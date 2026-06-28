import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from './About';
import Privacy from './Privacy';

// Seam 2 — ad-safety. The about and privacy pages are intentionally image-free
// so AdSense can run on them without surfacing copyrighted/uploaded card art.
// Each must render zero <img> elements and reserve an ad slot.
describe.each([
  ['About', About, 'about'],
  ['Privacy', Privacy, 'privacy'],
])('%s content page', (_name, Page, testId) => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <Page />
      </MemoryRouter>
    );
  }

  test('renders no <img> elements (ad-safe)', () => {
    const { container } = renderPage();
    expect(container.querySelectorAll('img')).toHaveLength(0);
  });

  test('renders the page and reserves an ad slot', () => {
    renderPage();
    expect(screen.getByTestId(testId)).toBeInTheDocument();
    expect(screen.getByTestId('ad-slot')).toBeInTheDocument();
  });
});
