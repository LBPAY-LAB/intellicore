'use client';

import { useState, useCallback } from 'react';
import { useGraphQuery } from '@/hooks/useGraphQuery';
import type { NGQLResult } from '@/lib/graphql/graph-query';
import {
  PlayIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

interface QueryHistoryItem {
  query: string;
  timestamp: Date;
  success: boolean;
  executionTimeMs: number;
}

export function GraphQueryConsole() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<NGQLResult | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const { runNGQL, loading, error } = useGraphQuery();

  const executeQuery = useCallback(async () => {
    if (!query.trim()) return;

    const res = await runNGQL(query);
    setResult(res);

    if (res) {
      setHistory((prev) => [
        {
          query,
          timestamp: new Date(),
          success: res.success,
          executionTimeMs: res.executionTimeMs,
        },
        ...prev.slice(0, 19), // Keep last 20 queries
      ]);
    }
  }, [query, runNGQL]);

  const loadFromHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        executeQuery();
      }
    },
    [executeQuery],
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Query Input */}
      <div className="p-4 border-b">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              nGQL Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-32 font-mono text-sm border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="MATCH (v:Instance) RETURN v LIMIT 10;"
            />
            <p className="mt-1 text-xs text-gray-500">
              Press Cmd/Ctrl + Enter to execute
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-7">
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayIcon className="w-4 h-4" />
              {loading ? 'Executing...' : 'Run'}
            </button>
            <button
              onClick={() => setQuery('')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <TrashIcon className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <XCircleIcon className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 flex overflow-hidden">
        {/* Result Table */}
        <div className="flex-1 overflow-auto p-4">
          {result && (
            <div>
              <div className="flex items-center gap-4 mb-4">
                {result.success ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircleIcon className="w-5 h-5" />
                    Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircleIcon className="w-5 h-5" />
                    Failed
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  {result.executionTimeMs.toFixed(2)}ms
                </span>
                <span className="text-gray-600">
                  {result.rowCount} row(s)
                </span>
              </div>

              {result.errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                  {result.errorMessage}
                </div>
              )}

              {result.columns.length > 0 && (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="px-4 py-3 text-sm text-gray-900 font-mono"
                            >
                              {typeof cell === 'object'
                                ? JSON.stringify(cell)
                                : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="flex items-center justify-center h-full text-gray-400">
              Execute a query to see results
            </div>
          )}
        </div>

        {/* Query History */}
        <div className="w-80 border-l bg-gray-50 overflow-auto">
          <div className="p-4 border-b bg-white sticky top-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="p-2">
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No queries yet
              </p>
            ) : (
              <ul className="space-y-2">
                {history.map((item, idx) => (
                  <li
                    key={idx}
                    onClick={() => loadFromHistory(item.query)}
                    className="p-2 bg-white rounded border cursor-pointer hover:border-blue-300"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {item.success ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.executionTimeMs.toFixed(0)}ms
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-600 truncate">
                      {item.query}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
