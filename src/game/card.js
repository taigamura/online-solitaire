// Pure game logic: no React, no browser globals.
// Per-card tap/flip helpers — immutable replacements for the in-place
// `card['tap'] = …` / `card['flip'] = …` mutations of objects held in
// `boardState`. Each returns a fresh card object; inputs are never mutated.

export function setTap(card, tap) {
  return { ...card, tap };
}

export function setFlip(card, flip) {
  return { ...card, flip };
}

export function toggleTap(card) {
  return { ...card, tap: !card.tap };
}

export function toggleFlip(card) {
  return { ...card, flip: !card.flip };
}

// Zone helpers: map a flat array of cards to fresh objects with tap/flip set.
export function setTapAll(cards, tap) {
  return cards.map((card) => setTap(card, tap));
}

export function setFlipAll(cards, flip) {
  return cards.map((card) => setFlip(card, flip));
}

// Apply `fn` to the card whose id matches, leaving the rest untouched (same
// reference). Returns a new array.
export function mapCardById(cards, id, fn) {
  return cards.map((card) => (card.id === id ? fn(card) : card));
}
