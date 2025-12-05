/**
 * WorkflowDiagram Component
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Visual representation of workflow states and transitions.
 */

'use client';

import React from 'react';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { WorkflowState, WorkflowTransition } from '@/lib/graphql/workflows';

interface WorkflowDiagramProps {
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  currentState?: string;
  className?: string;
}

// State type colors - light theme
const stateTypeColors: Record<string, { bg: string; border: string; text: string }> = {
  initial: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-700',
  },
  intermediate: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
  },
  final: {
    bg: 'bg-purple-50',
    border: 'border-purple-500',
    text: 'text-purple-700',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
  },
};

function formatStateName(state: string): string {
  return state.replace(/_/g, ' ');
}

function StateNode({
  state,
  isCurrent,
  transitions,
}: {
  state: WorkflowState;
  isCurrent: boolean;
  transitions: WorkflowTransition[];
}) {
  const stateType = state.type || 'intermediate';
  const colors = stateTypeColors[stateType] || stateTypeColors.intermediate;
  const outgoingTransitions = transitions.filter((t) => t.fromState === state.name);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative px-4 py-3 rounded-lg border-2 min-w-[140px]
                   ${colors.bg} ${colors.border}
                   ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`}
      >
        {/* Current indicator */}
        {isCurrent && (
          <div className="absolute -top-2 -right-2">
            <CheckCircleIcon className="w-5 h-5 text-blue-600" />
          </div>
        )}

        {/* State name */}
        <p className={`text-sm font-medium text-center ${colors.text}`}>
          {formatStateName(state.name)}
        </p>

        {/* State type badge */}
        <p className="text-xs text-center text-gray-500 mt-1 capitalize">
          {stateType === 'initial' ? 'Inicial' : stateType === 'final' ? 'Final' : ''}
        </p>
      </div>

      {/* Outgoing transitions */}
      {outgoingTransitions.length > 0 && (
        <div className="flex flex-col gap-1">
          {outgoingTransitions.map((transition) => (
            <div
              key={transition.id}
              className="flex items-center gap-2 text-xs text-gray-500"
              title={transition.description || transition.name}
            >
              <ArrowRightIcon className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{transition.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WorkflowDiagram({
  states,
  transitions,
  currentState,
  className = '',
}: WorkflowDiagramProps) {
  if (states.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>Nenhum estado definido</p>
      </div>
    );
  }

  // Sort states: initial first, then intermediate, then final
  const sortedStates = [...states].sort((a, b) => {
    const typeOrder: Record<string, number> = { initial: 0, intermediate: 1, final: 2, error: 3 };
    const aType = a.type || 'intermediate';
    const bType = b.type || 'intermediate';
    return (typeOrder[aType] ?? 1) - (typeOrder[bType] ?? 1);
  });

  // Group states by type for flow visualization
  const initialStates = sortedStates.filter((s) => s.type === 'initial');
  const intermediateStates = sortedStates.filter((s) => !s.type || s.type === 'intermediate');
  const finalStates = sortedStates.filter((s) => s.type === 'final' || s.type === 'error');

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Diagrama do Workflow</h3>

      {/* Flow visualization */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 overflow-x-auto">
        <div className="flex items-start gap-8 min-w-max">
          {/* Initial states */}
          {initialStates.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Inicio
              </p>
              {initialStates.map((state) => (
                <StateNode
                  key={state.id}
                  state={state}
                  isCurrent={currentState === state.name}
                  transitions={transitions}
                />
              ))}
            </div>
          )}

          {/* Connector */}
          {initialStates.length > 0 && intermediateStates.length > 0 && (
            <div className="flex items-center pt-8">
              <div className="w-8 h-0.5 bg-gray-300" />
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}

          {/* Intermediate states */}
          {intermediateStates.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Em Andamento
              </p>
              {intermediateStates.map((state) => (
                <StateNode
                  key={state.id}
                  state={state}
                  isCurrent={currentState === state.name}
                  transitions={transitions}
                />
              ))}
            </div>
          )}

          {/* Connector */}
          {intermediateStates.length > 0 && finalStates.length > 0 && (
            <div className="flex items-center pt-8">
              <div className="w-8 h-0.5 bg-gray-300" />
              <ArrowRightIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}

          {/* Final states */}
          {finalStates.length > 0 && (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Conclusao
              </p>
              {finalStates.map((state) => (
                <StateNode
                  key={state.id}
                  state={state}
                  isCurrent={currentState === state.name}
                  transitions={transitions}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600">Estado Inicial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">Estado Intermediario</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span className="text-gray-600">Estado Final</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-600">Estado de Erro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded ring-2 ring-blue-500" />
          <span className="text-gray-600">Estado Atual</span>
        </div>
      </div>
    </div>
  );
}
