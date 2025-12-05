'use client';

import React from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  DELETE_RELATIONSHIP,
  DeleteRelationshipResponse,
  ObjectRelationship,
} from '@/lib/graphql/relationships';

export interface RelationshipDeleteDialogProps {
  isOpen: boolean;
  relationship: ObjectRelationship | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Relationship Delete Confirmation Dialog
 * Handles deletion of relationships with confirmation
 */
const RelationshipDeleteDialog: React.FC<RelationshipDeleteDialogProps> = ({
  isOpen,
  relationship,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();

  const [deleteRelationship, { loading }] = useMutation<DeleteRelationshipResponse>(
    DELETE_RELATIONSHIP,
    {
      onCompleted: () => {
        toast.success('Success', {
          description: 'Relationship deleted successfully',
        });
        onSuccess?.();
        onClose();
      },
      onError: (error: Error) => {
        toast.error('Error', {
          description: error.message,
        });
      },
    }
  );

  const handleDelete = async () => {
    if (!relationship) return;

    await deleteRelationship({
      variables: { id: relationship.id },
    });
  };

  if (!isOpen || !relationship) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Relationship</h3>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this relationship? This will permanently remove
            the connection between:
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {relationship.source?.name || relationship.source_id}
              </span>
            </div>

            <div className="flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-400"
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
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm font-medium text-gray-900">
                {relationship.target?.name || relationship.target_id}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Type:</span>
                <span className="text-gray-700">{relationship.relationship_type}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Cardinality:</span>
                <span className="text-gray-700">{relationship.cardinality}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-xs text-yellow-700">
                This relationship will be permanently deleted from the database. Related
                graph structures will be updated automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading && (
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
            )}
            Delete Relationship
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipDeleteDialog;
