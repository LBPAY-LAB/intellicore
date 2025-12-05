'use client';

import { useState } from 'react';
import {
  GraphQueryConsole,
  GraphAnalyticsPanel,
  GraphPathFinder,
  GraphStatsCard,
  GraphSyncPanel,
} from '@/components/graph-query';
import {
  CommandLineIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

type TabId = 'console' | 'analytics' | 'paths' | 'admin';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'console', label: 'Query Console', icon: CommandLineIcon },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
  { id: 'paths', label: 'Path Finder', icon: ArrowsRightLeftIcon },
  { id: 'admin', label: 'Admin', icon: Cog6ToothIcon },
];

export default function GraphQueryPage() {
  const [activeTab, setActiveTab] = useState<TabId>('console');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Graph Query Engine</h1>
        <p className="text-sm text-gray-500 mt-1">
          Query, analyze, and manage the NebulaGraph database
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
        {activeTab === 'console' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GraphQueryConsole />
            </div>
            <div>
              <GraphStatsCard />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-4xl">
            <GraphAnalyticsPanel />
          </div>
        )}

        {activeTab === 'paths' && (
          <div className="max-w-4xl">
            <GraphPathFinder />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            <GraphSyncPanel />
            <GraphStatsCard />
          </div>
        )}
      </div>
    </div>
  );
}
