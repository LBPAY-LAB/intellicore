'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentTypeManager } from '@/components/documents/DocumentTypeManager';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const docs = (key: string, options?: Record<string, unknown>) => t(`documents.${key}`, options);
  const [activeTab, setActiveTab] = useState<'upload' | 'list' | 'types'>('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">{docs('title')}</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upload'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {docs('uploadDocument')}
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {docs('documentsList')}
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'types'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {docs('manageTypes')}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'upload' && (
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        )}
        {activeTab === 'list' && <DocumentList key={refreshKey} />}
        {activeTab === 'types' && <DocumentTypeManager />}
      </div>
    </div>
  );
}
