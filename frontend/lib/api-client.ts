/**
 * Type-safe API client for SuperCore backend
 * Handles authentication tokens and request/response interceptors
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

interface RequestConfig extends RequestInit {
  token?: string;
}

/**
 * Makes an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { token, headers, ...restConfig } = config;

  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token is provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    // Handle non-OK responses
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

      throw new ApiClientError(errorMessage, response.status, errorDetails);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null as T;
    }

    // Parse and return JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    );
  }
}

// ============================================================================
// Oracle API Types
// ============================================================================

export interface OracleWhoAmI {
  company_name: string;
  tax_id: string;
  logo_url?: string;
  subscription_tier?: string;
  created_at?: string;
}

export interface ObjectDefinition {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  schema: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ObjectInstance {
  id: string;
  object_definition_id: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// ============================================================================
// API Client Methods
// ============================================================================

export const apiClient = {
  /**
   * Oracle API - Get current tenant information
   */
  oracle: {
    whoami: (token?: string) =>
      apiRequest<OracleWhoAmI>('/api/v1/oracle/whoami', { token }),
  },

  /**
   * Object Definitions API
   */
  objectDefinitions: {
    list: (token?: string, page = 1, pageSize = 20) =>
      apiRequest<ListResponse<ObjectDefinition>>(
        `/api/v1/object-definitions?page=${page}&page_size=${pageSize}`,
        { token }
      ),

    get: (id: string, token?: string) =>
      apiRequest<ObjectDefinition>(`/api/v1/object-definitions/${id}`, {
        token,
      }),

    create: (data: Partial<ObjectDefinition>, token?: string) =>
      apiRequest<ObjectDefinition>('/api/v1/object-definitions', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),

    update: (id: string, data: Partial<ObjectDefinition>, token?: string) =>
      apiRequest<ObjectDefinition>(`/api/v1/object-definitions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),

    delete: (id: string, token?: string) =>
      apiRequest<void>(`/api/v1/object-definitions/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  /**
   * Object Instances API
   */
  instances: {
    list: (objectDefId: string, token?: string, page = 1, pageSize = 20) =>
      apiRequest<ListResponse<ObjectInstance>>(
        `/api/v1/object-definitions/${objectDefId}/instances?page=${page}&page_size=${pageSize}`,
        { token }
      ),

    get: (objectDefId: string, instanceId: string, token?: string) =>
      apiRequest<ObjectInstance>(
        `/api/v1/object-definitions/${objectDefId}/instances/${instanceId}`,
        { token }
      ),

    create: (
      objectDefId: string,
      data: Record<string, unknown>,
      token?: string
    ) =>
      apiRequest<ObjectInstance>(
        `/api/v1/object-definitions/${objectDefId}/instances`,
        {
          method: 'POST',
          body: JSON.stringify({ data }),
          token,
        }
      ),

    update: (
      objectDefId: string,
      instanceId: string,
      data: Record<string, unknown>,
      token?: string
    ) =>
      apiRequest<ObjectInstance>(
        `/api/v1/object-definitions/${objectDefId}/instances/${instanceId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ data }),
          token,
        }
      ),

    delete: (objectDefId: string, instanceId: string, token?: string) =>
      apiRequest<void>(
        `/api/v1/object-definitions/${objectDefId}/instances/${instanceId}`,
        {
          method: 'DELETE',
          token,
        }
      ),
  },
};

export default apiClient;
