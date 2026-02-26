# AI Notes

## What I used AI (Claude) for

- Initial project scaffolding and folder structure
- FastAPI route boilerplate and Pydantic model definitions
- CSS design system (color variables, card layout, diff highlighting)
- React component structure for LinkCard, DiffModal, AddLinkModal
- OpenAI prompt engineering for the change summary feature
- Docker Compose configuration
- README and documentation drafting

## What I checked and verified myself

- The unified diff logic (`difflib.unified_diff`) — read Python docs and tested edge cases (empty prev content, identical content, first-ever check)
- SQLite "keep only last 5 snapshots" query — verified the OFFSET behavior manually
- CORS middleware settings — confirmed they match frontend origin in production
- HTML tag stripping with regex — checked that it handles malformed HTML gracefully
- The `dangerouslySetInnerHTML` usage in DiffModal — confirmed we're only injecting our own server-generated span tags, not user content
- Environment variable handling — ensured no keys are hardcoded; verified `.env.example` is correct
- Error handling paths — manually traced what happens if fetch fails, if URL is invalid, if OpenAI API key is missing
- The 8-link cap enforcement — checked both backend (can be removed) and frontend disable logic
