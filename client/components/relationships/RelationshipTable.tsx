'use client';

import React, { useState, useMemo } from 'react';
import { ObjectRelationship } from '@/lib/graphql/relationships';
import { useTranslation } from 'react-i18next';

type SortField = 'source' | 'target' | 'type' | 'cardinality' | 'created_at';
type SortDirection = 'asc' | 'desc';

export interface RelationshipTableProps {
  relationships: ObjectRelationship[];
  onEdit: (relationship: ObjectRelationship) => void;
  onDelete: (relationship: ObjectRelationship) => void;
  onRowClick?: (relationship: ObjectRelationship) => void;
  loading?: boolean;
}

/**
 * Relationship Table Component
 * Displays relationships in a sortable, filterable table
 */
const RelationshipTable: React.FC<RelationshipTableProps> = ({
  relationships,
  onEdit,
  onDelete,
  onRowClick,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCardinality, setFilterCardinality] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort relationships
  const filteredAndSortedRelationships = useMemo(() => {
    let filtered = [...relationships];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rel) =>
          rel.source?.name?.toLowerCase().includes(query) ||
          rel.target?.name?.toLowerCase().includes(query) ||
          rel.relationship_type.toLowerCase().includes(query) ||
          rel.description?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (filterType) {
      filtered = filtered.filter((rel) => rel.relationship_type === filterType);
    }

    // Apply cardinality filter
    if (filterCardinality) {
      filtered = filtered.filter((rel) => rel.cardinality === filterCardinality);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'source':
          aValue = a.source?.name || a.source_id;
          bValue = b.source?.name || b.source_id;
          break;
        case 'target':
          aValue = a.target?.name || a.target_id;
          bValue = b.target?.name || b.target_id;
          break;
        case 'type':
          aValue = a.relationship_type;
          bValue = b.relationship_type;
          break;
        case 'cardinality':
          aValue = a.cardinality;
          bValue = b.cardinality;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [relationships, searchQuery, filterType, filterCardinality, sortField, sortDirection]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Source', 'Target', 'Type', 'Cardinality', 'Bidirectional', 'Description', 'Created'];
    const rows = filteredAndSortedRelationships.map((rel) => [
      rel.source?.name || rel.source_id,
      rel.target?.name || rel.target_id,
      rel.relationship_type,
      rel.cardinality,
      rel.is_bidirectional ? 'Yes' : 'No',
      rel.description || '',
      new Date(rel.created_at).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relationships-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
        <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-600">Loading relationships...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search relationships..."
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="PARENT_OF">Parent Of</option>
          <option value="CHILD_OF">Child Of</option>
          <option value="HAS_ONE">Has One</option>
          <option value="HAS_MANY">Has Many</option>
          <option value="BELONGS_TO">Belongs To</option>
        </select>

        {/* Cardinality Filter */}
        <select
          value={filterCardinality}
          onChange={(e) => setFilterCardinality(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Cardinalities</option>
          <option value="ONE_TO_ONE">1:1</option>
          <option value="ONE_TO_MANY">1:N</option>
          <option value="MANY_TO_MANY">N:N</option>
        </select>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors flex items-center gap-2 border border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  onClick={() => handleSort('source')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Source
                    <SortIcon field="source" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('target')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Target
                    <SortIcon field="target" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Type
                    <SortIcon field="type" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cardinality')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Cardinality
                    <SortIcon field="cardinality" />
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Bidirectional
                </th>
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Created
                    <SortIcon field="created_at" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedRelationships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No relationships found</p>
                      <p className="text-sm mt-1">Try adjusting your filters or create a new relationship</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRelationships.map((relationship) => (
                  <tr
                    key={relationship.id}
                    onClick={() => onRowClick?.(relationship)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {relationship.source?.name || relationship.source_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {relationship.target?.name || relationship.target_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">
                        {relationship.relationship_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-700">
                        {relationship.cardinality}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {relationship.is_bidirectional ? (
                        <svg className="w-5 h-5 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(relationship.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(relationship);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(relationship);
                          }}
                          className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-gray-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedRelationships.length} of {relationships.length} relationships
          </div>
          {(searchQuery || filterType || filterCardinality) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('');
                setFilterCardinality('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipTable;
