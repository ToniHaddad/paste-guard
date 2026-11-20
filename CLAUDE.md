# paste-guard

Fully client-side web app: redacts names, phones, IDs and similar from case
notes before they go into an AI assistant, and restores them in the answer.
No framework, no build step, no CDN, no server logic, zero network requests.

## Run and test
- `npm start` serves the folder on http://127.0.0.1:8109 (dependency-free Node server). Opening `index.html` directly also works.
- `npm test` runs `node --test` (unit, benchmark floors, no-network guard).
- `npm run bench` prints recall and precision per type and language, plus misses.

## Layout
- `index.html`, `styles.css`, `src/app.js`: the page. CSP is a meta tag: `connect-src 'none'`.
- `src/detect.js`: detection, no DOM. `src/gazetteer.js`: name lists. `src/redact.js`: Session (in-memory mapping), redact, restore.
- `bench/notes-src.js`: 60 synthetic notes with inline entity markup. `bench/run.js`: scorer. `bench/first-run.txt`: the first measurement, kept on purpose.
- `tests/no-network.test.js` fails if shipped code mentions fetch, XMLHttpRequest, WebSocket, sendBeacon, local/session storage, cookies, eval.

## Quirks
- Source files are classic scripts that also `module.exports` under Node (so `file://` works; ES modules do not).
- Never add a banned API to `src/`, even in a comment-free string.
- Benchmark split: dev (tuned on), heldout, stress (never tuned on). Do not tune on stress; add new notes instead.
- CASE number format `NBR-LB-2024-004817` is fictional.
