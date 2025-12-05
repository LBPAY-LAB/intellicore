/**
 * FreeTextInput Component
 * Sprint 11 - US-052: Free-text Input Component
 *
 * Multi-line text area for entering free-text data to be parsed by LLM.
 * Includes character count, placeholder examples, and paste handling.
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { DocumentTextIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  examples?: string[];
  onPaste?: (text: string) => void;
}

export function FreeTextInput({
  value,
  onChange,
  placeholder = 'Cole ou digite os dados aqui...\n\nExemplo:\nNome: João Silva\nCPF: 123.456.789-00\nEmail: joao@exemplo.com',
  maxLength = 10000,
  minLength = 10,
  disabled = false,
  className = '',
  label = 'Dados de Entrada',
  helperText = 'Digite ou cole as informações que deseja extrair. O sistema irá identificar automaticamente os campos.',
  examples = [],
  onPaste,
}: FreeTextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        onChange(newValue);
      }
    },
    [onChange, maxLength]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text');
      setIsPasting(true);

      // Allow default paste behavior
      setTimeout(() => {
        setIsPasting(false);
        if (onPaste) {
          onPaste(pastedText);
        }
      }, 100);
    },
    [onPaste]
  );

  const handleClear = useCallback(() => {
    onChange('');
    textareaRef.current?.focus();
  }, [onChange]);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(value + text);
        if (onPaste) {
          onPaste(text);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  }, [onChange, onPaste, value]);

  const handleExampleClick = useCallback(
    (example: string) => {
      onChange(example);
      textareaRef.current?.focus();
    },
    [onChange]
  );

  const characterCount = value.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isBelowMin = characterCount > 0 && characterCount < minLength;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Paste Button */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900
                       bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Colar do clipboard"
          >
            <ClipboardDocumentIcon className="w-4 h-4" />
            Colar
          </button>

          {/* Clear Button */}
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600
                         bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Limpar"
            >
              <XMarkIcon className="w-4 h-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">{helperText}</p>

      {/* Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={12}
          className={`
            w-full px-4 py-3 bg-white border rounded-lg resize-y
            text-gray-900 placeholder-gray-400 font-mono text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isFocused ? 'border-blue-500' : 'border-gray-300'}
            ${isPasting ? 'ring-2 ring-green-500' : ''}
            ${isBelowMin ? 'border-yellow-500' : ''}
          `}
          style={{ minHeight: '200px', maxHeight: '500px' }}
        />

        {/* Pasting Indicator */}
        {isPasting && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded animate-pulse">
            Colando...
          </div>
        )}
      </div>

      {/* Character Count and Validation */}
      <div className="flex items-center justify-between text-xs">
        <div>
          {isBelowMin && (
            <span className="text-yellow-600">
              Mínimo de {minLength} caracteres necessário
            </span>
          )}
        </div>
        <div
          className={`
            ${isNearLimit ? 'text-yellow-600' : 'text-gray-500'}
            ${characterCount >= maxLength ? 'text-red-500' : ''}
          `}
        >
          {characterCount.toLocaleString()} / {maxLength.toLocaleString()} caracteres
        </div>
      </div>

      {/* Examples */}
      {examples.length > 0 && value.length === 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-2">Exemplos de entrada:</p>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="block w-full text-left px-3 py-2 text-xs text-gray-700
                           bg-white hover:bg-gray-100 border border-gray-300
                           rounded transition-colors"
              >
                <span className="line-clamp-2 font-mono">{example}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FreeTextInput;
