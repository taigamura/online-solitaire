import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';

function renderLanding() {
  return render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );
}

// Seam 2 — ad-safety. The landing page is intentionally image-free: it must
// never render card art (or any <img>), so AdSense can run on it without
// surfacing copyrighted/uploaded card images.
test('renders no <img> elements (ad-safe)', () => {
  const { container } = renderLanding();
  expect(container.querySelectorAll('img')).toHaveLength(0);
});

test('reserves an ad slot and links into the deck builder', () => {
  renderLanding();
  expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
  expect(screen.getAllByRole('link').some((a) => a.getAttribute('href') === '/build')).toBe(true);
});
