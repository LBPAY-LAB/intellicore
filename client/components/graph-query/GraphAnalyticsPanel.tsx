'use client';

import { useState, useCallback } from 'react';
import { useGraphQuery, AnalyticsType } from '@/hooks/useGraphQuery';
import type { AnalyticsResult } from '@/lib/graphql/graph-query';
import {
  ChartBarIcon,
  PlayIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const analyticsOptions = [
  {
    type: AnalyticsType.DEGREE_CENTRALITY,
    label: 'Degree Centrality',
    description: 'Measures the number of direct connections each node has',
  },
  {
    type: AnalyticsType.BETWEENNESS_CENTRALITY,
    label: 'Betweenness Centrality',
    description: 'Measures how often a node lies on shortest paths between others',
  },
  {
    type: AnalyticsType.CLOSENESS_CENTRALITY,
    label: 'Closeness Centrality',
    description: 'Measures how close a node is to all other nodes',
  },
  {
    type: AnalyticsType.PAGERANK,
    label: 'PageRank',
    description: 'Measures node importance based on incoming connections',
  },
  {
    type: AnalyticsType.CLUSTERING_COEFFICIENT,
    label: 'Clustering Coefficient',
    description: 'Measures how much nodes cluster together',
  },
  {
    type: AnalyticsType.CONNECTED_COMPONENTS,
    label: 'Connected Components',
    description: 'Identifies separate groups of connected nodes',
  },
];

export function GraphAnalyticsPanel() {
  const [selectedType, setSelectedType] = useState<AnalyticsType>(
    AnalyticsType.DEGREE_CENTRALITY,
  );
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const { runAnalytics, loading, error } = useGraphQuery();

  const execute = useCallback(async () => {
    const res = await runAnalytics({
      type: selectedType,
      limit,
    });
    setResult(res);
  }, [runAnalytics, selectedType, limit]);

  const selectedOption = analyticsOptions.find((o) => o.type === selectedType);

  const getScoreColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'bg-green-500';
    if (ratio >= 0.6) return 'bg-blue-500';
    if (ratio >= 0.4) return 'bg-yellow-500';
    if (ratio >= 0.2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const maxScore = result?.items?.[0]?.score || 1;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Graph Analytics</h2>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analytics Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AnalyticsType)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {analyticsOptions.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limit
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button
            onClick={execute}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </button>
        </div>

        {/* Description */}
        {selectedOption && (
          <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
            <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{selectedOption.description}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        {result ? (
          <div>
            {/* Summary */}
            <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
              <span>
                Type: <strong>{result.type}</strong>
              </span>
              <span>
                Results: <strong>{result.items.length}</strong>
              </span>
              <span>
                Time: <strong>{result.executionTimeMs.toFixed(2)}ms</strong>
              </span>
            </div>

            {/* Summary Stats */}
            {result.summary && Object.keys(result.summary).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(result.summary).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-xs text-gray-500">{key}</span>
                      <p className="font-medium">
                        {typeof value === 'number'
                          ? value.toFixed(2)
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-2">
              {result.items.map((item) => (
                <div
                  key={item.vertexId}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  {/* Rank */}
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-sm font-medium">
                    {item.rank}
                  </div>

                  {/* Vertex ID */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">{item.vertexId}</p>
                    {item.metadata && (
                      <div className="flex gap-2 mt-1">
                        {Object.entries(item.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Score Bar */}
                  <div className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(
                            item.score,
                            maxScore,
                          )}`}
                          style={{
                            width: `${Math.max(
                              5,
                              (item.score / maxScore) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {item.score.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.items.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No results found
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Select an analytics type and click Run Analysis
          </div>
        )}
      </div>
    </div>
  );
}
