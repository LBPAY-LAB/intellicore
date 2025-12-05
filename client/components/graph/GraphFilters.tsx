'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RelationshipType, Cardinality } from '@/lib/graphql/relationships';
import { GraphFilters as GraphFiltersType } from './types';

export interface GraphFiltersProps {
  filters: GraphFiltersType;
  onFiltersChange: (filters: GraphFiltersType) => void;
  className?: string;
}

/**
 * Graph Filters Component
 * Provides search and filtering controls for the graph
 */
const GraphFilters: React.FC<GraphFiltersProps> = ({
  filters,
  onFiltersChange,
  className = '',
}) => {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  const relationshipTypeOptions = [
    { value: RelationshipType.PARENT_OF, label: 'Parent Of', color: 'blue' },
    { value: RelationshipType.CHILD_OF, label: 'Child Of', color: 'green' },
    { value: RelationshipType.HAS_ONE, label: 'Has One', color: 'purple' },
    { value: RelationshipType.HAS_MANY, label: 'Has Many', color: 'pink' },
    { value: RelationshipType.BELONGS_TO, label: 'Belongs To', color: 'orange' },
  ];

  const cardinalityOptions = [
    { value: Cardinality.ONE_TO_ONE, label: '1:1', color: 'blue' },
    { value: Cardinality.ONE_TO_MANY, label: '1:N', color: 'purple' },
    { value: Cardinality.MANY_TO_MANY, label: 'N:N', color: 'pink' },
  ];

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      // Debounce search
      const timer = setTimeout(() => {
        onFiltersChange({
          ...filters,
          searchQuery: value,
        });
      }, 300);

      return () => clearTimeout(timer);
    },
    [filters, onFiltersChange]
  );

  const toggleRelationshipType = useCallback(
    (type: RelationshipType) => {
      const newTypes = filters.relationshipTypes.includes(type)
        ? filters.relationshipTypes.filter((t) => t !== type)
        : [...filters.relationshipTypes, type];

      onFiltersChange({
        ...filters,
        relationshipTypes: newTypes,
      });
    },
    [filters, onFiltersChange]
  );

  const toggleCardinalityType = useCallback(
    (cardinality: Cardinality) => {
      const newCardinalities = filters.cardinalityTypes.includes(cardinality)
        ? filters.cardinalityTypes.filter((c) => c !== cardinality)
        : [...filters.cardinalityTypes, cardinality];

      onFiltersChange({
        ...filters,
        cardinalityTypes: newCardinalities,
      });
    },
    [filters, onFiltersChange]
  );

  const toggleInactiveNodes = useCallback(() => {
    onFiltersChange({
      ...filters,
      showInactiveNodes: !filters.showInactiveNodes,
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    onFiltersChange({
      searchQuery: '',
      relationshipTypes: [],
      cardinalityTypes: [],
      showInactiveNodes: true,
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.searchQuery ||
    filters.relationshipTypes.length > 0 ||
    filters.cardinalityTypes.length > 0 ||
    !filters.showInactiveNodes;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          Search Nodes
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="w-full px-3 py-2 pl-9 bg-white border border-gray-300 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Relationship Types */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          Relationship Types
        </label>
        <div className="space-y-1">
          {relationshipTypeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleRelationshipType(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                filters.relationshipTypes.includes(option.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  filters.relationshipTypes.includes(option.value)
                    ? 'bg-white'
                    : 'bg-gray-400'
                }`}
              />
              <span className="flex-1 text-left">{option.label}</span>
              {filters.relationshipTypes.includes(option.value) && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cardinality */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          Cardinality
        </label>
        <div className="space-y-1">
          {cardinalityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleCardinalityType(option.value)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                filters.cardinalityTypes.includes(option.value)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  filters.cardinalityTypes.includes(option.value)
                    ? 'bg-white'
                    : 'bg-gray-400'
                }`}
              />
              <span className="flex-1 text-left">{option.label}</span>
              {filters.cardinalityTypes.includes(option.value) && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider">
          Display Options
        </label>
        <button
          onClick={toggleInactiveNodes}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            filters.showInactiveNodes
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              filters.showInactiveNodes ? 'bg-white' : 'bg-gray-400'
            }`}
          />
          <span className="flex-1 text-left">Show Inactive Nodes</span>
          {filters.showInactiveNodes && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <span className="font-medium">Active filters:</span>
            <ul className="mt-1 space-y-0.5">
              {filters.searchQuery && (
                <li>• Search: "{filters.searchQuery}"</li>
              )}
              {filters.relationshipTypes.length > 0 && (
                <li>• {filters.relationshipTypes.length} relationship type(s)</li>
              )}
              {filters.cardinalityTypes.length > 0 && (
                <li>• {filters.cardinalityTypes.length} cardinality type(s)</li>
              )}
              {!filters.showInactiveNodes && <li>• Hiding inactive nodes</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphFilters;
