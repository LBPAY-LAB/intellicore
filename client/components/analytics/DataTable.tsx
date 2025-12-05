/**
 * Data Table Component
 * Sprint 14 - US-070: Visualization Components
 *
 * Simple data table for analytics results.
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  title?: string;
  onExport?: () => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  data,
  title,
  onExport,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        {title && (
          <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {(title || onExport) && (
        <div className="px-4 py-3 border-b flex items-center justify-between">
          {title && (
            <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="w-4 h-4" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
          Showing {sortedData.length} row{sortedData.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
