/**
 * ExtractionPreview Component
 * Sprint 11 - US-053 & US-054: LLM Extraction Integration & Field Mapping Preview
 *
 * Displays extracted field values with confidence indicators,
 * allows editing, accepting, and rejecting extracted values.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Field } from '@/lib/graphql/instances';

interface ExtractedField {
  value: string | number | boolean | null;
  confidence: number;
  sourceText?: string;
}

interface ExtractionPreviewProps {
  fields: Field[];
  extractedFields: Record<string, ExtractedField>;
  unmatchedText?: string;
  warnings?: string[];
  isLoading?: boolean;
  onFieldAccept: (fieldName: string, value: unknown) => void;
  onFieldReject: (fieldName: string) => void;
  onFieldEdit: (fieldName: string, value: unknown) => void;
  onRetryExtraction?: () => void;
  className?: string;
}

type FieldStatus = 'pending' | 'accepted' | 'rejected' | 'editing';

export function ExtractionPreview({
  fields,
  extractedFields,
  unmatchedText,
  warnings = [],
  isLoading = false,
  onFieldAccept,
  onFieldReject,
  onFieldEdit,
  onRetryExtraction,
  className = '',
}: ExtractionPreviewProps) {
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-700 bg-green-100 border border-green-300';
    if (confidence >= 0.7) return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
    return 'text-red-700 bg-red-100 border border-red-300';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.9) return 'Alta';
    if (confidence >= 0.7) return 'Média';
    return 'Baixa';
  };

  const handleAccept = useCallback(
    (fieldName: string, value: unknown) => {
      setFieldStatuses((prev) => ({ ...prev, [fieldName]: 'accepted' }));
      onFieldAccept(fieldName, value);
    },
    [onFieldAccept]
  );

  const handleReject = useCallback(
    (fieldName: string) => {
      setFieldStatuses((prev) => ({ ...prev, [fieldName]: 'rejected' }));
      onFieldReject(fieldName);
    },
    [onFieldReject]
  );

  const handleStartEdit = useCallback(
    (fieldName: string, currentValue: unknown) => {
      setFieldStatuses((prev) => ({ ...prev, [fieldName]: 'editing' }));
      setEditValues((prev) => ({
        ...prev,
        [fieldName]: currentValue?.toString() || '',
      }));
    },
    []
  );

  const handleSaveEdit = useCallback(
    (fieldName: string) => {
      const newValue = editValues[fieldName];
      setFieldStatuses((prev) => ({ ...prev, [fieldName]: 'accepted' }));
      onFieldEdit(fieldName, newValue);
    },
    [editValues, onFieldEdit]
  );

  const handleCancelEdit = useCallback((fieldName: string) => {
    setFieldStatuses((prev) => ({ ...prev, [fieldName]: 'pending' }));
    setEditValues((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const handleAcceptAll = useCallback(() => {
    const newStatuses: Record<string, FieldStatus> = {};
    Object.entries(extractedFields).forEach(([fieldName, extracted]) => {
      if (extracted.confidence >= 0.7 && fieldStatuses[fieldName] !== 'rejected') {
        newStatuses[fieldName] = 'accepted';
        onFieldAccept(fieldName, extracted.value);
      }
    });
    setFieldStatuses((prev) => ({ ...prev, ...newStatuses }));
  }, [extractedFields, fieldStatuses, onFieldAccept]);

  // Stats
  const totalFields = fields.length;
  const extractedCount = Object.keys(extractedFields).length;
  const acceptedCount = Object.values(fieldStatuses).filter((s) => s === 'accepted').length;
  const rejectedCount = Object.values(fieldStatuses).filter((s) => s === 'rejected').length;
  const pendingCount = extractedCount - acceptedCount - rejectedCount;

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-700">Extraindo campos com LLM...</p>
          <p className="text-xs text-gray-500">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h3 className="font-medium text-gray-900">Campos Extraídos</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {extractedCount} de {totalFields} campos identificados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="flex items-center gap-3 text-xs mr-4">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              {acceptedCount}
            </span>
            <span className="flex items-center gap-1 text-red-600">
              <XCircleIcon className="w-4 h-4" />
              {rejectedCount}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              Pendente: {pendingCount}
            </span>
          </div>

          {/* Actions */}
          {onRetryExtraction && (
            <button
              type="button"
              onClick={onRetryExtraction}
              className="flex items-center gap-1 px-3 py-1.5 text-xs
                         text-gray-700 hover:text-gray-900
                         bg-gray-100 hover:bg-gray-200 rounded border border-gray-300
                         transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Re-extrair
            </button>
          )}

          <button
            type="button"
            onClick={handleAcceptAll}
            disabled={pendingCount === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs
                       text-white bg-green-600 hover:bg-green-700 rounded
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircleIcon className="w-4 h-4" />
            Aceitar Alta Confiança
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-xs text-yellow-700">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="divide-y divide-gray-200">
        {fields.map((field) => {
          const extracted = extractedFields[field.name];
          const status = fieldStatuses[field.name] || 'pending';
          const isEditing = status === 'editing';

          return (
            <div
              key={field.id}
              className={`
                px-4 py-3 transition-colors
                ${status === 'accepted' ? 'bg-green-50' : ''}
                ${status === 'rejected' ? 'bg-red-50 opacity-50' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Field Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{field.name}</span>
                    <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200">
                      {field.field_type}
                    </span>
                    {field.is_required && (
                      <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded border border-red-200">
                        Obrigatório
                      </span>
                    )}
                    {status === 'accepted' && (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    )}
                    {status === 'rejected' && (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                  </div>

                  {field.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                  )}

                  {/* Extracted Value */}
                  {extracted ? (
                    <div className="mt-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editValues[field.name] || ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded
                                       text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(field.name)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Salvar"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelEdit(field.name)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Cancelar"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded text-gray-900 text-sm font-mono">
                            {extracted.value?.toString() || '(vazio)'}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded ${getConfidenceColor(
                              extracted.confidence
                            )}`}
                          >
                            {getConfidenceLabel(extracted.confidence)} ({Math.round(extracted.confidence * 100)}%)
                          </span>
                        </div>
                      )}

                      {/* Source Text */}
                      {extracted.sourceText && !isEditing && (
                        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          Fonte: &quot;{extracted.sourceText}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 rounded text-gray-500 text-sm inline-block">
                        Não identificado
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {extracted && status === 'pending' && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAccept(field.name, extracted.value)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="Aceitar valor"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(field.name, extracted.value)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Editar valor"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(field.name)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Rejeitar valor"
                    >
                      <XCircleIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmatched Text */}
      {unmatchedText && unmatchedText.trim() && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Texto não mapeado:
          </p>
          <p className="text-xs text-gray-500 font-mono whitespace-pre-wrap">
            {unmatchedText}
          </p>
        </div>
      )}
    </div>
  );
}

export default ExtractionPreview;
