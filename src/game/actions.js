// Pure action-availability helper.
// Given a selection (array of card objects) returns the Set of valid action
// keys that can be applied to that selection.  Source zone is derived from
// selection[0].source — all selected cards must be in the same zone (enforced
// at selection time in handleMouseDown) so checking the first card is enough.
//
// Action keys (strings):
//   'tap'        — tap / untap selected cards
//   'flip'       — flip selected cards face-down / face-up
//   'reset'      — deselect all
//   'sendTop'    — send selected cards to top of deck
//   'sendBottom' — send selected cards to bottom of deck
//   'overlap'    — group selected cards into an overlap stack

const SEND_TO_DECK_SOURCES = new Set(['handWrap', 'trashWrap', 'deckTopWrap']);
const OVERLAP_SOURCES = new Set(['battleWrap', 'overlappedCardsWrap']);

export function getAvailableActions(selection) {
  if (!selection || selection.length === 0) return new Set();

  const source = selection[0].source;
  const actions = new Set(['tap', 'flip', 'reset']);

  if (SEND_TO_DECK_SOURCES.has(source)) {
    actions.add('sendTop');
    actions.add('sendBottom');
  }

  if (OVERLAP_SOURCES.has(source)) {
    actions.add('overlap');
  }

  return actions;
}
