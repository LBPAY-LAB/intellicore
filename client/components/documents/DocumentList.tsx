'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments';
import { useActiveDocumentCategories } from '@/hooks/useDocumentCategories';
import { ProcessingStatusBadge } from './ProcessingStatusBadge';
import { ProcessForRagButton } from './ProcessForRagButton';
import type { Document, DocumentsFilterInput, EmbeddingStatus } from '@/lib/graphql/documents';

interface DocumentListProps {
  filter?: DocumentsFilterInput;
}

export function DocumentList({ filter: initialFilter }: DocumentListProps) {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Combine initial filter with local filters
  const combinedFilter: DocumentsFilterInput = {
    ...initialFilter,
    ...(categoryFilter && { documentCategoryId: categoryFilter }),
    ...(statusFilter && { embeddingStatus: statusFilter as EmbeddingStatus }),
  };

  const { documents, loading, refetch } = useDocuments(combinedFilter);
  const { categories, loading: loadingCategories } = useActiveDocumentCategories();
  const { deleteDocument, loading: deleting } = useDeleteDocument();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDownload = async (document: Document) => {
    try {
      if (document.downloadUrl) {
        window.open(document.downloadUrl, '_blank');
      }
    } catch (error) {
      toast.error(t('errors.downloadFailed'));
    }
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;

    try {
      await deleteDocument(selectedDocument.id);
      toast.success(t('deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      refetch();
    } catch (error) {
      toast.error(t('errors.deleteFailed'));
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-700">{t('loading')}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-900 mb-1">
            {t('filterByCategory')}
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={loadingCategories}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-900 mb-1">
            {t('filterByStatus')}
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="pending">{t('notProcessed')}</option>
            <option value="processing">{t('processing')}</option>
            <option value="completed">{t('processed')}</option>
            <option value="failed">{t('failed')}</option>
          </select>
        </div>

        {(categoryFilter || statusFilter) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setCategoryFilter('');
                setStatusFilter('');
              }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 underline"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📄</div>
          <p>{t('noDocuments')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('document')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('type')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('uploadedBy')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('uploadedAt')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {documents.map((doc: Document) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 break-words">
                          {doc.originalFilename}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {doc.documentType.name}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {doc.documentCategory ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.documentCategory.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ProcessingStatusBadge
                      status={doc.embeddingStatus}
                      error={doc.embeddingError}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900 font-medium">{doc.uploadedBy}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-900">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(doc.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <ProcessForRagButton
                        document={doc}
                        onSuccess={refetch}
                        size="sm"
                      />
                      <button
                        onClick={() => handleDownload(doc)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('download')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={deleting}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{t('confirmDelete')}</h3>
            <p className="mb-6 text-gray-600">
              {t('confirmDeleteMessage', {
                filename: selectedDocument.originalFilename,
              })}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedDocument(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
