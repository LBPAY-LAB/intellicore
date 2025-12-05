/**
 * Export Panel Component
 * Sprint 14 - US-069: Data Export
 *
 * Panel for configuring and triggering data exports.
 */

'use client';

import React, { useState } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  CodeBracketIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ExportFormat, ExportDataInput, ExportResult } from '@/lib/graphql/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ExportPanelProps {
  objectTypeIds?: string[];
  dateRange?: { startDate: string; endDate: string };
  onExportComplete?: (result: ExportResult) => void;
}

export function ExportPanel({
  objectTypeIds,
  dateRange,
  onExportComplete,
}: ExportPanelProps) {
  const { exportData, loading, error } = useAnalytics();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [filename, setFilename] = useState('');
  const [result, setResult] = useState<ExportResult | null>(null);

  const formats = [
    {
      value: ExportFormat.CSV,
      label: 'CSV',
      icon: TableCellsIcon,
      description: 'Comma-separated values',
    },
    {
      value: ExportFormat.EXCEL,
      label: 'Excel',
      icon: DocumentTextIcon,
      description: 'Microsoft Excel format',
    },
    {
      value: ExportFormat.JSON,
      label: 'JSON',
      icon: CodeBracketIcon,
      description: 'JavaScript Object Notation',
    },
    {
      value: ExportFormat.PDF,
      label: 'PDF',
      icon: DocumentIcon,
      description: 'Portable Document Format',
    },
  ];

  const handleExport = async () => {
    try {
      const input: ExportDataInput = {
        objectTypeIds,
        dateRange,
        format: selectedFormat,
        filename: filename || undefined,
      };

      const exportResult = await exportData(input);
      setResult(exportResult);
      onExportComplete?.(exportResult);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
        <ArrowDownTrayIcon className="w-5 h-5" />
        Export Data
      </h3>

      {/* Format Selection */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((format) => {
            const Icon = format.icon;
            return (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedFormat === format.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm font-medium">{format.label}</div>
                  <div className="text-xs text-gray-500">{format.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filename */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Filename (optional)
        </label>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="export_data"
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Exporting...
          </>
        ) : (
          <>
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="text-sm text-red-700">{error.message}</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-700">
                Export Complete
              </div>
              <div className="text-xs text-green-600 mt-1">
                {result.rowCount.toLocaleString()} rows •{' '}
                {formatFileSize(result.fileSizeBytes)}
              </div>
            </div>
          </div>
          <a
            href={result.downloadUrl}
            download={result.filename}
            className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download {result.filename}
          </a>
        </div>
      )}
    </div>
  );
}
