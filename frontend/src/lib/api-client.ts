import {
  ObjectDefinition,
  CreateObjectDefinitionRequest,
  UpdateObjectDefinitionRequest,
  ListObjectDefinitionsParams,
  PaginatedResponse,
} from '@/types/object-definition';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new APIError(response.status, error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const objectDefinitionsAPI = {
  list: async (params?: ListObjectDefinitionsParams): Promise<PaginatedResponse<ObjectDefinition>> => {
    const searchParams = new URLSearchParams();

    if (params?.category) searchParams.set('category', params.category);
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));

    const query = searchParams.toString();
    return fetchAPI<PaginatedResponse<ObjectDefinition>>(
      `/api/v1/object-definitions${query ? `?${query}` : ''}`
    );
  },

  get: async (id: string): Promise<ObjectDefinition> => {
    return fetchAPI<ObjectDefinition>(`/api/v1/object-definitions/${id}`);
  },

  create: async (data: CreateObjectDefinitionRequest): Promise<ObjectDefinition> => {
    return fetchAPI<ObjectDefinition>('/api/v1/object-definitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateObjectDefinitionRequest): Promise<ObjectDefinition> => {
    return fetchAPI<ObjectDefinition>(`/api/v1/object-definitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/api/v1/object-definitions/${id}`, {
      method: 'DELETE',
    });
  },
};

export { APIError };
