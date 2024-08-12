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
    
    function shuffle(){
		const changedDeck = [...deck]

        for (let i = changedDeck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let tmp = changedDeck[i];
            changedDeck[i] = changedDeck[j];
            changedDeck[j] = tmp;
        }

        setDeck(changedDeck)
        console.log(deck)
    }
    
	function draw(e){
		const changedDeck = [...deck]
        let drawCard = changedDeck[0]
        changedDeck.splice(0, 1)
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