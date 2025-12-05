/**
 * Analytics Hook
 * Sprint 14 - Analytics & Reporting
 *
 * React hook for analytics queries, reports, and exports.
 */

'use client';

import { useState, useCallback } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  ANALYTICS_QUERY,
  DASHBOARD_SUMMARY,
  TIME_SERIES,
  EXPORT_DATA,
  CREATE_REPORT,
  SCHEDULE_REPORT,
  UPDATE_SCHEDULED_REPORT,
  DELETE_SCHEDULED_REPORT,
  TOGGLE_REPORT_ACTIVE,
  EXECUTE_REPORT,
  GET_REPORT,
  LIST_SCHEDULED_REPORTS,
  GET_REPORT_EXECUTION,
  LIST_REPORT_EXECUTIONS,
  GET_EXPORT_FILE,
  AnalyticsQueryInput,
  AnalyticsResult,
  DashboardSummary,
  TimeSeriesResult,
  DateGranularity,
  ExportDataInput,
  ExportResult,
  CreateReportInput,
  ScheduleReportInput,
  ReportDefinition,
  ReportExecution,
} from '@/lib/graphql/analytics';

export interface UseAnalyticsReturn {
  // State
  loading: boolean;
  error: Error | null;

  // Dashboard
  dashboardSummary: DashboardSummary | null;
  loadDashboardSummary: (startDate?: string, endDate?: string) => Promise<DashboardSummary>;

  // Analytics queries
  analyticsResult: AnalyticsResult | null;
  runAnalyticsQuery: (input: AnalyticsQueryInput) => Promise<AnalyticsResult>;

  // Time series
  timeSeriesResult: TimeSeriesResult | null;
  loadTimeSeries: (
    metricName: string,
    granularity: DateGranularity,
    startDate: string,
    endDate: string,
    objectTypeIds?: string[],
  ) => Promise<TimeSeriesResult>;

  // Export
  exportResult: ExportResult | null;
  exportData: (input: ExportDataInput) => Promise<ExportResult>;
  getExportFile: (id: string) => Promise<ExportResult | null>;

  // Reports
  createReport: (input: CreateReportInput) => Promise<ReportExecution>;
  scheduleReport: (input: ScheduleReportInput) => Promise<ReportDefinition>;
  updateScheduledReport: (id: string, input: ScheduleReportInput) => Promise<ReportDefinition>;
  deleteScheduledReport: (id: string) => Promise<boolean>;
  toggleReportActive: (id: string, isActive: boolean) => Promise<ReportDefinition>;
  executeReport: (reportId: string) => Promise<ReportExecution>;
  getReport: (id: string) => Promise<ReportDefinition>;
  listScheduledReports: (limit?: number, offset?: number) => Promise<{ reports: ReportDefinition[]; totalCount: number }>;
  getReportExecution: (id: string) => Promise<ReportExecution>;
  listReportExecutions: (reportId: string, limit?: number) => Promise<{ executions: ReportExecution[]; totalCount: number }>;

  // Utilities
  clearError: () => void;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult | null>(null);
  const [timeSeriesResult, setTimeSeriesResult] = useState<TimeSeriesResult | null>(null);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  // Lazy queries with explicit types
  const [fetchDashboard] = useLazyQuery<{ dashboardSummary: DashboardSummary }>(DASHBOARD_SUMMARY, {
    fetchPolicy: 'network-only',
  });
  const [fetchAnalytics] = useLazyQuery<{ analyticsQuery: AnalyticsResult }>(ANALYTICS_QUERY, {
    fetchPolicy: 'network-only',
  });
  const [fetchTimeSeries] = useLazyQuery<{ timeSeries: TimeSeriesResult }>(TIME_SERIES, {
    fetchPolicy: 'network-only',
  });
  const [fetchReport] = useLazyQuery<{ report: ReportDefinition }>(GET_REPORT, {
    fetchPolicy: 'network-only',
  });
  const [fetchScheduledReports] = useLazyQuery<{ scheduledReports: { reports: ReportDefinition[]; totalCount: number } }>(LIST_SCHEDULED_REPORTS, {
    fetchPolicy: 'network-only',
  });
  const [fetchReportExecution] = useLazyQuery<{ reportExecution: ReportExecution }>(GET_REPORT_EXECUTION, {
    fetchPolicy: 'network-only',
  });
  const [fetchReportExecutions] = useLazyQuery<{ reportExecutions: { executions: ReportExecution[]; totalCount: number } }>(LIST_REPORT_EXECUTIONS, {
    fetchPolicy: 'network-only',
  });
  const [fetchExportFile] = useLazyQuery<{ exportFile: ExportResult }>(GET_EXPORT_FILE, {
    fetchPolicy: 'network-only',
  });

  // Mutations with explicit types
  const [exportDataMutation] = useMutation<{ exportData: ExportResult }>(EXPORT_DATA);
  const [createReportMutation] = useMutation<{ createReport: ReportExecution }>(CREATE_REPORT);
  const [scheduleReportMutation] = useMutation<{ scheduleReport: ReportDefinition }>(SCHEDULE_REPORT);
  const [updateScheduledReportMutation] = useMutation<{ updateScheduledReport: ReportDefinition }>(UPDATE_SCHEDULED_REPORT);
  const [deleteScheduledReportMutation] = useMutation<{ deleteScheduledReport: boolean }>(DELETE_SCHEDULED_REPORT);
  const [toggleReportActiveMutation] = useMutation<{ toggleReportActive: ReportDefinition }>(TOGGLE_REPORT_ACTIVE);
  const [executeReportMutation] = useMutation<{ executeReport: ReportExecution }>(EXECUTE_REPORT);

  // ==================== DASHBOARD ====================

  const loadDashboardSummary = useCallback(
    async (startDate?: string, endDate?: string): Promise<DashboardSummary> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await fetchDashboard({
          variables: { startDate, endDate },
        });

        if (queryError) throw queryError;
        if (!data?.dashboardSummary) throw new Error('No data returned');

        const result = data.dashboardSummary;
        setDashboardSummary(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load dashboard');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchDashboard],
  );

  // ==================== ANALYTICS QUERY ====================

  const runAnalyticsQuery = useCallback(
    async (input: AnalyticsQueryInput): Promise<AnalyticsResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await fetchAnalytics({
          variables: { input },
        });

        if (queryError) throw queryError;
        if (!data?.analyticsQuery) throw new Error('No data returned');

        const result = data.analyticsQuery;
        setAnalyticsResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Analytics query failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchAnalytics],
  );

  // ==================== TIME SERIES ====================

  const loadTimeSeries = useCallback(
    async (
      metricName: string,
      granularity: DateGranularity,
      startDate: string,
      endDate: string,
      objectTypeIds?: string[],
    ): Promise<TimeSeriesResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await fetchTimeSeries({
          variables: { metricName, granularity, startDate, endDate, objectTypeIds },
        });

        if (queryError) throw queryError;
        if (!data?.timeSeries) throw new Error('No data returned');

        const result = data.timeSeries;
        setTimeSeriesResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Time series query failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchTimeSeries],
  );

  // ==================== EXPORT ====================

  const exportData = useCallback(
    async (input: ExportDataInput): Promise<ExportResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await exportDataMutation({
          variables: { input },
        });

        if (!data?.exportData) throw new Error('Export failed');

        const result = data.exportData;
        setExportResult(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Export failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [exportDataMutation],
  );

  const getExportFile = useCallback(
    async (id: string): Promise<ExportResult | null> => {
      try {
        const { data, error: queryError } = await fetchExportFile({
          variables: { id },
        });

        if (queryError) throw queryError;
        return data?.exportFile || null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get export file');
        setError(error);
        throw error;
      }
    },
    [fetchExportFile],
  );

  // ==================== REPORTS ====================

  const createReport = useCallback(
    async (input: CreateReportInput): Promise<ReportExecution> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await createReportMutation({
          variables: { input },
        });

        if (!data?.createReport) throw new Error('Failed to create report');
        return data.createReport;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [createReportMutation],
  );

  const scheduleReport = useCallback(
    async (input: ScheduleReportInput): Promise<ReportDefinition> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await scheduleReportMutation({
          variables: { input },
        });

        if (!data?.scheduleReport) throw new Error('Failed to schedule report');
        return data.scheduleReport;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to schedule report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [scheduleReportMutation],
  );

  const updateScheduledReport = useCallback(
    async (id: string, input: ScheduleReportInput): Promise<ReportDefinition> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await updateScheduledReportMutation({
          variables: { id, input },
        });

        if (!data?.updateScheduledReport) throw new Error('Failed to update report');
        return data.updateScheduledReport;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateScheduledReportMutation],
  );

  const deleteScheduledReport = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await deleteScheduledReportMutation({
          variables: { id },
        });

        if (data?.deleteScheduledReport === undefined) throw new Error('Failed to delete report');
        return data.deleteScheduledReport;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [deleteScheduledReportMutation],
  );

  const toggleReportActive = useCallback(
    async (id: string, isActive: boolean): Promise<ReportDefinition> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await toggleReportActiveMutation({
          variables: { id, isActive },
        });

        if (!data?.toggleReportActive) throw new Error('Failed to toggle report');
        return data.toggleReportActive;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to toggle report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toggleReportActiveMutation],
  );

  const executeReport = useCallback(
    async (reportId: string): Promise<ReportExecution> => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await executeReportMutation({
          variables: { reportId },
        });

        if (!data?.executeReport) throw new Error('Failed to execute report');
        return data.executeReport;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to execute report');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [executeReportMutation],
  );

  const getReport = useCallback(
    async (id: string): Promise<ReportDefinition> => {
      try {
        const { data, error: queryError } = await fetchReport({
          variables: { id },
        });

        if (queryError) throw queryError;
        if (!data?.report) throw new Error('Report not found');
        return data.report;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get report');
        setError(error);
        throw error;
      }
    },
    [fetchReport],
  );

  const listScheduledReports = useCallback(
    async (limit = 50, offset = 0): Promise<{ reports: ReportDefinition[]; totalCount: number }> => {
      try {
        const { data, error: queryError } = await fetchScheduledReports({
          variables: { limit, offset },
        });

        if (queryError) throw queryError;
        if (!data?.scheduledReports) throw new Error('No data returned');
        return data.scheduledReports;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to list reports');
        setError(error);
        throw error;
      }
    },
    [fetchScheduledReports],
  );

  const getReportExecution = useCallback(
    async (id: string): Promise<ReportExecution> => {
      try {
        const { data, error: queryError } = await fetchReportExecution({
          variables: { id },
        });

        if (queryError) throw queryError;
        if (!data?.reportExecution) throw new Error('Execution not found');
        return data.reportExecution;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to get execution');
        setError(error);
        throw error;
      }
    },
    [fetchReportExecution],
  );

  const listReportExecutions = useCallback(
    async (reportId: string, limit = 20): Promise<{ executions: ReportExecution[]; totalCount: number }> => {
      try {
        const { data, error: queryError } = await fetchReportExecutions({
          variables: { reportId, limit },
        });

        if (queryError) throw queryError;
        if (!data?.reportExecutions) throw new Error('No data returned');
        return data.reportExecutions;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to list executions');
        setError(error);
        throw error;
      }
    },
    [fetchReportExecutions],
  );

  // ==================== UTILITIES ====================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    dashboardSummary,
    loadDashboardSummary,
    analyticsResult,
    runAnalyticsQuery,
    timeSeriesResult,
    loadTimeSeries,
    exportResult,
    exportData,
    getExportFile,
    createReport,
    scheduleReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleReportActive,
    executeReport,
    getReport,
    listScheduledReports,
    getReportExecution,
    listReportExecutions,
    clearError,
  };
}
