import { draw, manaBoost, setOneShield } from './deck';
import { makeCard } from './__fixtures__/makeCard';

// Build a board state with a deck whose last card is the one that gets drawn.
function makeBoard(overrides = {}) {
  return {
    deck: [makeCard({ id: 'd1' }), makeCard({ id: 'd2' }), makeCard({ id: 'top' })],
    hand: [],
    mana: [],
    shield: [],
    ...overrides,
  };
}

describe.each([
  ['draw', draw, 'hand', 'handWrap'],
  ['manaBoost', manaBoost, 'mana', 'manaWrap'],
  ['setOneShield', setOneShield, 'shield', 'shieldWrap'],
])('%s', (_name, fn, zone, expectedSource) => {
  it('moves the last deck card into the target zone', () => {
    const next = fn(makeBoard());
    expect(next[zone]).toHaveLength(1);
    expect(next[zone][0].id).toBe('top');
  });

  it('shrinks the deck by one, removing the drawn card from the end', () => {
    const next = fn(makeBoard());
    expect(next.deck).toHaveLength(2);
    expect(next.deck.map((c) => c.id)).toEqual(['d1', 'd2']);
  });

  it('preserves the id and rewrites the source', () => {
    const next = fn(makeBoard());
    const moved = next[zone][0];
    expect(moved.id).toBe('top');
    expect(moved.source).toBe(expectedSource);
  });

  it('appends to a non-empty target zone without disturbing existing cards', () => {
    const existing = makeCard({ id: 'kept', source: zone });
    const next = fn(makeBoard({ [zone]: [existing] }));
    expect(next[zone].map((c) => c.id)).toEqual(['kept', 'top']);
  });

  it('does not mutate the input board state or its cards', () => {
    const board = makeBoard();
    const snapshot = JSON.stringify(board);
    fn(board);
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});

describe('setOneShield', () => {
  it('flips the drawn card face down', () => {
    const next = setOneShield(makeBoard());
    expect(next.shield[0].flip).toBe(true);
  });
});

describe('draw and manaBoost', () => {
  it('leave flip untouched', () => {
    expect(draw(makeBoard()).hand[0].flip).toBe(false);
    expect(manaBoost(makeBoard()).mana[0].flip).toBe(false);
  });
});
