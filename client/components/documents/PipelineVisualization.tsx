/**
 * PipelineVisualization Component
 * Sprint 18 - US-DB-011: Pipeline Visualization UI
 *
 * Visual pipeline showing Bronze → Silver → Gold processing flow with real-time status.
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

export type PipelineStage = 'bronze' | 'silver' | 'gold_a' | 'gold_b' | 'gold_c';
export type StageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

interface StageInfo {
  stage: PipelineStage;
  status: StageStatus;
  progress?: number; // 0-100
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

interface PipelineVisualizationProps {
  documentId: string;
  documentName: string;
  stages: StageInfo[];
  currentStage?: PipelineStage;
  currentOperation?: string;
  elapsedTime?: string;
  estimatedRemaining?: string;
  logs?: ProcessingLog[];
  onRetry?: (stage: PipelineStage) => void;
}

interface ProcessingLog {
  timestamp: string;
  stage: PipelineStage;
  message: string;
  level: 'info' | 'warn' | 'error';
}

const STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; shortLabel: string; icon: React.ReactNode; color: string }
> = {
  bronze: {
    label: 'Bronze Layer',
    shortLabel: 'BRONZE',
    color: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  silver: {
    label: 'Silver Layer',
    shortLabel: 'SILVER',
    color: 'gray',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  gold_a: {
    label: 'Gold A (Trino)',
    shortLabel: 'GOLD A',
    color: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  gold_b: {
    label: 'Gold B (Graph)',
    shortLabel: 'GOLD B',
    color: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  gold_c: {
    label: 'Gold C (Vector)',
    shortLabel: 'GOLD C',
    color: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
};

const STATUS_CONFIG: Record<StageStatus, { bgColor: string; textColor: string; borderColor: string; icon: React.ReactNode }> = {
  pending: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-500',
    borderColor: 'border-gray-300',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth={2} strokeDasharray="4 4" />
      </svg>
    ),
  },
  processing: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500',
    icon: (
      <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
  },
  completed: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  failed: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  skipped: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-400',
    borderColor: 'border-gray-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>
    ),
  },
};

function StageNode({ stage, isActive }: { stage: StageInfo; isActive: boolean }) {
  const config = STAGE_CONFIG[stage.stage];
  const statusConfig = STATUS_CONFIG[stage.status];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all
          ${statusConfig.bgColor} ${statusConfig.borderColor}
          ${isActive ? 'ring-4 ring-blue-200 ring-offset-2' : ''}
        `}
      >
        <div className={statusConfig.textColor}>{statusConfig.icon}</div>
        {stage.status === 'processing' && stage.progress !== undefined && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {stage.progress}%
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <span className={`text-xs font-semibold ${isActive ? 'text-blue-600' : statusConfig.textColor}`}>
          {config.shortLabel}
        </span>
        {stage.status === 'completed' && (
          <div className="text-xs text-green-600 mt-0.5">✓ Complete</div>
        )}
        {stage.status === 'failed' && (
          <div className="text-xs text-red-600 mt-0.5">✗ Failed</div>
        )}
        {stage.status === 'skipped' && (
          <div className="text-xs text-gray-400 mt-0.5">Skipped</div>
        )}
      </div>
    </div>
  );
}

function StageConnector({ fromStatus, toStatus }: { fromStatus: StageStatus; toStatus: StageStatus }) {
  const isActive = fromStatus === 'completed' && toStatus === 'processing';
  const isCompleted = fromStatus === 'completed' && toStatus === 'completed';

  return (
    <div className="flex-1 flex items-center px-1 -mt-6">
      <div
        className={`
          h-1 w-full rounded transition-all
          ${isCompleted ? 'bg-green-400' : isActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-200'}
        `}
      />
      <svg
        className={`w-4 h-4 -ml-1 ${isCompleted ? 'text-green-400' : isActive ? 'text-blue-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
      </svg>
    </div>
  );
}

export function PipelineVisualization({
  documentId,
  documentName,
  stages,
  currentStage,
  currentOperation,
  elapsedTime,
  estimatedRemaining,
  logs = [],
  onRetry,
}: PipelineVisualizationProps) {
  const { t } = useTranslation('documents');

  // Derive overall status
  const hasErrors = stages.some((s) => s.status === 'failed');
  const isProcessing = stages.some((s) => s.status === 'processing');
  const isCompleted = stages.every((s) => s.status === 'completed' || s.status === 'skipped');

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">CoreBanking Brain - Processing Pipeline</h3>
            <p className="text-sm text-gray-600 mt-1 truncate max-w-lg" title={documentName}>
              Document: {documentName}
            </p>
          </div>
          {isCompleted && !hasErrors && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Processing Complete
            </span>
          )}
          {isProcessing && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          )}
          {hasErrors && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Has Errors
            </span>
          )}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="px-6 py-8">
        <div className="flex items-start justify-between max-w-4xl mx-auto">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.stage}>
              <StageNode stage={stage} isActive={currentStage === stage.stage} />
              {index < stages.length - 1 && (
                <StageConnector fromStatus={stage.status} toStatus={stages[index + 1].status} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Current Operation */}
        {currentOperation && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Current:</span> {currentOperation}
            </p>
            {(elapsedTime || estimatedRemaining) && (
              <p className="text-xs text-gray-500 mt-1">
                {elapsedTime && <span>Elapsed: {elapsedTime}</span>}
                {elapsedTime && estimatedRemaining && <span className="mx-2">|</span>}
                {estimatedRemaining && <span>Estimated: {estimatedRemaining} remaining</span>}
              </p>
            )}
          </div>
        )}

        {/* Error Display with Retry */}
        {hasErrors && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">Processing Errors</h4>
                <ul className="mt-2 space-y-1">
                  {stages
                    .filter((s) => s.status === 'failed' && s.error)
                    .map((s) => (
                      <li key={s.stage} className="text-sm text-red-700">
                        <span className="font-medium">{STAGE_CONFIG[s.stage].label}:</span> {s.error}
                      </li>
                    ))}
                </ul>
                {onRetry && (
                  <button
                    onClick={() => {
                      const failedStage = stages.find((s) => s.status === 'failed');
                      if (failedStage) onRetry(failedStage.stage);
                    }}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry Failed Stage
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Logs */}
      {logs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Processing Log</h4>
          <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`${
                  log.level === 'error'
                    ? 'text-red-400'
                    : log.level === 'warn'
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500">{log.timestamp}</span>
                <span className="mx-2">-</span>
                <span className="text-blue-400">{STAGE_CONFIG[log.stage].shortLabel}:</span>
                <span className="ml-2">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for compact inline status
export function PipelineStatusInline({ stages }: { stages: StageInfo[] }) {
  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, index) => {
        const statusConfig = STATUS_CONFIG[stage.status];
        const config = STAGE_CONFIG[stage.stage];
        return (
          <React.Fragment key={stage.stage}>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${statusConfig.bgColor} ${statusConfig.textColor}`}
              title={`${config.label}: ${stage.status}`}
            >
              {stage.status === 'completed' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : stage.status === 'processing' ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : stage.status === 'failed' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <span className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            {index < stages.length - 1 && (
              <div className={`w-3 h-0.5 ${stage.status === 'completed' ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
