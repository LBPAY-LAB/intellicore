'use client';

/**
 * DocumentsManager Component
 * Reusable component for managing documents (upload, list, types)
 * Used within RAG Explorer for unified document management
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentUpload } from './DocumentUpload';
import { DocumentList } from './DocumentList';
import { DocumentTypeManager } from './DocumentTypeManager';

type DocumentSubTab = 'upload' | 'list' | 'types';

export function DocumentsManager() {
  const { t } = useTranslation();
  const docs = (key: string, options?: Record<string, unknown>) =>
    t(`documents.${key}`, options);

  const [activeSubTab, setActiveSubTab] = useState<DocumentSubTab>('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveSubTab('list');
  };

  const subTabs: { id: DocumentSubTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'upload',
      label: docs('uploadDocument'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
    {
      id: 'list',
      label: docs('documentsList'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'types',
      label: docs('manageTypes'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                activeSubTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeSubTab === 'upload' && (
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        )}
        {activeSubTab === 'list' && <DocumentList key={refreshKey} />}
        {activeSubTab === 'types' && <DocumentTypeManager />}
      </div>
    </div>
  );
}
