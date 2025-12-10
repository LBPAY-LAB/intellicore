/**
 * Object Definitions API Client
 * Handles all API calls related to object definitions
 */

import {
  ObjectDefinition,
  ObjectDefinitionFilters,
  ObjectDefinitionListResponse,
  CreateObjectDefinitionRequest,
  UpdateObjectDefinitionRequest,
} from '@/lib/types/object-definition';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export class ObjectDefinitionsAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ObjectDefinitionsAPIError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = errorData;
      } catch {
        // If response is not JSON, use status text
      }

      throw new ObjectDefinitionsAPIError(errorMessage, response.status, errorDetails);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ObjectDefinitionsAPIError) {
      throw error;
    }

    throw new ObjectDefinitionsAPIError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    );
  }
}

export const objectDefinitionsAPI = {
  /**
   * List all object definitions with optional filters
   */
  list: async (
    filters: ObjectDefinitionFilters = {},
    token?: string
  ): Promise<ObjectDefinitionListResponse> => {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    if (filters.is_active !== undefined)
      params.append('is_active', String(filters.is_active));
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));

    const query = params.toString();
    const endpoint = `/api/v1/object-definitions${query ? `?${query}` : ''}`;

    return apiRequest<ObjectDefinitionListResponse>(endpoint, {}, token);
  },

  /**
   * Get a single object definition by ID
   */
  get: async (id: string, token?: string): Promise<ObjectDefinition> => {
    return apiRequest<ObjectDefinition>(
      `/api/v1/object-definitions/${id}`,
      {},
      token
    );
  },

  /**
   * Create a new object definition
   */
  create: async (
    data: CreateObjectDefinitionRequest,
    token?: string
  ): Promise<ObjectDefinition> => {
    return apiRequest<ObjectDefinition>(
      '/api/v1/object-definitions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Update an existing object definition
   */
  update: async (
    id: string,
    data: UpdateObjectDefinitionRequest,
    token?: string
  ): Promise<ObjectDefinition> => {
    return apiRequest<ObjectDefinition>(
      `/api/v1/object-definitions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },

  /**
   * Soft delete an object definition
   */
  delete: async (id: string, token?: string): Promise<void> => {
    return apiRequest<void>(
      `/api/v1/object-definitions/${id}`,
      {
        method: 'DELETE',
      },
      token
    );
  },
};
