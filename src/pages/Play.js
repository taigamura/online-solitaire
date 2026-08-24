import Sortable from 'sortablejs';
import React, { useState, useEffect } from 'react';
import './Play.css';
import cardBack from '../images/cardBack.jpg';
import { SideBySideMagnifier } from 'react-image-magnifiers';
import { shuffle as shuffleCards } from '../game/shuffle';
import {
  draw as drawCard,
  manaBoost as manaBoostCard,
  setOneShield as setOneShieldCard,
} from '../game/deck';
import {
  moveCards,
  moveCardsIntoOverlap,
  moveCardsOutOfOverlap,
  moveCardsToDeck,
} from '../game/move';
import { resetBoard } from '../game/board';
import { setFlipAll, setTapAll, toggleFlip, toggleTap, setTap, mapCardById } from '../game/card';
import { objectUrlFor } from '../objectUrlCache';

function Play({ deck, setDeck }) {
  const [cardsInPlay, setCardsInPlay] = useState([]);
  const [commandList, setCommandList] = useState({});
  const [turnCounter, setTurnCounter] = useState(1);

  const [boardState, setBoardState] = useState({
    hand: [],
    trash: [],
    mana: [],
    shield: [],
    battle: [],
    overlappedCards: [],
    deckTop: [],
    deck: [...deck],
  });

  const [viewDeck, setViewDeck] = useState(false);
  const [viewDeckTop, setViewDeckTop] = useState(false);
  const [canMagnify, setCanMagnify] = useState(false);
  const [canOverlap] = useState(true);
  const [canSortable] = useState(false);
  const [mouseRight, setMouseRight] = useState(false);
  const [overlapTop, setOverlapTop] = useState(false);

  const allCards = Object.values(boardState);
  const allPlayableAreaIds = Object.keys(boardState).map((x) => x + 'Wrap');

  useEffect(() => {
    if (canSortable) {
      const handWrap = document.getElementById('handWrap');
      const trashWrap = document.getElementById('trashWrap');
      const manaWrap = document.getElementById('manaWrap');
      const shieldWrap = document.getElementById('shieldWrap');
      const battleWrap = document.getElementById('battleWrap');

      Sortable.create(handWrap, { animation: 100 });
      Sortable.create(trashWrap, { animation: 100 });
      Sortable.create(manaWrap, { animation: 100 });
      Sortable.create(shieldWrap, { animation: 100 });
      Sortable.create(battleWrap, { animation: 100 });
    }

    if (viewDeckTop && canSortable) {
      const deckTopWrap = document.getElementById('deckTopWrap');
      Sortable.create(deckTopWrap, { animation: 100 });
    }

    if (viewDeck && canSortable) {
      const deckWrap = document.getElementById('deckWrap');
      Sortable.create(deckWrap, { animation: 100 });
    }

    if (boardState.overlappedCards.length > 0 && canOverlap && canSortable) {
      const overlappedCardsWraps = document.getElementsByClassName('cardWrap overlapWrap');
      for (var i = 0; i < overlappedCardsWraps.length; i++) {
        Sortable.create(overlappedCardsWraps[i], { animation: 100 });
      }
    }

    if (Object.keys(commandList).length > 0) {
      runCommandList();
    }

    listenDeckTopChange();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);
    // https://stackoverflow.com/questions/64434545/react-keydown-event-listener-is-being-called-multiple-times
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // Intentional dependency set. handleMouseDown/handleKeyUp/handleKeyDown are
    // redefined every render, so this effect already re-runs on each render — by
    // design: it re-registers the state-dependent key/mouse listeners and drives
    // the sequential command-list runner (runCommandList) and Sortable setup.
    // Listing the full reactive set the linter wants would not change this; a
    // real fix means memoising every handler (useCallback) and splitting this
    // effect, a larger refactor tracked separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleMouseDown, handleKeyUp, handleKeyDown]);

  // check which side mouse is on
  function handleMouseMove(e) {
    if (e.clientX > window.innerWidth / 2) {
      setMouseRight(true);
    } else {
      setMouseRight(false);
    }
  }

  // Runs a set of commands (functions) that need to run in sequence
  // setState will cause useEffect, creating a loop
  // on each iteration, one function must run as setState will run asynchronously
  function runCommandList() {
    const currCommandList = { ...commandList };

    if (currCommandList['shuffle'] > 0) {
      shuffle();
      currCommandList['shuffle']--;
      if (currCommandList['shuffle'] === 0) {
        delete currCommandList['shuffle'];
      }
    } else if (currCommandList['draw'] > 0) {
      draw();
      currCommandList['draw']--;
      if (currCommandList['draw'] === 0) {
        delete currCommandList['draw'];
      }
    } else if (currCommandList['shield'] > 0) {
      setOneShield();
      currCommandList['shield']--;
      if (currCommandList['shield'] === 0) {
        delete currCommandList['shield'];
      }
    } else if (currCommandList['manaUntapAll'] > 0) {
      manaUntapAll();
      currCommandList['manaUntapAll']--;
      if (currCommandList['manaUntapAll'] === 0) {
        delete currCommandList['manaUntapAll'];
      }
    } else if (currCommandList['battleUntapAll'] > 0) {
      battleUntapAll();
      currCommandList['battleUntapAll']--;
      if (currCommandList['battleUntapAll'] === 0) {
        delete currCommandList['battleUntapAll'];
      }
    }

    setCommandList(currCommandList);
  }

  function findOverlapGroupIdx(id) {
    let groupIdx = undefined;

    boardState.overlappedCards.forEach((group, i) => {
      group.forEach((card, j) => {
        if (id === card['id']) {
          groupIdx = i;
        }
      });
    });
    return groupIdx;
  }

  function tap(e) {
    e?.preventDefault();

    // The selected cards live inside boardState zones; toggle tap on each of them
    // immutably (fresh objects) wherever they sit, then refresh the selection to
    // point at the new objects so it stays in sync.
    const selectedIds = new Set(cardsInPlay.map((card) => card['id']));
    const toggleIfSelected = (card) => (selectedIds.has(card['id']) ? toggleTap(card) : card);

    const flatZones = ['hand', 'trash', 'mana', 'shield', 'battle', 'deck', 'deckTop'];
    const newBoardState = { ...boardState };
    flatZones.forEach((zone) => {
      newBoardState[zone] = boardState[zone].map(toggleIfSelected);
    });
    newBoardState.overlappedCards = boardState.overlappedCards.map((group) =>
      group.map(toggleIfSelected)
    );

    const updatedById = new Map();
    flatZones.forEach((zone) => {
      newBoardState[zone].forEach((card) => updatedById.set(card['id'], card));
    });
    newBoardState.overlappedCards.forEach((group) => {
      group.forEach((card) => updatedById.set(card['id'], card));
    });

    setBoardState(newBoardState);
    setCardsInPlay(cardsInPlay.map((card) => updatedById.get(card['id']) || card));
  }

  // when a single card is dragged ontop group, add to group
  // when a card is selected already in group, switch
  function overlap() {
    const currCardsInPlay = [...cardsInPlay];

    let illegalCards = [];
    currCardsInPlay.forEach((card, i) => {
      let groupIdx = findOverlapGroupIdx(card['id']);

      // if already in group, illegal
      if (groupIdx !== undefined) {
        illegalCards.push(card);
      }

      // only overlap if cards are in battle zone
      if (!(card['source'] === 'battleWrap' || card['source'] === 'overlappedCardsWrap')) {
        illegalCards.push(card);
      }
    });

    // check if overlap is called on already overlapped cards in same group
    // diff groups cannot be selected to begin with in handleMouseDown
    if (illegalCards.length > 0) {
      window.alert('同じグループで呼び出し禁止');
      setCardsInPlay([]);
    } else {
      // Fresh group of the selected cards, re-sourced and reversed so the first
      // selected card ends up on top — immutable, no mutation of the live cards.
      const group = currCardsInPlay
        .map((card) => ({ ...card, source: 'overlappedCardsWrap' }))
        .reverse();

      const [remainingBattle] = moveCards(
        boardState.battle,
        [],
        currCardsInPlay,
        'overlappedCardsWrap'
      );

      setBoardState((prevState) => ({
        ...prevState,
        battle: remainingBattle,
        overlappedCards: [...prevState.overlappedCards, group],
      }));
      setCardsInPlay([]);
    }
  }

  function drop(e) {
    const currBoardState = { ...boardState };
    const currCardsInPlay = [...cardsInPlay];
    let targetSource =
      e.target.tagName !== 'IMG'
        ? e.target.id
        : document.getElementById(e.target.id).parentElement.parentElement.id;
    let sourceId = currCardsInPlay[0]['source'];

    targetSource = targetSource.replace('Parent', '');

    let changedState = [];
    let source = sourceId.replace('Wrap', '');
    let target = targetSource.replace('Wrap', '');

    if ((source.includes('overlap') || target.includes('overlap')) && source !== target) {
      // if not dropped in empty space of overlappedCardsWrap
      if (!e.target.id.includes('overlappedCardsWrap')) {
        if (source.includes('overlap')) {
          changedState = moveCardsOutOfOverlap(
            boardState[source],
            boardState[target],
            currCardsInPlay,
            targetSource
          );
        } else {
          changedState = moveCardsIntoOverlap(
            boardState[source],
            boardState[target],
            currCardsInPlay,
            e.target.id,
            overlapTop,
            targetSource
          );
        }
        currBoardState[source] = changedState[0];
        currBoardState[target] = changedState[1];
        setBoardState(currBoardState);
      }
    } else if (source !== target) {
      changedState = moveCards(
        boardState[source],
        boardState[target],
        currCardsInPlay,
        targetSource
      );
      currBoardState[source] = changedState[0];
      currBoardState[target] = changedState[1];
      setBoardState(currBoardState);
    }

    setCardsInPlay([]);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function findCard(id) {
    let to_return = undefined;
    allCards.forEach((cardArea, i) => {
      cardArea.forEach((card, j) => {
        if (card['id'] === id) {
          to_return = card;
        }
      });
    });

    // if to_return is overlapped
    if (to_return === undefined) {
      boardState.overlappedCards.forEach((group, i) => {
        group.forEach((card, j) => {
          if (card['id'] === id) {
            to_return = card;
          }
        });
      });
    }

    return to_return;
  }

  function handleMouseDown(e) {
    let changedCardsInPlay = [...cardsInPlay];
    let selectedCard = findCard(e.target.id);

    // selectedCard must not be undefined (can be undefined when magnified)
    if (selectedCard) {
      // selected must be a card in playable area (not divs and other stuff) or grouped
      if (
        allPlayableAreaIds.includes(selectedCard['source']) ||
        findOverlapGroupIdx(selectedCard['id']) !== undefined
      ) {
        // must be unique
        if (!changedCardsInPlay.find((element) => element.id === selectedCard.id)) {
          if (changedCardsInPlay.length > 0) {
            // selected must be a part of same area else, clear card in play, if different groups, also clear
            if (
              selectedCard['source'] !== changedCardsInPlay[0]['source'] ||
              findOverlapGroupIdx(selectedCard['id']) !==
                findOverlapGroupIdx(changedCardsInPlay[0]['id'])
            ) {
              changedCardsInPlay = [];
            }
          }
          changedCardsInPlay.push(selectedCard);
          setCardsInPlay(changedCardsInPlay);
        }
      }
    }
  }

  function shuffle(e) {
    e?.preventDefault();
    const currDeck = shuffleCards(boardState.deck);
    setBoardState((prevState) => {
      return { ...prevState, deck: currDeck };
    });
  }

  function shuffleDeckTop(e) {
    e?.preventDefault();
    setBoardState((prevState) => {
      return { ...prevState, deckTop: shuffleCards(prevState.deckTop) };
    });
  }

  function manaBoost(e) {
    e?.preventDefault();
    if (boardState.deck.length > 0) {
      setBoardState(manaBoostCard(boardState));
    } else {
      window.alert('山札はありません');
    }
  }

  function draw(e) {
    e?.preventDefault();
    if (boardState.deck.length > 0) {
      setBoardState(drawCard(boardState));
    } else {
      window.alert('山札はありません');
    }
  }

  function setOneShield(e) {
    e?.preventDefault();
    if (boardState.deck.length > 0) {
      setBoardState(setOneShieldCard(boardState));
    } else {
      window.alert('デッキはありません');
    }
  }

  function handleCardClass(card) {
    let classString = '';

    if (card['tap']) {
      classString = 'card tap';
    } else {
      classString = 'card uptap';
    }

    if (canMagnify) {
      classString = classString + ' magnify';
    } else {
      classString = classString + ' unmagnify';
    }

    return classString;
  }

  function handleCardImgSrc(card) {
    let cardImg = '';
    if (card['flip']) {
      cardImg = cardBack;
    } else {
      cardImg = objectUrlFor(card['file']);
    }
    return cardImg;
  }

  // Accessible label for a card image: face-down cards read as such, otherwise
  // fall back to the uploaded file name so screen readers can tell cards apart.
  function handleCardImgAlt(card) {
    if (card['flip']) {
      return '裏向きのカード';
    }
    return card['file']?.name ?? 'カード';
  }

  function isCardInTarget(id, target) {
    const currTarget = [...target];
    let isFound = false;
    currTarget.forEach((element) => {
      if (element['id'] === id) {
        isFound = true;
      }
    });
    return isFound;
  }

  function flipCardInTarget(id, target) {
    return mapCardById(target, id, toggleFlip);
  }

  function flipCardWithId(id) {
    const currBoardState = { ...boardState };
    let target = '';

    if (isCardInTarget(id, boardState.hand)) {
      target = 'hand';
    } else if (isCardInTarget(id, boardState.trash)) {
      target = 'trash';
    } else if (isCardInTarget(id, boardState.shield)) {
      target = 'shield';
    } else if (isCardInTarget(id, boardState.battle)) {
      target = 'battle';
    } else if (isCardInTarget(id, boardState.mana)) {
      target = 'mana';
    } else if (isCardInTarget(id, boardState.deck)) {
      target = 'deck';
    } else if (isCardInTarget(id, boardState.overlappedCards)) {
      target = 'overlappedCards';
    } else if (isCardInTarget(id, boardState.deckTop)) {
      target = 'deckTop';
    }

    currBoardState[target] = flipCardInTarget(id, boardState[target]);
    setBoardState(currBoardState);
  }

  function untapCardInTarget(id, target) {
    return mapCardById(target, id, (card) => setTap(card, false));
  }

  function untapCardWithId(id) {
    const currBoardState = { ...boardState };
    let target = '';

    if (isCardInTarget(id, boardState.hand)) {
      target = 'hand';
    } else if (isCardInTarget(id, boardState.trash)) {
      target = 'trash';
    } else if (isCardInTarget(id, boardState.shield)) {
      target = 'shield';
    } else if (isCardInTarget(id, boardState.battle)) {
      target = 'battle';
    } else if (isCardInTarget(id, boardState.mana)) {
      target = 'mana';
    } else if (isCardInTarget(id, boardState.deck)) {
      target = 'deck';
    } else if (isCardInTarget(id, boardState.overlappedCards)) {
      target = 'overlappedCards';
    } else if (isCardInTarget(id, boardState.deckTop)) {
      target = 'deckTop';
    }

    currBoardState[target] = untapCardInTarget(id, boardState[target]);
    setBoardState(currBoardState);
  }

  function flip(e) {
    e?.preventDefault();
    cardsInPlay.forEach((element, i) => {
      flipCardWithId(element['id']);
    });
  }

  function resetSelected(e) {
    e?.preventDefault();
    setCardsInPlay([]);
  }

  function toggleMagnify(e) {
    e?.preventDefault();
    if (canMagnify) {
      setCanMagnify(false);
    } else {
      setCanMagnify(true);
    }
  }

  function handleKeyDown(e) {
    // m
    if (e.keyCode === 77) {
      if (!canMagnify) {
        setCanMagnify(true);
      }
    }
  }

  function handleKeyUp(e) {
    // space
    if (e.keyCode === 32) {
      flip(e);
    }
    // esc
    if (e.keyCode === 27) {
      resetSelected(e);
    }
    // o
    if (e.keyCode === 79 && canOverlap) {
      overlap();
    }
    // t
    if (e.keyCode === 84) {
      tap(e);
    }
    // m
    if (e.keyCode === 77) {
      if (canMagnify) {
        setCanMagnify(false);
      }
    }
    // r
    if (e.keyCode === 82) {
      allCards.forEach((area, i) => {
        area.forEach((card, j) => {
          untapCardWithId(card['id']);
        });
      });
      setCardsInPlay([]);
    }
  }

  function handleViewDeck(e) {
    e.preventDefault();
    if (viewDeck) {
      setViewDeck(false);
    } else {
      setViewDeck(true);
    }
  }

  function handleOverlapTop(e) {
    e.preventDefault();
    if (overlapTop) {
      setOverlapTop(false);
    } else {
      setOverlapTop(true);
    }
  }

  function handleReset(e) {
    e.preventDefault();

    setBoardState(resetBoard(deck));
    setCardsInPlay([]);
    setTurnCounter(1);
  }

  function top(e) {
    let source = '';
    let setSource = '';

    switch (e.target.id) {
      case 'handTop':
        source = boardState.hand;
        setSource = 'hand';
        break;
      case 'deckTopTop':
        source = boardState.deckTop;
        setSource = 'deckTop';
        break;
      case 'trashTop':
        source = boardState.trash;
        setSource = 'trash';
        break;
      // no default
    }

    if (source.length === 0) {
      window.alert('手札はありません');
      return;
    }

    const selectedInSource = cardsInPlay.filter((card) =>
      source.some((element) => element['id'] === card['id'])
    );

    if (selectedInSource.length > 0) {
      const [remaining, newDeck] = moveCardsToDeck(
        boardState.deck,
        source,
        selectedInSource,
        'top'
      );
      setBoardState((prevState) => ({ ...prevState, [setSource]: remaining, deck: newDeck }));
      setCardsInPlay([]);
    }
  }

  function bottom(e) {
    let source = '';
    let setSource = '';

    switch (e.target.id) {
      case 'handBottom':
        source = boardState.hand;
        setSource = 'hand';
        break;
      case 'deckTopBottom':
        source = boardState.deckTop;
        setSource = 'deckTop';
        break;
      case 'trashBottom':
        source = boardState.trash;
        setSource = 'trash';
        break;
      // no default
    }

    if (source.length === 0) {
      window.alert('手札はありません');
      return;
    }

    const selectedInSource = cardsInPlay.filter((card) =>
      source.some((element) => element['id'] === card['id'])
    );

    if (selectedInSource.length > 0) {
      const [remaining, newDeck] = moveCardsToDeck(
        boardState.deck,
        source,
        selectedInSource,
        'bottom'
      );
      setBoardState((prevState) => ({ ...prevState, [setSource]: remaining, deck: newDeck }));
      setCardsInPlay([]);
    }
  }

  function handleCardOverlay(id) {
    const changedCardsInPlay = [...cardsInPlay];
    let card = changedCardsInPlay.find((element) => element.id === id);
    if (card) {
      return (
        <div>
          <div id={id} className="shade"></div>
          <div className="centered">{changedCardsInPlay.indexOf(card)}</div>
        </div>
      );
    }
  }

  function handleDeckTop(e) {
    e.preventDefault();

    if (boardState.deck.length > 0) {
      setViewDeckTop(true);

      setBoardState((prevState) => {
        const changedDeck = [...prevState.deck];
        const top = changedDeck.pop();
        const drawnCard = { ...top, source: 'deckTopWrap' };
        return {
          ...prevState,
          deck: changedDeck,
          deckTop: prevState.deckTop.concat(drawnCard),
        };
      });
    } else {
      window.alert('山札はありません');
    }
  }

  function handleCardImg(card) {
    if (canMagnify) {
      // change side of magnifier
      if (mouseRight) {
        return (
          <SideBySideMagnifier
            switchSides="true"
            id={card['id']}
            imageSrc={handleCardImgSrc(card)}
            alt={handleCardImgAlt(card)}
            className={handleCardClass(card)}
          />
        );
      } else {
        return (
          <SideBySideMagnifier
            id={card['id']}
            imageSrc={handleCardImgSrc(card)}
            alt={handleCardImgAlt(card)}
            className={handleCardClass(card)}
          />
        );
      }
    } else {
      return (
        <img
          id={card['id']}
          src={handleCardImgSrc(card)}
          alt={handleCardImgAlt(card)}
          className={handleCardClass(card)}
        />
      );
    }
  }

  function listenDeckTopChange() {
    if (boardState.deckTop.length === 0) {
      setViewDeckTop(false);
    }
  }

  function shuffleOnceDrawFiveSetFiveShield(e) {
    e.preventDefault();
    if (boardState.deck.length > 10) {
      setCommandList({
        shuffle: 1,
        draw: 5,
        shield: 5,
      });
    } else {
      window.alert('山札が足りません');
    }
  }

  function deselectAll(e) {
    setCardsInPlay([]);
  }

  function selectAll(e) {
    let source = e.target.id.replace('SelectAll', '');
    const currCardsInPlay = [];

    if (!source.includes('overlap')) {
      boardState[source].forEach((card, i) => {
        currCardsInPlay.push(card);
      });
    } else {
      let sourceId = parseInt(source.replace('overlap', ''));
      boardState.overlappedCards.forEach((group, i) => {
        if (sourceId === i) {
          group.forEach((card, j) => {
            currCardsInPlay.push(card);
          });
        }
      });
    }

    setCardsInPlay(currCardsInPlay);
  }

  function overlapUntapAll(e) {
    e?.preventDefault();
    const sourceId = parseInt(e.target.id.replace('overlap', ''));

    const currBoardState = { ...boardState };
    currBoardState.overlappedCards = boardState.overlappedCards.map((group, i) =>
      i === sourceId ? setTapAll(group, false) : group
    );

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function overlapTapAll(e) {
    e?.preventDefault();
    const sourceId = parseInt(e.target.id.replace('overlap', ''));

    const currBoardState = { ...boardState };
    currBoardState.overlappedCards = boardState.overlappedCards.map((group, i) =>
      i === sourceId ? setTapAll(group, true) : group
    );

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function battleUntapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.battle = setTapAll(boardState.battle, false);
    currBoardState.overlappedCards = boardState.overlappedCards.map((group) =>
      setTapAll(group, false)
    );

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function battleTapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.battle = setTapAll(boardState.battle, true);
    currBoardState.overlappedCards = boardState.overlappedCards.map((group) =>
      setTapAll(group, true)
    );

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function manaTapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.mana = setTapAll(boardState.mana, true);
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function manaUntapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.mana = setTapAll(boardState.mana, false);
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function turnDraw(e) {
    e.preventDefault();
    setTurnCounter((prevState) => {
      return prevState + 1;
    });
    setCommandList({
      battleUntapAll: 1,
      manaUntapAll: 1,
      draw: 1,
    });
  }

  function shieldFlipAllFalse(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.shield = setFlipAll(boardState.shield, false);
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function shieldFlipAllTrue(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.shield = setFlipAll(boardState.shield, true);
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function undoOverlap(e) {
    e?.preventDefault();
    let sourceId = parseInt(e.target.id.replace('overlap', ''));

    setBoardState((prevState) => {
      const group = prevState.overlappedCards[sourceId] ?? [];
      // Return the whole group to the battle zone; moveCardsOutOfOverlap rebuilds
      // both zones immutably and drops the now-empty group.
      const [newGroups, newBattle] = moveCardsOutOfOverlap(
        prevState.overlappedCards,
        prevState.battle,
        group,
        'battleWrap'
      );
      return { ...prevState, battle: newBattle, overlappedCards: newGroups };
    });

    setCardsInPlay([]);
  }

  function getOverlapTopMessage() {
    if (overlapTop) {
      return '重ねるモード（現在：下）';
    } else {
      return '重ねるモード（現在：上）';
    }
  }

  function getMagnifyMessage() {
    if (canMagnify) {
      return '拡大モード（現在：ON）';
    } else {
      return '拡大モード（現在：OFF）';
    }
  }

  // ========================================================================================================================================================
  // HTML

  return (
    <div className="playBoard">
      <div className="desktopNotice">
        このツールはマウス操作（ドラッグ＆ドロップ）を前提としているため、デスクトップでのご利用を推奨します。スマートフォンやタブレットでは一部の操作が動作しないことがあります。
      </div>

      {/* 説明 */}
      <div id="areaInfo" className="boxLayout zoneInfo zone--neutral">
        <div className="boxTitle">説明</div>
        <div>
          <b>Spacebar</b> = カード選択した状態でカードを裏向き表示 | <b>Esc</b> = 選択カードリセット
          | <b>M</b> = カード拡大モード | <b>O</b> = カード選択した状態でカードを重ねる | <b>R</b> =
          全カードアンタップ | <b>T</b> = カード選択した状態でカードをタップ
        </div>
      </div>

      {/* データ */}
      <div id="areaData" className="boxLayout zoneData zone--neutral">
        <div>
          現在ターン：<span id="turnCounter">{turnCounter}</span>
        </div>
        <div>
          Sortable：<span id="canSortable">{canSortable.toString()}</span>
        </div>

        <form onSubmit={handleOverlapTop}>
          <button type="submit">{getOverlapTopMessage()}</button>
        </form>

        <form onSubmit={toggleMagnify}>
          <button type="submit">{getMagnifyMessage()}</button>
        </form>

        <form onSubmit={tap}>
          <button type="submit">選択カードタップ</button>
        </form>

        <form onSubmit={flip}>
          <button type="submit">選択カード裏返し</button>
        </form>

        <form onSubmit={resetSelected}>
          <button type="submit">選択カードリセット</button>
        </form>
      </div>

      {/* バトルゾーン */}
      <div id="areaBattle" className="boxLayout zoneBattle zone--fire">
        <div className="boxTitle">
          バトルゾーン(<span id="battle.length">{boardState.battle.length}</span>)
          <button
            type="button"
            id="battleSelectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            type="button"
            id="battleDeselectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="buttonLayout">
          <button type="button" id="placeholder_battle_00" className="button" onClick={overlap}>
            選択カードを重ねる
          </button>
          <button
            type="button"
            id="placeholder_battle_01"
            className="button"
            onClick={battleTapAll}
          >
            全てタップ
          </button>
          <button
            type="button"
            id="placeholder_battle_02"
            className="button"
            onClick={battleUntapAll}
          >
            全てアンタップ
          </button>
        </div>
        <div className="boxLayout">
          <div
            id="battleWrapParent"
            className="columnLayoutBottom"
            onDrop={drop}
            onDragOver={allowDrop}
          >
            <ul id="battleWrap" className="cardWrap">
              {boardState.battle?.map((card, index) => (
                <li
                  id={index}
                  className={handleCardClass(card)}
                  draggable="true"
                  onMouseDown={handleMouseDown}
                >
                  {handleCardImg(card)}
                  {handleCardOverlay(card['id'])}
                </li>
              ))}
            </ul>
            {boardState.overlappedCards?.map((group, i) => (
              <div>
                <button
                  type="button"
                  id={'overlap' + i + 'SelectAll'}
                  className="button"
                  onClick={selectAll}
                >
                  全選択
                </button>
                <button
                  type="button"
                  id={'overlap' + i + 'DeselectAll'}
                  className="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={deselectAll}
                >
                  全解除
                </button>
                <button
                  type="button"
                  id={'overlap' + i}
                  className="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={undoOverlap}
                >
                  重ね解除
                </button>
                <button
                  type="button"
                  id={'overlap' + i + 'TapAll'}
                  className="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={overlapTapAll}
                >
                  全てタップ
                </button>
                <button
                  type="button"
                  id={'overlap' + i + 'UntapAll'}
                  className="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={overlapUntapAll}
                >
                  全てアンタップ
                </button>
                <ul id="overlappedCardsWrap" className="cardWrap overlapWrap">
                  {group.map((card, j) => (
                    <li
                      id={j}
                      className={handleCardClass(card) + ' overlap'}
                      draggable="true"
                      onMouseDown={handleMouseDown}
                    >
                      {handleCardImg(card)}
                      {handleCardOverlay(card['id'])}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* シールドゾーン */}
      <div id="shield" className="boxLayout zoneShield zone--light">
        <div className="boxTitle">
          シールドゾーン(<span id="shield.length">{boardState.shield.length}</span>)
          <button
            type="button"
            id="shieldSelectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            type="button"
            id="shieldDeselectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="buttonLayout">
          <button
            type="button"
            id="placeholder_shield_00"
            className="button"
            onClick={shieldFlipAllFalse}
          >
            シールド全て表
          </button>
          <button
            type="button"
            id="placeholder_shield_01"
            className="button"
            onClick={shieldFlipAllTrue}
          >
            シールド全て裏
          </button>
        </div>
        <div className="boxLayout">
          <ul id="shieldWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
            {boardState.shield?.map((card, index) => (
              <li
                id={index}
                className={handleCardClass(card)}
                draggable="true"
                onMouseDown={handleMouseDown}
              >
                {handleCardImg(card)}
                {handleCardOverlay(card['id'])}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 手札 */}
      <div id="hand" className="boxLayout zoneHand zone--water">
        <div className="boxTitle">
          手札(<span id="hand.length">{boardState.hand.length}</span>)
          <button
            type="button"
            id="handSelectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            type="button"
            id="handDeselectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="buttonLayout">
          <button type="button" id="handBottom" className="button" onClick={bottom}>
            選択カードを山札の下に置く
          </button>
          <button type="button" id="handTop" className="button" onClick={top}>
            選択カードを山札の上に置く
          </button>
        </div>
        <div className="boxLayout">
          <ul id="handWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
            {boardState.hand?.map((card, index) => (
              <li
                id={index}
                className={handleCardClass(card)}
                draggable="true"
                onMouseDown={handleMouseDown}
              >
                {handleCardImg(card)}
                {handleCardOverlay(card['id'])}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* デッキ */}
      <div id="deck" className="boxLayout zoneDeck zone--neutral">
        <div className="boxTitle">
          デッキ(<span id="deck.length">{boardState.deck.length}</span>)
        </div>

        <form onSubmit={shuffleOnceDrawFiveSetFiveShield}>
          <button type="submit">シャッフル, 5 枚ドロー, 5 枚シールド化</button>
        </form>

        <form onSubmit={shuffle}>
          <button type="submit">シャッフル</button>
        </form>

        <form onSubmit={draw}>
          <button type="submit">1 枚ドロー</button>
        </form>

        <form onSubmit={turnDraw}>
          <button type="submit">ターンドロー</button>
        </form>

        <form onSubmit={setOneShield}>
          <button type="submit">1 枚シールド化</button>
        </form>

        <form onSubmit={handleDeckTop}>
          <button type="submit">デッキ上 1 枚確認</button>
        </form>

        <form onSubmit={handleViewDeck}>
          <button type="submit">デッキを確認</button>
        </form>

        <form onSubmit={handleReset}>
          <button type="submit">リセット</button>
        </form>
      </div>

      {/* マナゾーン */}
      <div id="mana" className="boxLayout zoneMana zone--nature">
        <div className="boxTitle">
          マナゾーン(<span id="mana.length">{boardState.mana.length}</span>)
          <button
            type="button"
            id="manaSelectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            type="button"
            id="manaDeselectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="buttonLayout">
          <button type="button" id="manaTapAll" className="button" onClick={manaTapAll}>
            全てタップ
          </button>
          <button type="button" id="manaUntapAll" className="button" onClick={manaUntapAll}>
            全てアンタップ
          </button>
          <button type="button" id="placeholder_mana_02" className="button" onClick={manaBoost}>
            1 枚マナブースト
          </button>
        </div>
        <div className="boxLayout">
          <ul id="manaWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
            {boardState.mana?.map((card, index) => (
              <li
                id={index}
                className={handleCardClass(card)}
                draggable="true"
                onMouseDown={handleMouseDown}
              >
                {handleCardImg(card)}
                {handleCardOverlay(card['id'])}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 墓地 */}
      <div id="trash" className="boxLayout zoneTrash zone--darkness">
        <div className="boxTitle">
          墓地(<span id="trash.length">{boardState.trash.length}</span>)
          <button
            type="button"
            id="trashSelectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </button>
          <button
            type="button"
            id="trashDeselectAll"
            className="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </button>
        </div>
        <div className="buttonLayout">
          <button type="button" id="trashBottom" className="button" onClick={bottom}>
            選択カードを山札の下に置く
          </button>
          <button type="button" id="trashTop" className="button" onClick={top}>
            選択カードを山札の上に置く
          </button>
          <button type="button" id="trashShuffle" className="button" onClick={shuffleDeckTop}>
            シャッフル
          </button>
        </div>
        <div className="boxLayout">
          <ul id="trashWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
            {boardState.trash?.map((card, index) => (
              <li
                id={index}
                className={handleCardClass(card)}
                draggable="true"
                onMouseDown={handleMouseDown}
              >
                {handleCardImg(card)}
                {handleCardOverlay(card['id'])}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 山札上X枚確認 */}
      {viewDeckTop && (
        <div id="deckTop" className="boxLayout zoneDeckTop zone--neutral">
          <div className="boxTitle">
            山札上(<span id="deckTop.length">{boardState.deckTop.length}</span>)枚確認
            <button
              type="button"
              id="deckTopSelectAll"
              className="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </button>
            <button
              type="button"
              id="deckTopDeselectAll"
              className="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </button>
          </div>
          <div className="buttonLayout">
            <button type="button" id="deckTopBottom" className="button" onClick={bottom}>
              選択カードを山札の下に置く
            </button>
            <button type="button" id="deckTopTop" className="button" onClick={top}>
              選択カードを山札の上に置く
            </button>
            <button type="button" id="deckTopShuffle" className="button" onClick={shuffleDeckTop}>
              シャッフル
            </button>
            <button type="button" id="deckTopOne" className="button" onClick={handleDeckTop}>
              デッキ上 1 枚確認
            </button>
          </div>
          <div className="boxLayout">
            <ul id="deckTopWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.deckTop?.map((card, index) => (
                <li
                  id={index}
                  className={handleCardClass(card)}
                  draggable="true"
                  onMouseDown={handleMouseDown}
                >
                  {handleCardImg(card)}
                  {handleCardOverlay(card['id'])}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* デッキ確認 */}
      {viewDeck && (
        <div id="area4" className="boxLayout zoneDeckView">
          <div className="boxTitle">
            デッキ確認(<span id="deckView.length">{boardState.deck.length}</span>)
            <button
              type="button"
              id="deckSelectAll"
              className="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </button>
            <button
              type="button"
              id="deckDeselectAll"
              className="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </button>
          </div>
          <div className="buttonLayout">
            <button type="button" id="deckShuffle" className="button" onClick={shuffle}>
              シャッフル
            </button>
          </div>
          <div className="boxLayout">
            <ul id="deckWrap" className="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {[...(boardState.deck ?? [])].reverse().map((card, index) => (
                <li
                  id={index}
                  className={handleCardClass(card)}
                  draggable="true"
                  onMouseDown={handleMouseDown}
                >
                  {handleCardImg(card)}
                  {handleCardOverlay(card['id'])}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Play;
