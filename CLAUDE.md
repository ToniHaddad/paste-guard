# paste-guard

Fully client-side web app: redacts names, phones, IDs and similar from case
notes (Arabic, French, English) before they go into an AI assistant, and
restores them in the answer. Set in one humanitarian organization in Lebanon.
No framework, no build step, no CDN, no server logic, zero network requests.

## Run and test
- `npm start` serves the folder on http://127.0.0.1:8109 (dependency-free Node server). Opening `index.html` directly also works.
- `npm test` runs `node --test` (unit, benchmark floors, no-network guard, bidi check).
- `npm run bench` prints recall and precision per type, language and split, plus misses.
- Pages: `gh workflow run pages.yml` (build and deploy jobs are separate; keep them so). Live: https://tonihaddad.github.io/paste-guard/

## Layout
- `index.html`, `styles.css`, `src/app.js`: the page. CSP is a meta tag: `connect-src 'none'`.
- `src/detect.js`: detection, no DOM. `src/gazetteer.js`: Lebanese and regional name lists. `src/redact.js`: Session (in-memory mapping), redact, restore.
- `bench/notes-src.js`: 60 synthetic notes with inline entity markup. `bench/run.js`: scorer. `bench/before-rebase.txt`: baseline measured before the detector was changed for this setting.
- `tests/no-network.test.js` fails if shipped code mentions fetch, XMLHttpRequest, WebSocket, sendBeacon, local/session storage, cookies, eval.

## Quirks
- Source files are classic scripts that also `module.exports` under Node (so `file://` works; ES modules do not).
- Never add a banned API to `src/`, even in a string.
- Benchmark split: dev (tuned on), heldout, stress (never tuned on). Do not tune on heldout or stress; add new notes instead.
- Case number formats `CS-2026-004817`, `HL-...`, `FAM-...` are fictional. All data is synthetic; the organization is never named.
- Regex strings in `detect.js` that contain `\p{L}` need a doubled backslash inside normal strings and template literals.
