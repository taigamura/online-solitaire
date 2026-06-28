import { shuffle } from './shuffle';
import { makeCard } from './__fixtures__/makeCard';

describe('shuffle', () => {
  it('preserves the multiset of card ids across many shuffles', () => {
    const cards = Array.from({ length: 20 }, () => makeCard());
    const expectedIds = cards.map((c) => c.id).sort();

    for (let i = 0; i < 200; i++) {
      const shuffled = shuffle(cards);
      expect(shuffled).toHaveLength(cards.length);
      expect(shuffled.map((c) => c.id).sort()).toEqual(expectedIds);
    }
  });

  it('does not mutate the input array', () => {
    const cards = [makeCard(), makeCard(), makeCard()];
    const before = [...cards];
    shuffle(cards);
    expect(cards).toEqual(before);
  });

  it('produces a deterministic permutation for a stubbed rng', () => {
    const a = makeCard({ id: 'a' });
    const b = makeCard({ id: 'b' });
    const c = makeCard({ id: 'c' });
    const d = makeCard({ id: 'd' });

    // With rng() === 0 every randomIndex is 0, giving a fixed permutation.
    const result = shuffle([a, b, c, d], () => 0);

    expect(result.map((card) => card.id)).toEqual(['b', 'c', 'd', 'a']);
  });
});
