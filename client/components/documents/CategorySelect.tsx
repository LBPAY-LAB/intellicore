/**
 * CategorySelect Component
 * Sprint 16 - US-DB-002: Enhanced Document Upload with Category Selection
 *
 * Dropdown with category descriptions shown on hover.
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useActiveDocumentCategories } from '@/hooks/useDocumentCategories';
import type { DocumentCategory } from '@/lib/graphql/documents';

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CategorySelect({
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
}: CategorySelectProps) {
  const { t: translate } = useTranslation();
  const t = (key: string, options?: Record<string, unknown>) => translate(`documents.${key}`, options);
  const { categories, loading } = useActiveDocumentCategories();
  const [hoveredCategory, setHoveredCategory] = useState<DocumentCategory | null>(null);

  const selectedCategory = categories.find((cat) => cat.id === value);

  return (
    <div className="space-y-2">
      <label htmlFor="documentCategory" className="block text-sm font-medium text-gray-900">
        {t('category')} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id="documentCategory"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || disabled}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <option value="">{t('selectCategory')}</option>
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ))}
        </select>

        {/* Info icon for showing description tooltip */}
        {selectedCategory?.description && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 group">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onMouseEnter={() => setHoveredCategory(selectedCategory)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Tooltip */}
            {hoveredCategory && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl z-10">
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold">{hoveredCategory.name}</p>
                    <p className="text-gray-300 mt-1">{hoveredCategory.description}</p>
                  </div>

                  {hoveredCategory.targetGoldLayers.length > 0 && (
                    <div className="pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Target Gold Layers:</p>
                      <div className="flex gap-1">
                        {hoveredCategory.targetGoldLayers.map((layer) => (
                          <span
                            key={layer}
                            className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded text-xs font-medium"
                          >
                            Layer {layer}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow pointer */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-gray-900 transform rotate-45" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category description (shown below select) */}
      {selectedCategory && (
        <div className="text-sm text-gray-700 bg-blue-50 rounded p-3 space-y-1">
          <p>{selectedCategory.description}</p>
          {selectedCategory.targetGoldLayers.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-gray-500">Gold Layers:</span>
              <div className="flex gap-1">
                {selectedCategory.targetGoldLayers.map((layer) => (
                  <span
                    key={layer}
                    className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium"
                  >
                    {layer}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
