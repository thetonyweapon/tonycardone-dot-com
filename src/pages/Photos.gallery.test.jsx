import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Photos from './Photos';

vi.mock('../data/photos.json', () => ({
  default: {
    photos: [
      { publicId: 'Trip1/p1', format: 'jpg', width: 800, height: 600, createdAt: '2026-01-01T00:00:00Z', tags: ['austin'] },
      { publicId: 'Trip1/p2', format: 'jpg', width: 600, height: 800, createdAt: '2026-01-02T00:00:00Z', tags: [] },
      { publicId: 'Trip1/p3', format: 'jpg', width: 1920, height: 1080, createdAt: '2026-01-03T00:00:00Z', tags: ['sunset', 'travel'] },
      { publicId: 'December_2025_Austin_Daytime/p4', format: 'jpg', width: 1000, height: 1000, createdAt: '2026-01-04T00:00:00Z', tags: [] },
    ],
    updatedAt: '2026-01-01T00:00:00Z',
  },
}));

const getPhotoButtons = () => {
  const main = screen.getByRole('main');
  return within(main).getAllByRole('button');
};

const getFolderImages = () => {
  const main = screen.getByRole('main');
  return within(main).getAllByRole('img');
};

const setup = (initialEntry = '/photos') => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/photos" element={<Photos />} />
        <Route path="/photos/:folderName" element={<Photos />} />
      </Routes>
    </MemoryRouter>
  );
  return user;
};

const openFolder = async (user, name) => {
  await user.click(screen.getByRole('link', { name: new RegExp(name, 'i') }));
};

describe('Photos — folder gallery', () => {
  it('starts at the folder level', async () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Photos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /trip1/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /december 2025 austin daytime/i })).toBeInTheDocument();
  });

  it('strips underscores from folder names', () => {
    setup();
    expect(screen.getByText('December 2025 Austin Daytime')).toBeInTheDocument();
    expect(screen.queryByText('December_2025_Austin_Daytime')).not.toBeInTheDocument();
  });

  it('shows a photo count per folder', () => {
    setup();
    const trip1 = screen.getByRole('link', { name: /trip1/i });
    expect(within(trip1).getByText('3 photos')).toBeInTheDocument();
    const december = screen.getByRole('link', { name: /december 2025 austin daytime/i });
    expect(within(december).getByText('1 photo')).toBeInTheDocument();
  });

  it('shows folder count in the header', () => {
    setup();
    expect(screen.getByText('2 folders')).toBeInTheDocument();
  });

  it('opens a folder to show its photos', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    expect(await screen.findByRole('heading', { name: 'Trip1', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('3 photos')).toBeInTheDocument();
    expect(getFolderImages().length).toBe(3);
  });

  it('shows tags immediately below tagged photos', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByText('austin');
    expect(screen.getByText('sunset')).toBeInTheDocument();
    expect(screen.getByText('travel')).toBeInTheDocument();
  });

  it('displays newest upload first in the folder', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    const images = getFolderImages();
    expect(images[0]).toHaveAttribute('src', expect.stringContaining('Trip1/p3'));
  });

  it('navigates back to all folders', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(screen.getByRole('link', { name: /all folders/i }));
    expect(await screen.findByRole('heading', { name: 'Photos', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /december 2025 austin daytime/i })).toBeInTheDocument();
  });

  it('deep-links to a folder', async () => {
    setup('/photos/December_2025_Austin_Daytime');
    expect(await screen.findByRole('heading', { name: 'December 2025 Austin Daytime', level: 1 })).toBeInTheDocument();
    expect(getFolderImages().length).toBe(1);
  });

  it('opens lightbox when a photo is clicked', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to next photo in lightbox', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next photo'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous photo in lightbox', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next photo'));
    await user.click(screen.getByLabelText('Previous photo'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('closes lightbox when close button is clicked', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close viewer'));
    expect(screen.queryByLabelText('Photo viewer')).not.toBeInTheDocument();
  });

  it('wraps around from first to last photo on previous', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Previous photo'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('wraps around from last to first photo on next', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Next photo'));
    await user.click(screen.getByLabelText('Next photo'));
    await user.click(screen.getByLabelText('Next photo'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
