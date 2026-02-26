# WebMonitor

A personal web monitoring app that tracks changes to URLs you care about and generates AI-powered summaries using Groq (Llama 3.1).

## What it does

- Add 3–8 URLs to monitor (pricing pages, docs, policy pages, competitor pages)
- Click **Check Now** to fetch and diff against the last snapshot
- Get an AI summary of what changed, with cited snippets
- Keep a history of the last 5 checks per link
- Filter links by project or search label/URL
- Edit labels, add tags, group by project
- Status page showing health of backend, database, and LLM connection

## Tech stack

- **Backend**: FastAPI + SQLite + Groq API (Llama 3.1 8B)
- **Frontend**: React + Vite (DM Mono + Syne fonts, dark theme)
- **Hosting**: Render (backend) + Vercel (frontend)

## Run locally

### Backend

```bash
cd backend
python -m venv venv

# Activate venv:
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
cp .env.example .env
# Add your GROQ_API_KEY to .env (free at console.groq.com)

uvicorn main:app --reload --port 8000
```

Test backend is running: http://localhost:8000/health

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:8000

npm run dev
```

Visit: http://localhost:5173

## One-command Docker (fallback)

```bash
# Copy and fill in your key first
cp backend/.env.example backend/.env
# Edit backend/.env and add GROQ_API_KEY

docker-compose up --build
```

Visit: http://localhost:5173

## Environment variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Free at console.groq.com |
| `DB_PATH` | No | Default: `webmonitor.db` |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend URL (local or Render) |

## What is NOT done

- Authentication / user accounts
- Email or Slack alerts on change detection
- JavaScript-rendered SPAs (server-side fetch gets static HTML only)
- Automatic scheduled checks (manual "Check Now" only — no cron)
- PDF or file monitoring

## Deployment

**Backend → [Render](https://render.com)**
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Env vars: `GROQ_API_KEY`, `DB_PATH=/var/data/webmonitor.db`
- Add a Disk: mount at `/var/data`, 1GB

**Frontend → [Vercel](https://vercel.com)**
- Root directory: `frontend`
- Env var: `VITE_API_URL=https://your-app.onrender.com`
