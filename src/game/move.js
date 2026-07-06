// Pure game logic: no React, no browser globals.
// Flat-zone card move — behaviour-preserving extraction of the in-tree
// `handleMovementOfCard`. Moves the cards listed in `cardsToMove` out of the
// `source` zone (a flat array) and appends them to the `target` zone, rewriting
// each moved card's `source` label to `newSource`.
//
// A card is moved only if it is present in BOTH `source` and `cardsToMove`
// (matched by `id`), exactly like the original. Moved cards keep their original
// order from `source`. The update is immutable: the input arrays and their card
// objects are never mutated — moved cards are fresh objects carrying `newSource`.
// `newSource` mirrors the old `drop` handler, which passes the still-`Wrap`-
// suffixed target label (e.g. `handWrap`) as the card's new `source`.

export function moveCards(source, target, cardsToMove, newSource) {
  const moveIds = new Set(cardsToMove.map((card) => card.id));

  const remaining = [];
  const moved = [];
  source.forEach((card) => {
    if (moveIds.has(card.id)) {
      moved.push(newSource === undefined ? card : { ...card, source: newSource });
    } else {
      remaining.push(card);
    }
  });

  return [remaining, target.concat(moved)];
}

// Index of the group containing the card `id`, or undefined — the pure
// counterpart of `findOverlapGroupIdx`, scoped to the supplied `groups`.
function findGroupIndex(groups, id) {
  let groupIdx;
  groups.forEach((group, i) => {
    group.forEach((card) => {
      if (card.id === id) {
        groupIdx = i;
      }
    });
  });
  return groupIdx;
}

// Overlap-group move, OUT of an overlap zone — behaviour-preserving extraction of
// the `source === overlappedCards` branch of `handleMovementOfCardOverlap`.
// `groups` is an array of groups (arrays of cards); cards in `cardsToMove` are
// pulled out of whatever group holds them and appended to the flat `target` zone,
// with their `source` rewritten to `newSource`. Emptied groups are dropped.
//
// The moved cards are appended to `target` in descending (group, card) order,
// matching the original reverse-splice loop. Immutable: groups and cards are
// rebuilt, never mutated in place (the old code spliced the live group arrays).
export function moveCardsOutOfOverlap(groups, target, cardsToMove, newSource) {
  const moveIds = new Set(cardsToMove.map((card) => card.id));

  const matches = [];
  groups.forEach((group) => {
    group.forEach((card) => {
      if (moveIds.has(card.id)) {
        matches.push(card);
      }
    });
  });
  const moved = matches
    .reverse()
    .map((card) => (newSource === undefined ? card : { ...card, source: newSource }));

  const newGroups = groups
    .map((group) => group.filter((card) => !moveIds.has(card.id)))
    .filter((group) => group.length > 0);

  return [newGroups, target.concat(moved)];
}

// Move the selected cards out of a flat zone onto the deck — behaviour-preserving
// extraction of the in-tree `top`/`bottom` handlers. `position` is 'top' (cards
// land at the END of the deck array, where `draw` takes from) or 'bottom' (the
// FRONT). Only cards present in BOTH `source` and `cardsToMove` (matched by id)
// move; they are appended in REVERSED selection order, matching the original
// reverse-`push` / forward-`unshift` loops. The whole resulting deck is rebuilt
// with `source: 'deckWrap'` (as the old code did). Immutable: inputs and their
// cards are never mutated. Returns `[newSource, newDeck]`.
export function moveCardsToDeck(deck, source, cardsToMove, position) {
  const moveIds = new Set(cardsToMove.map((card) => card.id));
  const inSource = new Set(source.map((card) => card.id));

  const remaining = source.filter((card) => !moveIds.has(card.id));
  const moved = cardsToMove.filter((card) => inSource.has(card.id)).reverse();

  const combined = position === 'top' ? deck.concat(moved) : moved.concat(deck);
  const newDeck = combined.map((card) => ({ ...card, source: 'deckWrap' }));

  return [remaining, newDeck];
}

// Overlap-group move, INTO an overlap zone — behaviour-preserving extraction of
// the `else` branch of `handleMovementOfCardOverlap`. Cards in `cardsToMove` are
// pulled out of the flat `source` zone and inserted into the group that holds the
// card `targetId`, with their `source` rewritten to `newSource`. When `overlapTop`
// is true the moved cards land on top of the group (front, reverse source order),
// otherwise on the bottom (back, source order) — matching the original
// unshift/push loop. Immutable: source and groups are rebuilt, never mutated.
export function moveCardsIntoOverlap(source, groups, cardsToMove, targetId, overlapTop, newSource) {
  const moveIds = new Set(cardsToMove.map((card) => card.id));
  const groupIdx = findGroupIndex(groups, targetId);

  const remaining = [];
  const moved = [];
  source.forEach((card) => {
    if (moveIds.has(card.id)) {
      moved.push(newSource === undefined ? card : { ...card, source: newSource });
    } else {
      remaining.push(card);
    }
  });

  const newGroups = groups.map((group, i) => {
    if (i !== groupIdx) {
      return group;
    }
    return overlapTop ? [...moved].reverse().concat(group) : group.concat(moved);
  });

  return [remaining, newGroups];
}
