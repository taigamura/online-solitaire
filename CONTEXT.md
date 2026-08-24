# CONTEXT.md — architecture map & landmines

Read this once at session start instead of re-deriving the codebase. It captures
the non-obvious structure, the data-model conventions, and the known rough edges.
For *rules of engagement* (verify gate, scope guard, style) see `CLAUDE.md`; for
the current backlog see `PROMPT.md`. Live build: https://gilded-tartufo-0aee12.netlify.app/

## What it is (1 line)

A **client-only, single-player Duel Masters (デュエルマスターズ) "一人回し" playtester**:
upload card images → build a deck → move cards around a board solo. No opponent,
no networking, no rules enforcement, no backend. React 18 / CRA / plain JS.

## Routes (App.js) — note: CLAUDE.md's route list is stale

| Path | Component | Notes |
| --- | --- | --- |
| `/` | `Landing` | Marketing/how-to page, intentionally image-free (ad-safe). |
| `/build` | `Deckbuild` | Upload images, pick 1–4 copies each, 「デッキ確定」→ `/play`. |
| `/play` | `Play` | The board. ~1500 lines, where 90% of the logic lives. |
| `/about`, `/privacy` | static | Japanese content pages. |

**The deck lives in `App.js` `useState`** and is passed to both pages as
`deck` / `setDeck` props. It is **not persisted** — a page refresh or opening
`/play` in a fresh tab loses everything. Navigation must stay inside the SPA.
There is a reserved AdSense slot on Landing (`data-testid="ad-slot"`), unwired.

## Core data model

A card is a plain object: `{ file, id, flip, tap, source }`.
- `file` — a browser `File`; the image is `URL.createObjectURL(file)` at render.
- `id` — uuid v4, the **only** stable identity. Match cards by `id`, never index.
- `flip` — face-down (renders `cardBack.jpg`). `tap` — rotated/tapped.
- **`source`** — the card's current zone, stored **with a `Wrap` suffix**:
  `'handWrap'`, `'deckWrap'`, `'manaWrap'`, `'shieldWrap'`, `'battleWrap'`,
  `'trashWrap'`, `'deckTopWrap'`, `'overlappedCardsWrap'`. This suffix convention
  is load-bearing: DOM wrapper ids are `<zone>Wrap`, and move logic converts
  between the two by `.replace('Wrap','')`. Get this wrong and drag/drop breaks.

`boardState` (Play.js) is one object with these zones — all flat arrays **except**:
`hand, trash, mana, shield, battle, deckTop, deck` (flat) and
**`overlappedCards`** = an **array of groups**, each group an array of cards
(stacked/overlapped piles in the battle zone).
- **Deck top = the END of the `deck` array.** `draw`/`manaBoost`/`shield` pop the
  last element. Deck-view renders `deck.toReversed()` so top shows first.

## The pure core: `src/game/` (this is the safe, tested part)

Pure functions, **no React, no browser globals** — run in plain Jest, each with a
`*.test.js`. Fabricate cards via `__fixtures__/makeCard` (`file: null`). Randomness
takes an injectable `rng = Math.random`. When you extract more logic, put it here.

- `move.js` — `moveCards`, `moveCardsIntoOverlap`, `moveCardsOutOfOverlap`,
  `moveCardsToDeck`. Immutable zone-to-zone moves (matched by id).
- `board.js` — `resetBoard(deck)` → fresh empty board with deck reset.
- `card.js` — `setTap/setFlip/toggleTap/toggleFlip/setTapAll/setFlipAll/mapCardById`.
- `deck.js` — `draw/manaBoost/setOneShield` (pop deck top → zone; caller guards empty).
- `shuffle.js` — Fisher–Yates with injectable rng.

Each was a **behaviour-preserving extraction** from Play.js; the docstrings note
exactly which old handler they replaced and any quirks preserved.

## Play.js mechanisms you must understand before editing

1. **Selection = `cardsInPlay`** (array of card objects). Built in
   `handleMouseDown`: you can only multi-select cards **in the same zone** (or the
   same overlap group); selecting a different source clears the selection first.
2. **DOM ↔ state coupling in drag/drop.** Each `<li>` has `id={index}` (the array
   index!) while the inner `<img>`/magnifier has `id={card.id}`. So `handleMouseDown`
   reads `e.target.id` as a **card id** (works because you grab the image);
   `drop()` walks `parentElement.parentElement.id` to find the target **zone**.
   IDs, `Wrap`/`WrapParent` suffixes, and this traversal are all interdependent.
3. **`commandList` sequential runner.** Multi-step actions (「シャッフル,5ドロー,5シールド」,
   「ターンドロー」) can't fire back-to-back because `setState` is async. Instead they
   set a counter object (`{shuffle:1, draw:5, shield:5}`); the big `useEffect`
   calls `runCommandList()`, which runs **one** step per render and decrements,
   looping via re-render until empty. Don't "simplify" this into a synchronous loop.
4. **The big `useEffect` re-runs every render on purpose.** Its deps are
   handlers redefined each render; it re-registers key/mouse listeners, sets up
   Sortable, and drives the command runner. The `exhaustive-deps` disable is
   intentional and documented inline — a real fix means memoising all handlers.
5. **Keyboard:** `M` = hold-to-magnify (keydown on / keyup off). `Space`=flip,
   `Esc`=deselect, `O`=overlap, `T`=tap, `R`=untap-all — all on **keyup**.
6. **Magnify** uses `react-image-magnifiers` `SideBySideMagnifier`; the zoom pane
   flips left/right based on `mouseRight` (tracked via `mousemove`).
7. **SortableJS is effectively OFF** — `canSortable` is a `const [x]=useState(false)`.
   All the `Sortable.create(...)` code is dormant; DnD is the native HTML5 handlers.
8. Zones are colour-themed by Duel Masters civilization via `zone--fire/water/
   light/darkness/nature/neutral` classes (battle=fire, hand=water, shield=light,
   mana=nature, trash=darkness, deck/deckTop=neutral). Defined in `Play.css`/`theme.css`.

## Rough edges — mostly fixed (see history below)

Fixed:
- **In-place mutation removed** from `top()`, `bottom()`, `overlap()`,
  `undoOverlap()`, `handleDeckTop()` — they now use the immutable `src/game/`
  functions (`moveCardsToDeck`, `moveCards`, `moveCardsOutOfOverlap`) and
  functional `setBoardState` updates. **Do not reintroduce in-place mutation.**
- **`deck`-prop aliasing neutralised.** `boardState.deck` is still initialised
  `[...deck]` (shallow, shares card objects with `App.js`'s `deck`), but nothing
  mutates those objects any more, so the prop stays intact for `resetBoard(deck)`.
- **Object URLs cached** via `src/objectUrlCache.js` (`objectUrlFor`, a `File`→URL
  `WeakMap`) instead of a fresh `URL.createObjectURL` per render. Used in both
  `Play.js` and `Deckbuild.js`. URLs aren't explicitly revoked (freed on page
  unload); fine for this client-only tool.
- **Modern-JS compat:** `Map.groupBy` → local `groupByFile` (Deckbuild);
  `Array.prototype.toReversed` → `[...deck].reverse()` (Play deck-view).
- **`handWrap` is now a `<ul>`** (was a `<div>` with `<li>` children).

Still open (documented, not yet fixed — fixing needs a `drop()` refactor):
- **Duplicate DOM ids:** every zone renders `<li id={index}>`, so index `0`
  repeats across zones; overlap groups all use `id="overlappedCardsWrap"`. Logic
  keys off the inner `<img id={card.id}>` and array index, not these — but it's
  invalid HTML. `drop()` resolves the target zone by string-munging the wrapper
  id (`.replace('Wrap','')` → `boardState[zone]`), so making these unique means
  teaching `drop()` to strip the suffix. Left as-is for now.
- Alerts are Japanese `window.alert` (「山札はありません」 etc.). Keep JP UI copy intact.

## Verify before every commit

`npm run verify` = Prettier check → Jest (smoke tests only) → **strict build**
(`CI=true npm run build`, lint-clean enforced). Keep it green and warning-free.
`npm run format` auto-fixes formatting. Tests are thin on `Play.js` UI; the real
safety net is `src/game/*.test.js` — extend those when you touch game logic.
