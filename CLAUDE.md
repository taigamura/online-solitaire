# CLAUDE.md — Project context

## What this is

A **single-player Duel Masters (デュエルマスターズ) playtester / "solitaire" tool**. The user
uploads card images, builds a deck, then plays alone on a board to test deck flow. There is no
opponent and no networking. Everything runs client-side in the browser.

- `src/pages/Deckbuild.js` — landing route `/`. Upload card images → build a deck (1–4 copies each).
- `src/pages/Play.js` — route `/play`. The full board: hand, mana, shield, battle, trash, deck,
  deck-top, and overlapped-card groups. Drag/drop between zones, tap/untap, flip, shuffle,
  keyboard shortcuts (Space=flip, Esc=deselect, M=magnify, O=overlap, R=untap all, T=tap).
- Cards are plain objects: `{ file, id (uuid), flip, tap, source }`. `file` is a browser `File`;
  images are rendered via `URL.createObjectURL(file)`.

## Stack

- Create React App (react-scripts 5), React 18, react-router-dom 6. **Plain JavaScript (not TS).**
- `.npmrc` pins `legacy-peer-deps=true` because `react-image-magnifiers` declares a React-16 peer
  dep but the app runs React 18. Install with plain `npm install`.

## The verification gate — DO NOT BREAK

Every change must keep `npm run verify` green. It runs:

1. `npm run format:check` — Prettier (config in `.prettierrc`).
2. `CI=true npm test -- --watchAll=false` — Jest + React Testing Library smoke tests.
3. `npm run build` — must compile (real errors fail; lint *warnings* are allowed for now).

Run `npm run format` to auto-fix formatting. `npm run lint:strict` shows lint warnings as errors
(the backlog burns these down; eventually `verify` will switch to the strict build).

## Conventions

- Prefer immutable state updates. Several existing handlers mutate card objects in place
  (`card["tap"] = true` on objects stored in `boardState`) — this is a known anti-pattern being
  removed; do not add more of it.
- When you extract pure game logic (move card between zones, draw, shuffle, tap, flip, overlap),
  put it in `src/game/` as pure functions and add unit tests — these are the cheapest safety net.
- Keep the Japanese UI copy intact unless a task is specifically about wording.
- This is a playtester, not a rules engine: it does not enforce Duel Masters rules, it just moves
  cards where the user drags them. Keep it that way unless asked.

## Scope guard

Current effort is **code health → bug fixes → UX polish**. Do **not** add new product features
(deck save/load, multiple decks, undo, online play, etc.) unless `PROMPT.md` lists them.
