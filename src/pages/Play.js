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
import { moveCards } from '../game/move';

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
  const [canOverlap, setCanOverlap] = useState(true);
  const [canSortable, setCanSortable] = useState(false);
  const [mouseRight, setMouseRight] = useState(false);
  const [overlapTop, setOverlapTop] = useState(false);

  const allCards = Object.values(boardState);
  const allPlayableAreaIds = Object.keys(boardState).map((x) => x + 'Wrap');

  const copy = [...deck];

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
  }, [handleMouseDown, handleKeyUp, handleKeyDown]); // <-- here put the parameter to listen, react will re-render component when your state will be changed

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
      if (currCommandList['shuffle'] == 0) {
        delete currCommandList['shuffle'];
      }
    } else if (currCommandList['draw'] > 0) {
      draw();
      currCommandList['draw']--;
      if (currCommandList['draw'] == 0) {
        delete currCommandList['draw'];
      }
    } else if (currCommandList['shield'] > 0) {
      setOneShield();
      currCommandList['shield']--;
      if (currCommandList['shield'] == 0) {
        delete currCommandList['shield'];
      }
    } else if (currCommandList['manaUntapAll'] > 0) {
      manaUntapAll();
      currCommandList['manaUntapAll']--;
      if (currCommandList['manaUntapAll'] == 0) {
        delete currCommandList['manaUntapAll'];
      }
    } else if (currCommandList['battleUntapAll'] > 0) {
      battleUntapAll();
      currCommandList['battleUntapAll']--;
      if (currCommandList['battleUntapAll'] == 0) {
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

  function handleMovementOfCardOverlap(source, target, targetId) {
    let currSource = [...source];
    const currTarget = [...target];
    const changedCardsInPlay = [...cardsInPlay];

    // overlappedCards --> target
    if (source === boardState.overlappedCards) {
      // [[group idx, card idx], ...]
      let indexesToRemove = [];
      // find indexes to remove from source
      currSource.forEach((group, i) => {
        group.forEach((card, j) => {
          changedCardsInPlay.forEach((currcardsInPlay, k) => {
            if (card['id'] == currcardsInPlay['id']) {
              indexesToRemove.push([i, j]);
            }
          });
        });
      });

      if (indexesToRemove.length > 0) {
        for (var i = indexesToRemove.length - 1; i >= 0; i--) {
          // splice overlappedCards[group idx].splice([card idx])
          let card = currSource[indexesToRemove[i][0]].splice(indexesToRemove[i][1], 1)[0];
          currTarget.push(card);
        }
      }

      // filter empty groups
      let changedCurrSource = [];
      currSource.forEach((group, i) => {
        if (group.length > 0) {
          changedCurrSource.push(group);
        }
      });
      currSource = changedCurrSource;
    }
    // source --> overlappedCards
    else {
      let elementsToRemove = [];
      // find indexes to remove from source
      currSource.forEach((card, i) => {
        changedCardsInPlay.forEach((currcardsInPlay, j) => {
          if (card['id'] == currcardsInPlay['id']) {
            elementsToRemove.push(card);
          }
        });
      });

      // find which group to push into
      let groupIdx = findOverlapGroupIdx(targetId);

      if (elementsToRemove.length > 0) {
        for (var i = 0; i < elementsToRemove.length; i++) {
          let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0];

          // if overlapTop = true, then dropped cards are on top
          if (overlapTop) {
            currTarget[groupIdx].unshift(card);
          } else {
            currTarget[groupIdx].push(card);
          }
        }
      }
    }
    return [currSource, currTarget];
  }

  function tap(e) {
    e?.preventDefault();
    const currCardsInPlay = [...cardsInPlay];

    currCardsInPlay.forEach((card, i) => {
      if (card['tap']) {
        card['tap'] = false;
      } else {
        card['tap'] = true;
      }
    });

    setCardsInPlay(currCardsInPlay);
  }

  // when a single card is dragged ontop group, add to group
  // when a card is selected already in group, switch
  function overlap() {
    const currBoardState = { ...boardState };
    const currCardsInPlay = [...cardsInPlay];

    let illegalCards = [];
    currCardsInPlay.forEach((card, i) => {
      let groupIdx = findOverlapGroupIdx(card['id']);

      // if already in group, illegal
      if (groupIdx != undefined) {
        illegalCards.push(card);
      }

      // only overlap if cards are in battle zone
      if (!(card['source'] == 'battleWrap' || card['source'] == 'overlappedCardsWrap')) {
        console.log('card["source"]', card['source']);
        illegalCards.push(card);
      }
    });

    // check if overlap is called on already overlapped cards in same group
    // diff groups cannot be selected to begin with in handleMouseDown
    if (illegalCards.length > 0) {
      console.log(illegalCards);
      window.alert('同じグループで呼び出し禁止');
      setCardsInPlay([]);
    } else {
      let group = [];
      currCardsInPlay.map((element) => (element['source'] = 'overlappedCardsWrap'));
      currCardsInPlay.forEach((card, i) => {
        group.push(card);
      });
      // make selected first card the top
      group = group.reverse();

      let changedState = moveCards(
        boardState.battle,
        boardState.overlappedCards,
        currCardsInPlay,
        'overlappedCardsWrap'
      );

      currBoardState.battle = changedState[0];
      currBoardState.overlappedCards.push(group);

      setBoardState(currBoardState);
      setCardsInPlay([]);
    }
  }

  function drop(e) {
    console.log('e.target:', e.target);

    const currBoardState = { ...boardState };
    const currCardsInPlay = [...cardsInPlay];
    let targetSource =
      e.target.tagName != 'IMG'
        ? e.target.id
        : document.getElementById(e.target.id).parentElement.parentElement.id;
    let sourceId = currCardsInPlay[0]['source'];

    targetSource = targetSource.replace('Parent', '');

    console.log('sourceId:', sourceId);
    console.log('targetSource:', targetSource);

    let changedState = [];
    let source = sourceId.replace('Wrap', '');
    let target = targetSource.replace('Wrap', '');

    if ((source.includes('overlap') || target.includes('overlap')) && source != target) {
      // if not dropped in empty space of overlappedCardsWrap
      if (!e.target.id.includes('overlappedCardsWrap')) {
        changedState = handleMovementOfCardOverlap(
          boardState[source],
          boardState[target],
          e.target.id
        );
        currBoardState[source] = changedState[0];
        // if target is overlapped or not
        if (Array.isArray(changedState[1][0])) {
          changedState[1].map((group) => group.map((card) => (card['source'] = targetSource)));
        } else {
          changedState[1].map((card) => (card['source'] = targetSource));
        }
        console.log(changedState[1]);
        currBoardState[target] = changedState[1];
        setBoardState(currBoardState);
      }
    } else if (source != target) {
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
        findOverlapGroupIdx(selectedCard['id']) != undefined
      ) {
        // must be unique
        if (!changedCardsInPlay.find((element) => element.id === selectedCard.id)) {
          if (changedCardsInPlay.length > 0) {
            // selected must be a part of same area else, clear card in play, if different groups, also clear
            if (
              selectedCard['source'] != changedCardsInPlay[0]['source'] ||
              findOverlapGroupIdx(selectedCard['id']) !=
                findOverlapGroupIdx(changedCardsInPlay[0]['id'])
            ) {
              changedCardsInPlay = [];
            }
          }
          changedCardsInPlay.push(selectedCard);
          setCardsInPlay(changedCardsInPlay);
        }
        console.log('changedCardsInPlay', changedCardsInPlay);
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
      cardImg = URL.createObjectURL(card['file']);
    }
    return cardImg;
  }

  function isCardInTarget(id, target) {
    const currTarget = [...target];
    let isFound = false;
    currTarget.forEach((element) => {
      if (element['id'] == id) {
        isFound = true;
      }
    });
    return isFound;
  }

  function flipCardInTarget(id, target) {
    const currTarget = [...target];
    currTarget.forEach((element) => {
      if (element['id'] == id) {
        element['flip'] ? (element['flip'] = false) : (element['flip'] = true);
      }
    });
    return currTarget;
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
    const currTarget = [...target];
    currTarget.forEach((card) => {
      if (card['id'] == id) {
        card['tap'] = false;
      }
    });
    return currTarget;
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
      console.log('run overlap');
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

    copy.forEach((card) => {
      card['tap'] = false;
      card['flip'] = false;
      card['source'] = 'deckWrap';
    });

    setBoardState({
      hand: [],
      trash: [],
      mana: [],
      shield: [],
      battle: [],
      overlappedCards: [],
      deckTop: [],
      deck: copy,
    });
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
    }

    const changedCardsInPlay = [...cardsInPlay];
    const currSource = [...source];
    const currDeck = [...boardState.deck];

    if (currSource.length > 0) {
      let elementsToRemove = [];
      changedCardsInPlay.forEach((card, i) => {
        currSource.forEach((element, j) => {
          if (element['id'] == card['id']) {
            elementsToRemove.push(card);
          }
        });
      });

      if (elementsToRemove.length > 0) {
        for (var i = elementsToRemove.length - 1; i >= 0; i--) {
          let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0];
          currDeck.push(card);
        }

        currDeck.forEach((card, i) => {
          card['source'] = 'deckWrap';
        });
        setBoardState((prevState) => {
          return { ...prevState, [setSource]: currSource };
        });
        setBoardState((prevState) => {
          return { ...prevState, deck: currDeck };
        });
        setCardsInPlay([]);
      }
    } else {
      window.alert('手札はありません');
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
    }

    const changedCardsInPlay = [...cardsInPlay];
    const currSource = [...source];
    const currDeck = [...boardState.deck];

    if (currSource.length > 0) {
      let elementsToRemove = [];
      changedCardsInPlay.forEach((card, i) => {
        currSource.forEach((element, j) => {
          if (element['id'] == card['id']) {
            elementsToRemove.push(card);
          }
        });
      });

      if (elementsToRemove.length > 0) {
        for (var i = 0; i < elementsToRemove.length; i++) {
          let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0];
          currDeck.unshift(card);
        }

        currDeck.forEach((card, i) => {
          card['source'] = 'deckWrap';
        });
        setBoardState((prevState) => {
          return { ...prevState, [setSource]: currSource };
        });
        setBoardState((prevState) => {
          return { ...prevState, deck: currDeck };
        });
        setCardsInPlay([]);
      }
    } else {
      window.alert('手札はありません');
    }
  }

  function handleCardOverlay(id) {
    const changedCardsInPlay = [...cardsInPlay];
    let card = changedCardsInPlay.find((element) => element.id === id);
    if (card) {
      return (
        <div>
          <div id={id} class="shade"></div>
          <div class="centered">{changedCardsInPlay.indexOf(card)}</div>
        </div>
      );
    }
  }

  function handleDeckTop(e) {
    e.preventDefault();

    if (boardState.deck.length > 0) {
      setViewDeckTop(true);

      const changedDeck = [...boardState.deck];
      let drawnCard = changedDeck.pop();
      setBoardState((prevState) => {
        return { ...prevState, deck: changedDeck };
      });

      const changedDeckTop = [...boardState.deckTop];
      drawnCard['source'] = 'deckTopWrap';
      changedDeckTop.push(drawnCard);
      setBoardState((prevState) => {
        return { ...prevState, deckTop: changedDeckTop };
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
            class={handleCardClass(card)}
          />
        );
      } else {
        return (
          <SideBySideMagnifier
            id={card['id']}
            imageSrc={handleCardImgSrc(card)}
            class={handleCardClass(card)}
          />
        );
      }
    } else {
      return <img id={card['id']} src={handleCardImgSrc(card)} class={handleCardClass(card)} />;
    }
  }

  function listenDeckTopChange() {
    if (boardState.deckTop.length == 0) {
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
        if (sourceId == i) {
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
    const currBoardState = { ...boardState };

    let sourceId = parseInt(e.target.id.replace('overlap', ''));

    currBoardState.overlappedCards.forEach((group, i) => {
      if (sourceId == i) {
        group.forEach((card) => {
          card['tap'] = false;
        });
      }
    });

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function overlapTapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    let sourceId = parseInt(e.target.id.replace('overlap', ''));

    currBoardState.overlappedCards.forEach((group, i) => {
      if (sourceId == i) {
        group.forEach((card) => {
          card['tap'] = true;
        });
      }
    });

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function battleUntapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.battle.forEach((card) => {
      card['tap'] = false;
    });

    currBoardState.overlappedCards.forEach((group) => {
      group.forEach((card) => {
        card['tap'] = false;
      });
    });

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function battleTapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.battle.forEach((card) => {
      card['tap'] = true;
    });

    currBoardState.overlappedCards.forEach((group) => {
      group.forEach((card) => {
        card['tap'] = true;
      });
    });

    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function manaTapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.mana.forEach((card) => {
      card['tap'] = true;
    });
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function manaUntapAll(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.mana.forEach((card) => {
      card['tap'] = false;
    });
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

    currBoardState.shield.forEach((card) => {
      card['flip'] = false;
    });
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function shieldFlipAllTrue(e) {
    e?.preventDefault();
    const currBoardState = { ...boardState };

    currBoardState.shield.forEach((card) => {
      card['flip'] = true;
    });
    setCardsInPlay([]);
    setBoardState(currBoardState);
  }

  function undoOverlap(e) {
    e?.preventDefault();
    let sourceId = parseInt(e.target.id.replace('overlap', ''));

    const currBoardState = { ...boardState };
    currBoardState.overlappedCards.forEach((group, i) => {
      if (i == sourceId) {
        while (group.length > 0) {
          let currCard = group.pop();
          currCard['source'] = 'battleWrap';
          currBoardState.battle.push(currCard);
        }
      }
    });

    // filter empty array from array
    currBoardState.overlappedCards = currBoardState.overlappedCards.filter((x) => x.length);

    setCardsInPlay([]);
    setBoardState(currBoardState);
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
    <div>
      {/* 説明 */}
      <div id="area0" class="boxLayout">
        <div class="boxTitle">説明</div>
        <div>
          <b>Spacebar</b> = カード選択した状態でカードを裏向き表示 | <b>Esc</b> = 選択カードリセット
          | <b>M</b> = カード拡大モード | <b>O</b> = カード選択した状態でカードを重ねる | <b>R</b> =
          全カードアンタップ | <b>T</b> = カード選択した状態でカードをタップ
        </div>
      </div>

      {/* データ */}
      <div id="area0" class="boxLayout">
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
      <div id="area0" class="boxLayout">
        <div class="boxTitle">
          バトルゾーン(<span id="battle.length">{boardState.battle.length}</span>)
          <a
            id="battleSelectAll"
            class="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={selectAll}
          >
            全選択
          </a>
          <a
            id="battleDeselectAll"
            class="button"
            style={{ marginLeft: 10 + 'px' }}
            onClick={deselectAll}
          >
            全解除
          </a>
        </div>
        <div class="buttonLayout">
          <a id="placeholder_battle_00" class="button" onClick={overlap}>
            選択カードを重ねる
          </a>
          <a id="placeholder_battle_01" class="button" onClick={battleTapAll}>
            全てタップ
          </a>
          <a id="placeholder_battle_01" class="button" onClick={battleUntapAll}>
            全てアンタップ
          </a>
        </div>
        <div class="boxLayout">
          <div
            id="battleWrapParent"
            class="columnLayoutBottom"
            onDrop={drop}
            onDragOver={allowDrop}
          >
            <ul id="battleWrap" class="cardWrap">
              {boardState.battle?.map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
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
                <a id={'overlap' + i + 'SelectAll'} class="button" onClick={selectAll}>
                  全選択
                </a>
                <a
                  id={'overlap' + i + 'DeselectAll'}
                  class="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={deselectAll}
                >
                  全解除
                </a>
                <a
                  id={'overlap' + i}
                  class="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={undoOverlap}
                >
                  重ね解除
                </a>
                <a
                  id={'overlap' + i + 'TapAll'}
                  class="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={overlapTapAll}
                >
                  全てタップ
                </a>
                <a
                  id={'overlap' + i + 'UntapAll'}
                  class="button"
                  style={{ marginLeft: 10 + 'px' }}
                  onClick={overlapUntapAll}
                >
                  全てアンタップ
                </a>
                <ul id="overlappedCardsWrap" class="cardWrap overlapWrap">
                  {group.map((card, j) => (
                    <li
                      id={j}
                      class={handleCardClass(card) + ' overlap'}
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

      <div id="area1" class="columnLayoutBottom">
        {/* シールドゾーン */}
        <div id="shield" class="boxLayout">
          <div class="boxTitle">
            シールドゾーン(<span id="shield.length">{boardState.shield.length}</span>)
            <a
              id="shieldSelectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </a>
            <a
              id="shieldDeselectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </a>
          </div>
          <div class="buttonLayout">
            <a id="placeholder_shield_00" class="button" onClick={shieldFlipAllFalse}>
              シールド全て表
            </a>
            <a id="placeholder_shield_01" class="button" onClick={shieldFlipAllTrue}>
              シールド全て裏
            </a>
          </div>
          <div class="boxLayout">
            <ul id="shieldWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.shield?.map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
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
        <div id="hand" class="boxLayout">
          <div class="boxTitle">
            手札(<span id="hand.length">{boardState.hand.length}</span>)
            <a
              id="handSelectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </a>
            <a
              id="handDeselectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </a>
          </div>
          <div class="buttonLayout">
            <a id="handBottom" class="button" onClick={bottom}>
              選択カードを山札の下に置く
            </a>
            <a id="handTop" class="button" onClick={top}>
              選択カードを山札の上に置く
            </a>
          </div>
          <div class="boxLayout">
            <div id="handWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.hand?.map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
                  draggable="true"
                  onMouseDown={handleMouseDown}
                >
                  {handleCardImg(card)}
                  {handleCardOverlay(card['id'])}
                </li>
              ))}
            </div>
          </div>
        </div>

        {/* デッキ */}
        <div id="deck" class="boxLayout">
          <div class="boxTitle">
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
      </div>

      {/* プレイヤーゾーン */}
      <div id="area2" class="columnLayoutBottom">
        {/* マナゾーン */}
        <div id="mana" class="boxLayout">
          <div class="boxTitle">
            マナゾーン(<span id="mana.length">{boardState.mana.length}</span>)
            <a
              id="manaSelectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </a>
            <a
              id="manaDeselectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </a>
          </div>
          <div class="buttonLayout">
            <a id="manaTapAll" class="button" onClick={manaTapAll}>
              全てタップ
            </a>
            <a id="manaUntapAll" class="button" onClick={manaUntapAll}>
              全てアンタップ
            </a>
            <a id="placeholder_mana_02" class="button" onClick={manaBoost}>
              1 枚マナブースト
            </a>
          </div>
          <div class="boxLayout">
            <ul id="manaWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.mana?.map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
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
        <div id="trash" class="boxLayout">
          <div class="boxTitle">
            墓地(<span id="hand.length">{boardState.trash.length}</span>)
            <a
              id="trashSelectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </a>
            <a
              id="trashDeselectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </a>
          </div>
          <div class="buttonLayout">
            <a id="trashBottom" class="button" onClick={bottom}>
              選択カードを山札の下に置く
            </a>
            <a id="trashTop" class="button" onClick={top}>
              選択カードを山札の上に置く
            </a>
            <a id="trashShuffle" class="button" onClick={shuffleDeckTop}>
              シャッフル
            </a>
          </div>
          <div class="boxLayout">
            <ul id="trashWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.trash?.map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
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
          <div id="deckTop" class="boxLayout">
            <div class="boxTitle">
              山札上(<span id="deckTop.length">{boardState.deckTop.length}</span>)枚確認
              <a
                id="deckTopSelectAll"
                class="button"
                style={{ marginLeft: 10 + 'px' }}
                onClick={selectAll}
              >
                全選択
              </a>
              <a
                id="deckTopDeselectAll"
                class="button"
                style={{ marginLeft: 10 + 'px' }}
                onClick={deselectAll}
              >
                全解除
              </a>
            </div>
            <div class="buttonLayout">
              <a id="deckTopBottom" class="button" onClick={bottom}>
                選択カードを山札の下に置く
              </a>
              <a id="deckTopTop" class="button" onClick={top}>
                選択カードを山札の上に置く
              </a>
              <a id="deckTopShuffle" class="button" onClick={shuffleDeckTop}>
                シャッフル
              </a>
              <a id="deckTopOne" class="button" onClick={handleDeckTop}>
                デッキ上 1 枚確認
              </a>
            </div>
            <div class="boxLayout">
              <ul id="deckTopWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                {boardState.deckTop?.map((card, index) => (
                  <li
                    id={index}
                    class={handleCardClass(card)}
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

      {/* デッキ確認 */}
      {viewDeck && (
        <div id="area4" class="boxLayout">
          <div class="boxTitle">
            デッキ確認(<span id="deck.length">{boardState.deck.length}</span>)
            <a
              id="deckSelectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={selectAll}
            >
              全選択
            </a>
            <a
              id="deckDeselectAll"
              class="button"
              style={{ marginLeft: 10 + 'px' }}
              onClick={deselectAll}
            >
              全解除
            </a>
          </div>
          <div class="buttonLayout">
            <a id="deckShuffle" class="button" onClick={shuffle}>
              シャッフル
            </a>
          </div>
          <div class="boxLayout">
            <ul id="deckWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
              {boardState.deck?.toReversed().map((card, index) => (
                <li
                  id={index}
                  class={handleCardClass(card)}
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
