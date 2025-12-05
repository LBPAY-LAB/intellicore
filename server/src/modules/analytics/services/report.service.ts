/**
 * Report Service
 * Sprint 14 - US-068, US-071: Report Generation & Scheduled Reports
 *
 * Service for managing report definitions and executions.
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import {
  CreateReportInput,
  ScheduleReportInput,
  ReportDefinition,
  ReportExecution,
  ReportStatus,
  ReportFrequency,
  ScheduledReportList,
  ReportExecutionList,
  ExportFormat,
} from '../dto/analytics.dto';
import {
  ReportDefinitionEntity,
  ReportExecutionEntity,
} from '../entities/report.entity';
import { ExportService } from './export.service';
import { AnalyticsConfig } from '../analytics.config';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly config: AnalyticsConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(ReportDefinitionEntity)
    private readonly reportRepository: Repository<ReportDefinitionEntity>,
    @InjectRepository(ReportExecutionEntity)
    private readonly executionRepository: Repository<ReportExecutionEntity>,
    private readonly exportService: ExportService,
  ) {
    this.config = this.configService.get<AnalyticsConfig>('analytics')!;
  }

  /**
   * Create and execute a one-time report
   */
  async createReport(input: CreateReportInput, userId?: string): Promise<ReportExecution> {
    this.logger.log(`Creating one-time report: ${input.name}`);

    // Create report definition
    const report = this.reportRepository.create({
      name: input.name,
      description: input.description,
      query: input.query as unknown as Record<string, unknown>,
      format: input.format,
      columns: input.columns,
      frequency: ReportFrequency.ONCE,
      isActive: false, // One-time reports don't need to be active
      createdBy: userId,
    });

    const savedReport = await this.reportRepository.save(report);

    // Execute immediately
    return this.executeReport(savedReport.id, userId);
  }

  /**
   * Schedule a recurring report
   */
  async scheduleReport(input: ScheduleReportInput, userId?: string): Promise<ReportDefinition> {
    this.logger.log(`Scheduling report: ${input.name}, frequency: ${input.frequency}`);

    const nextRunAt = this.calculateNextRunTime(input.frequency, input.cronExpression);

    const report = this.reportRepository.create({
      name: input.name,
      description: input.description,
      query: input.query as unknown as Record<string, unknown>,
      format: input.format,
      frequency: input.frequency,
      cronExpression: input.cronExpression,
      recipients: input.recipients,
      isActive: input.isActive ?? true,
      nextRunAt,
      createdBy: userId,
    });

    const saved = await this.reportRepository.save(report);
    return this.mapToReportDefinition(saved);
  }

  /**
   * Get report definition by ID
   */
  async getReport(id: string): Promise<ReportDefinition> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }
    return this.mapToReportDefinition(report);
  }

  /**
   * List all scheduled reports
   */
  async listScheduledReports(limit = 50, offset = 0): Promise<ScheduledReportList> {
    const [reports, totalCount] = await this.reportRepository.findAndCount({
      where: { frequency: Not(ReportFrequency.ONCE) },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      reports: reports.map((r) => this.mapToReportDefinition(r)),
      totalCount,
    };
  }

  /**
   * Update a scheduled report
   */
  async updateScheduledReport(
    id: string,
    input: Partial<ScheduleReportInput>,
  ): Promise<ReportDefinition> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    if (input.name) report.name = input.name;
    if (input.description !== undefined) report.description = input.description || null;
    if (input.query) report.query = input.query as unknown as Record<string, unknown>;
    if (input.format) report.format = input.format;
    if (input.frequency) {
      report.frequency = input.frequency;
      report.nextRunAt = this.calculateNextRunTime(input.frequency, input.cronExpression);
    }
    if (input.cronExpression !== undefined) report.cronExpression = input.cronExpression || null;
    if (input.recipients !== undefined) report.recipients = input.recipients || null;
    if (input.isActive !== undefined) report.isActive = input.isActive;

    const saved = await this.reportRepository.save(report);
    return this.mapToReportDefinition(saved);
  }

  /**
   * Delete a scheduled report
   */
  async deleteScheduledReport(id: string): Promise<boolean> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    await this.reportRepository.softDelete(id);
    return true;
  }

  /**
   * Enable/disable a scheduled report
   */
  async toggleReportActive(id: string, isActive: boolean): Promise<ReportDefinition> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found`);
    }

    report.isActive = isActive;
    if (isActive && report.frequency) {
      report.nextRunAt = this.calculateNextRunTime(report.frequency, report.cronExpression);
    }

    const saved = await this.reportRepository.save(report);
    return this.mapToReportDefinition(saved);
  }

  /**
   * Execute a report immediately
   */
  async executeReport(reportId: string, userId?: string): Promise<ReportExecution> {
    const report = await this.reportRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Report with ID "${reportId}" not found`);
    }

    // Create execution record
    const execution = this.executionRepository.create({
      reportId: report.id,
      status: ReportStatus.GENERATING,
      startedAt: new Date(),
      triggeredBy: userId,
    });

    const savedExecution = await this.executionRepository.save(execution);

    // Execute async
    this.runReportExecution(savedExecution.id, report).catch((error) => {
      this.logger.error(`Report execution failed: ${error.message}`, error.stack);
    });

    return this.mapToReportExecution(savedExecution);
  }

  /**
   * Get report execution status
   */
  async getExecution(id: string): Promise<ReportExecution> {
    const execution = await this.executionRepository.findOne({ where: { id } });
    if (!execution) {
      throw new NotFoundException(`Execution with ID "${id}" not found`);
    }
    return this.mapToReportExecution(execution);
  }

  /**
   * List executions for a report
   */
  async listExecutions(reportId: string, limit = 20): Promise<ReportExecutionList> {
    const [executions, totalCount] = await this.executionRepository.findAndCount({
      where: { reportId },
      order: { startedAt: 'DESC' },
      take: limit,
    });

    return {
      executions: executions.map((e) => this.mapToReportExecution(e)),
      totalCount,
    };
  }

  /**
   * Process scheduled reports (cron job)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledReports(): Promise<void> {
    if (!this.config.scheduledReportsEnabled) {
      return;
    }

    const now = new Date();
    const dueReports = await this.reportRepository.find({
      where: {
        isActive: true,
        nextRunAt: LessThanOrEqual(now),
        frequency: Not(ReportFrequency.ONCE),
      },
    });

    for (const report of dueReports) {
      this.logger.log(`Running scheduled report: ${report.name}`);

      try {
        await this.executeReport(report.id);

        // Update next run time
        report.lastRunAt = now;
        report.nextRunAt = this.calculateNextRunTime(report.frequency!, report.cronExpression);
        await this.reportRepository.save(report);
      } catch (error) {
        this.logger.error(`Failed to execute scheduled report ${report.id}: ${error.message}`);
      }
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async runReportExecution(
    executionId: string,
    report: ReportDefinitionEntity,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Generate export
      const exportResult = await this.exportService.exportData({
        objectTypeIds: (report.query as any).objectTypeIds,
        dateRange: (report.query as any).dateRange,
        filters: (report.query as any).filters,
        format: report.format,
        columns: report.columns || undefined,
        filename: `report_${report.name.replace(/\s+/g, '_')}_${Date.now()}`,
      });

      // Update execution record
      await this.executionRepository.update(executionId, {
        status: ReportStatus.COMPLETED,
        downloadUrl: exportResult.downloadUrl,
        rowCount: exportResult.rowCount,
        fileSizeBytes: exportResult.fileSizeBytes,
        completedAt: new Date(),
        executionTimeMs: Date.now() - startTime,
      });

      // Send to recipients if configured
      if (report.recipients?.length && this.config.emailEnabled) {
        // In production, implement email sending here
        this.logger.log(`Would send report to: ${report.recipients.join(', ')}`);
      }

      this.logger.log(`Report execution completed: ${executionId}`);
    } catch (error) {
      await this.executionRepository.update(executionId, {
        status: ReportStatus.FAILED,
        errorMessage: error.message,
        completedAt: new Date(),
        executionTimeMs: Date.now() - startTime,
      });

      this.logger.error(`Report execution failed: ${executionId}, ${error.message}`);
      throw error;
    }
  }

  private calculateNextRunTime(frequency: ReportFrequency, cronExpression?: string | null): Date {
    const now = new Date();

    switch (frequency) {
      case ReportFrequency.DAILY:
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        return tomorrow;

      case ReportFrequency.WEEKLY:
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay() + 1)); // Next Monday
        nextWeek.setHours(8, 0, 0, 0);
        return nextWeek;

      case ReportFrequency.MONTHLY:
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(8, 0, 0, 0);
        return nextMonth;

      case ReportFrequency.QUARTERLY:
        const nextQuarter = new Date(now);
        const currentQuarter = Math.floor(nextQuarter.getMonth() / 3);
        nextQuarter.setMonth((currentQuarter + 1) * 3);
        nextQuarter.setDate(1);
        nextQuarter.setHours(8, 0, 0, 0);
        return nextQuarter;

      default:
        return now;
    }
  }

  private mapToReportDefinition(entity: ReportDefinitionEntity): ReportDefinition {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description || undefined,
      query: entity.query,
      format: entity.format,
      frequency: entity.frequency || undefined,
      cronExpression: entity.cronExpression || undefined,
      recipients: entity.recipients || undefined,
      isActive: entity.isActive,
      lastRunAt: entity.lastRunAt || undefined,
      nextRunAt: entity.nextRunAt || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private mapToReportExecution(entity: ReportExecutionEntity): ReportExecution {
    return {
      id: entity.id,
      reportId: entity.reportId,
      status: entity.status,
      downloadUrl: entity.downloadUrl || undefined,
      errorMessage: entity.errorMessage || undefined,
      rowCount: entity.rowCount || undefined,
      fileSizeBytes: entity.fileSizeBytes ? Number(entity.fileSizeBytes) : undefined,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt || undefined,
      executionTimeMs: entity.executionTimeMs || undefined,
    };
  }
}
