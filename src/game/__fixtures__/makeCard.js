// Test card factory for pure src/game logic. `file: null` — pure logic only needs
// id/source/flip/tap, never the image.

let counter = 0;

export function makeCard(overrides = {}) {
  counter += 1;
  return {
    file: null,
    id: `card-${counter}`,
    flip: false,
    tap: false,
    source: 'deck',
    ...overrides,
  };
}
