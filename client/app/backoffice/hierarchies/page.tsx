'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HierarchiesGraphView from './components/HierarchiesGraphView';
import HierarchiesListView from './components/HierarchiesListView';

type ViewMode = 'graph' | 'list';

/**
 * Hierarchies Page
 * Main page for viewing and managing object type relationships
 * Supports both graph and list views
 */
export default function HierarchiesPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('graph');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('backoffice.hierarchies.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('backoffice.hierarchies.description')}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              viewMode === 'graph'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {t('backoffice.hierarchies.graphView')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded transition-colors flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            {t('backoffice.hierarchies.listView')}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">
              {viewMode === 'graph' ? t('backoffice.hierarchies.graphViewTips') : t('backoffice.hierarchies.listViewTips')}
            </h3>
            <p className="text-sm text-blue-700">
              {viewMode === 'graph'
                ? t('backoffice.hierarchies.graphViewTipsDescription')
                : t('backoffice.hierarchies.listViewTipsDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[600px]">
        {viewMode === 'graph' ? <HierarchiesGraphView /> : <HierarchiesListView />}
      </div>

      {/* Help Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('backoffice.hierarchies.relationshipTypes')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{t('backoffice.hierarchies.parentOf')}</span>
            </div>
            <p className="text-xs text-gray-600 pl-5">
              {t('backoffice.hierarchies.parentOfDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{t('backoffice.hierarchies.childOf')}</span>
            </div>
            <p className="text-xs text-gray-600 pl-5">
              {t('backoffice.hierarchies.childOfDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{t('backoffice.hierarchies.hasOne')}</span>
            </div>
            <p className="text-xs text-gray-600 pl-5">
              {t('backoffice.hierarchies.hasOneDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{t('backoffice.hierarchies.hasMany')}</span>
            </div>
            <p className="text-xs text-gray-600 pl-5">
              {t('backoffice.hierarchies.hasManyDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{t('backoffice.hierarchies.belongsTo')}</span>
            </div>
            <p className="text-xs text-gray-600 pl-5">
              {t('backoffice.hierarchies.belongsToDescription')}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('backoffice.hierarchies.cardinalityTypes')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-blue-600">{t('backoffice.hierarchies.oneToOne')}</div>
              <p className="text-xs text-gray-600">
                {t('backoffice.hierarchies.oneToOneDescription')}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-purple-600">{t('backoffice.hierarchies.oneToMany')}</div>
              <p className="text-xs text-gray-600">
                {t('backoffice.hierarchies.oneToManyDescription')}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-pink-600">{t('backoffice.hierarchies.manyToMany')}</div>
              <p className="text-xs text-gray-600">
                {t('backoffice.hierarchies.manyToManyDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
