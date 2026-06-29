import { resetBoard } from './board';
import { makeCard } from './__fixtures__/makeCard';

describe('resetBoard', () => {
  it('empties every non-deck zone', () => {
    const board = resetBoard([makeCard(), makeCard()]);

    expect(board.hand).toEqual([]);
    expect(board.trash).toEqual([]);
    expect(board.mana).toEqual([]);
    expect(board.shield).toEqual([]);
    expect(board.battle).toEqual([]);
    expect(board.overlappedCards).toEqual([]);
    expect(board.deckTop).toEqual([]);
  });

  it('puts every card in the deck, reset to untapped/unflipped/deckWrap', () => {
    const cards = [
      makeCard({ tap: true, flip: true, source: 'handWrap' }),
      makeCard({ tap: true, flip: false, source: 'battleWrap' }),
    ];

    const board = resetBoard(cards);

    expect(board.deck).toHaveLength(2);
    board.deck.forEach((card) => {
      expect(card.tap).toBe(false);
      expect(card.flip).toBe(false);
      expect(card.source).toBe('deckWrap');
    });
  });

  it('does not mutate the input cards (returns fresh objects)', () => {
    const original = makeCard({ tap: true, flip: true, source: 'handWrap' });

    const board = resetBoard([original]);

    expect(original.tap).toBe(true);
    expect(original.flip).toBe(true);
    expect(original.source).toBe('handWrap');
    expect(board.deck[0]).not.toBe(original);
  });

  it('preserves card identity fields (id, file)', () => {
    const card = makeCard({ id: 'abc', source: 'handWrap' });

    const board = resetBoard([card]);

    expect(board.deck[0].id).toBe('abc');
    expect(board.deck[0].file).toBe(null);
  });
});
