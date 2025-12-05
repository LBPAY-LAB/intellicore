/**
 * Analytics GraphQL Operations
 * Sprint 14 - Analytics & Reporting
 *
 * GraphQL queries, mutations, and types for analytics.
 */

import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const METRIC_VALUE_FRAGMENT = gql`
  fragment MetricValueFields on MetricValue {
    name
    value
    label
    formattedValue
  }
`;

export const DATA_POINT_FRAGMENT = gql`
  fragment DataPointFields on DataPoint {
    dimensions
    metrics {
      ...MetricValueFields
    }
  }
  ${METRIC_VALUE_FRAGMENT}
`;

export const TIME_SERIES_DATA_POINT_FRAGMENT = gql`
  fragment TimeSeriesDataPointFields on TimeSeriesDataPoint {
    timestamp
    value
    label
  }
`;

export const EXPORT_RESULT_FRAGMENT = gql`
  fragment ExportResultFields on ExportResult {
    id
    filename
    downloadUrl
    format
    rowCount
    fileSizeBytes
    expiresAt
    createdAt
  }
`;

export const REPORT_DEFINITION_FRAGMENT = gql`
  fragment ReportDefinitionFields on ReportDefinition {
    id
    name
    description
    query
    format
    frequency
    cronExpression
    recipients
    isActive
    lastRunAt
    nextRunAt
    createdAt
    updatedAt
  }
`;

export const REPORT_EXECUTION_FRAGMENT = gql`
  fragment ReportExecutionFields on ReportExecution {
    id
    reportId
    status
    downloadUrl
    errorMessage
    rowCount
    fileSizeBytes
    startedAt
    completedAt
    executionTimeMs
  }
`;

// ==================== QUERIES ====================

export const ANALYTICS_QUERY = gql`
  query AnalyticsQuery($input: AnalyticsQueryInput!) {
    analyticsQuery(input: $input) {
      data {
        ...DataPointFields
      }
      totals {
        ...MetricValueFields
      }
      rowCount
      executionTimeMs
      truncated
    }
  }
  ${DATA_POINT_FRAGMENT}
  ${METRIC_VALUE_FRAGMENT}
`;

export const DASHBOARD_SUMMARY = gql`
  query DashboardSummary($startDate: String, $endDate: String) {
    dashboardSummary(startDate: $startDate, endDate: $endDate) {
      totalObjectTypes
      totalInstances
      totalDocuments
      totalRelationships
      activeWorkflows
      pendingWorkflows
      objectTypeStats {
        id
        name
        instanceCount
        fieldCount
        relationshipCount
      }
      instanceStatusDistribution {
        status
        count
        percentage
      }
      instancesCreatedOverTime {
        ...TimeSeriesDataPointFields
      }
    }
  }
  ${TIME_SERIES_DATA_POINT_FRAGMENT}
`;

export const TIME_SERIES = gql`
  query TimeSeries(
    $metricName: String!
    $granularity: DateGranularity!
    $startDate: String!
    $endDate: String!
    $objectTypeIds: [String!]
  ) {
    timeSeries(
      metricName: $metricName
      granularity: $granularity
      startDate: $startDate
      endDate: $endDate
      objectTypeIds: $objectTypeIds
    ) {
      metricName
      data {
        ...TimeSeriesDataPointFields
      }
      granularity
    }
  }
  ${TIME_SERIES_DATA_POINT_FRAGMENT}
`;

export const GET_REPORT = gql`
  query GetReport($id: ID!) {
    report(id: $id) {
      ...ReportDefinitionFields
    }
  }
  ${REPORT_DEFINITION_FRAGMENT}
`;

export const LIST_SCHEDULED_REPORTS = gql`
  query ListScheduledReports($limit: Float, $offset: Float) {
    scheduledReports(limit: $limit, offset: $offset) {
      reports {
        ...ReportDefinitionFields
      }
      totalCount
    }
  }
  ${REPORT_DEFINITION_FRAGMENT}
`;

export const GET_REPORT_EXECUTION = gql`
  query GetReportExecution($id: ID!) {
    reportExecution(id: $id) {
      ...ReportExecutionFields
    }
  }
  ${REPORT_EXECUTION_FRAGMENT}
`;

export const LIST_REPORT_EXECUTIONS = gql`
  query ListReportExecutions($reportId: ID!, $limit: Float) {
    reportExecutions(reportId: $reportId, limit: $limit) {
      executions {
        ...ReportExecutionFields
      }
      totalCount
    }
  }
  ${REPORT_EXECUTION_FRAGMENT}
`;

export const GET_EXPORT_FILE = gql`
  query GetExportFile($id: ID!) {
    exportFile(id: $id) {
      ...ExportResultFields
    }
  }
  ${EXPORT_RESULT_FRAGMENT}
`;

// ==================== MUTATIONS ====================

export const EXPORT_DATA = gql`
  mutation ExportData($input: ExportDataInput!) {
    exportData(input: $input) {
      ...ExportResultFields
    }
  }
  ${EXPORT_RESULT_FRAGMENT}
`;

export const CREATE_REPORT = gql`
  mutation CreateReport($input: CreateReportInput!) {
    createReport(input: $input) {
      ...ReportExecutionFields
    }
  }
  ${REPORT_EXECUTION_FRAGMENT}
`;

export const SCHEDULE_REPORT = gql`
  mutation ScheduleReport($input: ScheduleReportInput!) {
    scheduleReport(input: $input) {
      ...ReportDefinitionFields
    }
  }
  ${REPORT_DEFINITION_FRAGMENT}
`;

export const UPDATE_SCHEDULED_REPORT = gql`
  mutation UpdateScheduledReport($id: ID!, $input: ScheduleReportInput!) {
    updateScheduledReport(id: $id, input: $input) {
      ...ReportDefinitionFields
    }
  }
  ${REPORT_DEFINITION_FRAGMENT}
`;

export const DELETE_SCHEDULED_REPORT = gql`
  mutation DeleteScheduledReport($id: ID!) {
    deleteScheduledReport(id: $id)
  }
`;

export const TOGGLE_REPORT_ACTIVE = gql`
  mutation ToggleReportActive($id: ID!, $isActive: Boolean!) {
    toggleReportActive(id: $id, isActive: $isActive) {
      ...ReportDefinitionFields
    }
  }
  ${REPORT_DEFINITION_FRAGMENT}
`;

export const EXECUTE_REPORT = gql`
  mutation ExecuteReport($reportId: ID!) {
    executeReport(reportId: $reportId) {
      ...ReportExecutionFields
    }
  }
  ${REPORT_EXECUTION_FRAGMENT}
`;

// ==================== TYPES ====================

export enum DateGranularity {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

export enum MetricType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  DISTINCT_COUNT = 'DISTINCT_COUNT',
}

export enum ChartType {
  LINE = 'LINE',
  BAR = 'BAR',
  PIE = 'PIE',
  DONUT = 'DONUT',
  AREA = 'AREA',
  SCATTER = 'SCATTER',
  HEATMAP = 'HEATMAP',
  TABLE = 'TABLE',
}

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  PDF = 'PDF',
}

export enum ReportFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface MetricValue {
  name: string;
  value: number;
  label?: string;
  formattedValue?: string;
}

export interface DataPoint {
  dimensions: Record<string, unknown>;
  metrics: MetricValue[];
}

export interface AnalyticsResult {
  data: DataPoint[];
  totals: MetricValue[];
  rowCount: number;
  executionTimeMs: number;
  truncated?: boolean;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TimeSeriesResult {
  metricName: string;
  data: TimeSeriesDataPoint[];
  granularity: DateGranularity;
}

export interface ObjectTypeStats {
  id: string;
  name: string;
  instanceCount: number;
  fieldCount: number;
  relationshipCount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface DashboardSummary {
  totalObjectTypes: number;
  totalInstances: number;
  totalDocuments: number;
  totalRelationships: number;
  activeWorkflows: number;
  pendingWorkflows: number;
  objectTypeStats: ObjectTypeStats[];
  instanceStatusDistribution: StatusDistribution[];
  instancesCreatedOverTime: TimeSeriesDataPoint[];
}

export interface ExportResult {
  id: string;
  filename: string;
  downloadUrl: string;
  format: ExportFormat;
  rowCount: number;
  fileSizeBytes: number;
  expiresAt: string;
  createdAt: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  query: Record<string, unknown>;
  format: ExportFormat;
  frequency?: ReportFrequency;
  cronExpression?: string;
  recipients?: string[];
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: ReportStatus;
  downloadUrl?: string;
  errorMessage?: string;
  rowCount?: number;
  fileSizeBytes?: number;
  startedAt: string;
  completedAt?: string;
  executionTimeMs?: number;
}

export interface DateRangeInput {
  startDate: string;
  endDate: string;
}

export interface MetricDefinitionInput {
  name: string;
  type: MetricType;
  field?: string;
  label?: string;
}

export interface DimensionInput {
  field: string;
  label?: string;
  granularity?: DateGranularity;
}

export interface FilterInput {
  field: string;
  operator: string;
  value: unknown;
}

export interface AnalyticsQueryInput {
  objectTypeIds?: string[];
  dateRange?: DateRangeInput;
  metrics: MetricDefinitionInput[];
  dimensions?: DimensionInput[];
  filters?: FilterInput[];
  limit?: number;
}

export interface ExportDataInput {
  objectTypeIds?: string[];
  dateRange?: DateRangeInput;
  filters?: FilterInput[];
  format: ExportFormat;
  columns?: string[];
  filename?: string;
}

export interface CreateReportInput {
  name: string;
  description?: string;
  query: AnalyticsQueryInput;
  format: ExportFormat;
  columns?: string[];
}

export interface ScheduleReportInput {
  name: string;
  description?: string;
  query: AnalyticsQueryInput;
  format: ExportFormat;
  frequency: ReportFrequency;
  cronExpression?: string;
  recipients?: string[];
  isActive?: boolean;
}
