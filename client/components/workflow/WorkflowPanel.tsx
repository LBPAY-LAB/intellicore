/**
 * WorkflowPanel Component
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Complete workflow management panel for instance detail pages.
 * Combines state indicator, transitions, diagram, and history.
 */

'use client';

import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CogIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useWorkflow } from '@/hooks/useWorkflow';
import { WorkflowStateIndicator } from './WorkflowStateIndicator';
import { WorkflowTransitionButtons } from './WorkflowTransitionButtons';
import { WorkflowDiagram } from './WorkflowDiagram';
import { WorkflowHistory } from './WorkflowHistory';

interface WorkflowPanelProps {
  instanceId: string;
  className?: string;
  defaultExpanded?: boolean;
}

type TabId = 'diagram' | 'history';

export function WorkflowPanel({
  instanceId,
  className = '',
  defaultExpanded = false,
}: WorkflowPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<TabId>('diagram');

  const {
    workflowInstance,
    currentState,
    availableTransitions,
    states,
    transitions,
    history,
    loading,
    transitionsLoading,
    executeTransition,
    refresh,
    error,
    hasWorkflow,
    isCompleted,
  } = useWorkflow({ instanceId });

  const handleTransition = async (
    transitionId: string,
    comment?: string,
    data?: Record<string, unknown>
  ): Promise<boolean> => {
    const success = await executeTransition(transitionId, comment, data);
    if (success) {
      refresh();
    }
    return success;
  };

  // Loading state
  if (loading && !workflowInstance) {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center gap-3">
          <CogIcon className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-gray-600">Carregando workflow...</span>
        </div>
      </div>
    );
  }

  // No workflow attached
  if (!hasWorkflow) {
    return (
      <div className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <CogIcon className="w-5 h-5" />
          <span>Nenhum workflow associado a esta instancia</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 text-red-700">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>Erro ao carregar workflow: {error.message}</span>
        </div>
      </div>
    );
  }

  // Find current state object from states array
  const currentStateObj = states.find(s => s.name === workflowInstance?.currentState);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <CogIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">
            {workflowInstance?.workflow?.name || 'Workflow'}
          </span>
          <WorkflowStateIndicator
            state={currentState || currentStateObj}
            stateName={workflowInstance?.currentState}
            isCompleted={isCompleted}
            size="sm"
          />
        </div>
        {expanded ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-200">
          {/* Transition buttons */}
          {availableTransitions.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Acoes Disponiveis
              </p>
              <WorkflowTransitionButtons
                transitions={availableTransitions}
                onTransition={handleTransition}
                loading={transitionsLoading}
              />
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('diagram')}
              className={`px-4 py-2 text-sm font-medium transition-colors
                         ${activeTab === 'diagram'
                           ? 'text-blue-600 border-b-2 border-blue-600'
                           : 'text-gray-600 hover:text-gray-900'
                         }`}
            >
              Diagrama
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium transition-colors
                         ${activeTab === 'history'
                           ? 'text-blue-600 border-b-2 border-blue-600'
                           : 'text-gray-600 hover:text-gray-900'
                         }`}
            >
              Historico ({history.length})
            </button>
          </div>

          {/* Tab content */}
          <div className="p-4">
            {activeTab === 'diagram' && states.length > 0 && (
              <WorkflowDiagram
                states={states}
                transitions={transitions}
                currentState={workflowInstance?.currentState}
              />
            )}

            {activeTab === 'history' && (
              <WorkflowHistory history={history} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
