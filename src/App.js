import './App.css';
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Play from './pages/Play';
import Deckbuild from './pages/Deckbuild';

// function component
function App() {
	return (
		<Routes>
			<Route path="/" element={<Deckbuild />} />
			<Route path="/play" element={<Play />} />
		</Routes>
	)
}

export default App;