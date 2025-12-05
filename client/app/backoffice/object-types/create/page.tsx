'use client';

import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CREATE_OBJECT_TYPE,
  CreateObjectTypeInput,
  CreateObjectTypeResponse,
} from '@/lib/graphql/object-types';
import Link from 'next/link';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function CreateObjectTypePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
    },
  });

  const [createObjectType, { loading }] = useMutation<CreateObjectTypeResponse>(
    CREATE_OBJECT_TYPE,
    {
      onCompleted: (data) => {
        toast.success(t('common.success'), {
          description: `Object type "${data.createObjectType.name}" created successfully`,
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

  const onSubmit = async (data: FormData) => {
    await createObjectType({
      variables: {
        input: {
          name: data.name,
          description: data.description || undefined,
          is_active: data.is_active,
        },
      },
    });
  };

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
          <span className="text-gray-900">{t('backoffice.objectTypes.create')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('backoffice.objectTypes.create')}
        </h1>
        <p className="text-gray-600 mt-1">
          Define a new object type for the meta-modeling platform
        </p>
      </div>

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
            <p className="mt-1 text-xs text-gray-500">
              A unique name that identifies this object type
            </p>
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
            <p className="mt-1 text-xs text-gray-500">
              Optional description to help understand the object type
            </p>
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
          <p className="text-xs text-gray-500 -mt-4 ml-7">
            Inactive object types cannot be used to create new instances
          </p>
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
            disabled={isSubmitting || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {(isSubmitting || loading) && (
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
            {t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
}
