import deckImage from '../images/cardgame_deck.png'
import Draggable from 'react-draggable'
import React, { useState, useEffect } from 'react';

function Play ({deck, setDeck}) {

	const [cardsInPlay, setCardsInPlay] = useState([]);

    useEffect(() => {
        console.log(deck)
		const changedDeck = [...deck]
        changedDeck.forEach((card) => {
            for (let i = 1; i < card["number"]; i++){
                changedDeck.push(card)
            }
        })
        setDeck(changedDeck)
    }, []);
    
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
        let drawCard = changedDeck.pop()
        if (changedDeck.length == 0) {
            console.log("empty")
        }
        setDeck(changedDeck)
        console.log(deck)

        const changedCardsInPlay = [...cardsInPlay]
        changedCardsInPlay.push(drawCard)
        setCardsInPlay(changedCardsInPlay)
        console.log(cardsInPlay)
    }
    
    return (
        <div>
            <h3>一人回し</h3>
            <img src={deckImage} alt="error" onClick={draw}/>
            
            {cardsInPlay?.map((card, index) => (
			    <Draggable>
                    <div>
                        <img src={URL.createObjectURL(card["file"])} width="157.5" height="220" alt="error" />
                    </div>
                </Draggable>
            ))}
            
			<form onSubmit={shuffle}>
				<button type='submit'>シャッフル</button>
			</form>
        </div>
    )
}

export default Play;