'use client';

import React, { useState } from 'react';
import { useDictValidation, type DictValidationResult } from '@/hooks/useAIAssistant';

interface DictValidationPanelProps {
  className?: string;
}

type RequestType = 'REGISTRO_CHAVE' | 'EXCLUSAO_CHAVE' | 'PORTABILIDADE' | 'REIVINDICACAO';
type KeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'EVP';

const REQUEST_TYPES: { value: RequestType; label: string }[] = [
  { value: 'REGISTRO_CHAVE', label: 'Registro de Chave' },
  { value: 'EXCLUSAO_CHAVE', label: 'Exclusão de Chave' },
  { value: 'PORTABILIDADE', label: 'Portabilidade' },
  { value: 'REIVINDICACAO', label: 'Reivindicação' },
];

const KEY_TYPES: { value: KeyType; label: string; placeholder: string }[] = [
  { value: 'CPF', label: 'CPF', placeholder: '000.000.000-00' },
  { value: 'CNPJ', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
  { value: 'EMAIL', label: 'E-mail', placeholder: 'email@exemplo.com' },
  { value: 'TELEFONE', label: 'Telefone', placeholder: '+5511999999999' },
  { value: 'EVP', label: 'Chave Aleatória (EVP)', placeholder: 'uuid...' },
];

export function DictValidationPanel({ className = '' }: DictValidationPanelProps) {
  const { validate, loading, result, error: validationError } = useDictValidation();

  const [formData, setFormData] = useState({
    requestType: 'REGISTRO_CHAVE' as RequestType,
    keyType: 'CPF' as KeyType,
    keyValue: '',
    participantIspb: '',
    accountType: '',
    accountNumber: '',
    branchNumber: '',
    ownerName: '',
    ownerDocument: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validate({
      requestType: formData.requestType,
      keyType: formData.keyType,
      keyValue: formData.keyValue,
      participantIspb: formData.participantIspb || undefined,
      accountType: formData.accountType || undefined,
      accountNumber: formData.accountNumber || undefined,
      branchNumber: formData.branchNumber || undefined,
      ownerName: formData.ownerName || undefined,
      ownerDocument: formData.ownerDocument || undefined,
    });
  };

  const getKeyPlaceholder = () => {
    const keyType = KEY_TYPES.find((k) => k.value === formData.keyType);
    return keyType?.placeholder || '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Validador de Requisições DICT
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Valide requisições PIX/DICT contra as regras do BACEN usando IA
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Requisição
          </label>
          <select
            value={formData.requestType}
            onChange={(e) => setFormData({ ...formData, requestType: e.target.value as RequestType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REQUEST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Key Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Chave
          </label>
          <select
            value={formData.keyType}
            onChange={(e) => setFormData({ ...formData, keyType: e.target.value as KeyType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {KEY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Key Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor da Chave *
          </label>
          <input
            type="text"
            value={formData.keyValue}
            onChange={(e) => setFormData({ ...formData, keyValue: e.target.value })}
            placeholder={getKeyPlaceholder()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* ISPB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ISPB do Participante
          </label>
          <input
            type="text"
            value={formData.participantIspb}
            onChange={(e) => setFormData({ ...formData, participantIspb: e.target.value })}
            placeholder="00000000"
            maxLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Account Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agência
            </label>
            <input
              type="text"
              value={formData.branchNumber}
              onChange={(e) => setFormData({ ...formData, branchNumber: e.target.value })}
              placeholder="0001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta
            </label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="12345-6"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Conta
          </label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="CACC">Conta Corrente (CACC)</option>
            <option value="SVGS">Conta Poupança (SVGS)</option>
            <option value="TRAN">Conta de Pagamento (TRAN)</option>
            <option value="SLRY">Conta Salário (SLRY)</option>
          </select>
        </div>

        {/* Owner Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Titular
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            placeholder="Nome completo"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF/CNPJ do Titular
          </label>
          <input
            type="text"
            value={formData.ownerDocument}
            onChange={(e) => setFormData({ ...formData, ownerDocument: e.target.value })}
            placeholder="000.000.000-00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.keyValue}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Validando...
            </>
          ) : (
            'Validar Requisição'
          )}
        </button>
      </form>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{validationError.message}</p>
        </div>
      )}

      {/* Validation Result */}
      {result && <ValidationResult result={result} />}
    </div>
  );
}

interface ValidationResultProps {
  result: DictValidationResult;
}

function ValidationResult({ result }: ValidationResultProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Score and Status */}
      <div className={`p-4 rounded-lg ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.isValid ? (
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={`font-semibold ${result.isValid ? 'text-green-700' : 'text-red-700'}`}>
              {result.isValid ? 'Requisição Válida' : 'Requisição Inválida'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{result.validationScore}</div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>

      {/* Processing Time */}
      <div className="text-xs text-gray-500 text-right">
        Processado em {result.processingTimeMs}ms
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-red-700 text-sm">Erros ({result.errors.length})</h3>
          {result.errors.map((error, index) => (
            <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-start gap-2">
                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono">
                  {error.field}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error.message}</p>
                  {error.suggestion && (
                    <p className="text-xs text-red-600 mt-1">💡 {error.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-yellow-700 text-sm">Avisos ({result.warnings.length})</h3>
          {result.warnings.map((warning, index) => (
            <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start gap-2">
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono">
                  {warning.field}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">{warning.message}</p>
                  {warning.suggestion && (
                    <p className="text-xs text-yellow-600 mt-1">💡 {warning.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-blue-700 text-sm">Sugestões ({result.suggestions.length})</h3>
          {result.suggestions.map((suggestion, index) => (
            <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="space-y-1">
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono">
                  {suggestion.field}
                </span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 line-through">{suggestion.currentValue}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-blue-700 font-medium">{suggestion.suggestedValue}</span>
                </div>
                <p className="text-xs text-blue-600">{suggestion.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sources */}
      {result.sources.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 text-sm">Fontes Consultadas ({result.sources.length})</h3>
          {result.sources.map((source, index) => (
            <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{source.documentName}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{source.chunkText}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      Relevância: {Math.round(source.score * 100)}%
                    </span>
                    {source.pageNumber && (
                      <span className="text-xs text-gray-400">
                        Página {source.pageNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DictValidationPanel;
