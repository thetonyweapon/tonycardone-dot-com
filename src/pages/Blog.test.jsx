import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Blog from './Blog';

const renderBlog = () =>
  render(
    <MemoryRouter>
      <Blog />
    </MemoryRouter>
  );

describe('Blog', () => {
  it('renders the page heading', () => {
    renderBlog();
    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument();
  });

  it('renders blog posts after loading', () => {
    renderBlog();
    expect(screen.getByText('A New Site')).toBeInTheDocument();
  });

  it('shows read time for a post', () => {
    renderBlog();
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    renderBlog();
    expect(screen.getByText(/collection of thoughts/i)).toBeInTheDocument();
  });

  it('renders post tags', () => {
    renderBlog();
    expect(screen.getByText('personal')).toBeInTheDocument();
  });

  it('renders post date', () => {
    renderBlog();
    expect(screen.getByText('June')).toBeInTheDocument();
  });
});
