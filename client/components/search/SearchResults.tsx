'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SemanticSearchResponse } from '@/lib/graphql/rag';

interface SearchResultsProps {
  results: SemanticSearchResponse;
  onDocumentSelect?: (documentId: string) => void;
}

export function SearchResults({ results, onDocumentSelect }: SearchResultsProps) {
  const { t } = useTranslation('search');
  const [expandedChunks, setExpandedChunks] = useState<Set<string>>(new Set());

  const toggleChunk = (chunkId: string) => {
    setExpandedChunks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chunkId)) {
        newSet.delete(chunkId);
      } else {
        newSet.add(chunkId);
      }
      return newSet;
    });
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.8) return 'text-blue-600 bg-blue-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('resultsTitle', { count: results.total })}
          </h3>
          <p className="text-sm text-gray-500">
            {t('processingTime', { time: results.processingTimeMs })}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.results.map((result) => {
          const isExpanded = expandedChunks.has(result.chunkId);
          const previewLength = 200;
          const shouldTruncate = result.chunkText.length > previewLength;
          const displayText = isExpanded || !shouldTruncate
            ? result.chunkText
            : result.chunkText.substring(0, previewLength) + '...';

          return (
            <div
              key={result.chunkId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <button
                    onClick={() => onDocumentSelect?.(result.documentId)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                  >
                    {result.originalFilename}
                  </button>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {result.documentTypeName}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {t('chunk', { index: result.chunkIndex + 1 })}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(result.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Relevance Score */}
                <div className={`px-3 py-1 rounded-full ${getScoreColor(result.score)}`}>
                  <span className="text-xs font-semibold">
                    {(result.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {highlightText(displayText, results.query)}
                </p>

                {shouldTruncate && (
                  <button
                    onClick={() => toggleChunk(result.chunkId)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {isExpanded ? t('showLess') : t('showMore')}
                  </button>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>
                  {t('tokens')}: {result.tokenCount}
                </span>
                <span>
                  {t('position')}: {result.startOffset}-{result.endOffset}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
