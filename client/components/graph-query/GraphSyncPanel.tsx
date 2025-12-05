'use client';

import { useState, useCallback } from 'react';
import { useGraphQuery } from '@/hooks/useGraphQuery';
import type { GraphSyncResult } from '@/lib/graphql/graph-query';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export function GraphSyncPanel() {
  const [syncResult, setSyncResult] = useState<GraphSyncResult | null>(null);
  const [syncEnabled, setSyncEnabled] = useState<boolean | null>(null);
  const { fullSync, clearGraph, enableSync, disableSync, getHealth, loading, error } =
    useGraphQuery();

  const handleFullSync = useCallback(async () => {
    const result = await fullSync();
    setSyncResult(result);
  }, [fullSync]);

  const handleClear = useCallback(async () => {
    if (
      window.confirm(
        'Are you sure you want to clear all data from the graph database? This action cannot be undone.',
      )
    ) {
      await clearGraph();
      setSyncResult(null);
    }
  }, [clearGraph]);

  const handleEnableSync = useCallback(async () => {
    const success = await enableSync();
    if (success) setSyncEnabled(true);
  }, [enableSync]);

  const handleDisableSync = useCallback(async () => {
    const success = await disableSync();
    if (success) setSyncEnabled(false);
  }, [disableSync]);

  const checkSyncStatus = useCallback(async () => {
    const health = await getHealth();
    if (health) {
      setSyncEnabled(health.syncEnabled);
    }
  }, [getHealth]);

  // Check sync status on mount
  useState(() => {
    checkSyncStatus();
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Graph Sync Management</h2>
        </div>
        <p className="text-sm text-gray-500">
          Synchronize data between PostgreSQL and NebulaGraph
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center gap-2">
          <XCircleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Sync Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Auto-Sync</h3>
            <p className="text-sm text-gray-500">
              Automatically sync changes to graph database
            </p>
          </div>
          <div className="flex items-center gap-2">
            {syncEnabled !== null && (
              <span
                className={`px-2 py-1 text-xs rounded ${
                  syncEnabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {syncEnabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
            {syncEnabled ? (
              <button
                onClick={handleDisableSync}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <PauseIcon className="w-4 h-4" />
                Disable
              </button>
            ) : (
              <button
                onClick={handleEnableSync}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <PlayIcon className="w-4 h-4" />
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Full Sync Button */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Full Synchronization</h3>
            <p className="text-sm text-gray-500">
              Sync all instances and relationships to the graph
            </p>
          </div>
          <button
            onClick={handleFullSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-4 h-4" />
                Run Full Sync
              </>
            )}
          </button>
        </div>

        {/* Clear Graph Button */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Clear Graph Data</h3>
            <p className="text-sm text-gray-500">
              Remove all vertices and edges from the graph
            </p>
          </div>
          <button
            onClick={handleClear}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
          >
            <TrashIcon className="w-4 h-4" />
            Clear Graph
          </button>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div
            className={`p-4 rounded-lg ${
              syncResult.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {syncResult.success ? (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              )}
              <h3 className="font-medium">
                {syncResult.success
                  ? 'Sync Completed Successfully'
                  : 'Sync Completed with Warnings'}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-2xl font-bold text-blue-600">
                  {syncResult.instancesSync}
                </p>
                <p className="text-xs text-gray-500">Instances Synced</p>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <p className="text-2xl font-bold text-purple-600">
                  {syncResult.relationshipsSync}
                </p>
                <p className="text-xs text-gray-500">Relationships Synced</p>
              </div>
            </div>

            {syncResult.errors.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Errors ({syncResult.errors.length})
                </h4>
                <div className="max-h-32 overflow-auto bg-white rounded border p-2">
                  {syncResult.errors.map((err, idx) => (
                    <p key={idx} className="text-xs text-red-600 mb-1">
                      {err}
                    </p>
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
