/**
 * WorkflowStateIndicator Component
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Displays the current workflow state with visual indicator.
 */

'use client';

import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
  ArchiveBoxIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { WorkflowState } from '@/lib/graphql/workflows';

interface WorkflowStateIndicatorProps {
  state?: WorkflowState | null;
  stateName?: string;
  isCompleted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const STATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  DRAFT: ClockIcon,
  ACTIVE: CheckCircleIcon,
  INACTIVE: PauseCircleIcon,
  ARCHIVED: ArchiveBoxIcon,
  DELETED: XCircleIcon,
  PENDING: ArrowPathIcon,
  APPROVED: CheckCircleIcon,
  REJECTED: XCircleIcon,
};

const DEFAULT_COLORS: Record<string, string> = {
  DRAFT: '#eab308',
  ACTIVE: '#22c55e',
  INACTIVE: '#64748b',
  ARCHIVED: '#a855f7',
  DELETED: '#ef4444',
  PENDING: '#f97316',
  APPROVED: '#22c55e',
  REJECTED: '#ef4444',
};

const SIZE_CLASSES = {
  sm: 'h-6 px-2 text-xs',
  md: 'h-8 px-3 text-sm',
  lg: 'h-10 px-4 text-base',
};

const ICON_SIZES = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function WorkflowStateIndicator({
  state,
  stateName,
  isCompleted = false,
  size = 'md',
  showLabel = true,
}: WorkflowStateIndicatorProps) {
  const name = state?.name || stateName || 'UNKNOWN';
  const displayName = state?.displayName || name.replace(/_/g, ' ');
  const color = state?.color || DEFAULT_COLORS[name] || '#64748b';
  const IconComponent = STATE_ICONS[name] || ClockIcon;

  const bgColor = `${color}20`;
  const textColor = color;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${SIZE_CLASSES[size]}`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <IconComponent className={ICON_SIZES[size]} />
      {showLabel && (
        <span className="capitalize">
          {displayName}
          {isCompleted && ' (Completo)'}
        </span>
      )}
    </div>
  );
}
