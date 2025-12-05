/**
 * useDocumentProcessing Hook
 * Sprint 18 - US-DB-011: Pipeline Visualization UI
 *
 * Hook for fetching document processing status including Silver chunks and Gold distribution.
 */

import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_DOCUMENT_SILVER_CHUNKS,
  GET_DOCUMENT_GOLD_DISTRIBUTIONS,
  GET_DOCUMENT_PROCESSING_STATS,
  RETRY_FAILED_GOLD_DISTRIBUTION,
  GET_DOCUMENT,
  type SilverChunk,
  type GoldDistribution,
  type DocumentProcessingStats,
  type Document,
  GoldDistributionStatus,
} from '@/lib/graphql/documents';
import { PipelineStage, StageStatus } from '@/components/documents/PipelineVisualization';

interface UseDocumentProcessingOptions {
  pollInterval?: number;
  skip?: boolean;
}

interface PipelineStatus {
  stages: {
    stage: PipelineStage;
    status: StageStatus;
    progress?: number;
    error?: string;
    startedAt?: string;
    completedAt?: string;
  }[];
  currentStage?: PipelineStage;
  currentOperation?: string;
  isComplete: boolean;
  hasErrors: boolean;
}

export function useDocumentProcessing(
  documentId: string,
  options: UseDocumentProcessingOptions = {}
) {
  const { pollInterval = 5000, skip = false } = options;

  // Fetch document details
  const {
    data: documentData,
    loading: documentLoading,
    refetch: refetchDocument,
  } = useQuery<{ document: Document }>(GET_DOCUMENT, {
    variables: { id: documentId },
    skip: skip || !documentId,
    pollInterval,
  });

  // Fetch Silver chunks
  const {
    data: chunksData,
    loading: chunksLoading,
    refetch: refetchChunks,
  } = useQuery<{ documentSilverChunks: SilverChunk[] }>(GET_DOCUMENT_SILVER_CHUNKS, {
    variables: { documentId },
    skip: skip || !documentId,
    pollInterval,
  });

  // Fetch Gold distributions
  const {
    data: distributionsData,
    loading: distributionsLoading,
    refetch: refetchDistributions,
  } = useQuery<{ documentGoldDistributions: GoldDistribution[] }>(
    GET_DOCUMENT_GOLD_DISTRIBUTIONS,
    {
      variables: { documentId },
      skip: skip || !documentId,
      pollInterval,
    }
  );

  // Fetch processing stats
  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useQuery<{ documentProcessingStats: DocumentProcessingStats }>(
    GET_DOCUMENT_PROCESSING_STATS,
    {
      variables: { documentId },
      skip: skip || !documentId,
      pollInterval,
    }
  );

  // Retry mutation
  const [retryMutation, { loading: retrying }] = useMutation(
    RETRY_FAILED_GOLD_DISTRIBUTION
  );

  const document = documentData?.document;
  const chunks = chunksData?.documentSilverChunks || [];
  const distributions = distributionsData?.documentGoldDistributions || [];
  const stats = statsData?.documentProcessingStats;

  // Derive pipeline status from data
  const derivePipelineStatus = (): PipelineStatus => {
    const stages: PipelineStatus['stages'] = [];
    let currentStage: PipelineStage | undefined;
    let currentOperation: string | undefined;

    // Bronze stage
    const bronzeStatus = deriveBronzeStatus();
    stages.push({
      stage: 'bronze',
      status: bronzeStatus.status,
      progress: bronzeStatus.progress,
      completedAt: document?.bronzeProcessedAt,
    });
    if (bronzeStatus.status === 'processing') {
      currentStage = 'bronze';
      currentOperation = 'Extracting text from document';
    }

    // Silver stage
    const silverStatus = deriveSilverStatus();
    stages.push({
      stage: 'silver',
      status: silverStatus.status,
      progress: silverStatus.progress,
      error: silverStatus.error,
    });
    if (silverStatus.status === 'processing') {
      currentStage = 'silver';
      currentOperation = `Chunking content (${chunks.length} chunks processed)`;
    }

    // Gold A stage
    const goldAStatus = deriveGoldStatus('goldA');
    stages.push({
      stage: 'gold_a',
      status: goldAStatus.status,
      progress: goldAStatus.progress,
      error: goldAStatus.error,
    });
    if (goldAStatus.status === 'processing') {
      currentStage = 'gold_a';
      currentOperation = 'Distributing to Trino analytics';
    }

    // Gold B stage
    const goldBStatus = deriveGoldStatus('goldB');
    stages.push({
      stage: 'gold_b',
      status: goldBStatus.status,
      progress: goldBStatus.progress,
      error: goldBStatus.error,
    });
    if (goldBStatus.status === 'processing') {
      currentStage = 'gold_b';
      currentOperation = 'Creating knowledge graph nodes';
    }

    // Gold C stage
    const goldCStatus = deriveGoldStatus('goldC');
    stages.push({
      stage: 'gold_c',
      status: goldCStatus.status,
      progress: goldCStatus.progress,
      error: goldCStatus.error,
    });
    if (goldCStatus.status === 'processing') {
      currentStage = 'gold_c';
      currentOperation = 'Generating vector embeddings';
    }

    const isComplete = stages.every(
      (s) => s.status === 'completed' || s.status === 'skipped'
    );
    const hasErrors = stages.some((s) => s.status === 'failed');

    return {
      stages,
      currentStage,
      currentOperation,
      isComplete,
      hasErrors,
    };
  };

  const deriveBronzeStatus = (): {
    status: StageStatus;
    progress?: number;
  } => {
    if (!document) return { status: 'pending' };

    if (document.bronzeProcessedAt) {
      return { status: 'completed', progress: 100 };
    }

    if (document.embeddingStatus === 'processing') {
      return { status: 'processing', progress: 50 };
    }

    return { status: 'pending' };
  };

  const deriveSilverStatus = (): {
    status: StageStatus;
    progress?: number;
    error?: string;
  } => {
    if (!document?.bronzeProcessedAt) return { status: 'pending' };
    if (chunks.length === 0) return { status: 'processing', progress: 0 };

    const completedChunks = chunks.filter((c: SilverChunk) => c.processingStatus === 'completed');
    const failedChunks = chunks.filter((c: SilverChunk) => c.processingStatus === 'failed');
    const processingChunks = chunks.filter((c: SilverChunk) => c.processingStatus === 'processing');

    if (failedChunks.length > 0) {
      return {
        status: 'failed',
        error: failedChunks[0].errorMessage || 'Chunk processing failed',
      };
    }

    if (processingChunks.length > 0 || completedChunks.length < chunks.length) {
      const progress = Math.round((completedChunks.length / chunks.length) * 100);
      return { status: 'processing', progress };
    }

    return { status: 'completed', progress: 100 };
  };

  const deriveGoldStatus = (
    layer: 'goldA' | 'goldB' | 'goldC'
  ): { status: StageStatus; progress?: number; error?: string } => {
    if (!stats) return { status: 'pending' };

    const layerStats = stats[layer];
    if (!layerStats) return { status: 'pending' };

    const total =
      layerStats.completed + layerStats.pending + layerStats.failed + layerStats.skipped;

    if (total === 0) return { status: 'pending' };

    if (layerStats.skipped === total) {
      return { status: 'skipped' };
    }

    if (layerStats.failed > 0) {
      return {
        status: 'failed',
        error: `${layerStats.failed} chunks failed distribution`,
      };
    }

    if (layerStats.pending > 0) {
      const progress = Math.round((layerStats.completed / total) * 100);
      return { status: 'processing', progress };
    }

    return { status: 'completed', progress: 100 };
  };

  const refetch = async () => {
    await Promise.all([
      refetchDocument(),
      refetchChunks(),
      refetchDistributions(),
      refetchStats(),
    ]);
  };

  const retryFailed = async () => {
    await retryMutation({ variables: { documentId } });
    await refetch();
  };

  const pipelineStatus = derivePipelineStatus();

  return {
    document,
    chunks,
    distributions,
    stats,
    pipelineStatus,
    loading: documentLoading || chunksLoading || distributionsLoading || statsLoading,
    retrying,
    refetch,
    retryFailed,
  };
}

// Simpler hook for just stats
export function useDocumentProcessingStats(documentId: string) {
  const { data, loading, refetch } = useQuery<{
    documentProcessingStats: DocumentProcessingStats;
  }>(GET_DOCUMENT_PROCESSING_STATS, {
    variables: { documentId },
    skip: !documentId,
  });

  return {
    stats: data?.documentProcessingStats,
    loading,
    refetch,
  };
}
