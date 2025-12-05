'use client';

import React from 'react';
import { Core } from 'cytoscape';
import { LayoutType } from './types';
import { useTranslation } from 'react-i18next';

export interface GraphControlsProps {
  cy: Core | null;
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onCenter: () => void;
  onExport?: (format: 'png' | 'jpg' | 'svg') => void;
  className?: string;
}

/**
 * Graph Controls Component
 * Provides zoom, layout selection, and export controls
 */
const GraphControls: React.FC<GraphControlsProps> = ({
  cy,
  currentLayout,
  onLayoutChange,
  onZoomIn,
  onZoomOut,
  onFit,
  onCenter,
  onExport,
  className = '',
}) => {
  const { t } = useTranslation();

  const layouts: { value: LayoutType; label: string; icon: string }[] = [
    { value: 'dagre', label: 'Hierarchical', icon: '📊' },
    { value: 'breadthfirst', label: 'Tree', icon: '🌳' },
    { value: 'circle', label: 'Circle', icon: '⭕' },
    { value: 'grid', label: 'Grid', icon: '⊞' },
    { value: 'cose', label: 'Force', icon: '🔀' },
  ];

  return (
    <div
      className={`flex flex-col gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm ${className}`}
    >
      {/* Zoom Controls */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Zoom
        </h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={onZoomIn}
            disabled={!cy}
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors border border-gray-300"
            title="Zoom In (Ctrl/Cmd +)"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            </svg>
          </button>
          <button
            onClick={onZoomOut}
            disabled={!cy}
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors border border-gray-300"
            title="Zoom Out (Ctrl/Cmd -)"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </button>
          <button
            onClick={onFit}
            disabled={!cy}
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors border border-gray-300"
            title="Fit to Screen"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            </svg>
          </button>
          <button
            onClick={onCenter}
            disabled={!cy}
            className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors border border-gray-300"
            title="Center View"
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Layout Selection */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Layout
        </h4>
        <div className="space-y-1">
          {layouts.map((layout) => (
            <button
              key={layout.value}
              onClick={() => onLayoutChange(layout.value)}
              disabled={!cy}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                currentLayout === layout.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={`Switch to ${layout.label} layout`}
            >
              <span>{layout.icon}</span>
              <span className="flex-1 text-left">{layout.label}</span>
            </button>
          ))}
        </div>
      </div>

      {onExport && (
        <>
          <div className="border-t border-gray-200" />

          {/* Export Controls */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Export
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => onExport('png')}
                disabled={!cy}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-gray-700 transition-colors border border-gray-300"
                title="Export as PNG"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>PNG</span>
              </button>
              <button
                onClick={() => onExport('jpg')}
                disabled={!cy}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-gray-700 transition-colors border border-gray-300"
                title="Export as JPG"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>JPG</span>
              </button>
              <button
                onClick={() => onExport('svg')}
                disabled={!cy}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-gray-700 transition-colors border border-gray-300"
                title="Export as SVG"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span>SVG</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GraphControls;
