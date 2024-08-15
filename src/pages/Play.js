import Sortable from 'sortablejs';
import { ReactSortable } from "react-sortablejs";
import React, { useState, useEffect } from 'react';
import './Play.css';
import cardBack from "../images/cardBack.jpg";

function Play ({deck, setDeck}) {

	const [hand, setHand] = useState([]);
	const [trash, setTrash] = useState([]);
	const [mana, setMana] = useState([]);
	const [shield, setShield] = useState([]);
	const [battle, setBattle] = useState([]);

    const [cardInPlay, setCardInPlay] = useState({});

    useEffect(() => {
        const handWrap = document.getElementById('handWrap');
        const trashWrap = document.getElementById('trashWrap');
        const manaWrap = document.getElementById('manaWrap');
        const shieldWrap = document.getElementById('shieldWrap');
        const battleWrap = document.getElementById('battleWrap');
        
        Sortable.create(handWrap);
        Sortable.create(trashWrap);
        Sortable.create(manaWrap);
        Sortable.create(shieldWrap);
        Sortable.create(battleWrap);
        
        document.addEventListener("keyup", handleKeyUp);
        return () => document.removeEventListener("keyup", handleKeyUp);
    }, [handleKeyUp]);
    
    function handleMovementOfCard (source, target) {
        const currSource = [...source]
        const currTarget = [...target]
        const currCardInPlay = cardInPlay
        
        let indexToRemove = 0
        currSource.forEach((element, index) => {
            if (element["id"] == currCardInPlay["id"]) {
                indexToRemove = index
            }
        })
        let card = currSource.splice(indexToRemove, 1)[0]
        currTarget.push(card)

        return [currSource, currTarget]
    }
    
    function drop(e) {

        const currCardInPlay = cardInPlay

        let sourceId = currCardInPlay["source"]
        let targetId = (e.target.tagName != "IMG") ? (e.target.id) : document.getElementById(e.target.id).parentElement.parentElement.id
        let changedState = []

        switch (sourceId) {

            case "handWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
                        changedState = handleMovementOfCard(hand, trash)
                        setHand(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(hand, shield)
                        setHand(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(hand, battle)
                        setHand(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(hand, mana)
                        setHand(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                }
                break

            case "trashWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(trash, hand)
                        setTrash(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(trash, shield)
                        setTrash(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(trash, battle)
                        setTrash(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(trash, mana)
                        setTrash(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                }
                break
            
            case "shieldWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(shield, trash)
                        setShield(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(shield, hand)
                        setShield(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(shield, battle)
                        setShield(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(shield, mana)
                        setShield(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                }
                break
            
            case "battleWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(battle, trash)
                        setBattle(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(battle, hand)
                        setBattle(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(battle, shield)
                        setBattle(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(battle, mana)
                        setBattle(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                }
                break
            
            case "manaWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(mana, trash)
                        setMana(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(mana, hand)
                        setMana(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(mana, shield)
                        setMana(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(mana, battle)
                        setMana(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        currCardInPlay["source"] = "manaWrap"
                        break
                }
                break
        }
        setCardInPlay(currCardInPlay)
    }
      
    function allowDrop(e) {
        e.preventDefault();
    }

    function handleMouseDown(e) {
        setCardInPlay({
            source: document.getElementById(e.target.id).parentElement.parentElement.id,
            id: e.target.id
        })
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
    }
    
	function draw(e){
		e.preventDefault();
		const changedDeck = [...deck]
        let drawnCard = changedDeck.pop()
        setDeck(changedDeck)

        const changedHand = [...hand]
        changedHand.push(drawnCard)
        setHand(changedHand)
    }
    
	function setOneShield(e){
		e.preventDefault();
		const changedDeck = [...deck]
        let drawnCard = changedDeck.pop()
        setDeck(changedDeck)
        drawnCard["flip"] = true

        const changedShield = [...shield]
        changedShield.push(drawnCard)
        setShield(changedShield)
    }

    function cardImg(card) {
        return (card["flip"]) ? cardBack : (URL.createObjectURL(card["file"]))
    }

    function isCardInTarget(id, target) {
        const currTarget = [...target]
        let isFound = false
        currTarget.forEach((element) => {
            if (element["id"] == id) {
                isFound = true
            }
        })
        return isFound
    }

    function flipCardInTarget(id, target) {
        const currTarget = [...target]
        currTarget.forEach((element) => {
            if (element["id"] == id) {
                (element["flip"]) ? (element["flip"] = false) : (element["flip"] = true)
            }
        })
        return currTarget
    }

    function flipCardWithId(id) {
        if (isCardInTarget(id, hand)) setHand(flipCardInTarget(id, hand)) 
        else if (isCardInTarget(id, trash)) setTrash(flipCardInTarget(id, trash))
        else if (isCardInTarget(id, shield)) setShield(flipCardInTarget(id, shield))
        else if (isCardInTarget(id, battle)) setBattle(flipCardInTarget(id, battle))
        else if (isCardInTarget(id, mana)) setMana(flipCardInTarget(id, mana))
    }

    function handleKeyUp (e) {
        if (e.keyCode === 32) {
            flipCardWithId(cardInPlay["id"])
        }
    }
    
    return (
        <div>
            {/* バトルゾーン */}
            <div id="topArea" class="boxLayout">
                <div class="boxTitle">
                    バトルゾーン(<span id="battle.length">{battle.length}</span>)
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_battle_00" class="button">placeholder_battle_00</a>
                    <a id="placeholder_battle_01" class="button">placeholder_battle_01</a>
                </div>
                <div class="boxLayout"></div>
                <ul id="battleWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                    {battle?.map((card, index) => (
                        <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                            <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* シールドゾーン */}
            <div id="middleArea" class="boxLayout">
                <div class="boxTitle">
                    シールドゾーン(<span id="shield.length">{shield.length}</span>)
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_shield_00" class="button">placeholder_shield_00</a>
                    <a id="placeholder_shield_01" class="button">placeholder_shield_01</a>
                </div>
                <div class="boxLayout"></div>
                <ul id="shieldWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                    {shield?.map((card, index) => (
                        <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                            <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* プレイヤーゾーン */}
            <div id="bottomArea" class="columnLayoutBottom">

                {/* 手札 */}
                <div id="hand" class="boxLayout">
                    <div class="boxTitle">
                        手札(<span id="hand.length">{hand.length}</span>)
                        <a id="placeholder_hand_00" class="button" style={{marginLeft: 10 + "px"}}>placeholder_hand_00</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_hand_01" class="button">placeholder_hand_01</a>
                        <a id="placeholder_hand_02" class="button">placeholder_hand_02</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="handWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {hand?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* マナゾーン */}
                <div id="mana" class="boxLayout">
                    <div class="boxTitle">
                        マナゾーン(<span id="mana.length">{mana.length}</span>)
                        <a id="placeholder_mana_00" class="button" style={{marginLeft: 10 + "px"}}>placeholder_mana_00</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_mana_01" class="button">placeholder_mana_01</a>
                        <a id="placeholder_mana_02" class="button">placeholder_mana_02</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="manaWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {mana?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
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
                        <a id="placeholder_trash_00" class="button">placeholder_trash_00</a>
                        <a id="placeholder_trash_01" class="button">placeholder_trash_01</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="trashWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {trash?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
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
                        <button type='submit'>一枚ドロー</button>
                    </form>

                    <form onSubmit={shuffle}>
                        <button type='submit'>シャッフル</button>
                    </form>
                    
                    <form onSubmit={setOneShield}>
                        <button type='submit'>1枚シールド化</button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Play;