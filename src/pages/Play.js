import Sortable from 'sortablejs';
import { ReactSortable } from "react-sortablejs";
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './Play.css';

function Play ({deck, setDeck}) {

	const [hand, setHand] = useState([]);
	const [trash, setTrash] = useState([]);
	const [mana, setMana] = useState([]);
    const [cardInPlay, setCardInPlay] = useState();

    useEffect(() => {
        console.log(deck)
		const changedDeck = [...deck]
		const changedTrash = [...trash]

        // remove if statement in PROD
        if (changedDeck.length < 100) {
            changedDeck.forEach((card) => {
                for (let i = 1; i < card["number"]; i++){
                    changedDeck.push(card)
                }
            })
            changedDeck.forEach((card) => {
                card["id"] = uuidv4()
            })
        }
        setDeck(changedDeck)
        setTrash(changedTrash)
        setCardInPlay()

        const handWrap = document.getElementById('handWrap');
        const trashWrap = document.getElementById('trashWrap');
        
        Sortable.create(handWrap);
        Sortable.create(trashWrap);
    }, []);
    
    function handleMovementOfCard (source, target) {
        const currSource = [...source]
        const currTarget = [...target]
        const currCardInPlay = cardInPlay
        
        let indexToRemove = 0
        currSource.forEach((element, index) => {
            if (element["id"] == currCardInPlay) {
                indexToRemove = index
            }
        })
        let card = currSource.splice(indexToRemove, 1)[0]
        currTarget.push(card)

        return [currSource, currTarget]
    }
    
    function drop(e) {

        let targetId = (e.target.tagName != "IMG") ? (e.target.id) : document.getElementById(e.target.id).parentElement.parentElement.id
        let changedState = []

        switch (targetId) {
            case "trashWrap":
                console.log("dropped in trash")
                changedState = handleMovementOfCard(hand, trash)
                setHand(changedState[0])
                setTrash(changedState[1])
                break
            case "handWrap":
                console.log("dropped in hand")
                changedState = handleMovementOfCard(trash, hand)
                setTrash(changedState[0])
                setHand(changedState[1])
                break
            default:
                setCardInPlay()
        }
    }
      
    function allowDrop(e) {
        e.preventDefault();
    }

    function handleMouseDown(e) {
        setCardInPlay(e.target.id)
        console.log(cardInPlay)
    }

    function shuffle(e) {
		e.preventDefault();
		const changedDeck = [...deck]
        let currentIndex = changedDeck.length
      
        while (currentIndex !== 0) {
          let randomIndex = Math.floor(Math.random() * currentIndex)
          currentIndex--
          [changedDeck[currentIndex], changedDeck[randomIndex]] = [changedDeck[randomIndex], changedDeck[currentIndex]]
        }
        setDeck(changedDeck)
        console.log(deck)
    }
    
	function draw(e){
		e.preventDefault();
		const changedDeck = [...deck]
        let drawnCard = changedDeck.pop()
        if (changedDeck.length == 0) {
            console.log("empty")
        }
        setDeck(changedDeck)
        console.log(deck)

        const changedHand = [...hand]
        changedHand.push(drawnCard)
        setHand(changedHand)
        console.log(hand)
    }
    
    return (
        <div>
            <h3>一人回し</h3>

            {/* バトルゾーン */}
            <div id="topArea" class="boxLayout">
                <div class="boxTitle">
                    バトルゾーン(<span id="battle.length">0</span>)
                </div>

            </div>
            
            {/* シールドゾーン */}
            <div id="middleArea" class="boxLayout">
                <div class="boxTitle">
                    シールドゾーン(<span id="shield.length">0</span>)
                </div>
            </div>
            
            {/* プレイヤーゾーン */}
            <div id="bottomArea" class="columnLayoutBottom">

                {/* 手札 */}
                <div id="hand" class="boxLayout">
                    <div class="boxTitle">
                        手札(<span id="hand.length">{hand.length}</span>)
                        <a id="placeholder_00" class="button" style={{marginLeft: 10 + "px"}}>placeholder_00</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_01" class="button">placeholder_01</a>
                        <a id="placeholder_02" class="button">placeholder_02</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="handWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {hand?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={URL.createObjectURL(card["file"])} width="78.75" height="110" alt="error" />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 墓地 */}
                <div id="trash" class="boxLayout">
                    <div class="boxTitle">
                        墓地(<span id="hand.length">{trash.length}</span>)
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_03" class="button">placeholder_03</a>
                        <a id="placeholder_04" class="button">placeholder_04</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="trashWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {trash?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={URL.createObjectURL(card["file"])} width="78.75" height="110" alt="error" />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* デッキ */}
                <div id="deck" class="boxLayout">
                    <div class="boxTitle">
                        デッキ(<span id="deck.length">{deck.length}</span>)
                    </div>
                    
                    <form onSubmit={draw}>
                        <button type='submit'>ドロー</button>
                    </form>

                    <form onSubmit={shuffle}>
                        <button type='submit'>シャッフル</button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Play;