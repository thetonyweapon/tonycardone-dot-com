import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Tony Cardone`)).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Footer />);
    const bluesky = screen.getByLabelText('Bluesky');
    expect(bluesky).toHaveAttribute('href', 'https://bsky.app/profile/tonycardone.com');
    expect(bluesky).toHaveAttribute('target', '_blank');

    const spotify = screen.getByLabelText('Spotify');
    expect(spotify).toHaveAttribute('href', 'https://open.spotify.com/user/thetonyweapon?si=88694c80dc2f4137');
    expect(spotify).toHaveAttribute('target', '_blank');

    const strava = screen.getByLabelText('Strava');
    expect(strava).toHaveAttribute('href', 'https://www.strava.com/athletes/20964858');
    expect(strava).toHaveAttribute('target', '_blank');

    const goodreads = screen.getByLabelText('Goodreads');
    expect(goodreads).toHaveAttribute('href', 'https://www.goodreads.com/user/show/80171915-tony');
    expect(goodreads).toHaveAttribute('target', '_blank');
  });
});
