'use client';

/**
 * FieldExtractionPreview Component
 * Sprint 9 - US-045: Validation Feedback UI
 *
 * Shows extracted field values from free-text with confidence indicators.
 */

import { useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ExtractedField {
  value: string | number | boolean | null;
  confidence: number;
  sourceText?: string;
}

interface FieldDefinition {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface FieldExtractionPreviewProps {
  fields: FieldDefinition[];
  extractedFields: Record<string, ExtractedField>;
  unmatchedText?: string;
  warnings?: string[];
  onFieldAccept?: (fieldName: string, value: unknown) => void;
  onFieldReject?: (fieldName: string) => void;
  onFieldEdit?: (fieldName: string, newValue: unknown) => void;
  isLoading?: boolean;
  className?: string;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600 bg-green-50';
  if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return 'Alta';
  if (confidence >= 0.5) return 'Media';
  return 'Baixa';
}

export function FieldExtractionPreview({
  fields,
  extractedFields,
  unmatchedText,
  warnings = [],
  onFieldAccept,
  onFieldReject,
  onFieldEdit,
  isLoading = false,
  className = '',
}: FieldExtractionPreviewProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [acceptedFields, setAcceptedFields] = useState<Set<string>>(new Set());
  const [rejectedFields, setRejectedFields] = useState<Set<string>>(new Set());

  const handleAccept = (fieldName: string) => {
    setAcceptedFields(prev => new Set(prev).add(fieldName));
    setRejectedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
    onFieldAccept?.(fieldName, extractedFields[fieldName]?.value);
  };

  const handleReject = (fieldName: string) => {
    setRejectedFields(prev => new Set(prev).add(fieldName));
    setAcceptedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldName);
      return newSet;
    });
    onFieldReject?.(fieldName);
  };

  const startEditing = (fieldName: string) => {
    setEditingField(fieldName);
    setEditValue(String(extractedFields[fieldName]?.value ?? ''));
  };

  const saveEdit = (fieldName: string) => {
    onFieldEdit?.(fieldName, editValue);
    setAcceptedFields(prev => new Set(prev).add(fieldName));
    setEditingField(null);
  };

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-6 w-6 animate-pulse text-purple-500" />
          <div>
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-100"></div>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-100 p-4">
              <div className="h-4 w-24 rounded bg-gray-200"></div>
              <div className="mt-2 h-8 w-full rounded bg-gray-100"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 p-4">
        <SparklesIcon className="h-6 w-6 text-purple-500" />
        <div>
          <h3 className="font-medium text-gray-900">Campos Extraidos</h3>
          <p className="text-sm text-gray-500">
            Revise os valores extraidos antes de confirmar
          </p>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="border-b border-gray-100 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-yellow-500" />
            <div>
              <p className="font-medium text-yellow-800">Avisos de Extracao</p>
              <ul className="mt-1 space-y-1 text-sm text-yellow-700">
                {warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Field List */}
      <div className="divide-y divide-gray-100">
        {fields.map(field => {
          const extracted = extractedFields[field.name];
          const hasValue = extracted && extracted.value !== null;
          const isAccepted = acceptedFields.has(field.name);
          const isRejected = rejectedFields.has(field.name);
          const isEditing = editingField === field.name;

          return (
            <div
              key={field.name}
              className={`p-4 transition-colors ${
                isAccepted ? 'bg-green-50' :
                isRejected ? 'bg-red-50' :
                ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{field.name}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
                        obrigatorio
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{field.description}</p>

                  {/* Extracted Value */}
                  {isEditing ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(field.name)}
                        className="rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : hasValue ? (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-50 px-2 py-1 font-mono text-sm text-purple-700">
                          {String(extracted.value)}
                        </span>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${getConfidenceColor(extracted.confidence)}`}>
                          {getConfidenceLabel(extracted.confidence)} ({Math.round(extracted.confidence * 100)}%)
                        </span>
                      </div>
                      {extracted.sourceText && (
                        <p className="mt-1 text-xs text-gray-400">
                          Fonte: &ldquo;{extracted.sourceText}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-400">
                        Nao encontrado
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {hasValue && !isEditing && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAccept(field.name)}
                      className={`rounded-md p-2 transition-colors ${
                        isAccepted
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                      }`}
                      title="Aceitar valor"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleReject(field.name)}
                      className={`rounded-md p-2 transition-colors ${
                        isRejected
                          ? 'bg-red-100 text-red-600'
                          : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                      }`}
                      title="Rejeitar valor"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => startEditing(field.name)}
                      className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      title="Editar valor"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmatched Text */}
      {unmatchedText && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-600">Texto nao mapeado:</p>
          <p className="mt-1 text-sm italic text-gray-500">&ldquo;{unmatchedText}&rdquo;</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-4">
        <div className="text-sm text-gray-500">
          {acceptedFields.size} aceitos, {rejectedFields.size} rejeitados de {fields.length} campos
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fields.forEach(f => {
                if (extractedFields[f.name]?.value !== null) {
                  handleAccept(f.name);
                }
              });
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Aceitar Todos
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldExtractionPreview;
