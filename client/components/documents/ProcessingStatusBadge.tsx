/**
 * ProcessingStatusBadge Component
 * Sprint 16 - US-DB-005: Processing Status Indicator
 *
 * Color-coded status badge with spinner for processing state and error tooltip.
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmbeddingStatus } from '@/lib/graphql/documents';

interface ProcessingStatusBadgeProps {
  status: EmbeddingStatus;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_STYLES = {
  [EmbeddingStatus.PENDING]: {
    translationKey: 'notProcessed',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  [EmbeddingStatus.PROCESSING]: {
    translationKey: 'processing',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  [EmbeddingStatus.COMPLETED]: {
    translationKey: 'processed',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  [EmbeddingStatus.FAILED]: {
    translationKey: 'failed',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
};

const STATUS_ICONS = {
  [EmbeddingStatus.PENDING]: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  [EmbeddingStatus.PROCESSING]: (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
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
  ),
  [EmbeddingStatus.COMPLETED]: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  [EmbeddingStatus.FAILED]: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const SIZE_CLASSES = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function ProcessingStatusBadge({
  status,
  error,
  size = 'md',
}: ProcessingStatusBadgeProps) {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const [showErrorTooltip, setShowErrorTooltip] = useState(false);

  const styles = STATUS_STYLES[status];
  const icon = STATUS_ICONS[status];
  const hasFailed = status === EmbeddingStatus.FAILED;

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center gap-2 rounded-full font-medium border
          ${styles.bgColor} ${styles.textColor} ${styles.borderColor} ${SIZE_CLASSES[size]}
          ${hasFailed ? 'cursor-help' : ''}
        `}
        onMouseEnter={() => hasFailed && setShowErrorTooltip(true)}
        onMouseLeave={() => setShowErrorTooltip(false)}
      >
        {icon}
        <span>{t(styles.translationKey)}</span>
        {hasFailed && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      {/* Error Tooltip */}
      {hasFailed && showErrorTooltip && error && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-50">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold text-red-300">{t('processingError')}</p>
                <p className="text-gray-300 mt-1">{error}</p>
              </div>
            </div>
          </div>

          {/* Arrow pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 w-4 h-4 bg-gray-900 transform rotate-45" />
        </div>
      )}
    </div>
  );
}
