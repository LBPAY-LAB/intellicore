'use client';

/**
 * Data Sources Management Page
 * Sprint 18 - External Data Source Configuration and Sync
 */

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';

// GraphQL Queries and Mutations
const GET_EXTERNAL_SOURCES = gql`
  query GetExternalSources {
    externalSources {
      id
      name
      description
      sourceType
      status
      connectionConfig
      syncConfig
      lastSyncAt
      lastSyncError
      syncSuccessCount
      syncFailureCount
      lastTestedAt
      lastTestSuccess
      lastTestMessage
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

const CREATE_EXTERNAL_SOURCE = gql`
  mutation CreateExternalSource($input: CreateExternalSourceInput!) {
    createExternalSource(input: $input) {
      id
      name
      sourceType
      status
    }
  }
`;

const TEST_CONNECTION = gql`
  mutation TestExternalSourceConnection($id: String!) {
    testExternalSourceConnection(id: $id) {
      success
      message
      latencyMs
    }
  }
`;

const SYNC_EXTERNAL_SOURCE = gql`
  mutation SyncExternalSource($id: String!, $fullSync: Boolean) {
    syncExternalSource(id: $id, fullSync: $fullSync) {
      success
      recordsProcessed
    }
  }
`;

const TOGGLE_ENABLED = gql`
  mutation ToggleExternalSourceEnabled($id: String!) {
    toggleExternalSourceEnabled(id: $id) {
      id
      isEnabled
      status
    }
  }
`;

const DELETE_EXTERNAL_SOURCE = gql`
  mutation DeleteExternalSource($id: String!) {
    deleteExternalSource(id: $id)
  }
`;

interface ExternalSource {
  id: string;
  name: string;
  description?: string;
  sourceType: string;
  status: string;
  connectionConfig: Record<string, unknown>;
  syncConfig?: Record<string, unknown>;
  lastSyncAt?: string;
  lastSyncError?: string;
  syncSuccessCount: number;
  syncFailureCount: number;
  lastTestedAt?: string;
  lastTestSuccess?: boolean;
  lastTestMessage?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  tigerbeetle: 'TigerBeetle',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  rest_api: 'REST API',
  graphql_api: 'GraphQL API',
  web_crawler: 'Web Crawler',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  error: 'bg-red-100 text-red-800',
  testing: 'bg-yellow-100 text-yellow-800',
};

export default function DataSourcesPage() {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    translate(`dataSources.${key}`, options);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; latencyMs?: number }>>({});

  // Form state for creating new source
  const [newSource, setNewSource] = useState<{
    name: string;
    description: string;
    sourceType: string;
    connectionConfig: Record<string, string | number | boolean>;
  }>({
    name: '',
    description: '',
    sourceType: 'postgres',
    connectionConfig: {
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
    },
  });

  const { data, loading, error, refetch } = useQuery<{ externalSources: ExternalSource[] }>(GET_EXTERNAL_SOURCES);

  const [createSource] = useMutation(CREATE_EXTERNAL_SOURCE, {
    onCompleted: () => {
      setShowCreateModal(false);
      setNewSource({
        name: '',
        description: '',
        sourceType: 'postgres',
        connectionConfig: { host: '', port: 5432, database: '', username: '', password: '' },
      });
      refetch();
    },
  });

  const [testConnection] = useMutation(TEST_CONNECTION);
  const [syncSource] = useMutation(SYNC_EXTERNAL_SOURCE);
  const [toggleEnabled] = useMutation(TOGGLE_ENABLED);
  const [deleteSource] = useMutation(DELETE_EXTERNAL_SOURCE);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await testConnection({ variables: { id } });
      const resultData = result.data as { testExternalSourceConnection?: { success: boolean; message: string; latencyMs?: number } } | null;
      const testResult = resultData?.testExternalSourceConnection;
      if (testResult) {
        setTestResults((prev) => ({
          ...prev,
          [id]: testResult,
        }));
      }
      refetch();
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: (err as Error).message },
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleSync = async (id: string, fullSync = false) => {
    setSyncingId(id);
    try {
      await syncSource({ variables: { id, fullSync } });
      refetch();
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleEnabled = async (id: string) => {
    await toggleEnabled({ variables: { id } });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDelete'))) {
      await deleteSource({ variables: { id } });
      refetch();
    }
  };

  const handleCreateSource = async () => {
    await createSource({
      variables: {
        input: {
          name: newSource.name,
          description: newSource.description,
          sourceType: newSource.sourceType.toUpperCase(),
          connectionConfig: newSource.connectionConfig,
        },
      },
    });
  };

  const sources = data?.externalSources || [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle')}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addSource')}
          </button>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error.message}
          </div>
        )}

        {/* Data Sources Grid */}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sources.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
                <p>{t('noSources')}</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  {t('addFirstSource')}
                </button>
              </div>
            ) : (
              sources.map((source) => (
                <div
                  key={source.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Source Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-500">
                          {SOURCE_TYPE_LABELS[source.sourceType] || source.sourceType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[source.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {source.status}
                        </span>
                        <button
                          onClick={() => handleToggleEnabled(source.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            source.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              source.isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    {source.description && (
                      <p className="text-sm text-gray-600 mt-2">{source.description}</p>
                    )}
                  </div>

                  {/* Sync Stats */}
                  <div className="p-4 bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('syncSuccess')}</span>
                      <span className="font-medium text-green-600">{source.syncSuccessCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{t('syncFailures')}</span>
                      <span className="font-medium text-red-600">{source.syncFailureCount}</span>
                    </div>
                    {source.lastSyncAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{t('lastSync')}</span>
                        <span className="text-gray-700">
                          {new Date(source.lastSyncAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {source.lastTestMessage && (
                      <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded">
                        <span
                          className={source.lastTestSuccess ? 'text-green-600' : 'text-red-600'}
                        >
                          {source.lastTestMessage}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Test Results (if just tested) */}
                  {testResults[source.id] && (
                    <div
                      className={`p-3 text-sm ${
                        testResults[source.id].success
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {testResults[source.id].success ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span>{testResults[source.id].message}</span>
                        {testResults[source.id].latencyMs && (
                          <span className="text-xs ml-auto">
                            {testResults[source.id].latencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 flex items-center gap-2 border-t border-gray-100">
                    <button
                      onClick={() => handleTestConnection(source.id)}
                      disabled={testingId === source.id}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {testingId === source.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {t('test')}
                    </button>
                    <button
                      onClick={() => handleSync(source.id)}
                      disabled={syncingId === source.id || source.status !== 'active'}
                      className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {syncingId === source.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      )}
                      {t('sync')}
                    </button>
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">{t('createSource')}</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('sourceName')}
                  </label>
                  <input
                    type="text"
                    value={newSource.name}
                    onChange={(e) => setNewSource((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('sourceNamePlaceholder')}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description')}
                  </label>
                  <textarea
                    value={newSource.description}
                    onChange={(e) =>
                      setNewSource((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder={t('descriptionPlaceholder')}
                  />
                </div>

                {/* Source Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('sourceType')}
                  </label>
                  <select
                    value={newSource.sourceType}
                    onChange={(e) =>
                      setNewSource((prev) => ({ ...prev, sourceType: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="tigerbeetle">TigerBeetle</option>
                    <option value="rest_api">REST API</option>
                    <option value="graphql_api">GraphQL API</option>
                    <option value="web_crawler">Web Crawler</option>
                  </select>
                </div>

                {/* Connection Config (PostgreSQL example) */}
                {newSource.sourceType === 'postgres' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{t('connectionConfig')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Host</label>
                        <input
                          type="text"
                          value={newSource.connectionConfig.host as string}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: { ...prev.connectionConfig, host: e.target.value },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          placeholder="localhost"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Port</label>
                        <input
                          type="number"
                          value={newSource.connectionConfig.port as number}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                port: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          placeholder="5432"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Database</label>
                        <input
                          type="text"
                          value={newSource.connectionConfig.database as string}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                database: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          placeholder="database_name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Username</label>
                        <input
                          type="text"
                          value={newSource.connectionConfig.username as string}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                username: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          placeholder="user"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Password</label>
                        <input
                          type="password"
                          value={newSource.connectionConfig.password as string}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                password: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          placeholder="********"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* REST API Config */}
                {newSource.sourceType === 'rest_api' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{t('connectionConfig')}</h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Base URL</label>
                      <input
                        type="url"
                        value={(newSource.connectionConfig.baseUrl as string) || ''}
                        onChange={(e) =>
                          setNewSource((prev) => ({
                            ...prev,
                            connectionConfig: { ...prev.connectionConfig, baseUrl: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        placeholder="https://api.example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">API Key (optional)</label>
                      <input
                        type="password"
                        value={(newSource.connectionConfig.apiKey as string) || ''}
                        onChange={(e) =>
                          setNewSource((prev) => ({
                            ...prev,
                            connectionConfig: { ...prev.connectionConfig, apiKey: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        placeholder="sk-..."
                      />
                    </div>
                  </div>
                )}

                {/* Web Crawler Config */}
                {newSource.sourceType === 'web_crawler' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">{t('connectionConfig')}</h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('webCrawler.startUrl')}</label>
                      <input
                        type="url"
                        value={(newSource.connectionConfig.startUrl as string) || ''}
                        onChange={(e) =>
                          setNewSource((prev) => ({
                            ...prev,
                            connectionConfig: { ...prev.connectionConfig, startUrl: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        placeholder="https://www.bcb.gov.br/estabilidadefinanceira/pix"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{t('webCrawler.urlPattern')}</label>
                      <input
                        type="text"
                        value={(newSource.connectionConfig.urlPattern as string) || ''}
                        onChange={(e) =>
                          setNewSource((prev) => ({
                            ...prev,
                            connectionConfig: { ...prev.connectionConfig, urlPattern: e.target.value },
                          }))
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                        placeholder={t('webCrawler.urlPatternPlaceholder')}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('webCrawler.maxDepth')}</label>
                        <input
                          type="number"
                          value={(newSource.connectionConfig.maxDepth as number) ?? 3}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                maxDepth: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          min={1}
                          max={10}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{t('webCrawler.maxPages')}</label>
                        <input
                          type="number"
                          value={(newSource.connectionConfig.maxPages as number) ?? 50}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                maxPages: parseInt(e.target.value),
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                          min={1}
                          max={500}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(newSource.connectionConfig.respectRobotsTxt as boolean) ?? true}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                respectRobotsTxt: e.target.checked,
                              },
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        {t('webCrawler.respectRobotsTxt')}
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(newSource.connectionConfig.followSubdomains as boolean) ?? false}
                          onChange={(e) =>
                            setNewSource((prev) => ({
                              ...prev,
                              connectionConfig: {
                                ...prev.connectionConfig,
                                followSubdomains: e.target.checked,
                              },
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        {t('webCrawler.followSubdomains')}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateSource}
                  disabled={!newSource.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('create')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
