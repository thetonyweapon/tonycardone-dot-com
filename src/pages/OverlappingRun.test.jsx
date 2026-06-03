import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OverlappingRun from './OverlappingRun';

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <OverlappingRun />
    </MemoryRouter>
  );

describe('OverlappingRun', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('renders the page heading', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'The Overlapping Run' })).toBeInTheDocument();
  });

  it('renders the tagline', async () => {
    renderPage();
    expect(await screen.findByText(/sustainable for both the planet/i)).toBeInTheDocument();
  });

  it('renders filter input', async () => {
    renderPage();
    expect(await screen.findByLabelText('Filter reviews')).toBeInTheDocument();
  });

  it('renders sort buttons', async () => {
    renderPage();
    expect(await screen.findByLabelText('Sort by team name')).toBeInTheDocument();
    expect(await screen.findByLabelText('Sort by overall score')).toBeInTheDocument();
  });

  it('renders stadium cards with names', async () => {
    renderPage();
    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it('renders city and state for each card', async () => {
    renderPage();
    const headings = await screen.findAllByRole('heading', { level: 2 });
    headings.forEach(h => {
      const article = h.closest('article');
      const commas = within(article).getAllByText(/,/);
      expect(commas.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders overall scores', async () => {
    renderPage();
    const badges = await screen.findAllByText(/⚽/);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('expands a card on click', async () => {
    renderPage();
    const expandBtn = await screen.findByLabelText(/Expand Toyota Stadium review/i);
    fireEvent.click(expandBtn);

    const scores = await screen.findAllByText(/\/10/);
    expect(scores.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByLabelText(/Collapse Toyota Stadium review/i)).toBeInTheDocument();
  });

  it('collapses a card on second click', async () => {
    renderPage();
    const expandBtn = await screen.findByLabelText(/Expand Toyota Stadium review/i);
    fireEvent.click(expandBtn);

    expect(await screen.findByLabelText(/Collapse Toyota Stadium review/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/Collapse Toyota Stadium review/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/Expand Toyota Stadium review/i)).toBeInTheDocument();
    });
  });

  it('only expands one card at a time', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Expand Toyota Stadium review/i));
    expect(await screen.findByLabelText(/Collapse Toyota Stadium review/i)).toBeInTheDocument();

    fireEvent.click(await screen.findByLabelText(/Expand Q2 Stadium review/i));
    expect(await screen.findByLabelText(/Collapse Q2 Stadium review/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Collapse Toyota Stadium review/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Expand Toyota Stadium review/i)).toBeInTheDocument();
  });

  it('updates URL hash on expand', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Expand Toyota Stadium review/i));
    await waitFor(() => {
      expect(window.location.hash).toBe('#toyota-stadium');
    });
  });

  it('clears URL hash on collapse', async () => {
    renderPage();
    fireEvent.click(await screen.findByLabelText(/Expand Toyota Stadium review/i));
    await waitFor(() => {
      expect(window.location.hash).toBe('#toyota-stadium');
    });

    fireEvent.click(screen.getByLabelText(/Collapse Toyota Stadium review/i));
    await waitFor(() => {
      expect(window.location.hash).toBe('');
    });
  });

  it('filters reviews by stadium name', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    const filter = screen.getByLabelText('Filter reviews');
    fireEvent.change(filter, { target: { value: 'Toyota' } });

    expect(screen.getByText('Toyota Stadium')).toBeInTheDocument();
    expect(screen.queryByText('Q2 Stadium')).not.toBeInTheDocument();
  });

  it('filters reviews by team name', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    const filter = screen.getByLabelText('Filter reviews');
    fireEvent.change(filter, { target: { value: 'Austin FC' } });

    expect(screen.getByText('Q2 Stadium')).toBeInTheDocument();
    expect(screen.queryByText('Toyota Stadium')).not.toBeInTheDocument();
  });

  it('filters reviews by city', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    const filter = screen.getByLabelText('Filter reviews');
    fireEvent.change(filter, { target: { value: 'Frisco' } });

    expect(screen.getByText('Toyota Stadium')).toBeInTheDocument();
    expect(screen.queryByText('Q2 Stadium')).not.toBeInTheDocument();
  });

  it('shows empty message when filter matches nothing', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    const filter = screen.getByLabelText('Filter reviews');
    fireEvent.change(filter, { target: { value: 'zzzzz' } });

    expect(await screen.findByText(/no reviews match/i)).toBeInTheDocument();
  });

  it('sorts by score when Score button is clicked', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    fireEvent.click(screen.getByLabelText('Sort by overall score'));

    const headings = screen.getAllByRole('heading', { level: 2 });
    const articles = headings.map(h => h.closest('article'));
    const scores = articles.map(a => {
      const badges = within(a).getAllByText(/⚽/);
      return parseFloat(badges[0].textContent.replace(/[^\d.]/g, ''));
    });

    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it('resets to team sort when Team button is clicked', async () => {
    renderPage();
    await screen.findByText('Toyota Stadium');

    fireEvent.click(screen.getByLabelText('Sort by overall score'));
    const scoreOrder = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);

    fireEvent.click(screen.getByLabelText('Sort by team name'));
    const teamOrder = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);

    expect(teamOrder).not.toEqual(scoreOrder);
  });

  it('renders the not-visited section', async () => {
    renderPage();
    expect(await screen.findByText('Not Reviewed (Yet)')).toBeInTheDocument();
  });

  it('renders the ratings key toggle button', async () => {
    renderPage();
    expect(await screen.findByText('What do these ratings mean?')).toBeInTheDocument();
  });

  it('expands the ratings key to show score guide', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('What do these ratings mean?'));

    expect(await screen.findByText('Hide ratings key')).toBeInTheDocument();
    expect(screen.getByText(/glaring issues/i)).toBeInTheDocument();
    expect(screen.getByText(/wasn't for me/i)).toBeInTheDocument();
    expect(screen.getByText(/limited or no transit/i)).toBeInTheDocument();
    expect(screen.getByText(/real outdoor space/i)).toBeInTheDocument();
  });

  it('collapses the ratings key on second click', async () => {
    renderPage();
    fireEvent.click(await screen.findByText('What do these ratings mean?'));
    expect(await screen.findByText('Hide ratings key')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hide ratings key'));
    await waitFor(() => {
      expect(screen.getByText('What do these ratings mean?')).toBeInTheDocument();
    });
    expect(screen.queryByText('Hide ratings key')).not.toBeInTheDocument();
  });
});
