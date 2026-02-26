# Prompts Used

## Session: Project Setup

**Prompt:** "Build a full-stack web monitor app. Backend: FastAPI with SQLite. Frontend: React + Vite. Features: add URLs, click Check Now to fetch and diff, AI summary of changes, history of last 5 checks, filter by project/search."

**Response:** Generated initial project structure, FastAPI routes, and React component stubs.

---

## Session: Diff Logic

**Prompt:** "How do I use Python's difflib to generate a unified diff between two strings and return it as HTML with colored spans for additions, removals, and context?"

**Response:** Provided `difflib.unified_diff` usage with HTML span wrapping. I adjusted the slice index (`diff[2:]`) to skip the file header lines.

---

## Session: OpenAI Integration

**Prompt:** "Write a FastAPI async function that takes a URL, old content, new content, and a diff, then calls OpenAI GPT-4o-mini to summarize the changes in 2-4 bullet points with snippet citations."

**Response:** Generated the `summarize_changes` function. I reviewed the prompt sent to GPT and tightened the system message.

---

## Session: Frontend Design

**Prompt:** "Create a dark-theme CSS design system for a dev tool. Use DM Mono and Syne fonts. Deep dark navy background, blue accent (#5b8fff), violet secondary. Card-based layout with diff view, status dots, and animated spinner."

**Response:** Generated full CSS file. I reviewed color contrast ratios and adjusted muted text color for readability.

---

## Session: Docker Setup

**Prompt:** "Write a docker-compose.yml for a FastAPI backend (port 8000) and React Vite frontend (port 5173), with the backend serving SQLite and reading OPENAI_API_KEY from environment."

**Response:** Generated docker-compose.yml and Dockerfiles. I adjusted volume mounts for SQLite persistence.

---

## Session: Deployment Config

**Prompt:** "What files do I need to deploy a FastAPI app to Render and a React Vite app to Vercel? Include render.yaml and vercel.json."

**Response:** Generated both config files. I verified the build commands and start commands match the project structure.
