'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  RelationshipType,
  Cardinality,
  CREATE_RELATIONSHIP,
  UPDATE_RELATIONSHIP,
  CreateRelationshipResponse,
  UpdateRelationshipResponse,
  ObjectRelationship,
} from '@/lib/graphql/relationships';
import { GET_OBJECT_TYPES, ObjectTypesResponse } from '@/lib/graphql/object-types';

const relationshipFormSchema = z.object({
  source_id: z.string().uuid('Invalid source object type'),
  target_id: z.string().uuid('Invalid target object type'),
  relationship_type: z.nativeEnum(RelationshipType, {
    message: 'Relationship type is required',
  }),
  cardinality: z.nativeEnum(Cardinality, {
    message: 'Cardinality is required',
  }),
  is_bidirectional: z.boolean().default(false),
  description: z.string().optional(),
});

type RelationshipFormData = z.infer<typeof relationshipFormSchema>;

export interface RelationshipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  sourceNodeId?: string;
  targetNodeId?: string;
  editingRelationship?: ObjectRelationship;
}

/**
 * Relationship Form Modal Component
 * Handles creation and editing of relationships
 */
const RelationshipFormModal: React.FC<RelationshipFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sourceNodeId,
  targetNodeId,
  editingRelationship,
}) => {
  const { t } = useTranslation();
  const isEditMode = !!editingRelationship;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipFormSchema) as any,
    defaultValues: editingRelationship
      ? {
          source_id: editingRelationship.source_id,
          target_id: editingRelationship.target_id,
          relationship_type: editingRelationship.relationship_type,
          cardinality: editingRelationship.cardinality,
          is_bidirectional: editingRelationship.is_bidirectional,
          description: editingRelationship.description || '',
        }
      : {
          source_id: sourceNodeId || '',
          target_id: targetNodeId || '',
          is_bidirectional: false,
          description: '',
        },
  });

  // Fetch object types for dropdowns
  const { data: objectTypesData } = useQuery<ObjectTypesResponse>(GET_OBJECT_TYPES, {
    variables: { first: 1000 },
  });

  const objectTypes = objectTypesData?.objectTypes.nodes || [];

  // Create mutation
  const [createRelationship] = useMutation<CreateRelationshipResponse>(
    CREATE_RELATIONSHIP,
    {
      onCompleted: () => {
        toast.success('Success', {
          description: 'Relationship created successfully',
        });
        onSuccess?.();
        onClose();
        reset();
      },
      onError: (error: Error) => {
        toast.error('Error', {
          description: error.message,
        });
      },
    }
  );

  // Update mutation
  const [updateRelationship] = useMutation<UpdateRelationshipResponse>(
    UPDATE_RELATIONSHIP,
    {
      onCompleted: () => {
        toast.success('Success', {
          description: 'Relationship updated successfully',
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

  const onSubmit = async (data: RelationshipFormData) => {
    if (isEditMode && editingRelationship) {
      await updateRelationship({
        variables: {
          input: {
            id: editingRelationship.id,
            relationship_type: data.relationship_type,
            cardinality: data.cardinality,
            is_bidirectional: data.is_bidirectional,
            description: data.description,
          },
        },
      });
    } else {
      await createRelationship({
        variables: {
          input: data,
        },
      });
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const selectedSourceId = watch('source_id');
  const selectedTargetId = watch('target_id');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Relationship' : 'Create Relationship'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="p-6 space-y-6">
          {/* Source Object Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Object Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="source_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select source...</option>
                  {objectTypes.map((ot: any) => (
                    <option key={ot.id} value={ot.id}>
                      {ot.name}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.source_id && (
              <p className="mt-1 text-sm text-red-600">{errors.source_id.message}</p>
            )}
          </div>

          {/* Target Object Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Object Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="target_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="">Select target...</option>
                  {objectTypes
                    .filter((ot: any) => ot.id !== selectedSourceId)
                    .map((ot: any) => (
                      <option key={ot.id} value={ot.id}>
                        {ot.name}
                      </option>
                    ))}
                </select>
              )}
            />
            {errors.target_id && (
              <p className="mt-1 text-sm text-red-600">{errors.target_id.message}</p>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="relationship_type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type...</option>
                  <option value={RelationshipType.PARENT_OF}>Parent Of</option>
                  <option value={RelationshipType.CHILD_OF}>Child Of</option>
                  <option value={RelationshipType.HAS_ONE}>Has One</option>
                  <option value={RelationshipType.HAS_MANY}>Has Many</option>
                  <option value={RelationshipType.BELONGS_TO}>Belongs To</option>
                </select>
              )}
            />
            {errors.relationship_type && (
              <p className="mt-1 text-sm text-red-600">
                {errors.relationship_type.message}
              </p>
            )}
          </div>

          {/* Cardinality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cardinality
              <span className="text-red-500 ml-1">*</span>
            </label>
            <Controller
              name="cardinality"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: Cardinality.ONE_TO_ONE, label: 'One-to-One', desc: '1:1' },
                    { value: Cardinality.ONE_TO_MANY, label: 'One-to-Many', desc: '1:N' },
                    { value: Cardinality.MANY_TO_MANY, label: 'Many-to-Many', desc: 'N:N' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => field.onChange(option.value)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        field.value === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {option.desc}
                        </div>
                        <div className="text-xs text-gray-600">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.cardinality && (
              <p className="mt-1 text-sm text-red-600">{errors.cardinality.message}</p>
            )}
          </div>

          {/* Bidirectional */}
          <div>
            <Controller
              name="is_bidirectional"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Bidirectional Relationship
                    </div>
                    <div className="text-xs text-gray-600">
                      Creates a two-way relationship between objects
                    </div>
                  </div>
                </label>
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Optional description of the relationship..."
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              )}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedSourceId || !selectedTargetId}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
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
              {isEditMode ? 'Update Relationship' : 'Create Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelationshipFormModal;
