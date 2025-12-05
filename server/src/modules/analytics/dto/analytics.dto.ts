/**
 * Analytics DTOs
 * Sprint 14 - Analytics & Reporting
 *
 * Data Transfer Objects for analytics queries, reports, and exports.
 */

import {
  ObjectType,
  Field,
  InputType,
  Int,
  Float,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsArray, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

// ==================== ENUMS ====================

export enum DateGranularity {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

registerEnumType(DateGranularity, {
  name: 'DateGranularity',
  description: 'Time granularity for aggregations',
});

export enum MetricType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  DISTINCT_COUNT = 'DISTINCT_COUNT',
}

registerEnumType(MetricType, {
  name: 'MetricType',
  description: 'Type of metric calculation',
});

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

registerEnumType(ChartType, {
  name: 'ChartType',
  description: 'Type of chart visualization',
});

export enum ExportFormat {
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
  PDF = 'PDF',
}

registerEnumType(ExportFormat, {
  name: 'ExportFormat',
  description: 'Export file format',
});

export enum ReportFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

registerEnumType(ReportFrequency, {
  name: 'ReportFrequency',
  description: 'Frequency for scheduled reports',
});

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Status of report generation',
});

// ==================== INPUT TYPES ====================

@InputType()
export class DateRangeInput {
  @Field()
  @IsDateString()
  startDate: string;

  @Field()
  @IsDateString()
  endDate: string;
}

@InputType()
export class MetricDefinitionInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => MetricType)
  @IsEnum(MetricType)
  type: MetricType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  field?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;
}

@InputType()
export class DimensionInput {
  @Field()
  @IsString()
  field: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @Field(() => DateGranularity, { nullable: true })
  @IsOptional()
  @IsEnum(DateGranularity)
  granularity?: DateGranularity;
}

@InputType()
export class FilterInput {
  @Field()
  @IsString()
  field: string;

  @Field()
  @IsString()
  operator: string; // eq, ne, gt, lt, gte, lte, in, contains, startsWith

  @Field(() => GraphQLJSON)
  value: unknown;
}

@InputType()
export class AnalyticsQueryInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  objectTypeIds?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => [MetricDefinitionInput])
  @IsArray()
  metrics: MetricDefinitionInput[];

  @Field(() => [DimensionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  dimensions?: DimensionInput[];

  @Field(() => [FilterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  filters?: FilterInput[];

  @Field(() => Int, { nullable: true, defaultValue: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  limit?: number;
}

@InputType()
export class DashboardWidgetInput {
  @Field()
  @IsString()
  title: string;

  @Field(() => ChartType)
  @IsEnum(ChartType)
  chartType: ChartType;

  @Field(() => AnalyticsQueryInput)
  query: AnalyticsQueryInput;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  gridWidth?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  gridHeight?: number;
}

@InputType()
export class CreateReportInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => AnalyticsQueryInput)
  query: AnalyticsQueryInput;

  @Field(() => ExportFormat)
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  columns?: string[];
}

@InputType()
export class ScheduleReportInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => AnalyticsQueryInput)
  query: AnalyticsQueryInput;

  @Field(() => ExportFormat)
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @Field(() => ReportFrequency)
  @IsEnum(ReportFrequency)
  frequency: ReportFrequency;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  recipients?: string[];

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class ExportDataInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  objectTypeIds?: string[];

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  dateRange?: DateRangeInput;

  @Field(() => [FilterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  filters?: FilterInput[];

  @Field(() => ExportFormat)
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  columns?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  filename?: string;
}

// ==================== OUTPUT TYPES ====================

@ObjectType()
export class MetricValue {
  @Field()
  name: string;

  @Field(() => Float)
  value: number;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  formattedValue?: string;
}

@ObjectType()
export class DataPoint {
  @Field(() => GraphQLJSON)
  dimensions: Record<string, unknown>;

  @Field(() => [MetricValue])
  metrics: MetricValue[];
}

@ObjectType()
export class AnalyticsResult {
  @Field(() => [DataPoint])
  data: DataPoint[];

  @Field(() => [MetricValue])
  totals: MetricValue[];

  @Field(() => Int)
  rowCount: number;

  @Field(() => Float)
  executionTimeMs: number;

  @Field({ nullable: true })
  truncated?: boolean;
}

@ObjectType()
export class TimeSeriesDataPoint {
  @Field()
  timestamp: string;

  @Field(() => Float)
  value: number;

  @Field({ nullable: true })
  label?: string;
}

@ObjectType()
export class TimeSeriesResult {
  @Field()
  metricName: string;

  @Field(() => [TimeSeriesDataPoint])
  data: TimeSeriesDataPoint[];

  @Field(() => DateGranularity)
  granularity: DateGranularity;
}

@ObjectType()
export class DashboardSummary {
  @Field(() => Int)
  totalObjectTypes: number;

  @Field(() => Int)
  totalInstances: number;

  @Field(() => Int)
  totalDocuments: number;

  @Field(() => Int)
  totalRelationships: number;

  @Field(() => Int)
  activeWorkflows: number;

  @Field(() => Int)
  pendingWorkflows: number;

  @Field(() => [ObjectTypeStats])
  objectTypeStats: ObjectTypeStats[];

  @Field(() => [StatusDistribution])
  instanceStatusDistribution: StatusDistribution[];

  @Field(() => [TimeSeriesDataPoint])
  instancesCreatedOverTime: TimeSeriesDataPoint[];
}

@ObjectType()
export class ObjectTypeStats {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  instanceCount: number;

  @Field(() => Int)
  fieldCount: number;

  @Field(() => Int)
  relationshipCount: number;
}

@ObjectType()
export class StatusDistribution {
  @Field()
  status: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class ExportResult {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  downloadUrl: string;

  @Field(() => ExportFormat)
  format: ExportFormat;

  @Field(() => Int)
  rowCount: number;

  @Field(() => Int)
  fileSizeBytes: number;

  @Field()
  expiresAt: Date;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class ReportDefinition {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON)
  query: Record<string, unknown>;

  @Field(() => ExportFormat)
  format: ExportFormat;

  @Field(() => ReportFrequency, { nullable: true })
  frequency?: ReportFrequency;

  @Field({ nullable: true })
  cronExpression?: string;

  @Field(() => [String], { nullable: true })
  recipients?: string[];

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  lastRunAt?: Date;

  @Field({ nullable: true })
  nextRunAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ReportExecution {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  reportId: string;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field({ nullable: true })
  downloadUrl?: string;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field(() => Int, { nullable: true })
  rowCount?: number;

  @Field(() => Int, { nullable: true })
  fileSizeBytes?: number;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Float, { nullable: true })
  executionTimeMs?: number;
}

@ObjectType()
export class ScheduledReportList {
  @Field(() => [ReportDefinition])
  reports: ReportDefinition[];

  @Field(() => Int)
  totalCount: number;
}

@ObjectType()
export class ReportExecutionList {
  @Field(() => [ReportExecution])
  executions: ReportExecution[];

  @Field(() => Int)
  totalCount: number;
}
