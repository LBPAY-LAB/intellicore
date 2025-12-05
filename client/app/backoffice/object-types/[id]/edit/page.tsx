'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useEffect } from 'react';
import {
  GET_OBJECT_TYPE,
  UPDATE_OBJECT_TYPE,
  ObjectTypeResponse,
  UpdateObjectTypeInput,
  UpdateObjectTypeResponse,
} from '@/lib/graphql/object-types';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function EditObjectTypePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  const { data, loading: fetching, error } = useQuery<ObjectTypeResponse>(
    GET_OBJECT_TYPE,
    {
      variables: { id },
      fetchPolicy: 'network-only',
    }
  );

  useEffect(() => {
    if (data?.objectType) {
      reset({
        name: data.objectType.name,
        description: data.objectType.description || '',
        is_active: data.objectType.is_active,
      });
    }
  }, [data, reset]);

  const [updateObjectType, { loading: updating }] = useMutation<UpdateObjectTypeResponse>(
    UPDATE_OBJECT_TYPE,
    {
      onCompleted: (data) => {
        toast.success(t('common.success'), {
          description: `Object type "${data.updateObjectType.name}" updated successfully`,
        });
        router.push('/backoffice/object-types');
      },
      onError: (error) => {
        toast.error(t('common.error'), {
          description: error.message,
        });
      },
    }
  );

  const onSubmit = async (formData: FormData) => {
    await updateObjectType({
      variables: {
        input: {
          id,
          name: formData.name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        },
      },
    });
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error || !data?.objectType) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
        <h3 className="text-red-500 font-semibold mb-2">{t('common.error')}</h3>
        <p className="text-red-400 text-sm">
          {error?.message || 'Object type not found'}
        </p>
        <Link
          href="/backoffice/object-types"
          className="mt-4 inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Back to List
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Link
            href="/backoffice/object-types"
            className="hover:text-gray-900 transition-colors"
          >
            {t('backoffice.objectTypes.title')}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{t('backoffice.objectTypes.edit')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('backoffice.objectTypes.edit')}
        </h1>
        <p className="text-gray-600 mt-1">
          Update the object type definition
        </p>
      </div>

      {/* Unsaved Changes Warning */}
      {isDirty && (
        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-700">Unsaved Changes</p>
            <p className="text-xs text-yellow-600 mt-1">You have unsaved changes. Make sure to save before leaving.</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              {t('backoffice.objectTypes.name')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              placeholder="e.g., Cliente PF, Conta Corrente"
              className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
              {t('backoffice.objectTypes.description')}
            </label>
            <textarea
              {...register('description')}
              id="description"
              rows={4}
              placeholder="Describe the purpose and characteristics of this object type..."
              className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Is Active Field */}
          <div className="flex items-center gap-3">
            <input
              {...register('is_active')}
              type="checkbox"
              id="is_active"
              className="w-4 h-4 bg-white border-gray-300 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
              Active
            </label>
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900 font-medium">
                  {new Date(data.objectType.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="text-gray-900 font-medium">
                  {new Date(data.objectType.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/backoffice/object-types"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || updating || !isDirty}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isSubmitting || updating) && (
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
            {t('common.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
