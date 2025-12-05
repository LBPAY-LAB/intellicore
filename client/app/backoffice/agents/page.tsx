'use client';

import { useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import {
  GET_OBJECT_TYPES,
  ObjectTypesResponse,
} from '@/lib/graphql/object-types';

export default function AgentsPage() {
  const { t } = useTranslation();

  const { data, loading, error } = useQuery<ObjectTypesResponse>(
    GET_OBJECT_TYPES,
    {
      variables: {
        first: 100,
      },
      fetchPolicy: 'network-only',
    }
  );

  const objectTypes = data?.objectTypes.nodes || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 rounded-t-lg">
        <h1 className="text-2xl font-bold text-gray-900">{t('agents.title')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('agents.description')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {t('common.error')}: {error.message}
          </div>
        )}

        {!loading && !error && objectTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('backoffice.agents.noAgents')}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {t('backoffice.agents.noAgentsDescription')}
            </p>
          </div>
        )}

        {!loading && !error && objectTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectTypes.map((objectType) => (
              <div
                key={objectType.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {objectType.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            objectType.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {objectType.is_active ? t('common.active') : t('common.inactive')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {objectType.description && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                      {objectType.description}
                    </p>
                  )}

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {t('backoffice.agents.llmAgent')}
                    </p>
                    <p className="text-sm text-gray-700">
                      {t('backoffice.agents.specializedAgent', { name: objectType.name })}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        // TODO: Implement agent testing
                        console.log('Test agent:', objectType.id);
                      }}
                    >
                      {t('agents.test')}
                    </button>
                    <button
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        // TODO: Implement validation history
                        console.log('View history:', objectType.id);
                      }}
                    >
                      {t('agents.history')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
