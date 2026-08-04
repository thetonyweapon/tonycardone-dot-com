import { render, screen, fireEvent, within } from '@testing-library/react';
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
  return within(main)
    .getAllByRole('button')
    .filter((b) => b.querySelector('img'));
};

const getFolderImages = () => {
  const main = screen.getByRole('main');
  return within(main).queryAllByRole('img');
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

  it('shows a download button in the lightbox', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();

    const downloadLink = screen.getByLabelText('Download photo');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('fl_attachment')
    );
    expect(downloadLink).toHaveAttribute(
      'href',
      expect.stringContaining('Trip1/p3')
    );
  });

  it('shows tags in the lightbox popup', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();

    expect(screen.getByText('austin')).toBeInTheDocument();
  });

  it('shows a fullscreen button in the lightbox', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);
    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();

    expect(screen.getByLabelText('Enter fullscreen')).toBeInTheDocument();
  });

  it('calls requestFullscreen when fullscreen button is clicked', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    await user.click(getPhotoButtons()[0]);

    const mockRequest = vi.fn();
    const lightbox = screen.getByLabelText('Photo viewer');
    lightbox.requestFullscreen = mockRequest;

    await user.click(screen.getByLabelText('Enter fullscreen'));
    expect(mockRequest).toHaveBeenCalled();
  });

  it('shows a tag filter bar with each tag in the folder', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'austin (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'sunset (1)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'travel (1)' })).toBeInTheDocument();
  });

  it('does not show a tag bar when the folder has no tags', async () => {
    const user = setup();
    await openFolder(user, 'December 2025 Austin Daytime');
    await screen.findByRole('heading', { name: 'December 2025 Austin Daytime', level: 1 });

    expect(screen.queryByRole('button', { name: 'All' })).not.toBeInTheDocument();
    expect(screen.queryByText('austin (1)')).not.toBeInTheDocument();
  });

  it('filters the grid when a tag chip is clicked', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });
    expect(getFolderImages().length).toBe(3);

    await user.click(screen.getByRole('button', { name: 'austin (1)' }));

    expect(getFolderImages().length).toBe(1);
    expect(getFolderImages()[0]).toHaveAttribute('src', expect.stringContaining('Trip1/p1'));
    expect(screen.getByText('1 of 3 photos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'austin (1)' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('un-toggles a tag chip to restore all photos', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    await user.click(screen.getByRole('button', { name: 'austin (1)' }));
    await user.click(screen.getByRole('button', { name: 'austin (1)' }));

    expect(getFolderImages().length).toBe(3);
    expect(screen.getByText('3 photos')).toBeInTheDocument();
  });

  it('ANDs multiple selected tags', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    await user.click(screen.getByRole('button', { name: 'sunset (1)' }));
    await user.click(screen.getByRole('button', { name: 'travel (1)' }));

    expect(getFolderImages().length).toBe(1);
    expect(getFolderImages()[0]).toHaveAttribute('src', expect.stringContaining('Trip1/p3'));
    expect(screen.getByText('1 of 3 photos')).toBeInTheDocument();
  });

  it('shows an empty state when the AND combination matches nothing', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    await user.click(screen.getByRole('button', { name: 'austin (1)' }));
    await user.click(screen.getByRole('button', { name: 'sunset (1)' }));

    expect(screen.getByText('No photos match the selected tags.')).toBeInTheDocument();
    expect(screen.getByText('0 of 3 photos')).toBeInTheDocument();
  });

  it('clears all filters via the All chip', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    await user.click(screen.getByRole('button', { name: 'austin (1)' }));
    await user.click(screen.getByRole('button', { name: 'sunset (1)' }));
    expect(getFolderImages().length).toBe(0);

    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(getFolderImages().length).toBe(3);
    expect(screen.getByText('3 photos')).toBeInTheDocument();
  });

  it('keeps lightbox navigation within the filtered set', async () => {
    const user = setup();
    await openFolder(user, 'Trip1');
    await screen.findByRole('heading', { name: 'Trip1', level: 1 });

    await user.click(screen.getByRole('button', { name: 'sunset (1)' }));
    await user.click(getPhotoButtons()[0]);

    expect(screen.getByLabelText('Photo viewer')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });
});
