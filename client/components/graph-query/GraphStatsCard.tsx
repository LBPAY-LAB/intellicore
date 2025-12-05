'use client';

import { useEffect, useState } from 'react';
import { useGraphQuery } from '@/hooks/useGraphQuery';
import type { GraphStats, GraphHealthStatus } from '@/lib/graphql/graph-query';
import {
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsPointingOutIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

export function GraphStatsCard() {
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [health, setHealth] = useState<GraphHealthStatus | null>(null);
  const { getStats, getHealth, loading } = useGraphQuery();

  const fetchData = async () => {
    const [statsData, healthData] = await Promise.all([
      getStats(),
      getHealth(),
    ]);
    setStats(statsData);
    setHealth(healthData);
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CircleStackIcon className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Graph Database</h2>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ArrowPathIcon
            className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="p-4">
        {/* Health Status */}
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          {health?.healthy ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-500" />
          )}
          <div>
            <p className="font-medium">
              {health?.healthy ? 'Connected' : 'Disconnected'}
            </p>
            <p className="text-xs text-gray-500">
              {health?.message || 'Checking status...'}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className={`px-2 py-1 text-xs rounded ${
                health?.syncEnabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sync: {health?.syncEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Vertices */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ArrowsPointingOutIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Vertices</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {stats?.totalVertices?.toLocaleString() || '0'}
            </p>
          </div>

          {/* Total Edges */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <ShareIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Edges</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {stats?.totalEdges?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Breakdown by Type */}
        {stats && (
          <div className="mt-4 space-y-3">
            {/* Vertices by Tag */}
            {Object.keys(stats.verticesByTag || {}).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  Vertices by Tag
                </h4>
                <div className="space-y-1">
                  {Object.entries(stats.verticesByTag).map(([tag, count]) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{tag}</span>
                      <span className="font-medium">
                        {(count as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edges by Type */}
            {Object.keys(stats.edgesByType || {}).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  Edges by Type
                </h4>
                <div className="space-y-1">
                  {Object.entries(stats.edgesByType).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{type}</span>
                      <span className="font-medium">
                        {(count as number).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
