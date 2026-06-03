import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Photos from './Photos';

vi.mock('../data/photos.json', () => ({
  default: {
    photos: [
      { publicId: 'test/photo1', format: 'jpg', width: 800, height: 600, createdAt: '2026-01-01T00:00:00Z', tags: [] },
      { publicId: 'test/photo2', format: 'jpg', width: 600, height: 800, createdAt: '2026-01-02T00:00:00Z', tags: [] },
      { publicId: 'test/photo3', format: 'jpg', width: 1920, height: 1080, createdAt: '2026-01-03T00:00:00Z', tags: [] },
    ],
    updatedAt: '2026-01-01T00:00:00Z',
  },
}));

const getPhotoButtons = () => {
  const main = screen.getByRole('main');
  return within(main).getAllByRole('button');
};

const renderPhotos = () =>
  render(
    <MemoryRouter>
      <Photos />
    </MemoryRouter>
  );

describe('Photos — gallery', () => {
  it('renders photo count when images exist', () => {
    renderPhotos();
    expect(screen.getByText('3 photos')).toBeInTheDocument();
  });

  it('renders all photo thumbnails', () => {
    renderPhotos();
    const images = screen.getAllByRole('img');
    expect(images.length).toBe(3);
  });

  it('renders images with Cloudinary URLs', () => {
    renderPhotos();
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute(
      'src',
      expect.stringContaining('cloudinary.com/thetonyweapon/image/upload/')
    );
    expect(images[0]).toHaveAttribute(
      'src',
      expect.stringContaining('test/photo1')
    );
  });

  it('opens lightbox when a photo is clicked', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to next photo in lightbox', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Next photo'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous photo in lightbox', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Next photo'));
    fireEvent.click(screen.getByLabelText('Previous photo'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('closes lightbox when close button is clicked', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Close viewer'));
    expect(screen.queryByLabelText('Photo viewer')).not.toBeInTheDocument();
  });

  it('wraps around from first to last photo on previous', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Previous photo'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('wraps around from last to first photo on next', () => {
    renderPhotos();
    fireEvent.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Next photo'));
    fireEvent.click(screen.getByLabelText('Next photo'));
    fireEvent.click(screen.getByLabelText('Next photo'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
