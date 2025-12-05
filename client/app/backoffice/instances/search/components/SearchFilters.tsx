/**
 * SearchFilters Component
 * Sprint 12 - US-058: Advanced Search UI
 *
 * Filter panel for instance search with ObjectType, status, and date filters.
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { InstanceStatus, ParsedFacets } from '@/lib/graphql/search';

const STATUS_LABELS: Record<InstanceStatus, string> = {
  [InstanceStatus.DRAFT]: 'Rascunho',
  [InstanceStatus.ACTIVE]: 'Ativo',
  [InstanceStatus.INACTIVE]: 'Inativo',
  [InstanceStatus.ARCHIVED]: 'Arquivado',
  [InstanceStatus.DELETED]: 'Excluido',
};

const STATUS_COLORS: Record<InstanceStatus, string> = {
  [InstanceStatus.DRAFT]: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  [InstanceStatus.ACTIVE]: 'bg-green-100 text-green-700 border border-green-300',
  [InstanceStatus.INACTIVE]: 'bg-gray-100 text-gray-600 border border-gray-300',
  [InstanceStatus.ARCHIVED]: 'bg-purple-100 text-purple-700 border border-purple-300',
  [InstanceStatus.DELETED]: 'bg-red-100 text-red-700 border border-red-300',
};

export interface SearchFiltersValue {
  objectTypeId?: string;
  status?: InstanceStatus[];
  createdAfter?: Date;
  createdBefore?: Date;
}

interface SearchFiltersProps {
  value: SearchFiltersValue;
  onChange: (filters: SearchFiltersValue) => void;
  facets?: ParsedFacets;
  objectTypes?: { id: string; name: string }[];
  className?: string;
}

export function SearchFilters({
  value,
  onChange,
  facets,
  objectTypes = [],
  className = '',
}: SearchFiltersProps) {
  const [showDateFilters, setShowDateFilters] = useState(false);

  const handleObjectTypeChange = useCallback(
    (objectTypeId: string | undefined) => {
      onChange({ ...value, objectTypeId });
    },
    [value, onChange]
  );

  const handleStatusToggle = useCallback(
    (status: InstanceStatus) => {
      const currentStatuses = value.status || [];
      const newStatuses = currentStatuses.includes(status)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status];
      onChange({ ...value, status: newStatuses.length > 0 ? newStatuses : undefined });
    },
    [value, onChange]
  );

  const handleDateChange = useCallback(
    (field: 'createdAfter' | 'createdBefore', dateStr: string) => {
      const date = dateStr ? new Date(dateStr) : undefined;
      onChange({ ...value, [field]: date });
    },
    [value, onChange]
  );

  const clearFilters = useCallback(() => {
    onChange({});
  }, [onChange]);

  const hasFilters =
    value.objectTypeId ||
    (value.status && value.status.length > 0) ||
    value.createdAfter ||
    value.createdBefore;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <FunnelIcon className="w-4 h-4" />
          Filtros
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Limpar todos
          </button>
        )}
      </div>

      {/* Object Type Filter */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Tipo de Objeto
        </label>
        <select
          value={value.objectTypeId || ''}
          onChange={(e) => handleObjectTypeChange(e.target.value || undefined)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                     text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os tipos</option>
          {objectTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
              {facets?.objectTypes?.[type.name] !== undefined && (
                ` (${facets.objectTypes[type.name]})`
              )}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filters */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const statusEnum = status as InstanceStatus;
            const isSelected = value.status?.includes(statusEnum) || false;
            const count = facets?.statuses?.[status];

            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusToggle(statusEnum)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  isSelected
                    ? `${STATUS_COLORS[statusEnum]} ring-2 ring-blue-500`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {label}
                {count !== undefined && (
                  <span className="ml-1 text-gray-500">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Filters */}
      <div>
        <button
          type="button"
          onClick={() => setShowDateFilters(!showDateFilters)}
          className="flex items-center justify-between w-full text-xs font-medium text-gray-600 mb-2"
        >
          <span className="flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            Data de Criacao
          </span>
          {showDateFilters ? (
            <ChevronUpIcon className="w-3 h-3" />
          ) : (
            <ChevronDownIcon className="w-3 h-3" />
          )}
        </button>

        {showDateFilters && (
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Apos</label>
              <input
                type="date"
                value={value.createdAfter?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('createdAfter', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                           text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Antes</label>
              <input
                type="date"
                value={value.createdBefore?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('createdBefore', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg
                           text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Filtros ativos:</div>
          <div className="flex flex-wrap gap-2">
            {value.objectTypeId && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200">
                {objectTypes.find((t) => t.id === value.objectTypeId)?.name || value.objectTypeId}
                <button
                  type="button"
                  onClick={() => handleObjectTypeChange(undefined)}
                  className="hover:text-blue-900"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {value.status?.map((status) => (
              <span
                key={status}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200"
              >
                {STATUS_LABELS[status]}
                <button
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className="hover:text-blue-900"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            {value.createdAfter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200">
                Apos {value.createdAfter.toLocaleDateString('pt-BR')}
                <button
                  type="button"
                  onClick={() => handleDateChange('createdAfter', '')}
                  className="hover:text-blue-900"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {value.createdBefore && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200">
                Antes {value.createdBefore.toLocaleDateString('pt-BR')}
                <button
                  type="button"
                  onClick={() => handleDateChange('createdBefore', '')}
                  className="hover:text-blue-900"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
