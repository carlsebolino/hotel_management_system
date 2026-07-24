import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchUsers } from './api/client';
import { UsersTable } from './components/UsersTable';
import { Container, Grid, SidebarLayout, Stack } from './components/layouts';
import './styles.css';

const summaryCards = [
  { label: 'Tasks today', value: '24', detail: '8 completed', tone: 'bg-sky-50 text-sky-700' },
  {
    label: 'Progress',
    value: '86%',
    detail: '12 items remaining',
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    label: 'Open requests',
    value: '7',
    detail: '2 need attention',
    tone: 'bg-amber-50 text-amber-700',
  },
];

function App() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('Loading API data...');
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiError, setHasApiError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers({ signal: controller.signal })
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        setStatus('Connected to Flask API');
        setHasApiError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setStatus('API unavailable');
          setHasApiError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <Container>
        <Stack gap="lg">
          <header className="flex flex-col justify-between gap-5 rounded-3xl bg-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-300 sm:flex-row sm:items-end sm:px-9">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
                Layout primitives
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Reference application dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                A responsive Tailwind demonstration built from reusable Container, Stack, Grid, and
                SidebarLayout components.
              </p>
            </div>
            <button className="rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
              New item
            </button>
          </header>

          <Grid columns={3}>
            {summaryCards.map((item) => (
              <section
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <strong className="text-3xl tracking-tight text-slate-900">{item.value}</strong>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.tone}`}>
                    {item.detail}
                  </span>
                </div>
              </section>
            ))}
          </Grid>

          <SidebarLayout
            sidebar={
              <nav
                aria-label="Dashboard sections"
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Workspace
                </p>
                {['Overview', 'Projects', 'Tasks', 'Team'].map((item, index) => (
                  <a
                    key={item}
                    className={`mb-1 block rounded-xl px-3 py-2.5 text-sm font-semibold ${index === 0 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                    href={`#${item.toLowerCase()}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            }
          >
            <Stack gap="md">
              <section
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                id="overview"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Team directory</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Data is loaded from the Flask API.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${hasApiError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}
                    role="status"
                  >
                    {status}
                  </span>
                </div>
                <div aria-busy={isLoading}>
                  {isLoading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading users...</p>
                  ) : (
                    <UsersTable users={users} />
                  )}
                </div>
              </section>
              <p className="text-center text-sm text-slate-500">
                Resize this page to see the grid and sidebar adapt for smaller screens.
              </p>
            </Stack>
          </SidebarLayout>
        </Stack>
      </Container>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
