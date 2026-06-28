# Ralph Fix Plan

Scope: code-health + test-foundation only. No new features, no UX/visual work, no dependency
swaps, no bug-audits (see `CLAUDE.md` and the "Out of scope" note below). Work the **single
highest unchecked item** per loop, top to bottom.

**Definition of done (every item):** `npm run verify` is green (format + tests + build); exactly
**one** commit on the `dev` branch; if you can't make `verify` green, revert and report — do not
leave it red. Prefer immutable updates; `src/game/` code stays free of React and browser globals
(`File`, `URL.createObjectURL`); randomness takes an injectable `rng = Math.random`; tests build
cards with the `src/game/__fixtures__` `makeCard` factory. GitHub issue refs are for humans — do
not push or open PRs.

## High Priority — test foundation (do first; each = extract + test)

- [x] **Keystone (#27).** Created `src/game/shuffle.js` (pure Fisher–Yates, injectable `rng`),
      `src/game/__fixtures__/makeCard.js`, and `src/game/shuffle.test.js` (id-multiset preserved
      over 200 runs, no input mutation, stubbed `rng` → exact permutation). Rewired `Play.js`
      `shuffle`/`shuffleDeckTop` to use it; `shuffleDeckTop` is now immutable too. verify green.
- [x] **Deck-draw helpers (#28).** Created `src/game/deck.js` with pure `draw`/`manaBoost`/
      `setOneShield` over board state (shared `moveTopOfDeck` helper; immutable — drawn card is a
      fresh object so inputs are never mutated, fixing the old in-place `source`/`flip` writes).
      `setOneShield` flips face-down; `draw`/`manaBoost` leave flip. `src/game/deck.test.js`:
      right zone, deck shrinks by one, `id` preserved, `source` rewritten, no input mutation,
      append to non-empty zone. Rewired `Play.js`; callers keep the empty-deck alert guard. verify green.
- [x] **Flat-zone move (#29).** Created `src/game/move.js` with pure immutable `moveCards(source,
      target, cardsToMove, newSource)` — moves cards present in both `source` and `cardsToMove`
      (matched by `id`, original order kept) and rewrites each moved card's `source` to `newSource`
      (fresh objects; inputs never mutated). Folded the old in-place `card['source'] = targetSource`
      rewrite (drop) into the helper; `drop` still passes the `Wrap`-suffixed label so suffix
      handling is preserved. Rewired `drop` and `overlap` call sites; dropped the leftover
      `console.log`. `src/game/move.test.js`: hand→battle / battle→mana moves + source rewrite,
      both-zones membership, order, field preservation, no mutation, no-match no-op. verify green.
- [x] **Overlap-group move (#30).** Added pure immutable `moveCardsOutOfOverlap(groups, target,
      cardsToMove, newSource)` and `moveCardsIntoOverlap(source, groups, cardsToMove, targetId,
      overlapTop, newSource)` to `src/game/move.js` (plus private `findGroupIndex`). They rebuild
      groups/cards instead of splicing the live group arrays (old in-place bug), drop emptied
      groups, preserve the original orders (out: descending (group,card); into: push=source order,
      unshift/`overlapTop`=reverse front), and fold in the drop source rewrite. Direction is chosen
      at the call site via `source.includes('overlap')` (≡ old `source === overlappedCards`); the
      `Array.isArray` source-rewrite block and a `console.log` are gone. Tests cover into bottom/top,
      multi-card top order, out-of-group, empty-group drop, descending order, no mutation. verify green.
- [x] **Immutability (#31).** Added pure `src/game/card.js` (`setTap`/`setFlip`/`toggleTap`/
      `toggleFlip`/`setTapAll`/`setFlipAll`/`mapCardById`, all returning fresh objects) +
      `card.test.js`. Rewired `flipCardInTarget`, `untapCardInTarget`, `overlap{Tap,Untap}All`,
      `battle{Tap,Untap}All`, `mana{Tap,Untap}All`, `shieldFlipAll{True,False}` to immutable maps.
      `tap()` was the keystone: it mutated `cardsInPlay` cards (same refs as `boardState`) and only
      called `setCardsInPlay`, so the visual update rode on the shared-ref mutation — rewrote it to
      toggle tap by id immutably across all flat zones + overlap groups, `setBoardState`, and refresh
      the selection to the new objects. NOTE: left `handleReset`'s `copy.forEach` tap/flip/source
      mutation alone — it rewrites `source` on the master deck `copy` ref and is flagged for the
      supervised `handleReset` correctness pass (Out of scope). verify green.

## Medium Priority — mechanical sweeps (build/format-verified; no new tests required)

- [x] **Remove console.logs (#32).** Deleted the 7 remaining `console.log`s in `Play.js` (overlap
      illegal-card checks ×2, `drop` e.target/sourceId/targetSource ×3, `changedCardsInPlay`, and the
      `run overlap` keydown log — the other 2 of the original 9 were already removed in #29/#30). No
      `console.log` left in `src/`. verify green; bundle shrank 81B.
- [x] **class → className (#33).** Converted all 104 raw `class=` attributes (94 in `Play.js`, 10 in
      `Deckbuild.js`) to `className=` via two literal substitutions (` class="`→` className="`,
      ` class={`→` className={`). All were space-preceded JSX attrs; no `class=` left in either file.
      Clears the "Invalid DOM property `class`" warnings; rendered output unchanged. verify green.
- [ ] **Strict equality (#34).** Convert the ~25 loose `==`/`!=` to `===`/`!==`, reviewing each for
      intended coercion (preserve deliberate index-vs-id comparisons by converting types explicitly).
- [ ] **De-duplicate DOM ids (#35).** Make `id="area0"` (×3), `id="placeholder_battle_01"` (×2), and
      the trash-count `id="hand.length"` (×2) unique/correct; verify drag/drop still routes after.

## Out of scope (do NOT do — defer to a supervised pass)

`handleReset`/`top`/`bottom` correctness audits; `<Zone>`/`<Card>` component split; replacing
`react-image-magnifiers`; the `useEffect`-deps rewrite; all UX/layout/CSS/button polish; any new
product feature; enforcing Duel Masters rules.

## Completed
- [x] Project enabled for Ralph
