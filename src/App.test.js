import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// The deckbuilder is the landing route ("/").
test('renders the deckbuilder landing page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/デュエルマスターズ一人回し用ツール/)).toBeInTheDocument();
});

// The play board must render with an empty deck without crashing.
// This is the smoke test the Ralph loop relies on when refactoring Play.js.
test('renders the play board on /play without crashing', () => {
  render(
    <MemoryRouter initialEntries={['/play']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/バトルゾーン/)).toBeInTheDocument();
});
