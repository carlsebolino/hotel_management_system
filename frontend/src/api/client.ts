const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

export interface User {
  name: string;
  email: string;
}

export interface HealthResponse {
  status: string;
}

interface ErrorResponse {
  message?: string;
}

interface UsersResponse {
  users?: User[];
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorPayload = payload as ErrorResponse;
    throw new Error(errorPayload.message ?? 'The API request failed.');
  }

  return payload as T;
}

export async function fetchUsers(options: Pick<RequestInit, 'signal'> = {}): Promise<User[]> {
  const payload = await requestJson<UsersResponse>('/users', options);
  return payload.users ?? [];
}

export async function fetchHealth(
  options: Pick<RequestInit, 'signal'> = {},
): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/health', options);
}
