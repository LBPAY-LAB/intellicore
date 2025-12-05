/**
 * RAG Explorer Page
 * Sprint 18+ - CoreBanking Brain: Pipeline Visualization & RAG Testing
 *
 * Intuitive and didactic page for exploring Bronze/Silver/Gold layers,
 * testing RAG queries, and understanding how document memory works.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  GET_DOCUMENTS,
  GET_DOCUMENT_SILVER_CHUNKS,
  GET_DOCUMENT_GOLD_DISTRIBUTIONS,
  GET_DOCUMENT_PROCESSING_STATS,
  RETRY_FAILED_GOLD_DISTRIBUTION,
  type Document,
  type SilverChunk,
  type GoldDistribution,
  type DocumentProcessingStats,
  EmbeddingStatus,
  GoldDistributionStatus,
} from '@/lib/graphql/documents';
import { DocumentsManager } from '@/components/documents/DocumentsManager';
import { DataSourcesManager } from '@/components/data-sources/DataSourcesManager';

type TabType = 'pipeline' | 'layers' | 'query' | 'stats' | 'documents' | 'sources';

export default function RagExplorerPage() {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) =>
    translate(`ragExplorer.${key}`, options);

  const [activeTab, setActiveTab] = useState<TabType>('pipeline');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Fetch all documents
  const { data: documentsData, loading: documentsLoading, refetch } = useQuery<{
    documents: Document[];
  }>(GET_DOCUMENTS);
  const documents: Document[] = documentsData?.documents || [];

  // Fetch selected document details
  const { data: chunksData, loading: chunksLoading } = useQuery<{
    documentSilverChunks: SilverChunk[];
  }>(GET_DOCUMENT_SILVER_CHUNKS, {
    variables: { documentId: selectedDocumentId },
    skip: !selectedDocumentId,
  });

  const { data: distributionsData, loading: distributionsLoading } = useQuery<{
    documentGoldDistributions: GoldDistribution[];
  }>(
    GET_DOCUMENT_GOLD_DISTRIBUTIONS,
    {
      variables: { documentId: selectedDocumentId },
      skip: !selectedDocumentId,
    }
  );

  const { data: statsData } = useQuery<{
    documentProcessingStats: DocumentProcessingStats;
  }>(GET_DOCUMENT_PROCESSING_STATS, {
    variables: { documentId: selectedDocumentId },
    skip: !selectedDocumentId,
  });

  const [retryFailed, { loading: retrying }] = useMutation<{
    retryFailedGoldDistribution: boolean;
  }>(RETRY_FAILED_GOLD_DISTRIBUTION);

  const chunks: SilverChunk[] = chunksData?.documentSilverChunks || [];
  const distributions: GoldDistribution[] = distributionsData?.documentGoldDistributions || [];
  const processingStats: DocumentProcessingStats | null = statsData?.documentProcessingStats || null;

  // Calculate pipeline statistics
  const pipelineStats = useMemo(() => {
    const total = documents.length;
    const pending = documents.filter((d) => d.embeddingStatus === EmbeddingStatus.PENDING).length;
    const processing = documents.filter(
      (d) => d.embeddingStatus === EmbeddingStatus.PROCESSING
    ).length;
    const completed = documents.filter(
      (d) => d.embeddingStatus === EmbeddingStatus.COMPLETED
    ).length;
    const failed = documents.filter((d) => d.embeddingStatus === EmbeddingStatus.FAILED).length;

    return { total, pending, processing, completed, failed };
  }, [documents]);

  const selectedDocument = documents.find((d) => d.id === selectedDocumentId);

  const handleRetryFailed = async () => {
    if (!selectedDocumentId) return;
    try {
      await retryFailed({ variables: { documentId: selectedDocumentId } });
      toast.success('Reprocessamento iniciado');
      refetch();
    } catch (error) {
      toast.error('Falha ao iniciar reprocessamento');
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'pipeline',
      label: t('tabs.pipeline'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: 'layers',
      label: t('tabs.layers'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: 'query',
      label: t('tabs.query'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'stats',
      label: t('tabs.stats'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: 'documents',
      label: t('tabs.documents'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      id: 'sources',
      label: t('tabs.sources'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-purple-100 mt-1">{t('subtitle')}</p>
            </div>
          </div>
          <p className="mt-4 text-purple-100 max-w-3xl">{t('description')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6">
          <nav className="flex gap-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Tab: Pipeline */}
        {activeTab === 'pipeline' && (
          <PipelineTab
            stats={pipelineStats}
            documents={documents}
            loading={documentsLoading}
            onRefresh={refetch}
            onSelectDocument={setSelectedDocumentId}
            selectedDocumentId={selectedDocumentId}
            t={t}
          />
        )}

        {/* Tab: Layers */}
        {activeTab === 'layers' && (
          <LayersTab
            documents={documents}
            selectedDocument={selectedDocument}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
            chunks={chunks}
            chunksLoading={chunksLoading}
            distributions={distributions}
            distributionsLoading={distributionsLoading}
            processingStats={processingStats}
            onRetryFailed={handleRetryFailed}
            retrying={retrying}
            t={t}
          />
        )}

        {/* Tab: Query */}
        {activeTab === 'query' && <QueryTab t={t} />}

        {/* Tab: Stats */}
        {activeTab === 'stats' && (
          <StatsTab
            documents={documents}
            pipelineStats={pipelineStats}
            loading={documentsLoading}
            t={t}
          />
        )}

        {/* Tab: Documents */}
        {activeTab === 'documents' && <DocumentsManager />}

        {/* Tab: Sources */}
        {activeTab === 'sources' && <DataSourcesManager />}
      </div>
    </div>
  );
}

// ============================================================
// Pipeline Tab Component
// ============================================================

interface PipelineTabProps {
  stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  documents: Document[];
  loading: boolean;
  onRefresh: () => void;
  onSelectDocument: (id: string | null) => void;
  selectedDocumentId: string | null;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function PipelineTab({
  stats,
  documents,
  loading,
  onRefresh,
  onSelectDocument,
  selectedDocumentId,
  t,
}: PipelineTabProps) {
  return (
    <div className="space-y-8">
      {/* Pipeline Diagram */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('pipeline.title')}</h2>
        <p className="text-gray-600 mb-6">{t('pipeline.description')}</p>

        {/* Visual Pipeline */}
        <div className="flex items-center justify-center gap-4 py-8 overflow-x-auto">
          {/* Upload Stage */}
          <PipelineStage
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            }
            label="Upload"
            sublabel="Documentos"
            color="blue"
            count={stats.total}
          />

          <PipelineArrow />

          {/* Bronze Stage */}
          <PipelineStage
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            label="Bronze"
            sublabel="Texto Extraído"
            color="amber"
            count={stats.completed + stats.processing}
          />

          <PipelineArrow />

          {/* Silver Stage */}
          <PipelineStage
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
            label="Silver"
            sublabel="Chunks + Entidades"
            color="gray"
            count={stats.completed}
          />

          <PipelineArrow />

          {/* Gold Stage */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <PipelineStageSmall label="A" sublabel="Trino" color="yellow" />
              <PipelineStageSmall label="B" sublabel="Graph" color="yellow" />
              <PipelineStageSmall label="C" sublabel="Vector" color="yellow" />
            </div>
            <span className="text-sm font-medium text-gray-700">Gold Layer</span>
            <span className="text-xs text-gray-500">Pronto para RAG</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title={t('pipeline.totalDocuments')}
          value={stats.total}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title={t('pipeline.processingQueue')}
          value={stats.pending + stats.processing}
          icon={
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title={t('pipeline.completed')}
          value={stats.completed}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="green"
        />
        <StatCard
          title={t('pipeline.failed')}
          value={stats.failed}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="red"
        />
        <div className="flex items-center justify-center">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('actions.refresh')}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Documentos Recentes</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-4"
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
              <p>{t('empty.noDocuments')}</p>
              <p className="text-sm mt-1">{t('empty.noDocumentsDescription')}</p>
            </div>
          ) : (
            documents.slice(0, 10).map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                  selectedDocumentId === doc.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  <DocumentStatusIcon status={doc.embeddingStatus} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.originalFilename}</p>
                  <p className="text-sm text-gray-500">
                    {doc.documentCategory?.name || doc.documentType?.name} -{' '}
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={doc.embeddingStatus} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Layers Tab Component
// ============================================================

interface LayersTabProps {
  documents: Document[];
  selectedDocument: Document | undefined;
  selectedDocumentId: string | null;
  onSelectDocument: (id: string | null) => void;
  chunks: SilverChunk[];
  chunksLoading: boolean;
  distributions: GoldDistribution[];
  distributionsLoading: boolean;
  processingStats: DocumentProcessingStats | null;
  onRetryFailed: () => void;
  retrying: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function LayersTab({
  documents,
  selectedDocument,
  selectedDocumentId,
  onSelectDocument,
  chunks,
  chunksLoading,
  distributions,
  distributionsLoading,
  processingStats,
  onRetryFailed,
  retrying,
  t,
}: LayersTabProps) {
  const [expandedChunk, setExpandedChunk] = useState<string | null>(null);

  // Calculate entity counts
  const entityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chunks.forEach((chunk) => {
      (chunk.extractedEntities || []).forEach((entity) => {
        counts[entity.type] = (counts[entity.type] || 0) + 1;
      });
    });
    return counts;
  }, [chunks]);

  return (
    <div className="space-y-6">
      {/* Document Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{t('layers.selectDocument')}</h3>
        <select
          value={selectedDocumentId || ''}
          onChange={(e) => onSelectDocument(e.target.value || null)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500"
        >
          <option value="">{t('layers.selectDocument')}</option>
          {documents
            .filter((d) => d.embeddingStatus === EmbeddingStatus.COMPLETED)
            .map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.originalFilename} - {doc.documentCategory?.name || doc.documentType?.name}
              </option>
            ))}
        </select>
      </div>

      {selectedDocument && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bronze Layer */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-600 text-white rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-900">{t('layers.bronze.title')}</h3>
                <p className="text-sm text-amber-700">{t('layers.bronze.subtitle')}</p>
              </div>
            </div>

            <p className="text-sm text-amber-800 mb-4">{t('layers.bronze.description')}</p>

            <div className="space-y-3">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-700">
                  {t('layers.bronze.fields.originalFile')}
                </p>
                <p className="text-sm text-gray-900 truncate">{selectedDocument.originalFilename}</p>
              </div>

              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-700">
                  {t('layers.bronze.fields.extractedText')}
                </p>
                <p className="text-sm text-gray-900">
                  {selectedDocument.extractedText
                    ? `${selectedDocument.extractedText.length.toLocaleString()} caracteres`
                    : 'Não disponível'}
                </p>
              </div>

              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs font-medium text-amber-700">
                  {t('layers.bronze.fields.processedAt')}
                </p>
                <p className="text-sm text-gray-900">
                  {selectedDocument.bronzeProcessedAt
                    ? new Date(selectedDocument.bronzeProcessedAt).toLocaleString()
                    : 'Não processado'}
                </p>
              </div>
            </div>
          </div>

          {/* Silver Layer */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-600 text-white rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{t('layers.silver.title')}</h3>
                <p className="text-sm text-gray-600">{t('layers.silver.subtitle')}</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{t('layers.silver.description')}</p>

            {chunksLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="w-8 h-8 animate-spin text-gray-400" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600">
                    {t('layers.silver.fields.totalChunks')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{chunks.length}</p>
                </div>

                <div className="bg-white/80 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600">
                    {t('layers.silver.fields.entities')}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(entityCounts).map(([type, count]) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {type}: {count}
                      </span>
                    ))}
                    {Object.keys(entityCounts).length === 0 && (
                      <span className="text-sm text-gray-500">Nenhuma entidade</span>
                    )}
                  </div>
                </div>

                {/* Chunks Preview */}
                <div className="bg-white/80 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 mb-2">Chunks Preview</p>
                  {chunks.slice(0, 5).map((chunk) => (
                    <button
                      key={chunk.id}
                      onClick={() => setExpandedChunk(expandedChunk === chunk.id ? null : chunk.id)}
                      className="w-full text-left mb-2 last:mb-0"
                    >
                      <div className="text-xs bg-gray-50 rounded p-2 hover:bg-gray-100">
                        <span className="font-medium">Chunk {chunk.chunkIndex + 1}</span>
                        <span className="text-gray-500 ml-2">({chunk.tokenCount} tokens)</span>
                        <p className="text-gray-600 truncate mt-1">
                          {chunk.content.substring(0, 100)}...
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gold Layer */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500 text-white rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-yellow-900">{t('layers.gold.title')}</h3>
                <p className="text-sm text-yellow-700">{t('layers.gold.subtitle')}</p>
              </div>
            </div>

            <p className="text-sm text-yellow-800 mb-4">{t('layers.gold.description')}</p>

            {distributionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="w-8 h-8 animate-spin text-yellow-400" viewBox="0 0 24 24">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Gold A */}
                <GoldLayerCard
                  title="Gold A"
                  subtitle="Trino SQL"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  }
                  stats={processingStats?.goldA}
                  total={distributions.length}
                />

                {/* Gold B */}
                <GoldLayerCard
                  title="Gold B"
                  subtitle="NebulaGraph"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  }
                  stats={processingStats?.goldB}
                  total={distributions.length}
                />

                {/* Gold C */}
                <GoldLayerCard
                  title="Gold C"
                  subtitle="Qdrant Vector"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                  stats={processingStats?.goldC}
                  total={distributions.length}
                />

                {/* Retry Button */}
                {processingStats &&
                  (processingStats.goldA.failed > 0 ||
                    processingStats.goldB.failed > 0 ||
                    processingStats.goldC.failed > 0) && (
                    <button
                      onClick={onRetryFailed}
                      disabled={retrying}
                      className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {retrying ? 'Reprocessando...' : t('actions.retryFailed')}
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDocument && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-gray-500 text-lg">{t('layers.selectDocument')}</p>
          <p className="text-gray-400 text-sm mt-1">
            Selecione um documento processado para explorar suas camadas de dados
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Query Tab Component
// ============================================================

interface QueryTabProps {
  t: (key: string, options?: Record<string, unknown>) => string;
}

function QueryTab({ t }: QueryTabProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);

    // TODO: Integrate with actual semantic search API
    // For now, simulate a search
    setTimeout(() => {
      setResults([]);
      setSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('query.title')}</h2>
        <p className="text-gray-600 mb-6">{t('query.description')}</p>

        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('query.placeholder')}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
          >
            {searching ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
            {t('query.submit')}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">{t('query.tips.title')}</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">1.</span>
            {t('query.tips.tip1')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">2.</span>
            {t('query.tips.tip2')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">3.</span>
            {t('query.tips.tip3')}
          </li>
        </ul>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">{t('query.results.title')}</h3>
          {/* Results will be displayed here */}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Stats Tab Component
// ============================================================

interface StatsTabProps {
  documents: Document[];
  pipelineStats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  loading: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function StatsTab({ documents, pipelineStats, loading, t }: StatsTabProps) {
  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; failed: number }> = {};
    documents.forEach((doc) => {
      const category = doc.documentCategory?.name || 'Sem categoria';
      if (!stats[category]) {
        stats[category] = { total: 0, completed: 0, failed: 0 };
      }
      stats[category].total++;
      if (doc.embeddingStatus === EmbeddingStatus.COMPLETED) {
        stats[category].completed++;
      }
      if (doc.embeddingStatus === EmbeddingStatus.FAILED) {
        stats[category].failed++;
      }
    });
    return stats;
  }, [documents]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('stats.title')}</h2>

        {/* Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">{t('stats.overview')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{pipelineStats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Processados</p>
              <p className="text-3xl font-bold text-green-900">{pipelineStats.completed}</p>
              <p className="text-xs text-green-600 mt-1">
                {pipelineStats.total > 0
                  ? `${((pipelineStats.completed / pipelineStats.total) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Em Processamento</p>
              <p className="text-3xl font-bold text-blue-900">
                {pipelineStats.pending + pipelineStats.processing}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">Com Falha</p>
              <p className="text-3xl font-bold text-red-900">{pipelineStats.failed}</p>
            </div>
          </div>
        </div>

        {/* By Category */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">{t('stats.byCategory')}</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-sm text-gray-500">{stats.total} documentos</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{stats.completed} processados</span>
                  {stats.failed > 0 && <span className="text-red-500">{stats.failed} falhas</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Helper Components
// ============================================================

function PipelineStage({
  icon,
  label,
  sublabel,
  color,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  color: string;
  count: number;
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`p-4 rounded-xl border-2 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <span className="mt-2 font-semibold text-gray-700">{label}</span>
      <span className="text-xs text-gray-500">{sublabel}</span>
      <span className="mt-1 px-2 py-0.5 bg-gray-200 rounded text-xs font-medium">{count}</span>
    </div>
  );
}

function PipelineStageSmall({
  label,
  sublabel,
  color,
}: {
  label: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center bg-yellow-100 rounded-lg p-2 border border-yellow-300">
      <span className="font-bold text-yellow-800">{label}</span>
      <span className="text-xs text-yellow-600">{sublabel}</span>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex items-center">
      <div className="w-8 h-1 bg-gray-300 rounded" />
      <svg className="w-4 h-4 -ml-1 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DocumentStatusIcon({ status }: { status: EmbeddingStatus }) {
  switch (status) {
    case EmbeddingStatus.COMPLETED:
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case EmbeddingStatus.PROCESSING:
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600 animate-spin" viewBox="0 0 24 24">
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      );
    case EmbeddingStatus.FAILED:
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      );
  }
}

function StatusBadge({ status }: { status: EmbeddingStatus }) {
  const config = {
    [EmbeddingStatus.PENDING]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Pendente' },
    [EmbeddingStatus.PROCESSING]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processando' },
    [EmbeddingStatus.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
    [EmbeddingStatus.FAILED]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Falhou' },
  };

  const { bg, text, label } = config[status];

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>
  );
}

function GoldLayerCard({
  title,
  subtitle,
  icon,
  stats,
  total,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  stats?: { completed: number; pending: number; failed: number; skipped: number };
  total: number;
}) {
  const completed = stats?.completed || 0;
  const failed = stats?.failed || 0;
  const pending = stats?.pending || 0;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="bg-white/80 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-yellow-600">{icon}</span>
        <span className="font-medium text-gray-900">{title}</span>
        <span className="text-xs text-gray-500">({subtitle})</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full ${failed > 0 ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-600">{completed} ok</span>
        {pending > 0 && <span className="text-gray-500">{pending} pendente</span>}
        {failed > 0 && <span className="text-red-600">{failed} falha</span>}
      </div>
    </div>
  );
}
