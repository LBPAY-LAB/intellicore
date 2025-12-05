/**
 * Create Instance Page
 * Sprint 11 - US-056: Instance Creation Flow
 *
 * Multi-step wizard for creating instances from free-text input.
 * Steps: Select Type -> Input Text -> Extract Fields -> Validate -> Confirm
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { useLLMValidation } from '@/hooks/useLLMValidation';
import { ValidationFeedback } from '@/components/validation/ValidationFeedback';

import { CreationStepper, CreationStep } from './components/CreationStepper';
import { ObjectTypeSelector } from './components/ObjectTypeSelector';
import { FreeTextInput } from './components/FreeTextInput';
import { ExtractionPreview } from './components/ExtractionPreview';

import {
  CREATE_INSTANCE,
  VALIDATE_INSTANCE_DATA,
  CreateInstanceInput,
  CreateInstanceResponse,
  ValidateInstanceDataResponse,
  ObjectTypeWithFields,
  InstanceStatus,
  Field,
} from '@/lib/graphql/instances';

interface ExtractedField {
  value: string | number | boolean | null;
  confidence: number;
  sourceText?: string;
}

export default function CreateInstancePage() {
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<CreationStep>('select');
  const [completedSteps, setCompletedSteps] = useState<CreationStep[]>([]);

  // Form state
  const [selectedObjectType, setSelectedObjectType] = useState<ObjectTypeWithFields | null>(null);
  const [freeText, setFreeText] = useState('');
  const [extractedFields, setExtractedFields] = useState<Record<string, ExtractedField>>({});
  const [acceptedFields, setAcceptedFields] = useState<Record<string, unknown>>({});
  const [unmatchedText, setUnmatchedText] = useState<string>('');
  const [extractionWarnings, setExtractionWarnings] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');

  // Validation state
  const [validationResult, setValidationResult] = useState<{
    compliant: boolean;
    validationResults: Array<{
      rule: string;
      passed: boolean;
      severity: 'error' | 'warning' | 'info';
      message: string;
      affectedFields?: string[];
    }>;
    riskScore: number;
    recommendations: string[];
    requiresReview: boolean;
  } | null>(null);

  // LLM Hook
  const { extractFields, validateBusinessRules, isLoading: llmLoading, error: llmError } = useLLMValidation();

  // GraphQL validation
  const { refetch: validateData, loading: validationLoading } = useQuery<ValidateInstanceDataResponse>(
    VALIDATE_INSTANCE_DATA,
    {
      skip: true,
    }
  );

  // GraphQL mutation
  const [createInstance, { loading: createLoading }] = useMutation<CreateInstanceResponse>(
    CREATE_INSTANCE,
    {
      onCompleted: (data) => {
        toast.success('Instância criada com sucesso!', {
          description: `ID: ${data.createInstance.id}`,
        });
        router.push('/backoffice/instances');
      },
      onError: (error) => {
        toast.error('Erro ao criar instância', {
          description: error.message,
        });
      },
    }
  );

  // Step navigation
  const goToStep = useCallback((step: CreationStep) => {
    setCurrentStep(step);
  }, []);

  const markStepCompleted = useCallback((step: CreationStep) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  }, []);

  // Step 1: Select Object Type
  const handleObjectTypeSelect = useCallback(
    (objectType: ObjectTypeWithFields | null) => {
      setSelectedObjectType(objectType);
      if (objectType) {
        markStepCompleted('select');
      }
    },
    [markStepCompleted]
  );

  const canProceedFromSelect = selectedObjectType !== null;

  // Step 2: Input Text
  const handleTextChange = useCallback((text: string) => {
    setFreeText(text);
  }, []);

  const canProceedFromInput = freeText.trim().length >= 10;

  // Step 3: Extract Fields
  const handleExtract = useCallback(async () => {
    if (!selectedObjectType || !freeText.trim()) return;

    const fields = selectedObjectType.fields.map((f) => ({
      name: f.name,
      type: f.field_type,
      description: f.description || '',
      required: f.is_required,
    }));

    const result = await extractFields(
      selectedObjectType.name,
      selectedObjectType.description || '',
      fields,
      freeText
    );

    if (result) {
      setExtractedFields(result.extractedFields);
      setUnmatchedText(result.unmatchedText || '');
      setExtractionWarnings(result.warnings);

      // Auto-accept high confidence fields
      const autoAccepted: Record<string, unknown> = {};
      Object.entries(result.extractedFields).forEach(([fieldName, extracted]) => {
        if (extracted.confidence >= 0.9) {
          autoAccepted[fieldName] = extracted.value;
        }
      });
      setAcceptedFields(autoAccepted);

      // Generate display name from first string field or use object type name
      const firstStringField = Object.entries(result.extractedFields).find(
        ([, v]) => typeof v.value === 'string' && v.confidence >= 0.8
      );
      if (firstStringField) {
        setDisplayName(String(firstStringField[1].value));
      } else {
        setDisplayName(`${selectedObjectType.name} - ${new Date().toLocaleDateString()}`);
      }

      markStepCompleted('input');
      goToStep('extract');
    }
  }, [selectedObjectType, freeText, extractFields, markStepCompleted, goToStep]);

  // Field actions
  const handleFieldAccept = useCallback((fieldName: string, value: unknown) => {
    setAcceptedFields((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleFieldReject = useCallback((fieldName: string) => {
    setAcceptedFields((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const handleFieldEdit = useCallback((fieldName: string, value: unknown) => {
    setAcceptedFields((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  const canProceedFromExtract = Object.keys(acceptedFields).length > 0;

  // Step 4: Validate
  const handleValidate = useCallback(async () => {
    if (!selectedObjectType || Object.keys(acceptedFields).length === 0) return;

    // Validate using LLM business rules
    const result = await validateBusinessRules(
      acceptedFields,
      selectedObjectType.name,
      'create'
    );

    if (result) {
      setValidationResult(result);
      markStepCompleted('extract');
      goToStep('validate');
    }
  }, [selectedObjectType, acceptedFields, validateBusinessRules, markStepCompleted, goToStep]);

  const canProceedFromValidate = validationResult?.compliant === true ||
    (validationResult && !validationResult.validationResults.some((r) => r.severity === 'error'));

  // Step 5: Confirm & Create
  const handleCreate = useCallback(async () => {
    if (!selectedObjectType) return;

    const input: CreateInstanceInput = {
      objectTypeId: selectedObjectType.id,
      data: acceptedFields,
      displayName: displayName || undefined,
      status: InstanceStatus.DRAFT,
    };

    await createInstance({ variables: { input } });
  }, [selectedObjectType, acceptedFields, displayName, createInstance]);

  // Examples for the free-text input
  const inputExamples = useMemo(() => {
    if (!selectedObjectType) return [];

    const fieldNames = selectedObjectType.fields.slice(0, 5).map((f) => f.name);
    return [
      fieldNames.map((name) => `${name}: [valor]`).join('\n'),
    ];
  }, [selectedObjectType]);

  const isLoading = llmLoading || validationLoading || createLoading;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push('/backoffice/instances')}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Nova Instância</h1>
                <p className="text-sm text-gray-600">
                  Crie uma instância a partir de texto livre
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              Extração com IA
            </div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <CreationStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Error Display */}
        {llmError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span>{llmError}</span>
            </div>
          </div>
        )}

        {/* Step: Select Object Type */}
        {currentStep === 'select' && (
          <div className="space-y-6">
            <ObjectTypeSelector
              selectedId={selectedObjectType?.id || null}
              onSelect={handleObjectTypeSelect}
            />

            {selectedObjectType && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="font-medium text-gray-900 mb-2">Campos do Tipo Selecionado</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedObjectType.fields.map((field) => (
                    <span
                      key={field.id}
                      className={`
                        px-2 py-1 text-xs rounded
                        ${field.is_required ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}
                      `}
                    >
                      {field.name}
                      <span className="ml-1 text-gray-500">({field.field_type})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => goToStep('input')}
                disabled={!canProceedFromSelect}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Input Text */}
        {currentStep === 'input' && (
          <div className="space-y-6">
            <FreeTextInput
              value={freeText}
              onChange={handleTextChange}
              examples={inputExamples}
              label={`Dados para ${selectedObjectType?.name || 'Instância'}`}
              helperText={`Digite ou cole as informações. O sistema irá extrair automaticamente os campos definidos em "${selectedObjectType?.name}".`}
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => goToStep('select')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                           hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>

              <button
                type="button"
                onClick={handleExtract}
                disabled={!canProceedFromInput || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg
                           hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {llmLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Extrair Campos
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Extract Fields */}
        {currentStep === 'extract' && (
          <div className="space-y-6">
            <ExtractionPreview
              fields={selectedObjectType?.fields || []}
              extractedFields={extractedFields}
              unmatchedText={unmatchedText}
              warnings={extractionWarnings}
              isLoading={llmLoading}
              onFieldAccept={handleFieldAccept}
              onFieldReject={handleFieldReject}
              onFieldEdit={handleFieldEdit}
              onRetryExtraction={handleExtract}
            />

            {/* Display Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome para identificar esta instância"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg
                           text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => goToStep('input')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                           hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>

              <button
                type="button"
                onClick={handleValidate}
                disabled={!canProceedFromExtract || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {llmLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    Validar Dados
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step: Validate */}
        {currentStep === 'validate' && validationResult && (
          <div className="space-y-6">
            <ValidationFeedback
              compliant={validationResult.compliant}
              validationResults={validationResult.validationResults}
              riskScore={validationResult.riskScore}
              recommendations={validationResult.recommendations}
              requiresReview={validationResult.requiresReview}
            />

            {/* Summary */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Resumo da Instância</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="text-gray-900">{selectedObjectType?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nome:</span>
                  <span className="text-gray-900">{displayName || '(não definido)'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Campos preenchidos:</span>
                  <span className="text-gray-900">{Object.keys(acceptedFields).length}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => goToStep('extract')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                           hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  markStepCompleted('validate');
                  goToStep('confirm');
                }}
                disabled={!canProceedFromValidate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuar
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {currentStep === 'confirm' && (
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Pronto para Criar</h3>
                  <p className="text-sm text-gray-600">
                    Revise os dados antes de confirmar a criação
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Objeto</p>
                    <p className="font-medium text-gray-900">{selectedObjectType?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nome de Exibição</p>
                    <p className="font-medium text-gray-900">{displayName || '(automático)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status Inicial</p>
                    <p className="font-medium text-yellow-600">RASCUNHO</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Campos</p>
                    <p className="font-medium text-gray-900">{Object.keys(acceptedFields).length} preenchidos</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Dados</p>
                  <pre className="p-4 bg-gray-50 rounded-lg text-xs text-gray-700 overflow-x-auto max-h-64 border border-gray-200">
                    {JSON.stringify(acceptedFields, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => goToStep('validate')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                           hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Voltar
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={createLoading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg
                           hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Criar Instância
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
