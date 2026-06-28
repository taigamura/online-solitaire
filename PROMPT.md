# PROMPT.md — Ralph loop backlog (code-health / test-foundation session)

You are improving a single-player Duel Masters playtester. Read `CLAUDE.md` first for context and
conventions. This file is the backlog for **one focused session**: scope is **code health and a
test foundation only** — no bug-audits, no UX/visual work, no dependency swaps (those are a later,
supervised pass).

## Each iteration

1. Read `CLAUDE.md` and this file.
2. Pick the **single highest-priority unchecked `[ ]` item** that is not blocked.
3. Implement only that item. Keep the change small and focused.
4. Run `npm run verify`. It must pass (format + tests + build).
5. If you added or changed behaviour, add or update a test that proves it.
6. Mark the item `[x]`, append a one-line note describing what you did, and commit on the current
   `dev` branch with a message like `chore/fix/refactor: <item>`. One item per commit.
7. If an item turns out to be wrong, obsolete, or already done, mark it `[x]` with a note saying so
   instead of forcing a change. (We already did this once: the `shuffle` parse bug was fixed before
   this session — only its test was missing.)

## Rules

- **Never** leave `npm run verify` red at the end of an iteration. If you can't finish cleanly,
  revert your changes and stop for a human.
- **Stay in scope.** No new product features. No UX/visual polish. No `handleReset` / `top` /
  `bottom` correctness audits, no component split, no `react-image-magnifiers` replacement, no
  `useEffect`-deps rewrite — these are deferred (see "Out of scope" below).
- Prefer immutable updates; never add new in-place mutation of `boardState` card objects.
- Anything extracted into `src/game/` is a **pure function over a board-state object / card array,
  with no React and no browser globals** (`File`, `URL.createObjectURL`). Functions that use
  randomness take an injectable `rng = Math.random` so tests are deterministic.
- Tests fabricate cards with the `src/game/__fixtures__` `makeCard` factory (`file: null`).

## Stop condition

Halt the loop when: all items below are checked; or `verify` can't be made green for the current
item (revert + stop); or an item needs out-of-scope judgment (mark deferred + stop).

---

## Cluster A — Test foundation (do first; each commit = extract + test)

- [ ] **Keystone.** Create `src/game/shuffle.js` with a pure `shuffle(cards, rng = Math.random)`
      (Fisher–Yates; the in-tree logic is already correct, this is a behaviour-preserving
      extraction). Rewire `Play.js` `shuffle`/`shuffleDeckTop` to call it. Add
      `src/game/__fixtures__/makeCard.js` and `src/game/shuffle.test.js` with two tests: multiset of
      `id`s preserved (run many iterations, always exact) and a deterministic permutation via a stub
      `rng`. This commit establishes the `src/game/` pattern every later item copies.
- [ ] Extract the deck-draw helpers (`draw`, `manaBoost`, `setOneShield` — all pop the **last**
      element of `deck`) into `src/game/deck.js` as pure functions over a board-state object. Rewire
      `Play.js`. Add tests (card moves to the right zone; deck shrinks by one; identity preserved).
- [ ] Extract flat-zone card movement (`handleMovementOfCard`) into `src/game/move.js` as a pure
      function. Preserve the `source` `Wrap`-suffix handling exactly. Add tests covering the
      `hand`↔`battle`↔`mana` cases and that moved cards get their `source` rewritten.
- [ ] Extract overlap-group movement (`handleMovementOfCardOverlap`) into `src/game/move.js`
      (or `src/game/overlap.js`). `overlappedCards` is an array **of groups**. Add tests for moving
      into/out of a group and the `overlapTop` top/bottom placement.
- [ ] Convert the ~10 in-place `card['tap'] = …` / `card['flip'] = …` mutation sites (lines ~246,
      248, 480, 532, 568, 687–688, 932, 950, 964 in `Play.js`) to immutable updates that return new
      card objects/arrays. Where practical route them through pure `src/game/` `tap`/`flip` helpers
      with tests. Behaviour must stay identical.

## Cluster B — Mechanical sweeps (low-risk; build/format-verified, no new tests required)

- [ ] Remove the 9 leftover `console.log` statements in `Play.js`.
- [ ] Replace every `class=` with `className=` in `Play.js` and `Deckbuild.js` (104 sites); clears
      the React "Invalid DOM property `class`" warnings.
- [ ] Replace `==`/`!=` with `===`/`!==` (25 sites), checking each for intended coercion (some
      compare numeric `index` against string ids — preserve intent, don't blindly swap).
- [ ] Make duplicate/wrong DOM ids unique: `id="area0"` (×3), `id="placeholder_battle_01"` (×2),
      and the trash-count `id="hand.length"` copy-paste (×2). Drop logic leans on element ids, so
      verify drag/drop still routes after renaming.

---

## Out of scope this session (deferred to a supervised pass)

`handleReset` / `top` / `bottom` correctness audits; breaking `Play.js` into `<Zone>`/`<Card>`
components; replacing `react-image-magnifiers` + dropping `legacy-peer-deps`; rewiring the
`useEffect` deps so listeners/Sortable aren't rebuilt every render; all UX, layout, button, and CSS
polish.

## Done log

(Completed items get checked above with a note; this section is for anything larger worth recording.)
