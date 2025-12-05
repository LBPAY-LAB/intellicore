'use client';

/**
 * ValidationFeedback Component
 * Sprint 9 - US-045: Validation Feedback UI
 *
 * Displays LLM validation results with visual feedback and recommendations.
 */

import { useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Types for validation results
interface ValidationResult {
  rule: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedFields?: string[];
}

interface ValidationFeedbackProps {
  compliant: boolean;
  validationResults: ValidationResult[];
  riskScore?: number;
  recommendations?: string[];
  requiresReview?: boolean;
  isLoading?: boolean;
  className?: string;
}

const severityConfig = {
  error: {
    icon: ExclamationCircleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    label: 'Erro',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    label: 'Alerta',
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    label: 'Info',
  },
};

export function ValidationFeedback({
  compliant,
  validationResults,
  riskScore = 0,
  recommendations = [],
  requiresReview = false,
  isLoading = false,
  className = '',
}: ValidationFeedbackProps) {
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());
  const [showRecommendations, setShowRecommendations] = useState(true);

  const toggleResult = (index: number) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedResults(newExpanded);
  };

  const errorCount = validationResults.filter(r => !r.passed && r.severity === 'error').length;
  const warningCount = validationResults.filter(r => !r.passed && r.severity === 'warning').length;
  const infoCount = validationResults.filter(r => !r.passed && r.severity === 'info').length;
  const passedCount = validationResults.filter(r => r.passed).length;

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <SparklesIcon className="h-5 w-5 animate-pulse text-purple-500" />
          <div className="flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-gray-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border ${compliant ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-current/10 p-4">
        <div className="flex items-center gap-3">
          {compliant ? (
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          ) : (
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
          )}
          <div>
            <h3 className={`font-medium ${compliant ? 'text-green-800' : 'text-red-800'}`}>
              {compliant ? 'Validacao Aprovada' : 'Validacao com Problemas'}
            </h3>
            <p className={`text-sm ${compliant ? 'text-green-600' : 'text-red-600'}`}>
              {passedCount} regras aprovadas
              {errorCount > 0 && `, ${errorCount} erros`}
              {warningCount > 0 && `, ${warningCount} alertas`}
              {infoCount > 0 && `, ${infoCount} infos`}
            </p>
          </div>
        </div>

        {/* Risk Score Badge */}
        {riskScore > 0 && (
          <div className={`rounded-full px-3 py-1 text-sm font-medium ${
            riskScore >= 0.7 ? 'bg-red-100 text-red-700' :
            riskScore >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            Risco: {Math.round(riskScore * 100)}%
          </div>
        )}
      </div>

      {/* Validation Results */}
      <div className="divide-y divide-current/10">
        {validationResults.map((result, index) => {
          const config = severityConfig[result.severity];
          const Icon = config.icon;
          const isExpanded = expandedResults.has(index);

          return (
            <div
              key={index}
              className={`${result.passed ? 'bg-white/50' : config.bgColor} transition-colors`}
            >
              <button
                onClick={() => toggleResult(index)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-black/5"
              >
                {result.passed ? (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-green-500" />
                ) : (
                  <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${result.passed ? 'text-green-700' : config.textColor}`}>
                    {result.rule}
                  </p>
                  {!isExpanded && (
                    <p className={`truncate text-sm ${result.passed ? 'text-green-600' : config.textColor} opacity-75`}>
                      {result.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!result.passed && (
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                      {config.label}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-current/5 px-3 pb-3 pt-2">
                  <p className={`text-sm ${result.passed ? 'text-green-700' : config.textColor}`}>
                    {result.message}
                  </p>
                  {result.affectedFields && result.affectedFields.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-500">Campos afetados:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {result.affectedFields.map((field, i) => (
                          <span
                            key={i}
                            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="border-t border-current/10">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex w-full items-center justify-between p-3 hover:bg-black/5"
          >
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-700">
                Recomendacoes ({recommendations.length})
              </span>
            </div>
            {showRecommendations ? (
              <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {showRecommendations && (
            <ul className="space-y-2 px-3 pb-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400"></span>
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Review Required Badge */}
      {requiresReview && (
        <div className="border-t border-current/10 bg-orange-50 p-3">
          <div className="flex items-center gap-2 text-orange-700">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="font-medium">Revisao manual necessaria</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationFeedback;
