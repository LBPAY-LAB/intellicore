/**
 * WorkflowTransitionButtons Component
 * Sprint 12 - US-061: Workflow Visualization
 *
 * Displays available transitions as action buttons.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  ArrowRightIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { AvailableTransition } from '@/lib/graphql/workflows';

interface WorkflowTransitionButtonsProps {
  transitions: AvailableTransition[];
  onTransition: (
    transitionId: string,
    comment?: string,
    data?: Record<string, unknown>
  ) => Promise<boolean>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

interface CommentDialogProps {
  transition: AvailableTransition;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

function CommentDialog({ transition, onConfirm, onCancel }: CommentDialogProps) {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {transition.name}
        </h3>
        {transition.description && (
          <p className="text-sm text-gray-600 mb-4">{transition.description}</p>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario {transition.requiresComment ? '(obrigatorio)' : '(opcional)'}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Digite um comentario..."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                       text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(comment)}
            disabled={transition.requiresComment && !comment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowTransitionButtons({
  transitions,
  onTransition,
  loading = false,
  disabled = false,
  className = '',
}: WorkflowTransitionButtonsProps) {
  const [pendingTransition, setPendingTransition] = useState<AvailableTransition | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  const handleClick = useCallback(
    async (transition: AvailableTransition) => {
      if (transition.requiresComment) {
        setPendingTransition(transition);
        return;
      }

      setExecuting(transition.id);
      try {
        await onTransition(transition.id);
      } finally {
        setExecuting(null);
      }
    },
    [onTransition]
  );

  const handleConfirmWithComment = useCallback(
    async (comment: string) => {
      if (!pendingTransition) return;

      setPendingTransition(null);
      setExecuting(pendingTransition.id);

      try {
        await onTransition(pendingTransition.id, comment);
      } finally {
        setExecuting(null);
      }
    },
    [pendingTransition, onTransition]
  );

  if (transitions.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {transitions.map((transition) => {
          const isExecuting = executing === transition.id;

          return (
            <button
              key={transition.id}
              type="button"
              onClick={() => handleClick(transition)}
              disabled={disabled || loading || isExecuting}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         text-sm font-medium transition-colors
                         ${
                           isExecuting
                             ? 'bg-blue-600 text-white'
                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                         }
                         disabled:opacity-50 disabled:cursor-not-allowed`}
              title={transition.description}
            >
              {isExecuting ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : transition.requiresComment ? (
                <ChatBubbleLeftIcon className="w-4 h-4" />
              ) : (
                <ArrowRightIcon className="w-4 h-4" />
              )}
              {transition.name}
              <span className="text-xs text-gray-500">
                → {transition.toState.replace(/_/g, ' ')}
              </span>
            </button>
          );
        })}
      </div>

      {pendingTransition && (
        <CommentDialog
          transition={pendingTransition}
          onConfirm={handleConfirmWithComment}
          onCancel={() => setPendingTransition(null)}
        />
      )}
    </>
  );
}
