const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function fetchUsers({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/users`, { signal });

  if (!response.ok) {
    throw new Error('Unable to load users from the API.');
  }

  const payload = await response.json();
  return payload.users ?? [];
}
