import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Photos from './Photos';

vi.mock('../data/photos.json', () => ({
  default: {
    photos: [],
    updatedAt: '2026-01-01T00:00:00Z',
  },
}));

const renderPhotos = () =>
  render(
    <MemoryRouter initialEntries={['/photos']}>
      <Routes>
        <Route path="/photos" element={<Photos />} />
        <Route path="/photos/:folderName" element={<Photos />} />
      </Routes>
    </MemoryRouter>
  );

describe('Photos — empty state', () => {
  it('renders the page heading', () => {
    renderPhotos();
    expect(screen.getByRole('heading', { name: 'Photos' })).toBeInTheDocument();
  });

  it('shows "No photos yet" empty state', () => {
    renderPhotos();
    expect(screen.getByRole('heading', { name: /no photos yet/i })).toBeInTheDocument();
  });

  it('shows upload prompt in empty state', () => {
    renderPhotos();
    expect(screen.getByText(/upload images to your Cloudinary account/i)).toBeInTheDocument();
  });
});
