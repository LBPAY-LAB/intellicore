/**
 * ObjectTypeSelector Component
 * Sprint 11 - US-052: Free-text Input Component
 *
 * Dropdown selector for choosing the ObjectType to create an instance of.
 * Shows ObjectType name, description, and field count.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { CubeIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  GET_ALL_OBJECT_TYPES_WITH_FIELDS,
  GetAllObjectTypesWithFieldsResponse,
  ObjectTypeWithFields,
} from '@/lib/graphql/instances';

interface ObjectTypeSelectorProps {
  selectedId: string | null;
  onSelect: (objectType: ObjectTypeWithFields | null) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  error?: string;
}

export function ObjectTypeSelector({
  selectedId,
  onSelect,
  disabled = false,
  className = '',
  label = 'Tipo de Objeto',
  helperText = 'Selecione o tipo de objeto para criar uma nova instância',
  error,
}: ObjectTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error: queryError } = useQuery<GetAllObjectTypesWithFieldsResponse>(
    GET_ALL_OBJECT_TYPES_WITH_FIELDS,
    {
      variables: { first: 100 },
    }
  );

  const objectTypes = data?.objectTypes?.nodes?.filter((ot: ObjectTypeWithFields) => ot.is_active) || [];
  const selectedObjectType = objectTypes.find((ot: ObjectTypeWithFields) => ot.id === selectedId);

  const filteredObjectTypes = objectTypes.filter(
    (ot: ObjectTypeWithFields) =>
      ot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ot.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = useCallback(
    (objectType: ObjectTypeWithFields) => {
      onSelect(objectType);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onSelect]
  );

  const handleClear = useCallback(() => {
    onSelect(null);
    setIsOpen(false);
    setSearchTerm('');
  }, [onSelect]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <CubeIcon className="w-5 h-5 text-purple-600" />
        {label}
      </label>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">{helperText}</p>

      {/* Selector Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={`
            w-full flex items-center justify-between px-4 py-3
            bg-white border rounded-lg text-left
            transition-colors duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'}
            ${error ? 'border-red-500' : ''}
          `}
        >
          {loading ? (
            <span className="text-gray-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Carregando tipos...
            </span>
          ) : selectedObjectType ? (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{selectedObjectType.name}</span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                  {selectedObjectType.fields?.length || 0} campos
                </span>
              </div>
              {selectedObjectType.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {selectedObjectType.description}
                </p>
              )}
            </div>
          ) : (
            <span className="text-gray-400">Selecione um tipo de objeto...</span>
          )}
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tipo de objeto..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded
                           text-gray-900 placeholder-gray-400 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {queryError ? (
                <div className="p-4 text-center text-red-600 text-sm">
                  Erro ao carregar tipos: {queryError.message}
                </div>
              ) : filteredObjectTypes.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo de objeto disponível'}
                </div>
              ) : (
                <>
                  {/* Clear Option */}
                  {selectedId && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left
                                 text-gray-500 hover:bg-gray-50 transition-colors
                                 border-b border-gray-200"
                    >
                      <span className="text-sm">Limpar seleção</span>
                    </button>
                  )}

                  {/* Object Type Options */}
                  {filteredObjectTypes.map((objectType: ObjectTypeWithFields) => {
                    const isSelected = objectType.id === selectedId;
                    return (
                      <button
                        key={objectType.id}
                        type="button"
                        onClick={() => handleSelect(objectType)}
                        className={`
                          w-full flex items-start gap-3 px-4 py-3 text-left
                          transition-colors
                          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        `}
                      >
                        {/* Selection Indicator */}
                        <div className="flex-shrink-0 pt-0.5">
                          {isSelected ? (
                            <CheckIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <CubeIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}
                            >
                              {objectType.name}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200">
                              {objectType.fields?.length || 0} campos
                            </span>
                          </div>
                          {objectType.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {objectType.description}
                            </p>
                          )}
                          {objectType.fields && objectType.fields.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {objectType.fields.slice(0, 5).map((field: { id: string; name: string; is_required: boolean }) => (
                                <span
                                  key={field.id}
                                  className={`
                                    px-1.5 py-0.5 text-xs rounded
                                    ${field.is_required ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}
                                  `}
                                  title={field.is_required ? 'Campo obrigatório' : 'Campo opcional'}
                                >
                                  {field.name}
                                </span>
                              ))}
                              {objectType.fields.length > 5 && (
                                <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded border border-gray-200">
                                  +{objectType.fields.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Click Outside Handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default ObjectTypeSelector;
