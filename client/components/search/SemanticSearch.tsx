'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchResultChunk } from '@/lib/graphql/rag';
import { useSemanticSearch } from '@/hooks/useSemanticSearch';
import { SearchResults } from './SearchResults';

interface SemanticSearchProps {
  documentTypeId?: string;
  onDocumentSelect?: (documentId: string) => void;
}

export function SemanticSearch({ documentTypeId, onDocumentSelect }: SemanticSearchProps) {
  const { t } = useTranslation('search');
  const {
    search,
    searchResults,
    loading,
    error,
    getSuggestions,
    suggestionsLoading,
  } = useSemanticSearch();

  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);
  const [scoreThreshold, setScoreThreshold] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced suggestions
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await getSuggestions(query);
      setSuggestions(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, getSuggestions]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (query.trim().length < 3) {
        return;
      }

      await search({
        query: query.trim(),
        limit,
        scoreThreshold,
        documentTypeId,
      });

      setShowSuggestions(false);
    },
    [query, limit, scoreThreshold, documentTypeId, search]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      setShowSuggestions(false);
    },
    []
  );

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={t('placeholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || query.length < 3}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('searching') : t('search')}
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showAdvanced ? t('hideAdvanced') : t('showAdvanced')}
            </button>
          </div>

          {/* Character count hint */}
          {query.length > 0 && query.length < 3 && (
            <p className="mt-1 text-xs text-gray-500">
              {t('minCharacters', { count: 3 - query.length })}
            </p>
          )}
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('resultsLimit')}
                </label>
                <input
                  id="limit"
                  type="number"
                  min={1}
                  max={100}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="threshold"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t('scoreThreshold')}
                </label>
                <input
                  id="threshold"
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={scoreThreshold}
                  onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t('thresholdHint')}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            {t('error')}: {error.message}
          </p>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <SearchResults
          results={searchResults}
          onDocumentSelect={onDocumentSelect}
        />
      )}

      {/* No Results */}
      {searchResults && searchResults.results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t('noResults')}</p>
          <p className="text-sm text-gray-400 mt-2">
            {t('tryAdjusting')}
          </p>
        </div>
      )}
    </div>
  );
}
