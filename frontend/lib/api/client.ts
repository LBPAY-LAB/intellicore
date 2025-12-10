import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export function useApiClient() {
  const { token } = useKeycloak();

  const request = async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, Keycloak will handle re-login
        throw new Error('Unauthorized');
      }
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  };

  return {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    put: <T>(endpoint: string, data: unknown) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: <T>(endpoint: string) =>
      request<T>(endpoint, {
        method: 'DELETE',
      }),
  };
}

// Server-side API client (for server components)
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { token, ...fetchOptions } = options || {};

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions?.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
