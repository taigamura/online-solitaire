# Ralph Fix Plan

Scope: the **dark-neon redesign** authorized by the #36 PRD — a design-token foundation,
ad-safe image-free content pages (landing / about / privacy), a routing restructure
(Deckbuild → `/build`), dark-neon themed chrome, and a Play-board usability rework (playmat
layout + contextual selection-toolbar + a pure action-availability helper). This PRD is the
"later supervised pass" that `CLAUDE.md`/`PROMPT.md` deferred all UX/layout/CSS work to — it
authorizes that work but **does not change the playtester's game behavior**. Work the **single
highest unchecked item** per loop, top to bottom; the order is dependency-sorted so the top
unchecked item is always unblocked.

**Definition of done (every item):** `npm run verify` is green (format + tests + build); exactly
**one** commit on the `dev` branch; if you can't make `verify` green, revert and report — do not
leave it red. Preserve all existing playtester behavior and keyboard shortcuts (Space/Esc/M/O/R/T).
Prefer immutable updates — **do not add new in-place mutation of `boardState` card objects**.
`src/game/` code stays free of React and browser globals (`File`, `URL.createObjectURL`);
randomness takes an injectable `rng = Math.random`; tests build cards with the
`src/game/__fixtures__` `makeCard` factory (`file: null`). No new styling dependencies (plain CSS
+ CSS custom-property tokens only). No Duel Masters logos, official fonts, or official card art.
GitHub issue refs are for humans — do not push or open PRs.

## High Priority — Phase 1: token foundation + ad-safe surface (ships the striking, monetizable-ready result first)

- [ ] **Striking dark-neon Landing page (#40).** Replace the Landing stub with the full responsive,
      Japanese, **image-free** landing page (hero + "what is this / how it works" + CTA into
      `/build`), built on the tokens. Add a reserved ad-slot placeholder for the later AdSense slice.
      Add the ad-safety test (Seam 2) asserting the page renders **no card `<img>` elements**.
- [ ] **About/how-to-use + Privacy-policy content pages (#41).** Two responsive, Japanese,
      dark-neon, **image-free** content pages: an about/how-to-use guide (uploading cards, building a
      deck, using the board) and a privacy policy covering cookies + third-party (AdSense) ad
      serving. Each reserves an ad slot; both reachable from the site nav; both covered by the
      ad-safety test (Seam 2 — no card `<img>`).

## Medium Priority — Phase 2–3: themed chrome + board UX rework

- [ ] **Dark-neon themed chrome on Deckbuild + Play (#39).** Apply the token theme to Deckbuild and
      Play **chrome** — headers, buttons, zone frames, page backgrounds — while keeping the
      **card-playing surface calm/neutral** so card art and tap/flip/selected states stay readable.
      Restyle only: **no** layout reorganization and **no** behavior change.
- [ ] **Playmat-style board layout + color-coded zones + desktop-first notice (#42).** Rework the
      Play board from the vertical stack of identical boxes into a **playmat-style fixed layout** with
      **color-coded zone framing** (civilization→zone mapping tuned from screenshots), aiming for a
      single surface with minimal desktop scrolling. Add a friendly small-screen "best experienced on
      desktop" notice (no touch-drag impl). Drag/drop routing, tap/flip/overlap/shuffle/draw, and all
      keyboard shortcuts must work exactly as before.
- [ ] **Declutter board: contextual selection-toolbar + structural icon buttons + action-availability
      fn (#43).** Extract a **pure `src/game/` function** that, given the selection and the zones its
      cards are in, returns the set of valid actions — with unit tests (Seam 3) via `makeCard` (empty
      selection → no actions; a selection in a given zone → expected set). Render a **single
      contextual selection-toolbar** that appears only when cards are selected and shows only valid
      actions (tap/flip/reset/send-to-top/send-to-bottom), plus an RTL smoke test (hidden with no
      selection, shown with one). Convert per-zone **structural** actions (shuffle, draw,
      select-all/deselect-all, …) into compact **icon buttons with tooltips**. Relocate/consolidate
      controls only — behavior and shortcuts unchanged.

## Low Priority — Phase 4: ad enablement (in-app wiring only; live ads gated on external deploy/approval)

- [ ] **AdSense snippet wiring on safe pages (#44).** Wire the Google AdSense snippet into the
      reserved slots on the **image-free** pages only (landing/about/privacy); Play and Deckbuild stay
      permanently ad-free. Read the publisher/client id from configuration so it ships dark and
      no-ops cleanly when unset. The ad-safety tests (no card images on ad pages) must still pass.
      Account creation, deployment, domain, and AdSense approval are external and **out of scope**.

## Out of scope this session (do NOT do — defer to a supervised pass)

Live AdSense account creation, site deployment, domain purchase, and AdSense approval (external,
non-code). Any product feature beyond the redesign: deck save/load, multiple decks, undo, online
play, an opponent, or rules enforcement — this stays a single-player playtester that moves cards
where the user drags them. Touch/mobile drag-and-drop for the Play board (desktop-first + notice).
A second language for the new pages (Japanese only). Any Duel Masters logos, official fonts, or
official card art. The still-deferred code-health audits (`<Zone>`/`<Card>` component split,
replacing `react-image-magnifiers`, the `useEffect`-deps rewrite, `handleReset`/`top`/`bottom`
correctness audits) — except where the board rework naturally touches them, in which case behavior
must be preserved, not changed.

## Completed
- [x] **Routing restructure + Landing stub + routing test (#38).** Moved Deckbuild from `/` to
      `/build` and kept Play at `/play` in App.js. Added `src/pages/Landing.js` — minimal Japanese
      stub at `/` (`data-testid="landing"` + CTA `<Link to="/build">`; full content deferred to #40)
      — and `src/components/Nav.js`, a lightweight `<Link>` nav (ホーム/デッキ構築/プレイ) rendered
      globally in App above `<Routes>`. Deck state still lifted in App and passed unchanged to both
      Deckbuild and Play. Fixed `handleConfirmDeck`'s relative `navigate('play')` → absolute
      `navigate('/play')` (it used to resolve relative to `/`; Deckbuild now lives at `/build`).
      Rewrote App.test.js into Seam-1 routing tests (`/`→Landing via testid, `/build`→Deckbuild,
      `/play`→Play). verify green (46 tests). NOTE: Nav/Landing are intentionally unstyled — themed
      chrome is #39; full landing is #40.
- [x] **Design-token foundation + remove CRA boilerplate (#37).** Added `src/theme.css` — one
      `:root` token vocabulary: dark-neon base palette + the five civ accents (`--civ-light/water/
      darkness/fire/nature`) + spacing/radius/shadow-glow/typography scales (foundation for #39–#43,
      not yet applied to chrome), plus neutral/structural tokens holding the *current* greys/whites
      so nothing changes visually. Folded `--card-height`/`--card-width` in (removed the `:root`
      block from Play.css). Imported `theme.css` in `index.js` before `index.css`. Refactored
      Play.css (all hex/rgba colors, radii, common spacings, font sizes → tokens) and index.css
      (body/code font-family → `--font-sans`/`--font-mono`); Deckbuild.css had no colors/sizes to
      tokenize. Deleted CRA boilerplate: `src/App.css` (unused `.App*`/logo-spin styles) + its import
      in App.js, and the unreferenced `src/logo.svg`. No `#hex`/`rgba`/`white` left in Play.css.
      verify green (45 tests). NOTE: structural tokens (`--color-ink`, `--color-paper`, etc.) are the
      light-themed seam the #39 themed-chrome pass will re-point at the dark-neon palette.
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
- [x] **Remove console.logs (#32).** Deleted the 7 remaining `console.log`s in `Play.js` (overlap
      illegal-card checks ×2, `drop` e.target/sourceId/targetSource ×3, `changedCardsInPlay`, and the
      `run overlap` keydown log — the other 2 of the original 9 were already removed in #29/#30). No
      `console.log` left in `src/`. verify green; bundle shrank 81B.
- [x] **class → className (#33).** Converted all 104 raw `class=` attributes (94 in `Play.js`, 10 in
      `Deckbuild.js`) to `className=` via two literal substitutions (` class="`→` className="`,
      ` class={`→` className={`). All were space-preceded JSX attrs; no `class=` left in either file.
      Clears the "Invalid DOM property `class`" warnings; rendered output unchanged. verify green.
- [x] **Strict equality (#34).** Converted all 18 loose `==`/`!=` in `Play.js` to `===`/`!==`
      (Deckbuild.js had none). Reviewed each: count/length `=== 0`, uuid-string id/source/tagName
      comparisons (already same-type), and the two `sourceId == i` overlap-index pairs (799, 916) —
      both numeric since `sourceId = parseInt(...)` and `i` is an array index, so strict is safe and
      now matches the existing `i === sourceId` sites. The `!= undefined` cases (196, 326) only ever
      hold `undefined` or a number (never `null`), so `!== undefined` preserves behavior. verify green.
- [x] **De-duplicate DOM ids (#35).** Renamed `id="area0"` (×3) → `areaInfo`/`areaData`/`areaBattle`,
      the second `placeholder_battle_01` → `placeholder_battle_02` (untap-all button), and the
      copy-pasted trash-count `id="hand.length"` → `trash.length`. Also caught a 4th duplicate the
      plan missed — `id="deck.length"` (×2): left the deck-zone count, renamed the deck-view modal one
      to `deckView.length`. `grep | uniq -d` now reports zero duplicate static ids. None of these ids
      are referenced in JS (`getElementById`/`e.target.id`) or `Play.css`, so drag/drop routing
      (which keys off the `*Wrap` ids) is unaffected. verify green.
- [x] Project enabled for Ralph

## Notes
- One focused change per loop; one commit; never leave the verify gate red.
