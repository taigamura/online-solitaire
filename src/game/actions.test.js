import { getAvailableActions } from './actions';
import { makeCard } from './__fixtures__/makeCard';

describe('getAvailableActions', () => {
  test('empty selection → no actions', () => {
    expect(getAvailableActions([])).toEqual(new Set());
  });

  test('null/undefined selection → no actions', () => {
    expect(getAvailableActions(null)).toEqual(new Set());
    expect(getAvailableActions(undefined)).toEqual(new Set());
  });

  test('hand selection → tap, flip, reset, sendTop, sendBottom', () => {
    const sel = [makeCard({ source: 'handWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset', 'sendTop', 'sendBottom']));
  });

  test('trash selection → tap, flip, reset, sendTop, sendBottom', () => {
    const sel = [makeCard({ source: 'trashWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset', 'sendTop', 'sendBottom']));
  });

  test('deckTop selection → tap, flip, reset, sendTop, sendBottom', () => {
    const sel = [makeCard({ source: 'deckTopWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset', 'sendTop', 'sendBottom']));
  });

  test('battle selection → tap, flip, reset, overlap', () => {
    const sel = [makeCard({ source: 'battleWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset', 'overlap']));
  });

  test('overlappedCards selection → tap, flip, reset, overlap', () => {
    const sel = [makeCard({ source: 'overlappedCardsWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset', 'overlap']));
  });

  test('mana selection → tap, flip, reset only (no deck-send, no overlap)', () => {
    const sel = [makeCard({ source: 'manaWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset']));
  });

  test('shield selection → tap, flip, reset only', () => {
    const sel = [makeCard({ source: 'shieldWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions).toEqual(new Set(['tap', 'flip', 'reset']));
  });

  test('multi-card selection uses first card source', () => {
    const sel = [makeCard({ source: 'handWrap' }), makeCard({ source: 'handWrap' })];
    const actions = getAvailableActions(sel);
    expect(actions.has('sendTop')).toBe(true);
    expect(actions.has('sendBottom')).toBe(true);
  });
});
