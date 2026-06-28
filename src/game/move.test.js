import { moveCards } from './move';
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
