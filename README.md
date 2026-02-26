# WebMonitor

A personal web monitoring app that tracks changes to URLs you care about and generates AI-powered summaries using GPT-4o-mini.

## What it does

- Add 3–8 URLs to monitor (pricing pages, docs, policy pages, competitor pages)
- Click **Check Now** to fetch and diff against the last snapshot
- Get an AI summary of what changed, with snippets
- Keep a history of the last 5 checks per link
- Filter links by project or search label/URL
- Edit labels, add tags, group by project

## Tech stack

- **Backend**: FastAPI + SQLite + OpenAI API
- **Frontend**: React + Vite
- **Hosting**: Render (backend) + Vercel (frontend)

## Run locally

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add your OPENAI_API_KEY to .env
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000 in .env
npm run dev
```

Visit `http://localhost:5173`

## One-command Docker (fallback)

```bash
docker-compose up --build
```

## What is NOT done

- Authentication / user accounts
- Email/Slack alerts on change detection
- JavaScript-rendered pages (SPAs behind login) — server-side fetch gets static HTML only
- Automatic scheduled checks (no cron — manual "Check Now" only)
- PDF/file monitoring

## Deployment

Backend: Deploy to [Render](https://render.com) as a Python web service. Set env var `OPENAI_API_KEY`.

Frontend: Deploy to [Vercel](https://vercel.com), set env var `VITE_API_URL` to your Render backend URL.
