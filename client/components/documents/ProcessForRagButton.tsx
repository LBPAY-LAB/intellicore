/**
 * ProcessForRagButton Component
 * Sprint 16 - US-DB-004: Process for RAG Button
 *
 * Action button with confirmation dialog for processing documents for RAG.
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useProcessDocumentForRag } from '@/hooks/useDocuments';
import { EmbeddingStatus, type Document } from '@/lib/graphql/documents';

interface ProcessForRagButtonProps {
  document: Document;
  onSuccess?: () => void;
  size?: 'sm' | 'md';
}

export function ProcessForRagButton({
  document,
  onSuccess,
  size = 'md',
}: ProcessForRagButtonProps) {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const [showDialog, setShowDialog] = useState(false);
  const { processDocument, loading } = useProcessDocumentForRag();

  // Disable if already processing or processed
  const isDisabled =
    document.embeddingStatus === EmbeddingStatus.PROCESSING ||
    document.embeddingStatus === EmbeddingStatus.COMPLETED;

  const handleClick = () => {
    setShowDialog(true);
  };

  const handleConfirm = async () => {
    try {
      await processDocument(document.id);
      toast.success(t('ragProcessingStarted'), {
        description: t('ragProcessingStartedMessage', {
          filename: document.originalFilename,
        }),
      });
      setShowDialog(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to process document:', error);
      toast.error(t('ragProcessingFailed'), {
        description: error instanceof Error ? error.message : t('ragProcessingFailedMessage'),
      });
    }
  };

  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isDisabled || loading}
        className={`
          ${sizeClasses}
          inline-flex items-center gap-2 bg-purple-600 text-white rounded-lg
          hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors font-medium
        `}
        title={
          isDisabled
            ? document.embeddingStatus === EmbeddingStatus.COMPLETED
              ? t('alreadyProcessed')
              : t('currentlyProcessing')
            : t('processForRag')
        }
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        {loading ? t('processing') : t('processForRag')}
      </button>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('processForRag')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('confirmProcessing')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                {t('confirmProcessingMessage')}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5"
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
                      {document.originalFilename}
                    </p>
                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                      <p>
                        {t('type')}: {document.documentType.name}
                      </p>
                      {document.documentCategory && (
                        <p>
                          {t('category')}: {document.documentCategory.name}
                        </p>
                      )}
                      <p>
                        {t('size')}: {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0"
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
                  <p className="text-xs text-blue-700">
                    {t('ragProcessingInfo')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDialog(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                )}
                {loading ? t('processing') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
