/**
 * WorkflowHistory Component
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Displays the transition history of a workflow instance.
 */

'use client';

import React from 'react';
import {
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { WorkflowHistoryEntry } from '@/lib/graphql/workflows';

interface WorkflowHistoryProps {
  history: WorkflowHistoryEntry[];
  className?: string;
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatStateName(state: string): string {
  return state.replace(/_/g, ' ');
}

export function WorkflowHistory({ history, className = '' }: WorkflowHistoryProps) {
  if (history.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <ClockIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum historico disponivel</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <ClockIcon className="w-5 h-5" />
        Historico de Transicoes
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative pl-10">
              {/* Timeline dot */}
              <div
                className={`absolute left-2 w-5 h-5 rounded-full border-2
                           ${index === 0
                             ? 'bg-blue-600 border-blue-500'
                             : 'bg-white border-gray-300'
                           }`}
              />

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Transition info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    {formatStateName(entry.fromState)}
                  </span>
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatStateName(entry.toState)}
                  </span>
                </div>

                {/* Transition name */}
                {entry.transitionName && (
                  <p className="text-sm text-blue-600 mb-2">
                    {entry.transitionName}
                  </p>
                )}

                {/* Comment */}
                {entry.comment && (
                  <div className="flex items-start gap-2 mb-2 text-sm text-gray-700">
                    <ChatBubbleLeftIcon className="w-4 h-4 mt-0.5 text-gray-400" />
                    <p>{entry.comment}</p>
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {formatDate(entry.createdAt)}
                  </span>
                  {entry.performedBy && (
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {entry.performedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
