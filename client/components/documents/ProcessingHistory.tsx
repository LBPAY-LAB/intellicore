/**
 * ProcessingHistory Component
 * Sprint 18 - US-DB-012: Processing History View
 *
 * Table view of all processed documents with status, metrics, and actions.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useDocuments } from '@/hooks/useDocuments';
import { useActiveDocumentCategories } from '@/hooks/useDocumentCategories';
import { PipelineStatusInline } from './PipelineVisualization';
import type { Document, EmbeddingStatus } from '@/lib/graphql/documents';

type SortField = 'filename' | 'category' | 'status' | 'uploadedAt' | 'processingTime';
type SortDirection = 'asc' | 'desc';

interface ProcessingHistoryProps {
  onViewDetails?: (document: Document) => void;
  onReprocess?: (documentId: string) => void;
}

export function ProcessingHistory({ onViewDetails, onReprocess }: ProcessingHistoryProps) {
  const { t } = useTranslation('documents');
  const { documents, loading, refetch } = useDocuments({});
  const { categories } = useActiveDocumentCategories();

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField>('uploadedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Apply filters
    if (categoryFilter) {
      result = result.filter((doc) => doc.documentCategoryId === categoryFilter);
    }

    if (statusFilter) {
      result = result.filter((doc) => doc.embeddingStatus === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.originalFilename.toLowerCase().includes(term) ||
          doc.documentCategory?.name.toLowerCase().includes(term)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'filename':
          comparison = a.originalFilename.localeCompare(b.originalFilename);
          break;
        case 'category':
          comparison = (a.documentCategory?.name || '').localeCompare(
            b.documentCategory?.name || ''
          );
          break;
        case 'status':
          comparison = a.embeddingStatus.localeCompare(b.embeddingStatus);
          break;
        case 'uploadedAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'processingTime':
          const aTime = a.bronzeProcessedAt
            ? new Date(a.bronzeProcessedAt).getTime() - new Date(a.createdAt).getTime()
            : 0;
          const bTime = b.bronzeProcessedAt
            ? new Date(b.bronzeProcessedAt).getTime() - new Date(b.createdAt).getTime()
            : 0;
          comparison = aTime - bTime;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [documents, categoryFilter, statusFilter, searchTerm, sortField, sortDirection]);

  // Paginate results
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = useMemo(() => {
    const completed = documents.filter((d) => d.embeddingStatus === 'completed').length;
    const processing = documents.filter((d) => d.embeddingStatus === 'processing').length;
    const failed = documents.filter((d) => d.embeddingStatus === 'failed').length;
    const pending = documents.filter((d) => d.embeddingStatus === 'pending').length;

    return { completed, processing, failed, pending, total: documents.length };
  }, [documents]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getProcessingTime = (doc: Document): string => {
    if (!doc.bronzeProcessedAt) return '-';
    const start = new Date(doc.createdAt).getTime();
    const end = new Date(doc.bronzeProcessedAt).getTime();
    const diffMs = end - start;

    if (diffMs < 1000) return `${diffMs}ms`;
    if (diffMs < 60000) return `${(diffMs / 1000).toFixed(1)}s`;
    return `${Math.floor(diffMs / 60000)}m ${Math.round((diffMs % 60000) / 1000)}s`;
  };

  const getStatusColor = (status: EmbeddingStatus): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Filename',
      'Category',
      'Status',
      'File Size (MB)',
      'Processing Time',
      'Uploaded At',
      'Uploaded By',
    ];

    const rows = filteredDocuments.map((doc) => [
      doc.originalFilename,
      doc.documentCategory?.name || '-',
      doc.embeddingStatus,
      (doc.fileSize / 1024 / 1024).toFixed(2),
      getProcessingTime(doc),
      new Date(doc.createdAt).toISOString(),
      doc.uploadedBy,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processing-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Export completed');
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );

    return (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="w-8 h-8 animate-spin text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-2xl font-bold text-blue-900">{stats.processing}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <p className="text-sm text-red-600">Failed</p>
          <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by filename..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('filename')}
                >
                  <div className="flex items-center gap-1">
                    Document
                    <SortIcon field="filename" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <SortIcon field="category" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pipeline
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Size
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('processingTime')}
                >
                  <div className="flex items-center gap-1">
                    Processing Time
                    <SortIcon field="processingTime" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('uploadedAt')}
                >
                  <div className="flex items-center gap-1">
                    Uploaded
                    <SortIcon field="uploadedAt" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={doc.originalFilename}>
                        {doc.originalFilename}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {doc.documentCategory ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {doc.documentCategory.name}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        doc.embeddingStatus
                      )}`}
                    >
                      {doc.embeddingStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <PipelineStatusInline
                      stages={[
                        {
                          stage: 'bronze',
                          status: doc.bronzeProcessedAt ? 'completed' : doc.embeddingStatus === 'processing' ? 'processing' : 'pending',
                        },
                        {
                          stage: 'silver',
                          status: doc.embeddingStatus === 'completed' ? 'completed' : doc.bronzeProcessedAt ? 'processing' : 'pending',
                        },
                        { stage: 'gold_a', status: doc.embeddingStatus === 'completed' ? 'completed' : 'pending' },
                        { stage: 'gold_b', status: doc.embeddingStatus === 'completed' ? 'completed' : 'pending' },
                        { stage: 'gold_c', status: doc.embeddingStatus === 'completed' ? 'completed' : 'pending' },
                      ]}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">{getProcessingTime(doc)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <span className="text-sm text-gray-900">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(doc)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      {doc.embeddingStatus === 'failed' && onReprocess && (
                        <button
                          onClick={() => onReprocess(doc.id)}
                          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Reprocess"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} of{' '}
              {filteredDocuments.length} documents
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {paginatedDocuments.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No documents found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
