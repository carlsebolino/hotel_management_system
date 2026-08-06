import { useEffect, useState } from 'react';
import { fetchUsers, type User } from '../api/client';
import { Container, Stack } from '../components/layouts';
import { UsersTable } from '../components/UsersTable';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);
        setUsers(await fetchUsers({ signal: controller.signal }));
      } catch (reason) {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : 'Unable to load users.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadUsers();
    return () => controller.abort();
  }, []);

  return (
    <Container className="page-frame standard-page">
      <Stack className="details-card users-card">
        <Stack className="section-heading">
          <p className="eyebrow">Flask API smoke path</p>
          <h1 className="page-title">Users</h1>
          <p className="intro">
            This page calls <code>VITE_API_BASE_URL</code> and renders the Flask{' '}
            <code>/api/v1/users</code> response.
          </p>
        </Stack>
        {loading ? (
          <p className="empty-state" role="status">
            Loading users from Flask…
          </p>
        ) : null}
        {error ? (
          <p className="error-state" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error ? <UsersTable users={users} /> : null}
      </Stack>
    </Container>
  );
}
