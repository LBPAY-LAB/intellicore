/**
 * SearchResultsGrid Component
 * Sprint 12 - US-058: Advanced Search UI
 *
 * Grid display for search results with instance cards.
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CubeIcon,
  EyeIcon,
  PencilSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { SearchInstance, InstanceStatus } from '@/lib/graphql/search';

const STATUS_CONFIG: Record<InstanceStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  [InstanceStatus.DRAFT]: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300', icon: ClockIcon },
  [InstanceStatus.ACTIVE]: { label: 'Ativo', color: 'bg-green-100 text-green-700 border border-green-300', icon: CheckCircleIcon },
  [InstanceStatus.INACTIVE]: { label: 'Inativo', color: 'bg-gray-100 text-gray-600 border border-gray-300', icon: XCircleIcon },
  [InstanceStatus.ARCHIVED]: { label: 'Arquivado', color: 'bg-purple-100 text-purple-700 border border-purple-300', icon: ArchiveBoxIcon },
  [InstanceStatus.DELETED]: { label: 'Excluido', color: 'bg-red-100 text-red-700 border border-red-300', icon: TrashIcon },
};

interface SearchResultsGridProps {
  instances: SearchInstance[];
  query: string;
  loading?: boolean;
  onInstanceClick?: (instanceId: string) => void;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 text-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function SearchResultsGrid({
  instances,
  query,
  loading = false,
  onInstanceClick,
}: SearchResultsGridProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 rounded-lg animate-pulse border border-gray-200"
          />
        ))}
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="text-center py-12">
        <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Nenhum resultado encontrado</p>
        {query && (
          <p className="text-gray-500 text-sm mt-2">
            Tente ajustar sua busca ou filtros
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {instances.map((instance) => {
        const statusConfig = STATUS_CONFIG[instance.status];
        const StatusIcon = statusConfig.icon;

        // Extract preview data
        const dataKeys = Object.keys(instance.data || {}).slice(0, 3);

        return (
          <div
            key={instance.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 hover:shadow-md
                       transition-all cursor-pointer group shadow-sm"
            onClick={() => {
              if (onInstanceClick) {
                onInstanceClick(instance.id);
              } else {
                router.push(`/backoffice/instances/${instance.id}`);
              }
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {instance.displayName
                    ? highlightMatch(instance.displayName, query)
                    : '(sem nome)'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  {instance.id.slice(0, 8)}...
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>

            {/* Object Type */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                <CubeIcon className="w-3 h-3" />
                {instance.objectType?.name || 'N/A'}
              </span>
            </div>

            {/* Data Preview */}
            {dataKeys.length > 0 && (
              <div className="space-y-1 mb-3">
                {dataKeys.map((key) => {
                  const value = instance.data[key];
                  const stringValue = typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value ?? '');

                  return (
                    <div key={key} className="text-xs">
                      <span className="text-gray-500">{key}: </span>
                      <span className="text-gray-700 truncate">
                        {highlightMatch(stringValue.slice(0, 50), query)}
                        {stringValue.length > 50 && '...'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                {new Date(instance.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/backoffice/instances/${instance.id}`);
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Ver detalhes"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/backoffice/instances/${instance.id}/edit`);
                  }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
