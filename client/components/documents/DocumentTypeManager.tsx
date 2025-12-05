'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useDocumentTypes,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
} from '@/hooks/useDocumentTypes';
import type { DocumentType, CreateDocumentTypeInput } from '@/lib/graphql/documents';

export function DocumentTypeManager() {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const { documentTypes, loading, refetch } = useDocumentTypes();
  const { createDocumentType } = useCreateDocumentType();
  const { updateDocumentType } = useUpdateDocumentType();
  const { deleteDocumentType } = useDeleteDocumentType();

  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState<CreateDocumentTypeInput>({
    name: '',
    description: '',
    allowedExtensions: [],
    maxFileSizeMb: 50,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      allowedExtensions: [],
      maxFileSizeMb: 50,
    });
    setEditingType(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingType) {
        await updateDocumentType({ id: editingType.id, ...formData });
        toast.success(t('typeUpdated'));
      } else {
        await createDocumentType(formData);
        toast.success(t('typeCreated'));
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error(t('errors.saveFailed'));
    }
  };

  const handleEdit = (type: DocumentType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description,
      allowedExtensions: type.allowedExtensions,
      maxFileSizeMb: type.maxFileSizeMb,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteType'))) return;

    try {
      await deleteDocumentType(id);
      toast.success(t('typeDeleted'));
      refetch();
    } catch (error) {
      toast.error(t('errors.deleteFailed'));
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-700">{t('loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{t('manageDocumentTypes')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? t('cancel') : t('addType')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('name')} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              {t('allowedExtensions')} * {t('commaSeparated')}
            </label>
            <input
              type="text"
              value={formData.allowedExtensions.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowedExtensions: e.target.value.split(',').map((ext) => ext.trim()),
                })
              }
              placeholder=".pdf, .docx, .txt"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">{t('maxSizeMb')} *</label>
            <input
              type="number"
              value={formData.maxFileSizeMb}
              onChange={(e) =>
                setFormData({ ...formData, maxFileSizeMb: parseInt(e.target.value) })
              }
              min={1}
              max={500}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {editingType ? t('updateType') : t('createType')}
          </button>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {documentTypes.map((type: DocumentType) => (
          <div key={type.id} className="border border-gray-300 rounded-lg p-4 flex justify-between items-start bg-white">
            <div>
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              {type.description && <p className="text-sm text-gray-700 mt-1">{type.description}</p>}
              <div className="mt-2 text-sm text-gray-700">
                <p>{t('extensions')}: {type.allowedExtensions.join(', ')}</p>
                <p>{t('maxSize')}: {type.maxFileSizeMb}MB</p>
                <p>
                  {t('status')}:{' '}
                  <span className={type.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {type.isActive ? t('active') : t('inactive')}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(type)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {t('edit')}
              </button>
              <button
                onClick={() => handleDelete(type.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
