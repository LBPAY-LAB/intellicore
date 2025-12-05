/**
 * Instances List Page
 * Sprint 11 - Instance Management
 *
 * Displays a paginated list of all instances with filtering and actions.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  PlusIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilSquareIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

import {
  GET_INSTANCES,
  DELETE_INSTANCE,
  CHANGE_INSTANCE_STATUS,
  GetInstancesResponse,
  Instance,
  InstanceStatus,
} from '@/lib/graphql/instances';

const STATUS_CONFIG: Record<InstanceStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  [InstanceStatus.DRAFT]: { label: 'Rascunho', color: 'bg-yellow-100 text-yellow-700 border border-yellow-300', icon: ClockIcon },
  [InstanceStatus.ACTIVE]: { label: 'Ativo', color: 'bg-green-100 text-green-700 border border-green-300', icon: CheckCircleIcon },
  [InstanceStatus.INACTIVE]: { label: 'Inativo', color: 'bg-gray-100 text-gray-600 border border-gray-300', icon: XCircleIcon },
  [InstanceStatus.ARCHIVED]: { label: 'Arquivado', color: 'bg-purple-100 text-purple-700 border border-purple-300', icon: ArchiveBoxIcon },
  [InstanceStatus.DELETED]: { label: 'Excluído', color: 'bg-red-100 text-red-700 border border-red-300', icon: TrashIcon },
};

export default function InstancesPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Fetch instances
  const { data, loading, error, refetch } = useQuery<GetInstancesResponse>(GET_INSTANCES, {
    variables: {
      first: pageSize,
      status: statusFilter === 'ALL' ? undefined : statusFilter,
    },
    fetchPolicy: 'cache-and-network',
  });

  // Delete mutation
  const [deleteInstance] = useMutation(DELETE_INSTANCE, {
    onCompleted: () => {
      toast.success('Instância excluída com sucesso');
      refetch();
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir instância', { description: error.message });
    },
  });

  // Status change mutation
  const [changeStatus] = useMutation(CHANGE_INSTANCE_STATUS, {
    onCompleted: () => {
      toast.success('Status atualizado');
      refetch();
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status', { description: error.message });
    },
  });

  const instances = data?.instances?.nodes || [];
  const totalCount = data?.instances?.totalCount || 0;
  const hasNextPage = data?.instances?.pageInfo?.hasNextPage || false;

  // Filter by search term (client-side for now)
  const filteredInstances = instances.filter((instance: Instance) =>
    !searchTerm ||
    instance.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instance.objectType?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(instance.data).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = useCallback(
    (id: string, displayName?: string) => {
      if (confirm(`Deseja excluir a instância "${displayName || id}"?`)) {
        deleteInstance({ variables: { id } });
      }
    },
    [deleteInstance]
  );

  const handleStatusChange = useCallback(
    (id: string, newStatus: InstanceStatus) => {
      changeStatus({ variables: { id, status: newStatus } });
    },
    [changeStatus]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold flex items-center gap-2 text-gray-900">
                <CubeIcon className="w-7 h-7 text-blue-600" />
                Instâncias
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie os registros de dados do sistema
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/backoffice/instances/search')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                           hover:bg-gray-200 border border-gray-300 transition-colors"
              >
                <BoltIcon className="w-5 h-5 text-yellow-600" />
                Busca Avancada
              </button>
              <button
                type="button"
                onClick={() => router.push('/backoffice/instances/create')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Nova Instancia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, tipo ou conteúdo..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg
                           text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InstanceStatus | 'ALL')}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg
                           text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Todos os status</option>
                {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors
                         disabled:opacity-50"
              title="Atualizar"
            >
              <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">Erro ao carregar instâncias: {error.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
            >
              Tentar novamente
            </button>
          </div>
        ) : loading && instances.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredInstances.length === 0 ? (
          <div className="p-12 text-center">
            <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhuma instância encontrada</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Tente ajustar os filtros'
                : 'Crie uma nova instância para começar'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <button
                type="button"
                onClick={() => router.push('/backoffice/instances/create')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                Nova Instância
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 flex items-center gap-4 text-sm text-gray-600">
              <span>{totalCount} instância(s) no total</span>
              {searchTerm && (
                <span>| {filteredInstances.length} resultado(s) para &quot;{searchTerm}&quot;</span>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInstances.map((instance: Instance) => {
                    const statusConfig = STATUS_CONFIG[instance.status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={instance.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {instance.displayName || '(sem nome)'}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {instance.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200">
                            {instance.objectType?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${statusConfig.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(instance.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => router.push(`/backoffice/instances/${instance.id}`)}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                              title="Ver detalhes"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push(`/backoffice/instances/${instance.id}/edit`)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Editar"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            {instance.status === InstanceStatus.DRAFT && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(instance.id, InstanceStatus.ACTIVE)}
                                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Ativar"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(instance.id, instance.displayName)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Excluir"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {hasNextPage && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
