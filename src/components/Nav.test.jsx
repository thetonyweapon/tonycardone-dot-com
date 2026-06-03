import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nav from './Nav';

const renderNav = () =>
  render(
    <MemoryRouter>
      <Nav />
    </MemoryRouter>
  );

describe('Nav', () => {
  it('renders site name', () => {
    renderNav();
    expect(screen.getByText('Tony Cardone')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderNav();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Thoughts')).toBeInTheDocument();
    expect(screen.getByText('Photos')).toBeInTheDocument();
  });

  it('renders social links with correct attributes', () => {
    renderNav();
    const github = screen.getByLabelText('GitHub');
    expect(github).toBeInTheDocument();
    expect(github).toHaveAttribute('href', 'https://github.com/thetonyweapon/');
    expect(github).toHaveAttribute('target', '_blank');

    const linkedin = screen.getByLabelText('LinkedIn');
    expect(linkedin).toBeInTheDocument();
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/tonycardone/');
    expect(linkedin).toHaveAttribute('target', '_blank');
  });

  it('toggles dark mode on button click', () => {
    renderNav();
    const toggle = screen.getByLabelText(/switch to dark mode/i);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/switch to light mode/i));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('applies saved dark theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    renderNav();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles mobile menu', () => {
    renderNav();
    const menuButton = screen.getByLabelText(/open menu/i);
    expect(screen.queryByText(/home/i)).toBeInTheDocument();

    fireEvent.click(menuButton);
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/close menu/i));
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });

  it('closes mobile menu when a link is clicked', () => {
    renderNav();
    fireEvent.click(screen.getByLabelText(/open menu/i));
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();

    const homeLink = screen.getAllByText('Home');
    fireEvent.click(homeLink[homeLink.length - 1]);
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });
});
