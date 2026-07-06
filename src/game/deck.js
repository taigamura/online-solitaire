// Pure game logic: no React, no browser globals.
// Deck-draw helpers — each pops the last card of `boardState.deck`, rewrites its
// `source`, and appends it to a target zone. Behaviour-preserving extraction of the
// in-tree `draw`/`manaBoost`/`setOneShield` handlers, made immutable: the drawn card
// is a fresh object, so the input board state and its cards are never mutated.
//
// Callers are responsible for the empty-deck guard (these assume `deck` is non-empty).

function moveTopOfDeck(boardState, targetZone, source, extra = {}) {
  const { deck } = boardState;
  const top = deck[deck.length - 1];
  const drawnCard = { ...top, source, ...extra };

  return {
    ...boardState,
    deck: deck.slice(0, deck.length - 1),
    [targetZone]: boardState[targetZone].concat(drawnCard),
  };
}

export function draw(boardState) {
  return moveTopOfDeck(boardState, 'hand', 'handWrap');
}

export function manaBoost(boardState) {
  return moveTopOfDeck(boardState, 'mana', 'manaWrap');
}

export function setOneShield(boardState) {
  return moveTopOfDeck(boardState, 'shield', 'shieldWrap', { flip: true });
}
