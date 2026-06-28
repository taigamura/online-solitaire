# Ralph Agent Configuration

## Verification gate (run this before every commit)

`npm run verify` is the single source of truth. It must be green at the end of every loop.
It runs, in order:
1. `npm run format:check` — Prettier
2. `CI=true npm test -- --watchAll=false` — Jest (non-watching)
3. `npm run build` — production build (real errors fail; lint warnings tolerated for now)

```bash
npm run verify
```

If formatting is the only failure, auto-fix with `npm run format` and re-run `npm run verify`.

## Tests

```bash
# Always non-watching — plain `npm test` runs CRA in watch mode and never exits.
CI=true npm test -- --watchAll=false
```

New game logic goes in `src/game/` as pure functions (no React, no browser globals) with Jest
unit tests using the `src/game/__fixtures__` `makeCard` factory.

## Build

```bash
npm run build
```

## Run (dev server — not used by the loop)

```bash
npm start
```

## Notes
- Install with plain `npm install` (`.npmrc` pins `legacy-peer-deps=true`).
- One focused change per loop; one commit on the `dev` branch; never leave `verify` red.
- See `CLAUDE.md` (auto-loaded) for conventions and scope guard.
