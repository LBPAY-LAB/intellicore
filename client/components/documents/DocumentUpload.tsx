'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUploadDocument } from '@/hooks/useDocuments';
import { useActiveDocumentTypes } from '@/hooks/useDocumentTypes';
import { CategorySelect } from './CategorySelect';
import type { DocumentType } from '@/lib/graphql/documents';

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedDocumentCategory, setSelectedDocumentCategory] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { uploadDocument } = useUploadDocument();
  const { documentTypes, loading: loadingTypes } = useActiveDocumentTypes();

  const validateFile = useCallback(
    (file: File, documentType?: DocumentType): string | null => {
      if (!documentType) {
        return t('errors.selectTypeFirst');
      }

      // Validate file size
      const maxSizeBytes = documentType.maxFileSizeMb * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return t('errors.fileTooLarge', {
          size: (file.size / 1024 / 1024).toFixed(2),
          maxSize: documentType.maxFileSizeMb,
        });
      }

      // Validate file extension
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const isExtensionAllowed = documentType.allowedExtensions.some(
        (ext: string) => ext.toLowerCase() === extension
      );

      if (!isExtensionAllowed) {
        return t('errors.invalidExtension', {
          extension,
          allowed: documentType.allowedExtensions.join(', '),
        });
      }

      return null;
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const documentType = documentTypes.find((dt: DocumentType) => dt.id === selectedDocumentType);
      const validationError = validateFile(file, documentType);

      if (validationError) {
        toast.error(validationError);
        return;
      }

      setSelectedFile(file);
    },
    [documentTypes, selectedDocumentType, validateFile]
  );

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType) {
      toast.error(t('errors.selectFileAndType'));
      return;
    }

    if (!selectedDocumentCategory) {
      toast.error(t('errors.selectCategory'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadDocument(selectedFile, selectedDocumentType, selectedDocumentCategory);

      toast.success(t('uploadSuccess', { filename: selectedFile.name }));
      setSelectedFile(null);
      setSelectedDocumentCategory('');
      setUploadProgress(100);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('errors.uploadFailed'));
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const selectedType = documentTypes.find((dt) => dt.id === selectedDocumentType);

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-gray-900 mb-2">
          {t('documentType')} *
        </label>
        <select
          id="documentType"
          value={selectedDocumentType}
          onChange={(e) => {
            setSelectedDocumentType(e.target.value);
            setSelectedFile(null); // Reset file when type changes
          }}
          disabled={loadingTypes || isUploading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <option value="">{t('selectType')}</option>
          {documentTypes.map((type: DocumentType) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {selectedType && (
          <p className="mt-1 text-sm text-gray-700">
            {t('allowedExtensions')}: {selectedType.allowedExtensions.join(', ')} | {t('maxSize')}
            : {selectedType.maxFileSizeMb}MB
          </p>
        )}
      </div>

      {/* Document Category Selector */}
      <CategorySelect
        value={selectedDocumentCategory}
        onChange={setSelectedDocumentCategory}
        disabled={isUploading}
        required={true}
      />

      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${!selectedDocumentType ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {selectedFile ? (
          <div className="space-y-2">
            <div className="text-4xl">📄</div>
            <p className="font-medium text-gray-900">{selectedFile.name}</p>
            <p className="text-sm text-gray-700">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {!isUploading && (
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {t('removeFile')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <p className="font-medium text-gray-900">{t('dragDropOrClick')}</p>
            <p className="text-sm text-gray-700">{t('dragDropHint')}</p>
            <input
              type="file"
              onChange={handleFileInputChange}
              disabled={!selectedDocumentType || isUploading}
              className="hidden"
              id="fileInput"
              accept={selectedType?.allowedExtensions.join(',')}
            />
            <label
              htmlFor="fileInput"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              {t('selectFile')}
            </label>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('uploading')}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !selectedDocumentType || !selectedDocumentCategory || isUploading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? t('uploading') : t('uploadDocument')}
      </button>
    </div>
  );
}
