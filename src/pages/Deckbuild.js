import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Deckbuild.css';
import { objectUrlFor } from '../objectUrlCache';

// Group cards by their File into [{ key: file, value: [...card] }, ...].
// Replaces Map.groupBy (ES2024), which isn't available on older browsers.
function groupByFile(cards) {
  const groups = new Map();
  cards.forEach((card) => {
    const existing = groups.get(card.file);
    if (existing) {
      existing.push(card);
    } else {
      groups.set(card.file, [card]);
    }
  });
  return Array.from(groups, ([key, value]) => ({ key, value }));
}

// function component
function Deckbuild({ deck, setDeck }) {
  const navigate = useNavigate();
  // deckGroupBy is [{key: file, value: [...card]}, ...]
  const [deckGroupBy, setDeckGroupBy] = useState([]);

  function handleChange(e) {
    e.preventDefault();
    const files = [...e.target.files];
    let currDeck = [];
    files.forEach((file) => {
      let card = {
        file: file,
        id: uuidv4(),
        flip: false,
        tap: false,
        source: 'deckWrap',
      };
      currDeck.push(card);
    });
    setDeck(currDeck);
    setDeckGroupBy(groupByFile(currDeck));
  }

  function handleReset(e) {
    e.preventDefault();
    setDeck([]);
    setDeckGroupBy([]);
    window.location.reload();
  }

  function handleConfirmDeck(e) {
    e.preventDefault();
    navigate('/play');
  }

  function handleNumberChange(e, targetCard) {
    e.preventDefault();
    const currDeck = [...deck];

    let initialNumber = 0;
    let targetNumber = parseInt(e.target.value);

    // count how many already in deck
    deck.forEach((card) => {
      if (card['file'] === targetCard['file']) {
        initialNumber++;
      }
    });

    // if cards need to be added
    if (initialNumber < targetNumber) {
      for (let i = initialNumber; i < targetNumber; i++) {
        let card = {
          file: targetCard['file'],
          id: uuidv4(),
          flip: false,
          tap: false,
          source: 'deckWrap',
        };
        currDeck.push(card);
      }
    }
    // if cards need to be removed
    else if (initialNumber > targetNumber) {
      let indexesToRemove = [];
      deck.forEach((card, i) => {
        if (card['file'] === targetCard['file']) {
          indexesToRemove.push(i);
        }
      });
      let toRemove = initialNumber - targetNumber;
      indexesToRemove.forEach((indexToRemove) => {
        if (toRemove !== 0) {
          currDeck.splice(indexToRemove, 1);
          toRemove--;
        }
      });
    }

    setDeck(currDeck);
    setDeckGroupBy(groupByFile(currDeck));
  }

  return (
    <div>
      <h1>デュエルマスターズ一人回し用ツール by taigamura</h1>

      <div id="readme" className="boxLayout">
        <p>
          下からカード写真を追加してください。画像は高画質のものを使ってください（デュエルマスターズ公式カード検索から保存した写真推奨）。その後、デッキ確定をクリック。
        </p>
      </div>

      {/* デュエマは 63mm x 88mm */}
      <div id="deckPreview" className="boxLayout">
        <div className="boxTitle">
          デッキ(<span id="deck.length">{deck.length}</span>)枚
        </div>
        <div className="buttonLayout">
          <input className="button" type="file" multiple onChange={handleChange} accept="image/*" />
          <button type="button" id="reset" className="button" onClick={handleReset}>
            リセット
          </button>
          <button type="button" id="confirmDeck" className="button" onClick={handleConfirmDeck}>
            デッキ確定
          </button>
        </div>
        <div className="boxLayout"></div>
        <ul id="" className="deckPreviewWrap">
          {deckGroupBy.map((group, i) => (
            <li className="deckPreviewWrap">
              {[...Array(group.value.length)].map(() => (
                <img src={objectUrlFor(group['key'])} width="78.75" height="110" alt="error" />
              ))}

              <select
                id={i}
                placeholder={1}
                onChange={(event) => handleNumberChange(event, group['value'][0])}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Deckbuild;
