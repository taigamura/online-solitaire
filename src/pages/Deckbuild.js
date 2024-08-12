import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// function component
function Deckbuild({deck, setDeck}) {

	const [preview, setPreview] = useState();
    const navigate = useNavigate();

	function handleChange(e){
		const files = [...e.target.files]
		let deck = []
		files.forEach((file) => {
			let card = {
				file: file,
				number: 1
			}
			deck.push(card)
		})
		setDeck(deck)
		console.log(deck)
	}

	function handleSubmit(e){
		e.preventDefault();
		setPreview(true)
	}

	function handleReset(e){
		setPreview(false)
		setDeck([])
	}

	function handleNumberChange(e){
		const changedDeck = [...deck]
		changedDeck[e.target.id].number = parseInt(e.target.value)
		setDeck(changedDeck)
	}

	return (
		<div>
			<h3>カードを追加</h3>
			<input type="file" multiple onChange={handleChange} />

			<div className="Deckbuild">
				{/* デュエマは 63mm x 88mm */}
				{deck?.map((card, index) => (
					<div>
						<img src={URL.createObjectURL(card["file"])} width="157.5" height="220" alt="error" />
						<select id={index} placeholder={card["number"]} onChange={handleNumberChange}>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
						</select>
					</div>
				))}
			</div>

			<form onSubmit={handleSubmit}>
				<button type='submit'>カード枚数確定</button>
			</form>

			<form onSubmit={handleReset}>
				<button type='submit'>リセット</button>
			</form>

			{preview && <div>
				{deck?.map((card, index) => (
					[...Array(card.number)].map(() => (
						// TODO: implement card overlap
						<div>
							<img src={URL.createObjectURL(card["file"])} width="157.5" height="220" alt="error" />
						</div>
					))
				))}

                <button type='submit' onClick={() => navigate('play')}>デッキ確定</button>
			</div>}
		</div>
	)
}

export default Deckbuild;