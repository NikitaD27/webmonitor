# AI Notes

## What I used AI (Claude) for

- Initial project scaffolding and folder structure
- FastAPI route boilerplate and Pydantic model definitions
- CSS design system (color variables, card layout, diff highlighting)
- React component structure for LinkCard, DiffModal, AddLinkModal
- **Groq Integration**: Switched from OpenAI to Groq for free Llama 3.1 summaries
- **Diff Fix**: HTML-escaping page content before diffing so `<tags>` in page source don't break the diff view
- **UI Polish**: Fixed diff modal display, added legend for diff colors, improved empty state messages
- Docker Compose configuration
- README and documentation drafting
- `.gitignore` and `.env.example` setup for safe deployment

## What I checked and verified myself

- The unified diff logic (`difflib.unified_diff`) — read Python docs and tested edge cases: empty prev content (first check), identical content (no changes), and real changes
- `html.escape()` on diff lines — verified that `<b>NSE India</b>` in page source now shows as text, not broken HTML
- SQLite "keep only last 5 snapshots" — verified the `LIMIT -1 OFFSET 5` behavior manually in SQLite shell
- CORS middleware — confirmed `allow_origins=["*"]` works for local dev; noted it should be restricted to frontend domain in production
- `dangerouslySetInnerHTML` in DiffModal — confirmed we only inject our own server-generated `<span>` tags, never raw user input
- Environment variable handling — checked that `.env` is in `.gitignore`, `.env.example` has no real keys, and `load_dotenv()` reads correctly
- Error handling — traced fetch failure path, invalid URL path, missing API key path manually
- Groq API response format — verified `resp.choices[0].message.content` is correct (same as OpenAI SDK format)
- The 8-link cap — checked frontend disables the Add button and backend doesn't enforce it (intentional)
