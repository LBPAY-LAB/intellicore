/**
 * Analytics Dashboard Page
 * Sprint 14 - US-067: Analytics Dashboard
 *
 * Main analytics dashboard with statistics, charts, and reports.
 */

'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CubeIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  PlayCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  StatCard,
  BarChart,
  LineChart,
  PieChart,
  DataTable,
  ExportPanel,
  ReportsList,
} from '@/components/analytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  DashboardSummary,
  DateGranularity,
} from '@/lib/graphql/analytics';

type TabId = 'dashboard' | 'reports' | 'export';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
  { id: 'export', label: 'Export', icon: ArrowDownTrayIcon },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const { loadDashboardSummary, loading, error } = useAnalytics();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await loadDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
        <p className="text-sm text-gray-500 mt-1">
          View statistics, generate reports, and export data
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        {activeTab === 'dashboard' && (
          <DashboardTab summary={summary} loading={loading} error={error} />
        )}

        {activeTab === 'reports' && <ReportsTab />}

        {activeTab === 'export' && <ExportTab />}
      </div>
    </div>
  );
}

// ==================== DASHBOARD TAB ====================

interface DashboardTabProps {
  summary: DashboardSummary | null;
  loading: boolean;
  error: Error | null;
}

function DashboardTab({ summary, loading, error }: DashboardTabProps) {
  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load dashboard: {error.message}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Object Types"
          value={summary.totalObjectTypes}
          icon={<CubeIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Instances"
          value={summary.totalInstances}
          icon={<DocumentDuplicateIcon className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Documents"
          value={summary.totalDocuments}
          icon={<DocumentTextIcon className="w-6 h-6" />}
          color="purple"
        />
        <StatCard
          title="Relationships"
          value={summary.totalRelationships}
          icon={<LinkIcon className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Active Workflows"
          value={summary.activeWorkflows}
          icon={<PlayCircleIcon className="w-6 h-6" />}
          color="green"
          size="sm"
        />
        <StatCard
          title="Pending Workflows"
          value={summary.pendingWorkflows}
          icon={<ClockIcon className="w-6 h-6" />}
          color="orange"
          size="sm"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instances Over Time */}
        <LineChart
          title="Instances Created Over Time"
          data={summary.instancesCreatedOverTime.map((d) => ({
            label: d.timestamp,
            value: d.value,
          }))}
          height={250}
          color="#3B82F6"
        />

        {/* Status Distribution */}
        <PieChart
          title="Instance Status Distribution"
          data={summary.instanceStatusDistribution.map((d) => ({
            label: d.status,
            value: d.count,
          }))}
          donut
          size={200}
        />
      </div>

      {/* Object Type Stats */}
      <BarChart
        title="Instances by Object Type"
        data={summary.objectTypeStats.slice(0, 8).map((ot) => ({
          label: ot.name,
          value: ot.instanceCount,
        }))}
        height={250}
      />

      {/* Object Types Table */}
      <DataTable
        title="Object Types Overview"
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          {
            key: 'instanceCount',
            label: 'Instances',
            sortable: true,
            render: (v) => (v as number).toLocaleString(),
          },
          { key: 'fieldCount', label: 'Fields', sortable: true },
          { key: 'relationshipCount', label: 'Relationships', sortable: true },
        ]}
        data={summary.objectTypeStats as unknown as Record<string, unknown>[]}
      />
    </div>
  );
}

// ==================== REPORTS TAB ====================

function ReportsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Create New Report
        </h3>
        <p className="text-sm text-gray-500">
          Use the Export tab to generate one-time reports, or schedule recurring
          reports below.
        </p>
      </div>

      <ReportsList />
    </div>
  );
}

// ==================== EXPORT TAB ====================

function ExportTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ExportPanel />

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Export Options</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <strong>CSV:</strong> Best for spreadsheets and data analysis tools.
            Compatible with Excel, Google Sheets, and most database imports.
          </div>
          <div>
            <strong>Excel:</strong> Native Microsoft Excel format with proper
            formatting and data types.
          </div>
          <div>
            <strong>JSON:</strong> Structured data format ideal for APIs,
            programming, and data pipelines.
          </div>
          <div>
            <strong>PDF:</strong> Document format suitable for sharing, printing,
            and archiving.
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Export Limits</h4>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Maximum 100,000 rows per export</li>
            <li>• Exports available for download for 24 hours</li>
            <li>• Large exports may take several minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
