const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

async function requestJson(path, { signal, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal,
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? 'The API request failed.');
  }

  return payload;
}

export async function fetchUsers({ signal } = {}) {
  const payload = await requestJson('/users', { signal });
  return payload.users ?? [];
}

export async function fetchHealth({ signal } = {}) {
  return requestJson('/health', { signal });
}
