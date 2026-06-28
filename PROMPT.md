# PROMPT.md — Ralph loop backlog

You are improving a single-player Duel Masters playtester. Read `CLAUDE.md` first for context and
conventions. This file is the backlog. **Each iteration:**

1. Read `CLAUDE.md` and this file.
2. Pick the **single highest-priority unchecked `[ ]` item** that is not blocked.
3. Implement only that item. Keep the change small and focused.
4. Run `npm run verify`. It must pass (format + tests + build).
5. If you added/changed behaviour, add or update a test that proves it.
6. Mark the item `[x]` here, append a one-line note under it describing what you did, and commit
   with a message like `chore/fix/refactor: <item>`. One item per commit.
7. If an item turns out to be wrong, obsolete, or already done, mark it `[x]` with a note saying so
   instead of forcing a change.

## Rules

- **Never** leave `npm run verify` red at the end of an iteration. If you can't finish cleanly,
  revert your changes.
- No new product features (see Scope guard in `CLAUDE.md`).
- Prefer immutable updates; never add new in-place mutation of `boardState` card objects.
- When in doubt about a hard refactor, do the smallest safe step and leave a `[ ]` follow-up item.

---

## Priority 1 — Bugs & correctness (verifiable, do first)

- [ ] Fix `shuffle()` and `shuffleDeckTop()` in `Play.js`: `currentIndex--` is on its own line
      directly before `[currDeck[...]]`, so JS parses it as `currentIndex--[...]` and the swap
      never runs (deck is never actually shuffled). Fix the Fisher–Yates implementation and add a
      unit test that shuffling preserves the multiset of cards and (statistically) reorders them.
- [ ] Audit `handleReset()` in `Play.js`: it reuses `const copy = [...deck]` captured at render and
      mutates card objects. Confirm reset reliably returns every card to the deck and clears all
      zones; add a test.
- [ ] `top()` / `bottom()` call `setBoardState` twice back-to-back; verify no state is dropped and
      that the moved cards' `source` is updated correctly.
- [ ] Trash zone count badge uses `id="hand.length"` (copy-paste from hand). Make ids unique/correct.
- [ ] Several elements share `id="area0"` and `id="placeholder_battle_01"`. Duplicate ids are
      invalid HTML and can break `getElementById`. Make all ids unique.

## Priority 2 — Code health / refactor (unblocks the rest)

- [ ] Replace every `class=` with `className=` across `Play.js` and `Deckbuild.js` (this clears the
      React "Invalid DOM property `class`" console warnings). Verify tests still pass.
- [ ] Replace `==`/`!=` with `===`/`!==` throughout, checking each for intended coercion.
- [ ] Remove leftover `console.log` debugging statements.
- [ ] Extract pure game logic from `Play.js` into `src/game/` (e.g. `moveCard`, `draw`, `shuffle`,
      `tapAll`, `flip`, `overlap`). Pure functions over a board-state object, no React. Add unit
      tests. Do this incrementally — one function per iteration is fine.
- [ ] Remove in-place mutation of card objects in `boardState`; switch the tap/flip/untap helpers to
      immutable updates that return new objects/arrays.
- [ ] Break `Play.js` rendering into components: a reusable `<Zone>` and `<Card>` so each board area
      isn't copy-pasted markup. Do this zone-by-zone, keeping `verify` green each step.
- [ ] Review the `useEffect` in `Play.js` (deps `[handleMouseDown, handleKeyUp, handleKeyDown]`,
      which are recreated every render). Fix listener wiring so handlers aren't added/removed every
      render and Sortable isn't re-initialised redundantly.
- [ ] Replace the abandoned, React-16-only `react-image-magnifiers` with a maintained library or a
      small custom hover-zoom. Once removed, drop `legacy-peer-deps` from `.npmrc` if nothing else
      needs it.

## Priority 3 — UX / visual polish

- [ ] Convert `<a class="button">` pseudo-buttons to real `<button>` elements (fixes the
      `jsx-a11y/anchor-is-valid` lint warnings and makes them keyboard-accessible). Restyle so they
      look the same. After this, consider switching `verify` to the strict build (`lint:strict`).
- [ ] Deckbuild: improve the upload flow — show selected count, allow adding to an existing deck,
      validate against a sensible deck size, and surface errors instead of silent no-ops.
- [ ] Tidy `Play.js` / `Play.css` layout: consistent spacing, zone headers, responsive board so
      zones don't overflow on smaller screens.
- [ ] Make the keyboard-shortcut help panel clearer and keep it in sync with the actual handlers.
- [ ] General CSS cleanup in `Play.css` / `Deckbuild.css`: remove dead rules, unify the button and
      box styles.

---

## Done log

(Completed items get checked above with a note; this section is for anything larger worth recording.)
