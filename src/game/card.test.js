import { setTap, setFlip, toggleTap, toggleFlip, setTapAll, setFlipAll, mapCardById } from './card';
import { makeCard } from './__fixtures__/makeCard';

describe('setTap / setFlip', () => {
  it('returns a fresh card with tap set, leaving the rest intact', () => {
    const card = makeCard({ id: 'a', tap: false, flip: true });
    const next = setTap(card, true);

    expect(next).not.toBe(card);
    expect(next).toEqual({ ...card, tap: true });
    expect(card.tap).toBe(false);
  });

  it('returns a fresh card with flip set, leaving the rest intact', () => {
    const card = makeCard({ id: 'a', flip: false, tap: true });
    const next = setFlip(card, true);

    expect(next).not.toBe(card);
    expect(next).toEqual({ ...card, flip: true });
    expect(card.flip).toBe(false);
  });
});

describe('toggleTap / toggleFlip', () => {
  it('flips tap from false to true and true to false without mutating', () => {
    const off = makeCard({ tap: false });
    const on = makeCard({ tap: true });

    expect(toggleTap(off).tap).toBe(true);
    expect(toggleTap(on).tap).toBe(false);
    expect(off.tap).toBe(false);
  });

  it('flips flip from false to true and true to false without mutating', () => {
    const off = makeCard({ flip: false });
    const on = makeCard({ flip: true });

    expect(toggleFlip(off).flip).toBe(true);
    expect(toggleFlip(on).flip).toBe(false);
    expect(off.flip).toBe(false);
  });
});

describe('setTapAll / setFlipAll', () => {
  it('sets tap on every card, returning fresh objects', () => {
    const cards = [makeCard({ tap: false }), makeCard({ tap: true })];
    const next = setTapAll(cards, true);

    expect(next.every((c) => c.tap === true)).toBe(true);
    expect(next[0]).not.toBe(cards[0]);
    expect(cards[0].tap).toBe(false);
  });

  it('sets flip on every card, returning fresh objects', () => {
    const cards = [makeCard({ flip: true }), makeCard({ flip: false })];
    const next = setFlipAll(cards, false);

    expect(next.every((c) => c.flip === false)).toBe(true);
    expect(cards[0].flip).toBe(true);
  });
});

describe('mapCardById', () => {
  it('applies fn only to the matching card and keeps others by reference', () => {
    const a = makeCard({ id: 'a', tap: false });
    const b = makeCard({ id: 'b', tap: false });
    const next = mapCardById([a, b], 'a', (card) => setTap(card, true));

    expect(next[0].tap).toBe(true);
    expect(next[0]).not.toBe(a);
    expect(next[1]).toBe(b);
    expect(a.tap).toBe(false);
  });

  it('returns a new array even when no id matches', () => {
    const cards = [makeCard({ id: 'a' })];
    const next = mapCardById(cards, 'missing', toggleTap);

    expect(next).not.toBe(cards);
    expect(next[0]).toBe(cards[0]);
  });
});
