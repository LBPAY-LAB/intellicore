'use client';

import { useState, useCallback } from 'react';
import { useGraphQuery, TraversalDirection } from '@/hooks/useGraphQuery';
import type { GraphPath } from '@/lib/graphql/graph-query';
import {
  ArrowsRightLeftIcon,
  PlayIcon,
  ArrowPathIcon,
  MapPinIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export function GraphPathFinder() {
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [maxDepth, setMaxDepth] = useState(5);
  const [findAll, setFindAll] = useState(false);
  const [paths, setPaths] = useState<GraphPath[]>([]);
  const { findShortestPath, findAllPaths, loading, error } = useGraphQuery();

  const execute = useCallback(async () => {
    if (!sourceId.trim() || !targetId.trim()) return;

    if (findAll) {
      const result = await findAllPaths(sourceId, targetId, maxDepth);
      setPaths(result);
    } else {
      const result = await findShortestPath({
        sourceVertexId: sourceId,
        targetVertexId: targetId,
        maxDepth,
        direction: TraversalDirection.BOTH,
      });
      setPaths(result ? [result] : []);
    }
  }, [sourceId, targetId, maxDepth, findAll, findShortestPath, findAllPaths]);

  const swapVertices = useCallback(() => {
    const temp = sourceId;
    setSourceId(targetId);
    setTargetId(temp);
  }, [sourceId, targetId]);

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <ArrowsRightLeftIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Path Finder</h2>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Vertex ID
            </label>
            <input
              type="text"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              placeholder="Enter source vertex ID"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={swapVertices}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Swap source and target"
          >
            <ArrowsRightLeftIcon className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Vertex ID
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Enter target vertex ID"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="w-24">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Depth
            </label>
            <select
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="findAll"
              checked={findAll}
              onChange={(e) => setFindAll(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="findAll" className="text-sm text-gray-700">
              Find all paths
            </label>
          </div>

          <button
            onClick={execute}
            disabled={loading || !sourceId.trim() || !targetId.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                Find Path
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        {paths.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Found <strong>{paths.length}</strong> path(s)
            </div>

            {paths.map((path, pathIdx) => (
              <div
                key={pathIdx}
                className="border rounded-lg overflow-hidden"
              >
                <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Path {pathIdx + 1}
                  </span>
                  <span className="text-sm text-gray-500">
                    Length: {path.length} hops
                  </span>
                </div>

                <div className="p-4">
                  {/* Visual Path */}
                  <div className="flex flex-wrap items-center gap-2">
                    {path.vertices.map((vertex, vertexIdx) => (
                      <div key={vertex.id} className="flex items-center gap-2">
                        {/* Vertex Node */}
                        <div
                          className={`px-3 py-2 rounded-lg border-2 ${
                            vertexIdx === 0
                              ? 'border-green-500 bg-green-50'
                              : vertexIdx === path.vertices.length - 1
                              ? 'border-red-500 bg-red-50'
                              : 'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <MapPinIcon
                              className={`w-4 h-4 ${
                                vertexIdx === 0
                                  ? 'text-green-600'
                                  : vertexIdx === path.vertices.length - 1
                                  ? 'text-red-600'
                                  : 'text-blue-600'
                              }`}
                            />
                            <span className="text-xs font-medium">
                              {vertex.tag}
                            </span>
                          </div>
                          <p className="font-mono text-xs mt-1 truncate max-w-[150px]">
                            {vertex.id}
                          </p>
                        </div>

                        {/* Arrow */}
                        {vertexIdx < path.vertices.length - 1 && (
                          <div className="flex flex-col items-center">
                            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                            {path.edges[vertexIdx] && (
                              <span className="text-xs text-gray-500">
                                {path.edges[vertexIdx].type}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Path Details */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Vertices ({path.vertices.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {path.vertices.map((vertex, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-gray-50 p-2 rounded"
                        >
                          <span className="font-medium">{vertex.tag}:</span>{' '}
                          <span className="font-mono">{vertex.id}</span>
                        </div>
                      ))}
                    </div>

                    {path.edges.length > 0 && (
                      <>
                        <h4 className="text-sm font-medium text-gray-700 mt-3 mb-2">
                          Edges ({path.edges.length})
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {path.edges.map((edge, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-gray-50 p-2 rounded"
                            >
                              <span className="font-mono">{edge.sourceId}</span>
                              <span className="mx-2 text-gray-400">
                                --[{edge.type}]--&gt;
                              </span>
                              <span className="font-mono">{edge.targetId}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sourceId && targetId && !loading ? (
          <div className="text-center py-12 text-gray-400">
            No paths found between the specified vertices
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            Enter source and target vertex IDs to find paths
          </div>
        )}
      </div>
    </div>
  );
}
