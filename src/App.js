import './App.css';
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Play from './pages/Play';
import Deckbuild from './pages/Deckbuild';

// function component
function App() {

	const [deck, setDeck] = useState();

	return (
		<div>
			<Routes>
				<Route path="/" element={<Deckbuild deck={deck} setDeck={setDeck} />} />
				<Route path="/play" element={<Play deck={deck} setDeck={setDeck} />} />
			</Routes>
		</div>
	)
}

export default App;