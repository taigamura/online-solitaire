import Sortable from 'sortablejs';
import React, { useState, useEffect } from 'react';
import './Play.css';
import cardBack from "../images/cardBack.jpg";
import DragSelect from "dragselect";

function Play ({deck, setDeck}) {

	const [hand, setHand] = useState([]);
	const [trash, setTrash] = useState([]);
	const [mana, setMana] = useState([]);
	const [shield, setShield] = useState([]);
	const [battle, setBattle] = useState([]);
	const [deckTop, setDeckTop] = useState([]);
	const [viewDeck, setViewDeck] = useState(false);
	const [viewDeckTop, setViewDeckTop] = useState(false);

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

        if (viewDeckTop) {
            const deckTopWrap = document.getElementById('deckTopWrap');
            Sortable.create(deckTopWrap);
        }
        
        if (viewDeck) {
            const deckWrap = document.getElementById('deckWrap');
            Sortable.create(deckWrap);
        }

        const ds = new DragSelect({
            selectables: document.querySelectorAll('card')
        });

        listenDeckTopChange()
        
        document.addEventListener("keyup", handleKeyUp);
        // https://stackoverflow.com/questions/64434545/react-keydown-event-listener-is-being-called-multiple-times
        return () => document.removeEventListener("keyup", handleKeyUp);
    }, [handleKeyUp]); // <-- here put the parameter to listen, react will re-render component when your state will be changed
    
    function handleMovementOfCard (source, target) {
        const currSource = [...source]
        const currTarget = [...target]
        const currCardInPlay = cardInPlay
        
        let indexToRemove = undefined
        currSource.forEach((element, index) => {
            if (element["id"] == currCardInPlay["id"]) {
                indexToRemove = index
            }
        })
        if (indexToRemove !== undefined) {
            let card = currSource.splice(indexToRemove, 1)[0]
            currTarget.push(card)
    
            return [currSource, currTarget]
        }
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
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(hand, deck)
                        setHand(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
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
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(trash, deck)
                        setTrash(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
                        break
                }
                break
            
            case "shieldWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
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
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(shield, deck)
                        setShield(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
                        break
                }
                break
            
            case "battleWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
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
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(battle, deck)
                        setBattle(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
                        break
                }
                break
            
            case "manaWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
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
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(mana, deck)
                        setMana(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
                        break
                }
                break
            
            case "deckWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
                        changedState = handleMovementOfCard(deck, trash)
                        setDeck(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(deck, hand)
                        setDeck(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(deck, shield)
                        setDeck(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(deck, battle)
                        setDeck(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(deck, mana)
                        setDeck(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                    case "deckWrap":
                        console.log("dropped in deck")
                        currCardInPlay["source"] = "deckWrap"
                        break
                }
                break
                
            case "deckTopWrap":
                switch (targetId) {
                    case "trashWrap":
                        console.log("dropped in trash")
                        changedState = handleMovementOfCard(deckTop, trash)
                        setDeckTop(changedState[0])
                        setTrash(changedState[1])
                        currCardInPlay["source"] = "trashWrap"
                        break
                    case "handWrap":
                        console.log("dropped in hand")
                        changedState = handleMovementOfCard(deckTop, hand)
                        setDeckTop(changedState[0])
                        setHand(changedState[1])
                        currCardInPlay["source"] = "handWrap"
                        break
                    case "shieldWrap":
                        console.log("dropped in shield")
                        changedState = handleMovementOfCard(deckTop, shield)
                        setDeckTop(changedState[0])
                        setShield(changedState[1])
                        currCardInPlay["source"] = "shieldWrap"
                        break
                    case "battleWrap":
                        console.log("dropped in battle")
                        changedState = handleMovementOfCard(deckTop, battle)
                        setDeckTop(changedState[0])
                        setBattle(changedState[1])
                        currCardInPlay["source"] = "battleWrap"
                        break
                    case "manaWrap":
                        console.log("dropped in mana")
                        changedState = handleMovementOfCard(deckTop, mana)
                        setDeckTop(changedState[0])
                        setMana(changedState[1])
                        currCardInPlay["source"] = "manaWrap"
                        break
                    case "deckWrap":
                        console.log("dropped in deck")
                        changedState = handleMovementOfCard(deckTop, deck)
                        setDeckTop(changedState[0])
                        setDeck(changedState[1])
                        currCardInPlay["source"] = "deckWrap"
                        break
                    case "deckTopWrap":
                        console.log("dropped in deckTop")
                        currCardInPlay["source"] = "deckTopWrap"
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
        console.log(e.target)
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
        
        if (deck.length > 0) {
            const changedDeck = [...deck]
            let drawnCard = changedDeck.pop()
            setDeck(changedDeck)
    
            const changedHand = [...hand]
            changedHand.push(drawnCard)
            setHand(changedHand)
        } else {
            window.alert("山札はありません")
        }
    }
    
	function setOneShield(e){
		e.preventDefault();
        
        if (deck.length > 0) {
            const changedDeck = [...deck]
            let drawnCard = changedDeck.pop()
            setDeck(changedDeck)
            drawnCard["flip"] = true

            const changedShield = [...shield]
            changedShield.push(drawnCard)
            setShield(changedShield)
        } else {
            window.alert("デッキはありません")
        }
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
        else if (isCardInTarget(id, deck)) setDeck(flipCardInTarget(id, deck))
    }

    function handleKeyUp(e) {
        if (e.keyCode === 32) {
            flipCardWithId(cardInPlay["id"])
        }
    }

    function handleViewDeck(e) {
		e.preventDefault();
        if (viewDeck) {
            setViewDeck(false)
        } else {
            setViewDeck(true)
        }
    }

    function pushSourceIntoTarget(source, target) {
        const currSource = [...source]
        const currTarget = [...target]

        currSource.forEach((element) => {
            element["flip"] = false
            currTarget.push(element)
        })

        return currTarget
    }

    function handleReset(e) {
		e.preventDefault();
        let currDeck = [...deck]
        
        currDeck = pushSourceIntoTarget(hand, currDeck)
        currDeck = pushSourceIntoTarget(trash, currDeck);
        currDeck = pushSourceIntoTarget(mana, currDeck);
        currDeck = pushSourceIntoTarget(shield, currDeck);
        currDeck = pushSourceIntoTarget(battle, currDeck);
        setDeck(currDeck);

        setHand([])
        setTrash([])
        setMana([])
        setShield([])
        setBattle([])
    }

    function bottom(e) {
        const currCardInPlay = cardInPlay
        const currHand = [...hand]
        const currDeck = [...deck]

        if (currHand.length > 0) {
            let indexToRemove = undefined
            currHand.forEach((element, i) => {
                if (element["id"] == currCardInPlay["id"]) {
                    indexToRemove = i
                }
            })
            
            if (indexToRemove !== undefined) {
                let card = currHand.splice(indexToRemove, 1)[0]
    
                currDeck.unshift(card)
                currCardInPlay["source"] = "deckWrap"
                setHand(currHand)
                setCardInPlay(currCardInPlay)
                setDeck(currDeck)
            }
        } else {
            window.alert("手札はありません")
        }
    }

    function handleShade(id) {
        if (cardInPlay["id"] == id) {
            return (<div id={id} class="shade"></div>)
        }
    }

	function handleDeckTop(e){
		e.preventDefault();

        if (deck.length > 0) {
            setViewDeckTop(true)

            const changedDeck = [...deck]
            let drawnCard = changedDeck.pop()
            setDeck(changedDeck)
    
            const changedDeckTop = [...deckTop]
            changedDeckTop.push(drawnCard)
            setDeckTop(changedDeckTop)
        } else {
            window.alert("山札はありません")
        }
    }

    function listenDeckTopChange(){
        console.log(deckTop.length)

        if (deckTop.length == 0){
            setViewDeckTop(false)
        }
    }
    
    return (
        <div>
            {/* バトルゾーン */}
            <div id="area0" class="boxLayout">
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
                            {handleShade(card["id"])}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* シールドゾーン */}
            <div id="area1" class="boxLayout">
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
                            {handleShade(card["id"])}
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* プレイヤーゾーン */}
            <div id="area2" class="columnLayoutBottom">

                {/* 手札 */}
                <div id="hand" class="boxLayout">
                    <div class="boxTitle">
                        手札(<span id="hand.length">{hand.length}</span>)
                        <a id="placeholder_hand_00" class="button" style={{marginLeft: 10 + "px"}}>placeholder_hand_00</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="bottom" class="button" onClick={bottom}>山札の下に置く</a>
                        <a id="placeholder_hand_02" class="button">placeholder_hand_02</a>
                    </div>
                    <div class="boxLayout"></div>
                    <ul id="handWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                        {hand?.map((card, index) => (
                            <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                                <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                                {handleShade(card["id"])}
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
                                {handleShade(card["id"])}
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
                                {handleShade(card["id"])}
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
                    
                    <form onSubmit={handleViewDeck}>
                        <button type='submit'>デッキを確認</button>
                    </form>

                    <form onSubmit={handleReset}>
                        <button type='submit'>リセット</button>
                    </form>

                    <form onSubmit={handleDeckTop}>
                        <button type='submit'>デッキ上1枚確認</button>
                    </form>
                </div>

            </div>
            
            {/* 山札上X枚確認 */}
            {viewDeckTop && <div id="area3" class="boxLayout">
                <div class="boxTitle">
                    山札上(<span id="deckTop.length">{deckTop.length}</span>)枚確認
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_deckTop_00" class="button">placeholder_deckTop_00</a>
                    <a id="placeholder_deckTop_01" class="button">placeholder_deckTop_01</a>
                </div>
                <div class="boxLayout"></div>
                <ul id="deckTopWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                    {deckTop?.map((card, index) => (
                        <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                            <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                            {handleShade(card["id"])}
                        </li>
                    ))}
                </ul>
            </div>}
            
            {/* デッキ確認 */}
            {viewDeck && <div id="area4" class="boxLayout">
                <div class="boxTitle">
                    デッキ確認(<span id="deck.length">{deck.length}</span>)
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_deck_00" class="button">placeholder_deck_00</a>
                    <a id="placeholder_deck_01" class="button">placeholder_deck_01</a>
                </div>
                <div class="boxLayout"></div>
                <ul id="deckWrap" class="cardWrap" draggable="true" onMouseDown={handleMouseDown} onDrop={drop} onDragOver={allowDrop}>
                    {deck?.map((card, index) => (
                        <li id={index} class="card" draggable="true" onDrop={drop} onDragOver={allowDrop}>
                            <img id={card["id"]} src={cardImg(card)} width="78.75" height="110" alt="error" />
                            {handleShade(card["id"])}
                        </li>
                    ))}
                </ul>
            </div>}
        </div>
    )
}

export default Play;