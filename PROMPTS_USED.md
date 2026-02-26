# Prompts Used

All prompts were used with Claude (claude.ai) during development.

---

## Session 1: Project Selection & Planning

**Prompt:** "which would be better to build and easy and learning and can be shared today eod" (choosing between Option A knowledge graph and Option B web monitor)

**Claude Response:** Recommended Option B (Web Monitor) — simpler data model, fewer moving parts, easier to host, better for learning. Suggested FastAPI + SQLite + React + Vite stack.

**What I took from it:** Went with Option B and the suggested stack.

---

## Session 2: Full Project Scaffold

**Prompt:** "yes" (asked Claude to scaffold the full project)

**Claude Response:** Generated complete project — `backend/main.py` (FastAPI with all routes), React components (Home, Status, LinkCard, AddLinkModal, DiffModal), CSS design system, `docker-compose.yml`, `render.yaml`, `vercel.json`, and all doc files.

**What I reviewed:** Read through all routes, verified the diff logic using `difflib.unified_diff`, checked SQLite snapshot pruning query, confirmed CORS settings.

---

## Session 3: Switching from OpenAI to Groq

**Prompt:** "give me updated code as we are using claude open api key" → then switched to Groq after Anthropic API had no credits

**Claude Response:** Generated updated `main.py` replacing `openai` import with `anthropic` SDK, then again with `groq` SDK using `llama-3.1-8b-instant` model.

**What I verified:** Confirmed `resp.choices[0].message.content` is the correct response format for Groq SDK (same as OpenAI). Tested with a real API call.

---

## Session 4: Fixing Diff Display

**Prompt:** Shared screenshot showing raw HTML tags appearing in the diff view instead of clean text (e.g. `<b>NSE India Home</b>` showing as literal text with broken spans)

**Claude Response:** Identified root cause — page HTML tags were not being escaped before wrapping in diff `<span>` tags. Fixed by adding `html.escape()` on each diff line in `build_diff_html()`. Also added `html.unescape()` and script/style stripping in `fetch_url_content()` so stored content is clean text.

**What I verified:** Tested with NSE India URL — confirmed diff now shows readable text lines, not raw HTML. Checked `dangerouslySetInnerHTML` is safe since we only inject our own escaped spans.

---

## Session 5: Debugging & Running Locally

**Prompts:** Various error messages shared during local setup:
- `ERROR: Could not import module "main"` → Claude identified wrong directory, fix was `cd backend` first
- `LLM error: 401 invalid x-api-key` → Claude walked through `.env` format check and key validation
- `LLM error: 400 credit balance too low` → Claude explained API credits vs chat subscription difference, recommended Groq as free alternative
- `ModuleNotFoundError: No module named 'groq'` → Fix was `pip install groq` with venv activated

**What I learned:** Always activate venv before installing packages. API credits and chat subscriptions are separate billing.

---

## Session 6: Deployment Setup

**Prompt:** "now we have docker and compose and yaml file how should i host it... which files should be added in gitignore give me all and steps to push to repo"

**Claude Response:** Generated final `.gitignore`, `backend/.env.example`, `frontend/.env.example`, and step-by-step guide for GitHub push → Render backend deploy → Vercel frontend deploy.

**What I verified:** Ran `git status` to confirm no `.env` files were being tracked before pushing. Checked Render disk mount path matches `DB_PATH` env var.

---

## Session 7: Documentation Cleanup

**Prompt:** Shared existing `README.md` and `AI_NOTES.md` for review — both still referenced OpenAI/GPT-4o-mini after switching to Groq.

**Claude Response:** Updated both files to reflect actual stack (Groq + Llama 3.1), removed inaccurate entries, made "what I checked" section honest and specific.

**What I did:** Read through both files after update, removed any entries that didn't reflect what was actually built or tested.
