/**
 * useLLMValidation Hook
 * Sprint 9 - US-045: Validation Feedback UI
 *
 * React hook for interacting with the LLM Validation API.
 */

import { useState, useCallback } from 'react';

const LLM_GATEWAY_URL = process.env.NEXT_PUBLIC_LLM_GATEWAY_URL || 'http://localhost:8001';

// Types
interface FieldDefinition {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface ExtractedField {
  value: string | number | boolean | null;
  confidence: number;
  sourceText?: string;
}

// Raw API response type (snake_case)
interface RawExtractedField {
  value: string | number | boolean | null;
  confidence: number;
  source_text?: string;
}

interface ExtractFieldsResult {
  extractedFields: Record<string, ExtractedField>;
  unmatchedText?: string;
  warnings: string[];
  model: string;
}

interface ValidationResult {
  rule: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedFields?: string[];
}

interface BusinessRulesResult {
  compliant: boolean;
  validationResults: ValidationResult[];
  riskScore: number;
  recommendations: string[];
  requiresReview: boolean;
  model: string;
}

interface RecognizedEntity {
  type: string;
  value: string;
  normalized?: string;
  position?: { start: number; end: number };
  confidence: number;
}

interface EntityRecognitionResult {
  entities: RecognizedEntity[];
  textWithAnnotations?: string;
  model: string;
}

interface UseLLMValidationReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Methods
  extractFields: (
    objectTypeName: string,
    objectTypeDescription: string,
    fields: FieldDefinition[],
    inputText: string
  ) => Promise<ExtractFieldsResult | null>;

  validateBusinessRules: (
    data: Record<string, unknown>,
    objectType: string,
    operation?: string,
    ragContext?: string,
    customRules?: string
  ) => Promise<BusinessRulesResult | null>;

  recognizeEntities: (text: string) => Promise<EntityRecognitionResult | null>;

  // Reset
  clearError: () => void;
}

export function useLLMValidation(): UseLLMValidationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractFields = useCallback(
    async (
      objectTypeName: string,
      objectTypeDescription: string,
      fields: FieldDefinition[],
      inputText: string
    ): Promise<ExtractFieldsResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${LLM_GATEWAY_URL}/api/v1/validation/extract-fields`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            object_type_name: objectTypeName,
            object_type_description: objectTypeDescription,
            fields: fields.map(f => ({
              name: f.name,
              type: f.type,
              description: f.description,
              required: f.required ?? false,
            })),
            input_text: inputText,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }

        const data = await response.json();

        // Transform response to camelCase
        return {
          extractedFields: Object.fromEntries(
            Object.entries(data.extracted_fields || {}).map(([key, val]) => {
              const v = val as RawExtractedField;
              return [key, {
                value: v.value,
                confidence: v.confidence,
                sourceText: v.source_text,
              }];
            })
          ),
          unmatchedText: data.unmatched_text,
          warnings: data.warnings || [],
          model: data.model,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const validateBusinessRules = useCallback(
    async (
      data: Record<string, unknown>,
      objectType: string,
      operation = 'create',
      ragContext?: string,
      customRules?: string
    ): Promise<BusinessRulesResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${LLM_GATEWAY_URL}/api/v1/validation/validate-business-rules`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data,
              object_type: objectType,
              operation,
              rag_context: ragContext,
              custom_rules: customRules,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }

        const result = await response.json();

        return {
          compliant: result.compliant,
          validationResults: (result.validation_results || []).map((vr: Record<string, unknown>) => ({
            rule: vr.rule,
            passed: vr.passed,
            severity: vr.severity,
            message: vr.message,
            affectedFields: vr.affected_fields,
          })),
          riskScore: result.risk_score,
          recommendations: result.recommendations || [],
          requiresReview: result.requires_review,
          model: result.model,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const recognizeEntities = useCallback(
    async (text: string): Promise<EntityRecognitionResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${LLM_GATEWAY_URL}/api/v1/validation/recognize-entities`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP error ${response.status}`);
        }

        const result = await response.json();

        return {
          entities: (result.entities || []).map((e: Record<string, unknown>) => ({
            type: e.type,
            value: e.value,
            normalized: e.normalized,
            position: e.position,
            confidence: e.confidence,
          })),
          textWithAnnotations: result.text_with_annotations,
          model: result.model,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    extractFields,
    validateBusinessRules,
    recognizeEntities,
    clearError,
  };
}

export default useLLMValidation;
