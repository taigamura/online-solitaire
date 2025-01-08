import Sortable from 'sortablejs';
import React, { useState, useEffect } from 'react';
import './Play.css';
import cardBack from "../images/cardBack.jpg";
import { SideBySideMagnifier } from "react-image-magnifiers";

function Play ({deck, setDeck}) {

    const [cardsInPlay, setCardsInPlay] = useState([]);
    const [commandList, setCommandList] = useState({})
    
    const [boardState, setBoardState] = useState({
        "hand": [],
        "trash": [],
        "mana": [],
        "shield": [],
        "battle": [],
        "overlappedCards": [],
        "deckTop": [],
        "deck": deck
    });
    
	const [viewDeck, setViewDeck] = useState(false);
	const [viewDeckTop, setViewDeckTop] = useState(false);
    const [canMagnify, setCanMagnify] = useState(false);
    const [canOverlap, setCanOverlap] = useState(true);
    const [mouseRight, setMouseRight] = useState(false)

    const allCards = Object.values(boardState)
    const allPlayableAreaIds = Object.keys(boardState).map(x => x + "Wrap")

    useEffect(() => {
        const handWrap = document.getElementById('handWrap');
        const trashWrap = document.getElementById('trashWrap');
        const manaWrap = document.getElementById('manaWrap');
        const shieldWrap = document.getElementById('shieldWrap');
        const battleWrap = document.getElementById('battleWrap');
        
        Sortable.create(handWrap, {animation: 100});
        Sortable.create(trashWrap, {animation: 100});
        Sortable.create(manaWrap, {animation: 100});
        Sortable.create(shieldWrap, {animation: 100});
        Sortable.create(battleWrap, {animation: 100});

        if (viewDeckTop) {
            const deckTopWrap = document.getElementById('deckTopWrap');
            Sortable.create(deckTopWrap, {animation: 100});
        }
        
        if (viewDeck) {
            const deckWrap = document.getElementById('deckWrap');
            Sortable.create(deckWrap, {animation: 100});
        }
        
        if (boardState.overlappedCards.length > 0 && canOverlap) {
            const overlappedCardsWraps = document.getElementsByClassName("cardWrap overlapWrap")
            for (var i = 0; i < overlappedCardsWraps.length; i++) {
                Sortable.create(overlappedCardsWraps[i], {animation: 100});
            }
        }

        if (Object.keys(commandList).length > 0) {
            runCommandList()
        }

        listenDeckTopChange()
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("keyup", handleKeyUp);
        document.addEventListener("keydown", handleKeyDown);
        // https://stackoverflow.com/questions/64434545/react-keydown-event-listener-is-being-called-multiple-times
        return () => {
            document.addEventListener("mousemove", handleMouseMove)
            document.removeEventListener("keyup", handleKeyUp)
            document.removeEventListener("keydown", handleKeyDown)
        };
    }, [handleMouseDown, handleKeyUp, handleKeyDown]); // <-- here put the parameter to listen, react will re-render component when your state will be changed

    // check which side mouse is on
    function handleMouseMove(e) {
        if (e.clientX > window.innerWidth / 2) {
            setMouseRight(true)
        } else {
            setMouseRight(false)
        }
    }

    // Runs a set of commands (functions) that need to run in sequence
    // setState will cause useEffect, creating a loop
    // on each iteration, one function must run as setState will run asynchronously
    function runCommandList() {
        const currCommandList = {...commandList}

        if (currCommandList["shuffle"] > 0) { 
            shuffle()
            currCommandList["shuffle"]--
            if (currCommandList["shuffle"] == 0) {
                delete currCommandList["shuffle"]
            }
        }
        else if (currCommandList["draw"] > 0) { 
            draw()
            currCommandList["draw"]--
            if (currCommandList["draw"] == 0) {
                delete currCommandList["draw"]
            }
        }
        else if (currCommandList["shield"] > 0) { 
            setOneShield()
            currCommandList["shield"]--
            if (currCommandList["shield"] == 0) {
                delete currCommandList["shield"]
            }
        }

        setCommandList(currCommandList)
    }

    function handleMovementOfCard (source, target) {
        const currSource = [...source]
        const currTarget = [...target]
        const changedCardsInPlay = [...cardsInPlay]
        
        let elementsToRemove = []
        // find indexes to remove from source
        currSource.forEach((card, i) => {
            changedCardsInPlay.forEach((currcardsInPlay, j) => {
                if (card["id"] == currcardsInPlay["id"]) {
                    elementsToRemove.push(card)
                }
            })
        })

        if (elementsToRemove.length > 0) {
            for (var i = 0; i < elementsToRemove.length; i++) {
                let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0]
                currTarget.push(card)
            }
            console.log(currTarget)
            return [currSource, currTarget]
        }
    }

    function findOverlapGroupIdx(id) {
        let groupIdx = undefined

        boardState.overlappedCards.forEach((group, i) => {
            group.forEach((card, j) => {
                if (id === card["id"]) {
                    groupIdx = i
                }
            })
        })
        return groupIdx
    }
    
    function handleMovementOfCardOverlap(source, target, targetId) {
        let currSource = [...source]
        const currTarget = [...target]
        const changedCardsInPlay = [...cardsInPlay]

        // overlappedCards --> target
        if (source === boardState.overlappedCards) {
            
            // [[group idx, card idx], ...]
            let indexesToRemove = []
            // find indexes to remove from source
            currSource.forEach((group, i) => {
                group.forEach((card, j) => {
                    changedCardsInPlay.forEach((currcardsInPlay, k) => {
                        if (card["id"] == currcardsInPlay["id"]) {
                            indexesToRemove.push([i, j])
                        }
                    })
                })
            })
    
            if (indexesToRemove.length > 0) {
                for (var i = indexesToRemove.length-1; i >= 0; i--) {
                    // splice overlappedCards[group idx].splice([card idx])
                    let card = currSource[indexesToRemove[i][0]].splice(indexesToRemove[i][1], 1)[0]
                    currTarget.push(card)
                }
            }
            
            // filter empty groups
            let changedCurrSource = []
            currSource.forEach((group, i) => {
                if (group.length > 0) {
                    changedCurrSource.push(group)
                }
            })
            currSource = changedCurrSource
        } 
        // source --> overlappedCards
        else {
            let elementsToRemove = []
            // find indexes to remove from source
            currSource.forEach((card, i) => {
                changedCardsInPlay.forEach((currcardsInPlay, j) => {
                    if (card["id"] == currcardsInPlay["id"]) {
                        elementsToRemove.push(card)
                    }
                })
            })

            // find which group to push into
            let groupIdx = findOverlapGroupIdx(targetId)
    
            if (elementsToRemove.length > 0) {
                for (var i = 0; i < elementsToRemove.length; i++) {
                    let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0]
                    currTarget[groupIdx].push(card)
                }
            }
        }
        return [currSource, currTarget]
    }

    function tap() {
        const currCardsInPlay = [...cardsInPlay]

        currCardsInPlay.forEach((card, i) => {
            if (card["tap"]) {
                card["tap"] = false
            } else {
                card["tap"] = true
            }
        })

        setCardsInPlay(currCardsInPlay)
    }

    // when a single card is dragged ontop group, add to group
    // when a card is selected already in group, switch
    function overlap() {
        const currBoardState = {...boardState}
        const currCardsInPlay = [...cardsInPlay]

        let illegalCards = []
        currCardsInPlay.forEach((card, i) => {
            let groupIdx = findOverlapGroupIdx(card["id"])

            // if already in group, illegal
            if (groupIdx != undefined) {
                illegalCards.push(card)
            }

            // only overlap if cards are in battle zone
            if (!(card["source"] == "battleWrap" || card["source"] == "overlappedCardsWrap")) {
                console.log('card["source"]', card["source"])
                illegalCards.push(card)
            }
        })
        
        // check if overlap is called on already overlapped cards in same group
        // diff groups cannot be selected to begin with in handleMouseDown
        if (illegalCards.length > 0) {
            console.log(illegalCards)
            window.alert("同じグループで呼び出し禁止")
            setCardsInPlay([])
        } else {
            let group = []
            currCardsInPlay.map(element => element["source"] = "overlappedCardsWrap");
            currCardsInPlay.forEach((card, i) => {
                group.push(card)
            })
    
            let changedState = handleMovementOfCard(boardState.battle, boardState.overlappedCards)
            
            currBoardState.battle = changedState[0]
            currBoardState.overlappedCards.push(group)

            setBoardState(currBoardState)
            setCardsInPlay([])
        }
    }

    function drop(e) {
        console.log("e.target:", e.target)

        const currBoardState = {...boardState}
        const currCardsInPlay = [...cardsInPlay]
        let targetSource = (e.target.tagName != "IMG") ? (e.target.id) : document.getElementById(e.target.id).parentElement.parentElement.id
        let sourceId = currCardsInPlay[0]["source"]

        targetSource = targetSource.replace("Parent", "")

        console.log("sourceId:", sourceId)
        console.log("targetSource:", targetSource)

        let changedState = []
        let source = sourceId.replace("Wrap", "")
        let target = targetSource.replace("Wrap", "")

        if ((source.includes("overlap") || target.includes("overlap")) && source != target) {
            changedState = handleMovementOfCardOverlap(boardState[source], boardState[target], e.target.id)
            currBoardState[source] = changedState[0]
            // if target is overlapped or not
            if (Array.isArray(changedState[1][0])) {
                changedState[1].map(group => group.map(card => card["source"] = targetSource))
            } else {
                changedState[1].map(card => card["source"] = targetSource)
            }
            console.log(changedState[1])
            currBoardState[target] = changedState[1]
            setBoardState(currBoardState)
        }
        else if (source != target) {
            changedState = handleMovementOfCard(boardState[source], boardState[target])
            currBoardState[source] = changedState[0]
            changedState[1].map(card => card["source"] = targetSource)
            currBoardState[target] = changedState[1]
            setBoardState(currBoardState)
        }
        
        setCardsInPlay([])
    }
      
    function allowDrop(e) {
        e.preventDefault();
    }

    function findCard(id) {
        let to_return = undefined
        allCards.forEach((cardArea, i) => {
            cardArea.forEach((card, j) => {
                if (card["id"] === id) {
                    to_return = card
                }
            })
        })
        
        // if to_return is overlapped
        if (to_return === undefined) {
            boardState.overlappedCards.forEach((group, i) => {
                group.forEach((card, j) => {
                    if (card["id"] === id) {
                        to_return = card
                    }
                })
            })
        }

        return to_return
    }

    function handleMouseDown(e) {
        let changedCardsInPlay = [...cardsInPlay]
        let selectedCard = findCard(e.target.id)

        // selectedCard must not be undefined (can be undefined when magnified)
        if (selectedCard) {
            // selected must be a card in playable area (not divs and other stuff) or grouped
            if (allPlayableAreaIds.includes(selectedCard["source"]) || findOverlapGroupIdx(selectedCard["id"]) != undefined) {
                // must be unique
                if (!changedCardsInPlay.find(element => element.id === selectedCard.id)) {
                    if (changedCardsInPlay.length > 0) {
                        // selected must be a part of same area else, clear card in play, if different groups, also clear
                        if (selectedCard["source"] != changedCardsInPlay[0]["source"] || findOverlapGroupIdx(selectedCard["id"]) != findOverlapGroupIdx(changedCardsInPlay[0]["id"])) {
                            changedCardsInPlay = []
                        }
                    }
                    changedCardsInPlay.push(selectedCard)
                    setCardsInPlay(changedCardsInPlay)
                }
                console.log("changedCardsInPlay", changedCardsInPlay)
            }
        }
    }

    function shuffle(e) {
        e?.preventDefault();
        const currDeck = [...boardState.deck]
        let currentIndex = currDeck.length
        
        while (currentIndex !== 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
            [currDeck[currentIndex], currDeck[randomIndex]] = [currDeck[randomIndex], currDeck[currentIndex]]
        }
        setBoardState(prevState => {return {...prevState, "deck": currDeck}})
    }
    
    function shuffleDeckTop(e) {
        e?.preventDefault();
        const currBoardState = {...boardState}
        let currentIndex = currBoardState.deckTop.length
        
        while (currentIndex !== 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--
            [currBoardState.deckTop[currentIndex], currBoardState.deckTop[randomIndex]] = [currBoardState.deckTop[randomIndex], currBoardState.deckTop[currentIndex]]
        }

        setBoardState(currBoardState)
    }
    
	function draw(e){
        e?.preventDefault();
        if (boardState.deck.length > 0) {
            const currBoardState = {...boardState}
            let drawnCard = currBoardState.deck.slice(-1)[0]
            drawnCard["source"] = "handWrap"
            currBoardState.deck = currBoardState.deck.slice(0, currBoardState.deck.length - 1)
            currBoardState.hand = currBoardState.hand.concat(drawnCard)
            setBoardState(currBoardState)
        } else {
            window.alert("山札はありません")
        }
    }

	function setOneShield(e){
        e?.preventDefault();
        if (boardState.deck.length > 0) {
            const currBoardState = {...boardState}
            let drawnCard = boardState.deck.slice(-1)[0]
            drawnCard["source"] = "shieldWrap"
            drawnCard["flip"] = true
            currBoardState.deck = currBoardState.deck.slice(0, currBoardState.deck.length - 1)
            currBoardState.shield = currBoardState.shield.concat(drawnCard)
            setBoardState(currBoardState)
        } else {
            window.alert("デッキはありません")
        }
    }

    function handleCardClass(card) {
        let classString = ""

        if (card["tap"]) {
            classString = "card tap"
        } else {
            classString = "card uptap"
        }

        if (canMagnify) {
            classString = classString + " magnify"
        } else {
            classString = classString + " unmagnify"
        }

        return classString
    }

    function handleCardImgSrc(card) {
        let cardImg = ""
        if (card["flip"]) {
            cardImg = cardBack
        } else {
            cardImg = URL.createObjectURL(card["file"])
        }
        return cardImg
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
        const currBoardState = {...boardState}
        let target = ""

        if (isCardInTarget(id, boardState.hand)) { target = "hand" } 
        else if (isCardInTarget(id, boardState.trash)) { target = "trash" } 
        else if (isCardInTarget(id, boardState.shield)) { target = "shield" } 
        else if (isCardInTarget(id, boardState.battle)) { target = "battle" } 
        else if (isCardInTarget(id, boardState.mana)) { target = "mana" } 
        else if (isCardInTarget(id, boardState.deck)) { target = "deck" }
        else if (isCardInTarget(id, boardState.overlappedCards)) { target = "overlappedCards" }
        else if (isCardInTarget(id, boardState.deckTop)) { target = "deckTop" }

        currBoardState[target] = flipCardInTarget(id, boardState[target])
        setBoardState(currBoardState)
    }
    
    function untapCardInTarget(id, target) {
        const currTarget = [...target]
        currTarget.forEach((card) => {
            if (card["id"] == id) {
                (card["tap"]) = false
            }
        })
        return currTarget
    }
    
    function untapCardWithId(id) {
        const currBoardState = {...boardState}
        let target = ""

        if (isCardInTarget(id, boardState.hand)) { target = "hand" } 
        else if (isCardInTarget(id, boardState.trash)) { target = "trash" } 
        else if (isCardInTarget(id, boardState.shield)) { target = "shield" } 
        else if (isCardInTarget(id, boardState.battle)) { target = "battle" } 
        else if (isCardInTarget(id, boardState.mana)) { target = "mana" } 
        else if (isCardInTarget(id, boardState.deck)) { target = "deck" }
        else if (isCardInTarget(id, boardState.overlappedCards)) { target = "overlappedCards" }
        else if (isCardInTarget(id, boardState.deckTop)) { target = "deckTop" }

        currBoardState[target] = untapCardInTarget(id, boardState[target])
        setBoardState(currBoardState)
    }
    
    function handleKeyDown(e) {
        // m
        if (e.keyCode === 77) {
            if (!canMagnify) {
                setCanMagnify(true)
            }
        }
    }

    function handleKeyUp(e) {
        // space
        if (e.keyCode === 32) { 
            cardsInPlay.forEach((element, i) => {
                flipCardWithId(element["id"])
            })
        }
        // esc
        if (e.keyCode === 27) {
            setCardsInPlay([])
        }
        // o
        if (e.keyCode === 79 && canOverlap) {
            console.log("run overlap")
            overlap()
        }
        // t
        if (e.keyCode === 84) {
            tap()
        }
        // m
        if (e.keyCode === 77) {
            if (canMagnify) {
                setCanMagnify(false)
            }
        }
        // r
        if (e.keyCode === 82) {
            allCards.forEach((area, i) => {
                area.forEach((card, j) => {
                    untapCardWithId(card["id"])
                })
            })
            setCardsInPlay([])
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
        let currDeck = [...boardState.deck]
        
        currDeck = pushSourceIntoTarget(boardState.hand, currDeck)
        currDeck = pushSourceIntoTarget(boardState.trash, currDeck);
        currDeck = pushSourceIntoTarget(boardState.mana, currDeck);
        currDeck = pushSourceIntoTarget(boardState.shield, currDeck);
        currDeck = pushSourceIntoTarget(boardState.battle, currDeck);
        currDeck = pushSourceIntoTarget(boardState.deckTop, currDeck);
        
        boardState.overlappedCards.forEach((group, i) => {
            currDeck = pushSourceIntoTarget(group, currDeck);
        })

        setBoardState({
            "hand": [],
            "trash": [],
            "mana": [],
            "shield": [],
            "battle": [],
            "overlappedCards": [],
            "deckTop": [],
            "deck": currDeck
        })
        setCardsInPlay([])
    }
    
    function top(e) {
        let source = ""
        let setSource = ""

        switch (e.target.id) {
            case "handTop":
                source = boardState.hand
                setSource = "hand"
                break
            case "deckTopTop":
                source = boardState.deckTop
                setSource = "deckTop"
                break
        }

        const changedCardsInPlay = [...cardsInPlay]
        const currSource = [...source]
        const currDeck = [...boardState.deck]

        if (currSource.length > 0) {
            let elementsToRemove = []
            changedCardsInPlay.forEach((currcardInPlay, i) => {
                currSource.forEach((element, j) => {
                    if (element["id"] == currcardInPlay["id"]) {
                        elementsToRemove.push(currcardInPlay)
                    }
                })
            })
            
            if (elementsToRemove.length > 0) {
                for (var i = elementsToRemove.length-1; i >= 0; i--) {
                    let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0]
                    currDeck.push(card)
                }
                
                changedCardsInPlay.forEach((currcardInPlay, i) => {
                    currcardInPlay["source"] = "deckWrap"
                })
                setCardsInPlay(changedCardsInPlay)
                setCardsInPlay([])
                setBoardState(prevState => {return {...prevState, [setSource]: currSource}})
                setBoardState(prevState => {return {...prevState, "deck": currDeck}})
            }
        } else {
            window.alert("手札はありません")
        }
    }

    function bottom(e) {
        let source = ""
        let setSource = ""

        switch (e.target.id) {
            case "handBottom":
                source = boardState.hand
                setSource = "hand"
                break
            case "deckTopBottom":
                source = boardState.deckTop
                setSource = "deckTop"
                break
        }

        const changedCardsInPlay = [...cardsInPlay]
        const currSource = [...source]
        const currDeck = [...boardState.deck]

        if (currSource.length > 0) {
            let elementsToRemove = []
            changedCardsInPlay.forEach((currcardInPlay, i) => {
                currSource.forEach((element, j) => {
                    if (element["id"] == currcardInPlay["id"]) {
                        elementsToRemove.push(currcardInPlay)
                    }
                })
            })
            
            if (elementsToRemove.length > 0) {
                for (var i = 0; i < elementsToRemove.length; i++) {
                    let card = currSource.splice(currSource.indexOf(elementsToRemove[i]), 1)[0]
                    currDeck.unshift(card)
                }
                
                changedCardsInPlay.forEach((currcardInPlay, i) => {
                    currcardInPlay["source"] = "deckWrap"
                })
                setCardsInPlay(changedCardsInPlay)
                setCardsInPlay([])
                setBoardState(prevState => {return {...prevState, [setSource]: currSource}})
                setBoardState(prevState => {return {...prevState, "deck": currDeck}})
            }
        } else {
            window.alert("手札はありません")
        }
    }

    function handleCardOverlay(id) {
        const changedCardsInPlay = [...cardsInPlay]
        let card = changedCardsInPlay.find(element => element.id === id);
        if (card) {
            return (
                <div>
                    <div id={id} class="shade"></div>
                    <div class="centered">{changedCardsInPlay.indexOf(card)}</div>
                </div>
            )
        }
    }

	function handleDeckTop(e){
		e.preventDefault();

        if (boardState.deck.length > 0) {
            setViewDeckTop(true)

            const changedDeck = [...boardState.deck]
            let drawnCard = changedDeck.pop()
            setBoardState(prevState => {return {...prevState, "deck": changedDeck}})
    
            const changedDeckTop = [...boardState.deckTop]
            drawnCard["source"] = "deckTopWrap"
            changedDeckTop.push(drawnCard)
            setBoardState(prevState => {return {...prevState, "deckTop": changedDeckTop}})
        } else {
            window.alert("山札はありません")
        }
    }

    function handleCardImg(card) {
        if (canMagnify) {
            // change side of magnifier
            if (mouseRight) {
                return <SideBySideMagnifier switchSides="true" id={card["id"]} imageSrc={handleCardImgSrc(card)} class={handleCardClass(card)}/>
            } else {
                return <SideBySideMagnifier id={card["id"]} imageSrc={handleCardImgSrc(card)} class={handleCardClass(card)}/>
            }
        } else {
            return <img id={card["id"]} src={handleCardImgSrc(card)} class={handleCardClass(card)}/>
        }
    }

    function listenDeckTopChange(){
        if (boardState.deckTop.length == 0){
            setViewDeckTop(false)
        }
    }

    function shuffleOnceDrawFiveSetFiveShield(e){
        e.preventDefault();
        if (boardState.deck.length > 10) {
            setCommandList({
                "shuffle": 1,
                "draw": 5,
                "shield": 5
            })
        } else {
            window.alert("山札が足りません")
        }
    }

    function selectAll(e) {
        let source = e.target.id.replace("SelectAll", "")
        const currCardsInPlay = []
        boardState[source].forEach((card, i) => {
            currCardsInPlay.push(card)
        })

        // handle overlappedCards
        // if (source == "battle") {
        //     boardState.overlappedCards.forEach((group, i) => {
        //         group.forEach((card, j) => {
        //             currCardsInPlay.push(card)
        //         })
        //     })
        // }

        setCardsInPlay(currCardsInPlay)
    }
    
    // ========================================================================================================================================================
    // HTML
    
    return (
        <div>

            {/* 説明 */}
            <div id="area0" class="boxLayout">
                <div class="boxTitle">説明</div>
                <div>Spacebar = カード選択した状態でカードを裏向き表示</div>
                <div>Esc = 選択カードリセット</div>
                <div>M = カード拡大モード</div>
                <div>O = カード選択した状態でカードを重ねる</div>
                <div>R = 全カードアンタップ</div>
                <div>T = カード選択した状態でカードをタップ</div>
            </div>

            {/* バトルゾーン */}
            <div id="area0" class="boxLayout">
                <div class="boxTitle">
                    バトルゾーン(<span id="battle.length">{boardState.battle.length}</span>)
                    <a id="battleSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_battle_00" class="button" onClick={overlap}>選択カードを重ねる</a>
                    <a id="placeholder_battle_01" class="button">placeholder_battle_01</a>
                </div>
                <div class="boxLayout">
                    <div id="battleWrapParent" class="columnLayoutBottom" onDrop={drop} onDragOver={allowDrop}>
                        <ul id="battleWrap" class="cardWrap">
                            {boardState.battle?.map((card, index) => (
                                <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                    {handleCardImg(card)}
                                    {handleCardOverlay(card["id"])}
                                </li>
                            ))}
                        </ul>
                        {boardState.overlappedCards?.map((group, i) => (
                            <ul id="overlappedCardsWrap" class="cardWrap overlapWrap">
                                {group.map((card, j) => (
                                    <li id={j} class={handleCardClass(card) + " overlap"} draggable="true" onMouseDown={handleMouseDown}>
                                        {handleCardImg(card)}
                                        {handleCardOverlay(card["id"])}
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* シールドゾーン */}
            <div id="area1" class="boxLayout">
                <div class="boxTitle">
                    シールドゾーン(<span id="shield.length">{boardState.shield.length}</span>)
                    <a id="shieldSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_shield_00" class="button">placeholder_shield_00</a>
                    <a id="placeholder_shield_01" class="button">placeholder_shield_01</a>
                </div>
                <div class="boxLayout">
                    <ul id="shieldWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                        {boardState.shield?.map((card, index) => (
                            <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                {handleCardImg(card)}
                                {handleCardOverlay(card["id"])}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            {/* プレイヤーゾーン */}
            <div id="area2" class="columnLayoutBottom">

                {/* 手札 */}
                <div id="hand" class="boxLayout">
                    <div class="boxTitle">
                        手札(<span id="hand.length">{boardState.hand.length}</span>)
                        <a id="handSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="handBottom" class="button" onClick={bottom}>山札の下に置く</a>
                        <a id="handTop" class="button" onClick={top}>山札の上に置く</a>
                    </div>
                    <div class="boxLayout">
                        <div id="handWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                            {boardState.hand?.map((card, index) => (
                                <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                    {handleCardImg(card)}
                                    {handleCardOverlay(card["id"])}
                                </li>
                            ))}
                        </div>
                    </div>
                </div>

                {/* マナゾーン */}
                <div id="mana" class="boxLayout">
                    <div class="boxTitle">
                        マナゾーン(<span id="mana.length">{boardState.mana.length}</span>)
                        <a id="manaSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_mana_01" class="button">placeholder_mana_01</a>
                        <a id="placeholder_mana_02" class="button">placeholder_mana_02</a>
                    </div>
                    <div class="boxLayout">
                        <ul id="manaWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                            {boardState.mana?.map((card, index) => (
                                <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                    {handleCardImg(card)}
                                    {handleCardOverlay(card["id"])}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 墓地 */}
                <div id="trash" class="boxLayout">
                    <div class="boxTitle">
                        墓地(<span id="hand.length">{boardState.trash.length}</span>)
                        <a id="trashSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                    </div>
                    <div class="buttonLayout">
                        <a id="placeholder_trash_00" class="button">placeholder_trash_00</a>
                        <a id="placeholder_trash_01" class="button">placeholder_trash_01</a>
                    </div>
                    <div class="boxLayout">
                        <ul id="trashWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                            {boardState.trash?.map((card, index) => (
                                <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                    {handleCardImg(card)}
                                    {handleCardOverlay(card["id"])}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* デッキ */}
                <div id="deck" class="boxLayout">
                    <div class="boxTitle">
                        デッキ(<span id="deck.length">{boardState.deck.length}</span>)
                    </div>
                    
                    <form onSubmit={shuffleOnceDrawFiveSetFiveShield}>
                        <button type='submit'>シャッフル, 5枚ドロー, 5枚シールド化</button>
                    </form>

                    <form onSubmit={shuffle}>
                        <button type='submit'>シャッフル</button>
                    </form>

                    <form onSubmit={draw}>
                        <button type='submit'>1枚ドロー</button>
                    </form>
                    
                    <form onSubmit={setOneShield}>
                        <button type='submit'>1枚シールド化</button>
                    </form>

                    <form onSubmit={handleDeckTop}>
                        <button type='submit'>デッキ上1枚確認</button>
                    </form>
                    
                    <form onSubmit={handleViewDeck}>
                        <button type='submit'>デッキを確認</button>
                    </form>
                    
                    <form onSubmit={handleReset}>
                        <button type='submit'>リセット</button>
                    </form>
                </div>

            </div>
            
            {/* 山札上X枚確認 */}
            {viewDeckTop && <div id="area3" class="boxLayout">
                <div class="boxTitle">
                    山札上(<span id="deckTop.length">{boardState.deckTop.length}</span>)枚確認
                    <a id="deckTopSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                </div>
                <div class="buttonLayout">
                    <a id="deckTopBottom" class="button" onClick={bottom}>山札の下に置く</a>
                    <a id="deckTopTop" class="button" onClick={top}>山札の上に置く</a>
                    <a id="deckTopShuffle" class="button" onClick={shuffleDeckTop}>シャッフル</a>
                </div>
                <div class="boxLayout">
                    <ul id="deckTopWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                        {boardState.deckTop?.map((card, index) => (
                            <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                {handleCardImg(card)}
                                {handleCardOverlay(card["id"])}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>}
            
            {/* デッキ確認 */}
            {viewDeck && <div id="area4" class="boxLayout">
                <div class="boxTitle">
                    デッキ確認(<span id="deck.length">{boardState.deck.length}</span>)
                    <a id="deckSelectAll" class="button" style={{marginLeft: 10 + "px"}} onClick={selectAll}>全選択</a>
                </div>
                <div class="buttonLayout">
                    <a id="placeholder_deck_00" class="button">placeholder_deck_00</a>
                    <a id="placeholder_deck_01" class="button">placeholder_deck_01</a>
                </div>
                <div class="boxLayout">
                    <ul id="deckWrap" class="cardWrap" onDrop={drop} onDragOver={allowDrop}>
                        {boardState.deck?.toReversed().map((card, index) => (
                            <li id={index} class={handleCardClass(card)} draggable="true" onMouseDown={handleMouseDown}>
                                {handleCardImg(card)}
                                {handleCardOverlay(card["id"])}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>}
        </div>
    )
}

export default Play;