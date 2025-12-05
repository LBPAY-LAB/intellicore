'use client';

import React from 'react';
import { ObjectRelationship } from '@/lib/graphql/relationships';
import { useTranslation } from 'react-i18next';

export interface RelationshipDetailsPanelProps {
  relationship: ObjectRelationship | null;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
  className?: string;
}

/**
 * Relationship Details Panel Component
 * Displays detailed information about a selected relationship
 */
const RelationshipDetailsPanel: React.FC<RelationshipDetailsPanelProps> = ({
  relationship,
  onEdit,
  onDelete,
  onClose,
  className = '',
}) => {
  const { t } = useTranslation();

  if (!relationship) {
    return null;
  }

  const cardinalityLabels = {
    ONE_TO_ONE: '1:1 (One-to-One)',
    ONE_TO_MANY: '1:N (One-to-Many)',
    MANY_TO_MANY: 'N:N (Many-to-Many)',
  };

  const relationshipTypeLabels = {
    PARENT_OF: 'Parent Of',
    CHILD_OF: 'Child Of',
    HAS_ONE: 'Has One',
    HAS_MANY: 'Has Many',
    BELONGS_TO: 'Belongs To',
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Relationship Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Source and Target */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Source
              </div>
              <div className="text-sm font-medium text-gray-900">
                {relationship.source?.name || relationship.source_id}
              </div>
              {relationship.source?.description && (
                <div className="text-xs text-gray-500 mt-1">
                  {relationship.source.description}
                </div>
              )}
            </div>

            {/* Arrow indicator */}
            <div className="flex-shrink-0">
              {relationship.is_bidirectional ? (
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Target
              </div>
              <div className="text-sm font-medium text-gray-900">
                {relationship.target?.name || relationship.target_id}
              </div>
              {relationship.target?.description && (
                <div className="text-xs text-gray-500 mt-1">
                  {relationship.target.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Relationship Type */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
            Relationship Type
          </label>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <span className="text-sm text-gray-900 font-medium">
              {relationshipTypeLabels[relationship.relationship_type]}
            </span>
          </div>
        </div>

        {/* Cardinality */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
            Cardinality
          </label>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <span className="text-sm text-gray-900 font-medium">
              {cardinalityLabels[relationship.cardinality]}
            </span>
          </div>
        </div>

        {/* Bidirectional */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
            Directionality
          </label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <div
              className={`w-2 h-2 rounded-full ${
                relationship.is_bidirectional ? 'bg-blue-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-sm text-gray-900">
              {relationship.is_bidirectional ? 'Bidirectional' : 'Unidirectional'}
            </span>
          </div>
        </div>

        {/* Description */}
        {relationship.description && (
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-sm text-gray-700">{relationship.description}</p>
            </div>
          </div>
        )}

        {/* Status */}
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
            Status
          </label>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                relationship.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {relationship.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Created</span>
            <span className="text-gray-700">
              {new Date(relationship.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Updated</span>
            <span className="text-gray-700">
              {new Date(relationship.updated_at).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">ID</span>
            <span className="text-gray-700 font-mono text-[10px]">
              {relationship.id}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipDetailsPanel;
