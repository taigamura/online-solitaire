import './App.css';
import Draggable from 'react-draggable'
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import Play from './Play';

// function component
function App() {

	const [files, setFiles] = useState();
	const [deckShow, setDeckShow] = useState();
	const navigate = useNavigate()

	function handleChange(e){
		setFiles([...e.target.files])
	}

	function handleSubmit(e){
		// reloads page for some reason default
		e.preventDefault();
		setDeckShow(true)
	}

	function handleReset(e){
		setDeckShow(false)
		setFiles([])
	}

	function handleNumberChange(e){
		const changedFiles = [...files]
		changedFiles[e.target.id].number = parseInt(e.target.value)
		setFiles(changedFiles)
	}
	
	function handleRedirect(e){
		navigate("/play");
	}

	return (
		<div>
			<h3>カードを追加</h3>
			<input type="file" multiple onChange={handleChange} />

			<Draggable>
				<div className="App">
					{/* デュエマは 63mm x 88mm */}
					{files?.map((file, index) => (
						<div>
							<img src={URL.createObjectURL(file)} width="157.5" height="220" alt="error" />
							<select id={index} placeholder="1" onChange={handleNumberChange}>
								<option value="1">1</option>
								<option value="2">2</option>
								<option value="3">3</option>
								<option value="4">4</option>
							</select>
						</div>
					))}
				</div>
			</Draggable>

			<form onSubmit={handleSubmit}>
				<button type='submit'>カード枚数確定</button>
			</form>

			<form onSubmit={handleReset}>
				<button type='submit'>リセット</button>
			</form>

			{deckShow && <div>
				{files?.map((file, index) => (
					[...Array(file.number)].map(() => (
						// TODO: implement card overlap
						<div>
							<img src={URL.createObjectURL(file)} width="157.5" height="220" alt="error" />
						</div>
					))
				))}

				<form onSubmit={handleRedirect}>
					<button type='submit'>デッキ確定</button>
				</form>
			</div>}
			
			<Routes>
				<Route exact path="/" element={<App/>}/>
				<Route exact path="/play" element={<Play/>}/>
			</Routes>
		</div>
	)
}

export default App;