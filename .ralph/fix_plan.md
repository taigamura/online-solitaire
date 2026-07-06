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

## Medium Priority — Phase 2–3: themed chrome + board UX rework

- [x] **Playmat-style board layout + color-coded zones + desktop-first notice (#42).** Rework the
      Play board from the vertical stack of identical boxes into a **playmat-style fixed layout** with
      **color-coded zone framing** (civilization→zone mapping tuned from screenshots), aiming for a
      single surface with minimal desktop scrolling. Add a friendly small-screen "best experienced on
      desktop" notice (no touch-drag impl). Drag/drop routing, tap/flip/overlap/shuffle/draw, and all
      keyboard shortcuts must work exactly as before. Play.css: `.playBoard` → 3-col/4-row CSS grid
      with named areas (notice/shield/info/deck/battle/hand/mana/trash); `.desktopNotice` → notice area;
      `.zoneInfoPanel` → info area wrapping both info + data boxes; zone classes get `grid-area`;
      `.zoneDeckTop`/`.zoneDeckView` → `position:fixed` overlays. Civilization-accented top border
      (`zone--fire/water/light/nature/darkness/neutral`). Removed unused `moveCardsToDeck` import.
      verify green (56 tests).
- [x] **Declutter board: contextual selection-toolbar + structural icon buttons + action-availability
      fn (#43).** `src/game/actions.js`: pure `getAvailableActions(selection)` — returns a `Set` of
      action keys (`tap`,`flip`,`reset`,`sendTop`,`sendBottom`,`overlap`) based on the first card's
      `source`. `src/game/actions.test.js` (10 tests): empty/null → empty set; hand/trash/deckTop →
      sendTop+sendBottom; battle/overlappedCards → overlap; mana/shield → tap+flip+reset only;
      multi-card uses first card. Play.js: `selectionToolbar` div (`data-testid="selection-toolbar"`)
      appears conditionally when `cardsInPlay.length > 0`, renders only actions from
      `getAvailableActions(cardsInPlay)` as icon buttons with `title` tooltips. `sendTopFromSelection`
      / `sendBottomFromSelection` helpers derive zone from `cardsInPlay[0].source` and delegate to
      existing `top`/`bottom`. Deck zone: converted 8 `<form onSubmit>` buttons → `type="button"`
      `onClick` icon buttons with `title` tooltips. All other zones: selectAll/deselectAll → `iconBtn`;
      tap/untap-all → `iconBtn`; sendTop/sendBottom removed from zone buttonLayouts (moved to toolbar).
      Data panel: removed tap/flip/resetSelected forms (moved to toolbar); removed Sortable display.
      Play.css: `.selectionToolbar` (fixed bottom overlay, neon-cyan glow), `.selectionToolbar__label`,
      `.button.iconBtn` (compact padding). verify green (66 tests).

## Low Priority — Phase 4: ad enablement (in-app wiring only; live ads gated on external deploy/approval)

- [x] **AdSense snippet wiring on safe pages (#44).** `src/components/AdSlot.js`: renders
      `<ins class="adsbygoogle">` with `useEffect` push only when both `REACT_APP_ADSENSE_CLIENT`
      and `REACT_APP_ADSENSE_SLOT` env vars are set at build time; returns `null` (no-op) when
      either is absent so the app ships dark without a live account. `public/index.html`: replaced
      hardcoded `ca-pub-*` client id in the adsbygoogle script src with `%REACT_APP_ADSENSE_CLIENT%`
      (CRA build-time substitution) so the load itself is also conditional. Landing.js, About.js,
      Privacy.js: imported `AdSlot` and replaced the `広告スペース` placeholder text inside the
      existing `<aside data-testid="ad-slot">` with `<AdSlot />`. Play and Deckbuild untouched —
      permanently ad-free. Ad-safety tests (zero `<img>` on ad pages, ad-slot present) still pass;
      `<ins>` contains no `<img>`. verify green (66 tests).

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
- [x] **Dark-neon themed chrome on Deckbuild + Play (#39).** CSS-only restyle — no markup/layout/
      behavior change. `index.css` body now paints the dark-neon page background + light text (covers
      Play/Deckbuild; Landing/About/Privacy already override with their own dark surface). In Play.css
      (shared globally, so it themes Deckbuild too): zone titles `.boxTitle` → neon-cyan; zone frames
      `.boxLayout`/`.cardWrap.overlapWrap` → `--color-surface` bg + subtle `--color-surface-raised`
      1px border (the calm card-playing surface — cards/tap/flip/selection-`.shade` stay readable);
      `.button` + `.button.on` and native `.boxLayout button`/`select` → surface-raised + neon-cyan
      border with a neon-fill hover. New `src/components/Nav.css` (imported by Nav.js) makes the global
      nav a dark surface bar with a neon-cyan bottom border + neon hover links. verify green (52
      tests). NOTE: structural light tokens `--color-border`/`--color-ink`/`--color-title-muted` are
      now unused (superseded by direct neon tokens) but left defined; `--color-paper`/`scrim`/
      `on-ink`/`toggle-*` still drive the slider + selection overlay. Board layout is still the legacy
      vertical stack — playmat rework is #42.
- [x] **About/how-to-use + Privacy-policy content pages (#41).** Added `src/pages/About.js`
      (`/about`, `data-testid="about"`) — how-to guide: これは何？ + upload/build/board steps with the
      six keyboard shortcuts (Space/Esc/M/O/R/T) as `.contentKbd` chips + caveats — and
      `src/pages/Privacy.js` (`/privacy`, `data-testid="privacy"`) — cookies + Google AdSense
      third-party serving + local-only card images + 免責事項. Both responsive, Japanese, image-free,
      each with a reserved `data-testid="ad-slot"` `<aside>` and a CTA. New shared
      `src/pages/content.css` (dark-neon, token-based, `clamp()` fluid headings) holds the content
      classes; `.adSlot` is reused from the global Landing.css bundle (consistent with this app's
      global-CSS architecture). Wired both routes into App.js and added 使い方/プライバシー links to the
      global Nav. Added `src/pages/contentPages.test.js` (Seam 2, `describe.each`): each page renders
      **zero `<img>`** and reserves an ad slot. verify green (52 tests). NOTE: Nav still unstyled —
      themed chrome is #39 (next).
- [x] **Striking dark-neon Landing page (#40).** Replaced the stub `src/pages/Landing.js` with the
      full responsive, Japanese, image-free page: gradient/glow hero (title + tagline + primary
      `デッキを作る`→`/build` & secondary `プレイ画面へ`→`/play` CTAs), a "これは何？" section, a
      3-step "使い方" list with CSS-drawn neon number badges (no images), a reserved
      `data-testid="ad-slot"` `<aside>` (wired to AdSense in #44; stays image-free), and a final CTA.
      New `src/pages/Landing.css` is built entirely on the #37 dark-neon tokens (palette, neon
      gradients/glow, spacing/radius/shadow, typography) with a `clamp()`-based fluid scale + a
      480px mobile media query. Kept `data-testid="landing"` so the Seam-1 routing test still passes.
      Added `src/pages/Landing.test.js` (Seam 2): asserts the page renders **zero `<img>`** (ad-safe)
      and that the ad slot + `/build` CTA link exist. verify green (48 tests). NOTE: the global Nav
      is still unstyled/light — themed chrome is #39.
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
