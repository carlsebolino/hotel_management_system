import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function renderPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('frontend routes', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['/', /responsive columns/i],
    ['/about', /one product, two focused applications/i],
  ])('renders %s', (path, heading) => {
    renderPath(path);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('marks the current navigation link active and updates it after navigation', async () => {
    renderPath('/');
    const homeLink = screen.getByRole('link', { name: 'Grid demo' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    expect(homeLink).toHaveClass('active');
    await userEvent.click(aboutLink);
    expect(aboutLink).toHaveClass('active');
    expect(homeLink).not.toHaveClass('active');
  });

  it('renders the wildcard not-found page directly', () => {
    renderPath('/does-not-exist');
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('shows users loading and success states', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ users: [{ name: 'Ada', email: 'ada@example.test' }] }), {
        status: 200,
      }),
    );
    renderPath('/users');
    expect(screen.getByRole('status')).toHaveTextContent(/loading users/i);
    expect(await screen.findByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('ada@example.test')).toBeInTheDocument();
  });

  it('shows the users error state', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Service unavailable' }), { status: 503 }),
    );
    renderPath('/users');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Service unavailable'));
  });
});
