import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Seam 1 — top-level routing. The deck state is lifted into App and flows into
// Deckbuild (/build) and Play (/play); the landing stub lives at "/".
function renderAt(path) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test('renders the Landing stub at /', () => {
  renderAt('/');
  expect(screen.getByTestId('landing')).toBeInTheDocument();
});

test('renders the deckbuilder at /build', () => {
  renderAt('/build');
  expect(screen.getByText(/デュエルマスターズ一人回し用ツール/)).toBeInTheDocument();
});

test('renders the play board at /play without crashing', () => {
  renderAt('/play');
  expect(screen.getByText(/バトルゾーン/)).toBeInTheDocument();
});
