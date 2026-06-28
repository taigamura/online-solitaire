import { moveCards, moveCardsIntoOverlap, moveCardsOutOfOverlap } from './move';
import { makeCard } from './__fixtures__/makeCard';

describe('moveCards', () => {
  it('moves a hand card into the battle zone and rewrites its source', () => {
    const moving = makeCard({ id: 'm', source: 'handWrap' });
    const hand = [makeCard({ id: 'h1', source: 'handWrap' }), moving];
    const battle = [makeCard({ id: 'b1', source: 'battleWrap' })];

    const [newHand, newBattle] = moveCards(hand, battle, [moving], 'battleWrap');

    expect(newHand.map((c) => c.id)).toEqual(['h1']);
    expect(newBattle.map((c) => c.id)).toEqual(['b1', 'm']);
    expect(newBattle[1].source).toBe('battleWrap');
  });

  it('moves a battle card into the mana zone and rewrites its source', () => {
    const moving = makeCard({ id: 'm', source: 'battleWrap' });
    const battle = [moving];
    const mana = [];

    const [newBattle, newMana] = moveCards(battle, mana, [moving], 'manaWrap');

    expect(newBattle).toEqual([]);
    expect(newMana.map((c) => c.id)).toEqual(['m']);
    expect(newMana[0].source).toBe('manaWrap');
  });

  it('only moves cards present in both source and cardsToMove', () => {
    const a = makeCard({ id: 'a' });
    const b = makeCard({ id: 'b' });
    const notInSource = makeCard({ id: 'ghost' });
    const source = [a, b];

    const [remaining, target] = moveCards(source, [], [a, notInSource], 'manaWrap');

    expect(remaining.map((c) => c.id)).toEqual(['b']);
    expect(target.map((c) => c.id)).toEqual(['a']);
  });

  it('preserves the original source order of the moved cards', () => {
    const x = makeCard({ id: 'x' });
    const y = makeCard({ id: 'y' });
    const z = makeCard({ id: 'z' });
    const source = [x, y, z];

    const [, target] = moveCards(source, [], [z, x], 'manaWrap');

    expect(target.map((c) => c.id)).toEqual(['x', 'z']);
  });

  it('preserves id, flip and tap on the moved card', () => {
    const moving = makeCard({ id: 'm', flip: true, tap: true, source: 'handWrap' });
    const [, target] = moveCards([moving], [], [moving], 'battleWrap');

    expect(target[0]).toMatchObject({ id: 'm', flip: true, tap: true, source: 'battleWrap' });
  });

  it('does not mutate the input arrays or their card objects', () => {
    const moving = makeCard({ id: 'm', source: 'handWrap' });
    const hand = [moving];
    const battle = [];
    const handSnapshot = JSON.stringify(hand);

    moveCards(hand, battle, [moving], 'battleWrap');

    expect(JSON.stringify(hand)).toBe(handSnapshot);
    expect(moving.source).toBe('handWrap');
    expect(battle).toEqual([]);
  });

  it('returns the unchanged source and target when nothing matches', () => {
    const source = [makeCard({ id: 'a' })];
    const [remaining, target] = moveCards(source, [], [makeCard({ id: 'other' })], 'manaWrap');

    expect(remaining.map((c) => c.id)).toEqual(['a']);
    expect(target).toEqual([]);
  });
});

describe('moveCardsIntoOverlap', () => {
  // Two existing groups; we drop onto a card in the second group.
  function makeGroups() {
    return [
      [makeCard({ id: 'g0a', source: 'overlappedCardsWrap' })],
      [makeCard({ id: 'g1a', source: 'overlappedCardsWrap' })],
    ];
  }

  it('moves a flat-zone card onto the bottom of the target group (overlapTop false)', () => {
    const moving = makeCard({ id: 'm', source: 'battleWrap' });
    const battle = [makeCard({ id: 'b0', source: 'battleWrap' }), moving];

    const [newBattle, newGroups] = moveCardsIntoOverlap(
      battle,
      makeGroups(),
      [moving],
      'g1a',
      false,
      'overlappedCardsWrap'
    );

    expect(newBattle.map((c) => c.id)).toEqual(['b0']);
    expect(newGroups[1].map((c) => c.id)).toEqual(['g1a', 'm']);
    expect(newGroups[1][1].source).toBe('overlappedCardsWrap');
    expect(newGroups[0].map((c) => c.id)).toEqual(['g0a']);
  });

  it('places moved cards on top of the group when overlapTop is true', () => {
    const moving = makeCard({ id: 'm', source: 'battleWrap' });

    const [, newGroups] = moveCardsIntoOverlap(
      [moving],
      makeGroups(),
      [moving],
      'g1a',
      true,
      'overlappedCardsWrap'
    );

    expect(newGroups[1].map((c) => c.id)).toEqual(['m', 'g1a']);
  });

  it('puts multiple top-dropped cards in front in reverse source order', () => {
    const m1 = makeCard({ id: 'm1', source: 'battleWrap' });
    const m2 = makeCard({ id: 'm2', source: 'battleWrap' });

    const [, newGroups] = moveCardsIntoOverlap(
      [m1, m2],
      makeGroups(),
      [m1, m2],
      'g1a',
      true,
      'overlappedCardsWrap'
    );

    expect(newGroups[1].map((c) => c.id)).toEqual(['m2', 'm1', 'g1a']);
  });

  it('does not mutate the input source or groups', () => {
    const moving = makeCard({ id: 'm', source: 'battleWrap' });
    const battle = [moving];
    const groups = makeGroups();
    const groupsSnapshot = JSON.stringify(groups);

    moveCardsIntoOverlap(battle, groups, [moving], 'g1a', false, 'overlappedCardsWrap');

    expect(JSON.stringify(groups)).toBe(groupsSnapshot);
    expect(moving.source).toBe('battleWrap');
  });
});

describe('moveCardsOutOfOverlap', () => {
  it('pulls a card out of its group into the flat target and rewrites source', () => {
    const moving = makeCard({ id: 'm', source: 'overlappedCardsWrap' });
    const groups = [
      [makeCard({ id: 'g0a', source: 'overlappedCardsWrap' }), moving],
      [makeCard({ id: 'g1a', source: 'overlappedCardsWrap' })],
    ];
    const battle = [makeCard({ id: 'b0', source: 'battleWrap' })];

    const [newGroups, newBattle] = moveCardsOutOfOverlap(groups, battle, [moving], 'battleWrap');

    expect(newGroups.map((g) => g.map((c) => c.id))).toEqual([['g0a'], ['g1a']]);
    expect(newBattle.map((c) => c.id)).toEqual(['b0', 'm']);
    expect(newBattle[1].source).toBe('battleWrap');
  });

  it('drops a group once it becomes empty', () => {
    const moving = makeCard({ id: 'solo', source: 'overlappedCardsWrap' });
    const groups = [[moving], [makeCard({ id: 'keep', source: 'overlappedCardsWrap' })]];

    const [newGroups, newBattle] = moveCardsOutOfOverlap(groups, [], [moving], 'battleWrap');

    expect(newGroups.map((g) => g.map((c) => c.id))).toEqual([['keep']]);
    expect(newBattle.map((c) => c.id)).toEqual(['solo']);
  });

  it('appends moved cards in descending (group, card) order', () => {
    const c00 = makeCard({ id: 'c00', source: 'overlappedCardsWrap' });
    const c01 = makeCard({ id: 'c01', source: 'overlappedCardsWrap' });
    const c10 = makeCard({ id: 'c10', source: 'overlappedCardsWrap' });
    const groups = [
      [c00, c01],
      [c10, makeCard({ id: 'stay', source: 'overlappedCardsWrap' })],
    ];

    const [, target] = moveCardsOutOfOverlap(groups, [], [c00, c01, c10], 'battleWrap');

    expect(target.map((c) => c.id)).toEqual(['c10', 'c01', 'c00']);
  });

  it('does not mutate the input groups or their cards', () => {
    const moving = makeCard({ id: 'm', source: 'overlappedCardsWrap' });
    const groups = [[makeCard({ id: 'g0a', source: 'overlappedCardsWrap' }), moving]];
    const snapshot = JSON.stringify(groups);

    moveCardsOutOfOverlap(groups, [], [moving], 'battleWrap');

    expect(JSON.stringify(groups)).toBe(snapshot);
    expect(moving.source).toBe('overlappedCardsWrap');
  });
});
