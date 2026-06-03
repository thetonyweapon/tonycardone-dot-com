import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Photos from './Photos';

const renderPhotos = () =>
  render(
    <MemoryRouter>
      <Photos />
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

  it('shows the coming soon banner', () => {
    renderPhotos();
    expect(screen.getByText(/haven't done it yet/i)).toBeInTheDocument();
  });

  it('shows upload prompt in empty state', () => {
    renderPhotos();
    expect(screen.getByText(/upload images to your Cloudinary account/i)).toBeInTheDocument();
  });
});
