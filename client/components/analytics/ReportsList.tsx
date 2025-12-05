/**
 * Reports List Component
 * Sprint 14 - US-071: Scheduled Reports
 *
 * List of scheduled reports with management actions.
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  DocumentTextIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  ReportDefinition,
  ReportExecution,
  ReportStatus,
  ReportFrequency,
} from '@/lib/graphql/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ReportsListProps {
  onSelectReport?: (report: ReportDefinition) => void;
}

export function ReportsList({ onSelectReport }: ReportsListProps) {
  const {
    listScheduledReports,
    executeReport,
    toggleReportActive,
    deleteScheduledReport,
    loading,
  } = useAnalytics();

  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const result = await listScheduledReports(50, 0);
      setReports(result.reports);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleExecute = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await executeReport(reportId);
      // Could show execution status here
    } catch (err) {
      console.error('Failed to execute report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (report: ReportDefinition) => {
    setActionLoading(report.id);
    try {
      const updated = await toggleReportActive(report.id, !report.isActive);
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? updated : r)),
      );
    } catch (err) {
      console.error('Failed to toggle report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    setActionLoading(reportId);
    try {
      await deleteScheduledReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      console.error('Failed to delete report:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatFrequency = (frequency?: ReportFrequency): string => {
    switch (frequency) {
      case ReportFrequency.DAILY:
        return 'Daily';
      case ReportFrequency.WEEKLY:
        return 'Weekly';
      case ReportFrequency.MONTHLY:
        return 'Monthly';
      case ReportFrequency.QUARTERLY:
        return 'Quarterly';
      default:
        return 'One-time';
    }
  };

  const formatDate = (date?: string): string => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Scheduled Reports
        </h3>
        <button
          onClick={loadReports}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="divide-y">
        {reports.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            No scheduled reports. Create one to get started.
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectReport?.(report)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {report.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        report.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {report.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {report.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {formatFrequency(report.frequency)}
                    </span>
                    <span>Format: {report.format}</span>
                    {report.lastRunAt && (
                      <span>Last run: {formatDate(report.lastRunAt)}</span>
                    )}
                    {report.nextRunAt && report.isActive && (
                      <span>Next run: {formatDate(report.nextRunAt)}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleExecute(report.id)}
                    disabled={actionLoading === report.id}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    title="Run now"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(report)}
                    disabled={actionLoading === report.id}
                    className={`p-2 rounded-lg ${
                      report.isActive
                        ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                        : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={report.isActive ? 'Pause' : 'Resume'}
                  >
                    {report.isActive ? (
                      <PauseIcon className="w-4 h-4" />
                    ) : (
                      <PlayIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={actionLoading === report.id}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalCount > reports.length && (
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 text-center">
          Showing {reports.length} of {totalCount} reports
        </div>
      )}
    </div>
  );
}
