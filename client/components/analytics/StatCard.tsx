/**
 * Stat Card Component
 * Sprint 14 - US-070: Visualization Components
 *
 * Displays a single metric with optional trend indicator.
 */

'use client';

import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 ring-blue-500/20',
  green: 'bg-green-50 text-green-600 ring-green-500/20',
  purple: 'bg-purple-50 text-purple-600 ring-purple-500/20',
  orange: 'bg-orange-50 text-orange-600 ring-orange-500/20',
  red: 'bg-red-50 text-red-600 ring-red-500/20',
  gray: 'bg-gray-50 text-gray-600 ring-gray-500/20',
};

const iconColorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  size = 'md',
}: StatCardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`${valueSizeClasses[size]} font-bold text-gray-900 mt-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${iconColorClasses[color]} text-white`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
