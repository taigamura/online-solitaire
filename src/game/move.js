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
