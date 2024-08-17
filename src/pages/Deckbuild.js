import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import './Deckbuild.css';

// function component
function Deckbuild({deck, setDeck}) {

    const navigate = useNavigate();
	// deckGroupBy is [{key: file, value: [...card]}, ...]
	const [deckGroupBy, setDeckGroupBy] = useState([]);

	function handleChange(e){
		e.preventDefault();
		const files = [...e.target.files]
		let currDeck = []
		files.forEach((file) => {
			let card = {
				file: file,
				id: uuidv4(),
				flip: false
			}
			currDeck.push(card)
		})
		setDeck(currDeck)
		setDeckGroupBy(Array.from(Map.groupBy(currDeck, card => {return card.file}), ([key, value]) => ({ key, value })))
	}

	function handleReset(e){
		e.preventDefault();
		setDeck([])
		setDeckGroupBy([])
	}

	function handleConfirmDeck(e) {
		e.preventDefault();
		navigate('play')
	}

	function handleNumberChange(e, targetCard){
		e.preventDefault();
		const currDeck = [...deck]
		
		let initialNumber = 0
		let targetNumber = parseInt(e.target.value)
		
		// count how many already in deck
		deck.forEach((card) => {
			if (card["file"] === targetCard["file"]) {
				initialNumber++
			}
		})

		// if cards need to be added
		if (initialNumber < targetNumber) {
			for (let i = initialNumber; i < targetNumber; i++) {
				let card = {
					file: targetCard["file"],
					id: uuidv4(),
					flip: false
				}
				currDeck.push(card)
			}
		} 
		// if cards need to be removed
		else if (initialNumber > targetNumber) {
			let indexesToRemove = []
			deck.forEach((card, i) => {
				if (card["file"] === targetCard["file"]) {
					indexesToRemove.push(i)
				}
			})
			let toRemove = initialNumber - targetNumber
			indexesToRemove.forEach((indexToRemove) => {
				if (toRemove !== 0) {
					currDeck.splice(indexToRemove, 1)
					toRemove--
				}
			})
		}

        setDeck(currDeck)
		setDeckGroupBy(Array.from(Map.groupBy(currDeck, card => {return card.file}), ([key, value]) => ({ key, value })))
	}

	return (
		<div>
			<h3>カードを追加</h3>
			<input type="file" multiple onChange={handleChange} />
			
			{/* デュエマは 63mm x 88mm */}
            <div id="deckPreview" class="boxLayout">
                <div class="boxTitle">
                    カード枚数指定(<span id="deck.length">{deck.length}</span>)
                </div>
                <div class="buttonLayout">
                    <a id="reset" class="button" onClick={handleReset}>リセット</a>
                    <a id="confirmDeck" class="button" onClick={handleConfirmDeck}>デッキ確定</a>
                </div>
                <div class="boxLayout"></div>
					<ul id="" class="deckPreviewWrap">
						{deckGroupBy.map((group, i) => (
							<li class="deckPreviewWrap">
								{[...Array(group.value.length)].map(() => (
									<img src={URL.createObjectURL(group["key"])} width="78.75" height="110" alt="error" />
								))}
								
								<select id={i} placeholder={1} onChange={event => handleNumberChange(event, group["value"][0])}>
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
	)
}

export default Deckbuild;