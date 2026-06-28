import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Play from './pages/Play';
import Deckbuild from './pages/Deckbuild';
import Nav from './components/Nav';

// function component
function App() {
  const [deck, setDeck] = useState([]);

  return (
    <div>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/build" element={<Deckbuild deck={deck} setDeck={setDeck} />} />
        <Route path="/play" element={<Play deck={deck} setDeck={setDeck} />} />
      </Routes>
    </div>
  );
}

export default App;
