/**
 * ExternalSourcesManager Component
 * Sprint 18 - US-DB-015: External Source Config UI
 *
 * UI for configuring and managing external data sources.
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useExternalSources,
  useCreateExternalSource,
  useUpdateExternalSource,
  useDeleteExternalSource,
  useToggleExternalSourceEnabled,
  useTestExternalSourceConnection,
  useSyncExternalSource,
} from '@/hooks/useExternalSources';
import {
  ExternalSource,
  ExternalSourceType,
  ExternalSourceStatus,
  CreateExternalSourceInput,
} from '@/lib/graphql/external-sources';

const SOURCE_TYPE_CONFIG: Record<
  ExternalSourceType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  [ExternalSourceType.TIGERBEETLE]: {
    label: 'TigerBeetle',
    color: 'orange',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  [ExternalSourceType.POSTGRES]: {
    label: 'PostgreSQL',
    color: 'blue',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  [ExternalSourceType.MYSQL]: {
    label: 'MySQL',
    color: 'cyan',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  [ExternalSourceType.REST_API]: {
    label: 'REST API',
    color: 'green',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  [ExternalSourceType.GRAPHQL_API]: {
    label: 'GraphQL API',
    color: 'pink',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
};

const STATUS_CONFIG: Record<ExternalSourceStatus, { label: string; bgColor: string; textColor: string }> = {
  [ExternalSourceStatus.ACTIVE]: { label: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  [ExternalSourceStatus.INACTIVE]: { label: 'Inactive', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
  [ExternalSourceStatus.ERROR]: { label: 'Error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  [ExternalSourceStatus.TESTING]: { label: 'Testing', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
};

interface SourceFormData {
  name: string;
  description: string;
  sourceType: ExternalSourceType;
  connectionConfig: Record<string, any>;
  isEnabled: boolean;
}

export function ExternalSourcesManager() {
  const { sources, loading, refetch } = useExternalSources();
  const { create, loading: creating } = useCreateExternalSource();
  const { update, loading: updating } = useUpdateExternalSource();
  const { deleteSource, loading: deleting } = useDeleteExternalSource();
  const { toggle, loading: toggling } = useToggleExternalSourceEnabled();
  const { testConnection, loading: testing } = useTestExternalSourceConnection();
  const { sync, loading: syncing } = useSyncExternalSource();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<ExternalSource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSourceForDelete, setSelectedSourceForDelete] = useState<ExternalSource | null>(null);
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);

  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    description: '',
    sourceType: ExternalSourceType.POSTGRES,
    connectionConfig: {},
    isEnabled: true,
  });

  const handleOpenCreate = () => {
    setEditingSource(null);
    setFormData({
      name: '',
      description: '',
      sourceType: ExternalSourceType.POSTGRES,
      connectionConfig: getDefaultConnectionConfig(ExternalSourceType.POSTGRES),
      isEnabled: true,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (source: ExternalSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      description: source.description || '',
      sourceType: source.sourceType,
      connectionConfig: source.connectionConfig,
      isEnabled: source.isEnabled,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSource) {
        await update({
          id: editingSource.id,
          ...formData,
        });
        toast.success('Data source updated successfully');
      } else {
        await create(formData as CreateExternalSourceInput);
        toast.success('Data source created successfully');
      }
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to save data source');
    }
  };

  const handleDelete = async () => {
    if (!selectedSourceForDelete) return;

    try {
      await deleteSource(selectedSourceForDelete.id);
      toast.success('Data source deleted');
      setDeleteDialogOpen(false);
      setSelectedSourceForDelete(null);
    } catch (error) {
      toast.error('Failed to delete data source');
    }
  };

  const handleToggle = async (source: ExternalSource) => {
    try {
      await toggle(source.id);
      toast.success(`Data source ${source.isEnabled ? 'disabled' : 'enabled'}`);
    } catch (error) {
      toast.error('Failed to toggle data source');
    }
  };

  const handleTestConnection = async (source: ExternalSource) => {
    setTestingSourceId(source.id);
    try {
      const result = await testConnection(source.id);
      if (result?.success) {
        toast.success(`Connection successful (${result.latencyMs}ms)`);
      } else {
        toast.error(`Connection failed: ${result?.message}`);
      }
      refetch();
    } catch (error) {
      toast.error('Connection test failed');
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleSync = async (source: ExternalSource, fullSync = false) => {
    try {
      const result = await sync(source.id, fullSync);
      if (result?.success) {
        toast.success(`Sync completed: ${result.recordsProcessed} records processed`);
      } else {
        toast.error('Sync failed');
      }
      refetch();
    } catch (error) {
      toast.error('Sync failed');
    }
  };

  const getDefaultConnectionConfig = (type: ExternalSourceType): Record<string, any> => {
    switch (type) {
      case ExternalSourceType.TIGERBEETLE:
        return { clusterAddress: 'localhost:3000', clusterId: '0' };
      case ExternalSourceType.POSTGRES:
        return { host: 'localhost', port: 5432, database: '', username: '', password: '', ssl: false };
      case ExternalSourceType.MYSQL:
        return { host: 'localhost', port: 3306, database: '', username: '', password: '' };
      case ExternalSourceType.REST_API:
      case ExternalSourceType.GRAPHQL_API:
        return { baseUrl: '', apiKey: '', timeout: 30000 };
      default:
        return {};
    }
  };

  const handleSourceTypeChange = (type: ExternalSourceType) => {
    setFormData({
      ...formData,
      sourceType: type,
      connectionConfig: getDefaultConnectionConfig(type),
    });
  };

  const renderConnectionConfigFields = () => {
    const { sourceType, connectionConfig } = formData;

    const updateConfig = (key: string, value: any) => {
      setFormData({
        ...formData,
        connectionConfig: { ...connectionConfig, [key]: value },
      });
    };

    switch (sourceType) {
      case ExternalSourceType.TIGERBEETLE:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cluster Address</label>
              <input
                type="text"
                value={connectionConfig.clusterAddress || ''}
                onChange={(e) => updateConfig('clusterAddress', e.target.value)}
                placeholder="localhost:3000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cluster ID</label>
              <input
                type="text"
                value={connectionConfig.clusterId || ''}
                onChange={(e) => updateConfig('clusterId', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      case ExternalSourceType.POSTGRES:
      case ExternalSourceType.MYSQL:
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                <input
                  type="text"
                  value={connectionConfig.host || ''}
                  onChange={(e) => updateConfig('host', e.target.value)}
                  placeholder="localhost"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="number"
                  value={connectionConfig.port || ''}
                  onChange={(e) => updateConfig('port', parseInt(e.target.value))}
                  placeholder={sourceType === ExternalSourceType.POSTGRES ? '5432' : '3306'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
              <input
                type="text"
                value={connectionConfig.database || ''}
                onChange={(e) => updateConfig('database', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={connectionConfig.username || ''}
                  onChange={(e) => updateConfig('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={connectionConfig.password || ''}
                  onChange={(e) => updateConfig('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {sourceType === ExternalSourceType.POSTGRES && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={connectionConfig.ssl || false}
                  onChange={(e) => updateConfig('ssl', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ssl" className="text-sm text-gray-700">Use SSL</label>
              </div>
            )}
          </>
        );

      case ExternalSourceType.REST_API:
      case ExternalSourceType.GRAPHQL_API:
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                type="url"
                value={connectionConfig.baseUrl || ''}
                onChange={(e) => updateConfig('baseUrl', e.target.value)}
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key (optional)</label>
              <input
                type="password"
                value={connectionConfig.apiKey || ''}
                onChange={(e) => updateConfig('apiKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (ms)</label>
              <input
                type="number"
                value={connectionConfig.timeout || 30000}
                onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">External Data Sources</h2>
          <p className="text-sm text-gray-600 mt-1">Configure connections to external databases and APIs for RAG context</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Data Source
        </button>
      </div>

      {/* Sources List */}
      {sources.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <p className="text-gray-500 mb-4">No external data sources configured yet</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Data Source
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source: ExternalSource) => {
            const typeConfig = SOURCE_TYPE_CONFIG[source.sourceType];
            const statusConfig = STATUS_CONFIG[source.status];
            const isTestingThis = testingSourceId === source.id;

            return (
              <div
                key={source.id}
                className={`bg-white rounded-lg border ${source.isEnabled ? 'border-gray-200' : 'border-gray-100 opacity-60'} p-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-${typeConfig.color}-100 text-${typeConfig.color}-600`}>
                      {typeConfig.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{source.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                          {statusConfig.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {typeConfig.label}
                        </span>
                      </div>
                      {source.description && (
                        <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        {source.lastTestedAt && (
                          <span>
                            Last tested: {new Date(source.lastTestedAt).toLocaleString()}
                            {source.lastTestSuccess ? (
                              <span className="text-green-600 ml-1">(OK)</span>
                            ) : (
                              <span className="text-red-600 ml-1">(Failed)</span>
                            )}
                          </span>
                        )}
                        {source.lastSyncAt && (
                          <span>Last sync: {new Date(source.lastSyncAt).toLocaleString()}</span>
                        )}
                        <span>
                          Syncs: {source.syncSuccessCount} success / {source.syncFailureCount} failed
                        </span>
                      </div>
                      {source.lastTestMessage && source.status === ExternalSourceStatus.ERROR && (
                        <p className="text-xs text-red-600 mt-1">{source.lastTestMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(source)}
                      disabled={isTestingThis || testing}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Test Connection"
                    >
                      {isTestingThis ? (
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleSync(source)}
                      disabled={syncing || source.status !== ExternalSourceStatus.ACTIVE}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Sync Data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggle(source)}
                      disabled={toggling}
                      className={`p-2 rounded-lg transition-colors ${
                        source.isEnabled
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={source.isEnabled ? 'Disable' : 'Enable'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={source.isEnabled ? "M5 13l4 4L19 7" : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"} />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(source)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSourceForDelete(source);
                        setDeleteDialogOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {editingSource ? 'Edit Data Source' : 'Add Data Source'}
                </h3>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source Type</label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => handleSourceTypeChange(e.target.value as ExternalSourceType)}
                    disabled={!!editingSource}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {Object.entries(SOURCE_TYPE_CONFIG).map(([type, config]) => (
                      <option key={type} value={type}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Connection Configuration</h4>
                  <div className="space-y-4">{renderConnectionConfigFields()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isEnabled" className="text-sm text-gray-700">Enable this data source</label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {creating || updating ? 'Saving...' : editingSource ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && selectedSourceForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Data Source</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <strong>{selectedSourceForDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedSourceForDelete(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
