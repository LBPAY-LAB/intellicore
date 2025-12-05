/**
 * Analytics Configuration
 * Sprint 14 - US-067: Analytics Dashboard
 *
 * Configuration for analytics module including export settings
 * and scheduled report options.
 */

import { registerAs } from '@nestjs/config';

export interface AnalyticsConfig {
  // Export settings
  exportTempDir: string;
  exportMaxRows: number;
  exportRetentionHours: number;

  // Scheduled reports
  scheduledReportsEnabled: boolean;
  scheduledReportsCron: string;
  emailEnabled: boolean;
  emailFrom: string;

  // Dashboard settings
  dashboardCacheSeconds: number;
  maxChartDataPoints: number;
}

export default registerAs(
  'analytics',
  (): AnalyticsConfig => ({
    // Export settings
    exportTempDir: process.env.ANALYTICS_EXPORT_DIR || '/tmp/analytics-exports',
    exportMaxRows: parseInt(process.env.ANALYTICS_EXPORT_MAX_ROWS || '100000', 10),
    exportRetentionHours: parseInt(process.env.ANALYTICS_EXPORT_RETENTION_HOURS || '24', 10),

    // Scheduled reports
    scheduledReportsEnabled: process.env.ANALYTICS_SCHEDULED_ENABLED === 'true',
    scheduledReportsCron: process.env.ANALYTICS_SCHEDULED_CRON || '0 8 * * *', // Daily at 8am
    emailEnabled: process.env.ANALYTICS_EMAIL_ENABLED === 'true',
    emailFrom: process.env.ANALYTICS_EMAIL_FROM || 'noreply@intellicore.local',

    // Dashboard settings
    dashboardCacheSeconds: parseInt(process.env.ANALYTICS_CACHE_SECONDS || '300', 10), // 5 min
    maxChartDataPoints: parseInt(process.env.ANALYTICS_MAX_CHART_POINTS || '1000', 10),
  }),
);
