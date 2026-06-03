import '@testing-library/jest-dom/vitest';

beforeEach(() => {
  const fakeMatchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  window.matchMedia = fakeMatchMedia;
  localStorage.clear();
  document.documentElement.classList.remove('dark');
});
