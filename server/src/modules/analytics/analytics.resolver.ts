/**
 * Analytics GraphQL Resolver
 * Sprint 14 - Analytics & Reporting
 *
 * GraphQL resolver for analytics queries, reports, and exports.
 */

import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { AnalyticsQueryService } from './services/analytics-query.service';
import { ExportService } from './services/export.service';
import { ReportService } from './services/report.service';
import {
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
  ScheduledReportList,
  ReportExecutionList,
} from './dto/analytics.dto';

@Resolver()
export class AnalyticsResolver {
  private readonly logger = new Logger(AnalyticsResolver.name);

  constructor(
    private readonly analyticsQueryService: AnalyticsQueryService,
    private readonly exportService: ExportService,
    private readonly reportService: ReportService,
  ) {}

  // ==================== ANALYTICS QUERIES ====================

  /**
   * Execute analytics query with metrics and dimensions
   */
  @Query(() => AnalyticsResult, { description: 'Execute analytics query' })
  async analyticsQuery(
    @Args('input') input: AnalyticsQueryInput,
  ): Promise<AnalyticsResult> {
    this.logger.log('Executing analytics query');
    return this.analyticsQueryService.executeQuery(input);
  }

  /**
   * Get dashboard summary statistics
   */
  @Query(() => DashboardSummary, { description: 'Get dashboard summary' })
  async dashboardSummary(
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<DashboardSummary> {
    this.logger.log('Getting dashboard summary');
    const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
    return this.analyticsQueryService.getDashboardSummary(dateRange);
  }

  /**
   * Get time series data for a metric
   */
  @Query(() => TimeSeriesResult, { description: 'Get time series data' })
  async timeSeries(
    @Args('metricName') metricName: string,
    @Args('granularity', { type: () => DateGranularity }) granularity: DateGranularity,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('objectTypeIds', { type: () => [String], nullable: true }) objectTypeIds?: string[],
  ): Promise<TimeSeriesResult> {
    this.logger.log(`Getting time series: ${metricName}`);
    return this.analyticsQueryService.getTimeSeries(
      metricName,
      granularity,
      startDate,
      endDate,
      objectTypeIds,
    );
  }

  // ==================== EXPORT OPERATIONS ====================

  /**
   * Export data to file (CSV, Excel, JSON, PDF)
   */
  @Mutation(() => ExportResult, { description: 'Export data to file' })
  async exportData(
    @Args('input') input: ExportDataInput,
  ): Promise<ExportResult> {
    this.logger.log(`Exporting data: ${input.format}`);
    return this.exportService.exportData(input);
  }

  /**
   * Get export file info
   */
  @Query(() => ExportResult, { nullable: true, description: 'Get export file info' })
  async exportFile(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ExportResult | null> {
    const file = await this.exportService.getExportFile(id);
    if (!file) return null;

    return {
      id: file.id,
      filename: file.filename,
      downloadUrl: file.downloadUrl,
      format: file.format,
      rowCount: file.rowCount,
      fileSizeBytes: file.fileSizeBytes,
      expiresAt: file.expiresAt,
      createdAt: file.createdAt,
    };
  }

  // ==================== REPORT OPERATIONS ====================

  /**
   * Create and execute a one-time report
   */
  @Mutation(() => ReportExecution, { description: 'Create and run one-time report' })
  async createReport(
    @Args('input') input: CreateReportInput,
  ): Promise<ReportExecution> {
    this.logger.log(`Creating report: ${input.name}`);
    return this.reportService.createReport(input);
  }

  /**
   * Schedule a recurring report
   */
  @Mutation(() => ReportDefinition, { description: 'Schedule recurring report' })
  async scheduleReport(
    @Args('input') input: ScheduleReportInput,
  ): Promise<ReportDefinition> {
    this.logger.log(`Scheduling report: ${input.name}`);
    return this.reportService.scheduleReport(input);
  }

  /**
   * Get report definition
   */
  @Query(() => ReportDefinition, { description: 'Get report definition' })
  async report(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ReportDefinition> {
    return this.reportService.getReport(id);
  }

  /**
   * List scheduled reports
   */
  @Query(() => ScheduledReportList, { description: 'List scheduled reports' })
  async scheduledReports(
    @Args('limit', { nullable: true, defaultValue: 50 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<ScheduledReportList> {
    return this.reportService.listScheduledReports(limit, offset);
  }

  /**
   * Update scheduled report
   */
  @Mutation(() => ReportDefinition, { description: 'Update scheduled report' })
  async updateScheduledReport(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ScheduleReportInput,
  ): Promise<ReportDefinition> {
    this.logger.log(`Updating scheduled report: ${id}`);
    return this.reportService.updateScheduledReport(id, input);
  }

  /**
   * Delete scheduled report
   */
  @Mutation(() => Boolean, { description: 'Delete scheduled report' })
  async deleteScheduledReport(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    this.logger.log(`Deleting scheduled report: ${id}`);
    return this.reportService.deleteScheduledReport(id);
  }

  /**
   * Enable/disable scheduled report
   */
  @Mutation(() => ReportDefinition, { description: 'Toggle report active status' })
  async toggleReportActive(
    @Args('id', { type: () => ID }) id: string,
    @Args('isActive') isActive: boolean,
  ): Promise<ReportDefinition> {
    this.logger.log(`Toggling report ${id} active: ${isActive}`);
    return this.reportService.toggleReportActive(id, isActive);
  }

  /**
   * Execute report immediately
   */
  @Mutation(() => ReportExecution, { description: 'Execute report now' })
  async executeReport(
    @Args('reportId', { type: () => ID }) reportId: string,
  ): Promise<ReportExecution> {
    this.logger.log(`Executing report: ${reportId}`);
    return this.reportService.executeReport(reportId);
  }

  /**
   * Get report execution status
   */
  @Query(() => ReportExecution, { description: 'Get execution status' })
  async reportExecution(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ReportExecution> {
    return this.reportService.getExecution(id);
  }

  /**
   * List report executions
   */
  @Query(() => ReportExecutionList, { description: 'List report executions' })
  async reportExecutions(
    @Args('reportId', { type: () => ID }) reportId: string,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
  ): Promise<ReportExecutionList> {
    return this.reportService.listExecutions(reportId, limit);
  }
}
