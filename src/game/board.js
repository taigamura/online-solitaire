// Pure game logic: no React, no browser globals.
// Board-level helpers over the boardState object.

// resetBoard returns a fresh starting board: every zone empty except the deck,
// which holds every card reset to untapped, unflipped, and sourced to the deck
// zone. Input cards are never mutated — each returned card is a fresh object —
// so the caller's deck prop is left untouched (the old handler mutated it).
export function resetBoard(deck) {
  return {
    hand: [],
    trash: [],
    mana: [],
    shield: [],
    battle: [],
    overlappedCards: [],
    deckTop: [],
    deck: deck.map((card) => ({ ...card, tap: false, flip: false, source: 'deckWrap' })),
  };
}
