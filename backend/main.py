from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import httpx
import difflib
import sqlite3
import json
import re
import os
from datetime import datetime
from dotenv import load_dotenv
# from groq import Groq (Imported as AsyncGroq inside summarize_changes)

# Load environmental variables explicitly from the same directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path, override=True)

app = FastAPI(title="WebMonitor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.getenv("DB_PATH", "webmonitor.db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
if GROQ_API_KEY:
    masked_key = f"{GROQ_API_KEY[:7]}...{GROQ_API_KEY[-4:]}"
    print(f"INFO: Groq API Key loaded (length: {len(GROQ_API_KEY)}, format: {masked_key})")
else:
    print("WARNING: Groq API Key NOT loaded from environment")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL UNIQUE,
            label TEXT,
            tags TEXT DEFAULT '[]',
            project TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            link_id INTEGER NOT NULL,
            content TEXT,
            checked_at TEXT DEFAULT (datetime('now')),
            diff_html TEXT,
            summary TEXT,
            status TEXT DEFAULT 'ok',
            FOREIGN KEY(link_id) REFERENCES links(id)
        );
    """)
    conn.commit()
    conn.close()

init_db()

class LinkCreate(BaseModel):
    url: str
    label: Optional[str] = None
    tags: Optional[List[str]] = []
    project: Optional[str] = ""

class LinkUpdate(BaseModel):
    label: Optional[str] = None
    tags: Optional[List[str]] = None
    project: Optional[str] = None

async def fetch_url_content(url: str) -> str:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    }
    # Using http2=True as many modern sites (like NSE India) prefer/require it
    async with httpx.AsyncClient(timeout=15, follow_redirects=True, http2=True) as client:
        r = await client.get(url, headers=headers)
        r.raise_for_status()
        
        # 1. Remove scripts and styles
        content = re.sub(r'<(script|style|nav|footer)[^>]*>.*?</\1>', ' ', r.text, flags=re.DOTALL | re.IGNORECASE)
        # 2. Basic tag stripping (preserving brief structure)
        text = re.sub(r'<[^>]+>', ' ', content)
        # 3. Clean whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text[:50000]

def build_diff_html(old: str, new: str) -> str:
    old_lines = old.splitlines(keepends=True)
    new_lines = new.splitlines(keepends=True)
    diff = list(difflib.unified_diff(old_lines, new_lines, lineterm='', n=3))
    if not diff:
        return ""
    html_parts = []
    for line in diff[2:]:
        if line.startswith('+'):
            html_parts.append(f'<span class="diff-add">{line}</span>')
        elif line.startswith('-'):
            html_parts.append(f'<span class="diff-remove">{line}</span>')
        elif line.startswith('@@'):
            html_parts.append(f'<span class="diff-hunk">{line}</span>')
        else:
            html_parts.append(f'<span class="diff-ctx">{line}</span>')
    return '\n'.join(html_parts)

async def summarize_changes(url: str, diff_text: str) -> str:
    if not GROQ_API_KEY:
        return "LLM summary unavailable — set GROQ_API_KEY in .env"
    if not diff_text:
        return "No changes detected since last check."
    try:
        # Using AsyncGroq for non-blocking requests in FastAPI
        from groq import AsyncGroq
        client = AsyncGroq(api_key=GROQ_API_KEY)
        snippet = diff_text[:3000]
        resp = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            max_tokens=300,
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise change analyst. Your task is to summarize changes on a webpage in 1-2 flowing, human-readable sentences in a single paragraph. \n\nRULES:\n1. Output PLAIN TEXT ONLY. Strictly NO HTML tags.\n2. Include relevant CITATIONS or SNIPPETS (like specific price changes, new version numbers, or key text updates) from the diff where appropriate to provide context.\n3. Combine all changes into a single flowing narrative. \n4. Use connecting words like 'while', 'and', or 'additionally' to bridge related changes.\n5. DO NOT use technical formatting or diff symbols (+, -, @@)."
                },
                {
                    "role": "user",
                    "content": f"URL: {url}\n\nRecent Changes (Diff):\n{snippet}\n\nProvide a human-readable summary with citations/snippets (single paragraph):"
                }
            ],
        )
        summary = resp.choices[0].message.content.strip()
        # Fail-safe: Strip any HTML tags and common diff symbols the AI might have included
        summary = re.sub(r'<[^>]+>', '', summary)
        summary = re.sub(r'^[+\-•*@]+', '', summary, flags=re.MULTILINE)
        summary = summary.replace('+', '').replace('-', '').replace('@@', '').strip()
        return summary
    except Exception as e:
        # Mask the key in error message if it appears
        err_msg = str(e)
        if GROQ_API_KEY and len(GROQ_API_KEY) > 10:
             err_msg = err_msg.replace(GROQ_API_KEY, "[MASKED_KEY]")
        return f"LLM error: {err_msg}"

@app.get("/health")
async def health():
    db_ok = False
    try:
        conn = get_db()
        conn.execute("SELECT 1")
        conn.close()
        db_ok = True
    except:
        pass
    llm_ok = bool(GROQ_API_KEY)
    return {
        "backend": "ok",
        "database": "ok" if db_ok else "error",
        "llm": "connected" if llm_ok else "no API key set",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/links")
async def list_links():
    conn = get_db()
    # Join with the latest snapshot for each link
    query = """
        SELECT l.*, s.summary as last_summary, s.status as last_status, s.checked_at as last_checked
        FROM links l
        LEFT JOIN (
            SELECT link_id, summary, status, checked_at,
                   ROW_NUMBER() OVER (PARTITION BY link_id ORDER BY checked_at DESC) as rn
            FROM snapshots
        ) s ON l.id = s.link_id AND s.rn = 1
        ORDER BY l.created_at DESC
    """
    rows = conn.execute(query).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post("/links")
async def add_link(data: LinkCreate):
    if not data.url.startswith(("http://", "https://")):
        raise HTTPException(400, "URL must start with http:// or https://")
    conn = get_db()
    try:
        cur = conn.execute(
            "INSERT INTO links (url, label, tags, project) VALUES (?,?,?,?)",
            (data.url, data.label or data.url, json.dumps(data.tags), data.project)
        )
        conn.commit()
        link_id = cur.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(409, "URL already exists")
    row = conn.execute("SELECT * FROM links WHERE id=?", (link_id,)).fetchone()
    conn.close()
    return dict(row)

@app.patch("/links/{link_id}")
async def update_link(link_id: int, data: LinkUpdate):
    conn = get_db()
    row = conn.execute("SELECT * FROM links WHERE id=?", (link_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Link not found")
    updates = {}
    if data.label is not None: updates["label"] = data.label
    if data.tags is not None: updates["tags"] = json.dumps(data.tags)
    if data.project is not None: updates["project"] = data.project
    if updates:
        set_clause = ", ".join(f"{k}=?" for k in updates)
        conn.execute(f"UPDATE links SET {set_clause} WHERE id=?", (*updates.values(), link_id))
        conn.commit()
    row = conn.execute("SELECT * FROM links WHERE id=?", (link_id,)).fetchone()
    conn.close()
    return dict(row)

@app.delete("/links/{link_id}")
async def delete_link(link_id: int):
    conn = get_db()
    conn.execute("DELETE FROM snapshots WHERE link_id=?", (link_id,))
    conn.execute("DELETE FROM links WHERE id=?", (link_id,))
    conn.commit()
    conn.close()
    return {"ok": True}

@app.post("/links/{link_id}/check")
async def check_link(link_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM links WHERE id=?", (link_id,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Link not found")
    url = row["url"]
    prev = conn.execute(
        "SELECT content FROM snapshots WHERE link_id=? ORDER BY checked_at DESC LIMIT 1",
        (link_id,)
    ).fetchone()
    prev_content = prev["content"] if prev else ""

    try:
        new_content = await fetch_url_content(url)
        status = "ok"
    except Exception as e:
        conn.execute(
            "INSERT INTO snapshots (link_id, content, diff_html, summary, status) VALUES (?,?,?,?,?)",
            (link_id, prev_content, "", f"Fetch failed: {str(e)}", "error")
        )
        conn.commit()
        conn.close()
        return {"status": "error", "summary": f"Fetch failed: {str(e)}"}

    diff_plain = '\n'.join(list(difflib.unified_diff(prev_content.splitlines(), new_content.splitlines(), lineterm='', n=1)))
    diff_html = build_diff_html(prev_content, new_content)
    summary = await summarize_changes(url, diff_plain)

    conn.execute(
        "INSERT INTO snapshots (link_id, content, diff_html, summary, status) VALUES (?,?,?,?,?)",
        (link_id, new_content, diff_html, summary, status)
    )
    conn.commit()

    ids = conn.execute(
        "SELECT id FROM snapshots WHERE link_id=? ORDER BY checked_at DESC LIMIT -1 OFFSET 5",
        (link_id,)
    ).fetchall()
    for r in ids:
        conn.execute("DELETE FROM snapshots WHERE id=?", (r["id"],))
    conn.commit()
    conn.close()

    return {
        "status": "ok",
        "changed": bool(diff_html),
        "diff_html": diff_html,
        "summary": summary,
        "checked_at": datetime.now().isoformat()
    }

@app.get("/links/{link_id}/history")
async def get_history(link_id: int):
    conn = get_db()
    rows = conn.execute(
        "SELECT id, checked_at, diff_html, summary, status FROM snapshots WHERE link_id=? ORDER BY checked_at DESC LIMIT 5",
        (link_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]