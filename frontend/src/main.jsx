import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchUsers } from './api/client';
import { UsersTable } from './components/UsersTable';
import './styles.css';

function App() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('Loading API data...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetchUsers({ signal: controller.signal })
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        setStatus('Connected to Flask API');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setStatus(error.message);
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
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Decoupled architecture</p>
        <h1>Hotel Management System</h1>
        <p>
          React and Vite own the client experience while Flask exposes JSON APIs
          for backend data and workflows.
        </p>
      </section>

      <section className="card" aria-busy={isLoading}>
        <div className="card-header">
          <h2>Users</h2>
          <span>{status}</span>
        </div>
        {isLoading ? (
          <p className="empty-state">Loading users...</p>
        ) : (
          <UsersTable users={users} />
        )}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
