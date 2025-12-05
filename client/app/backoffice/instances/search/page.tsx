/**
 * Instance Search Page
 * Sprint 12 - US-058: Advanced Search UI
 *
 * Full-text search page with filters, facets, and results grid.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  BoltIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

import { useInstanceSearch, InstanceSearchOptions } from '@/hooks/useInstanceSearch';
import { GET_ALL_OBJECT_TYPES_WITH_FIELDS, GetAllObjectTypesWithFieldsResponse } from '@/lib/graphql/instances';
import { InstanceStatus } from '@/lib/graphql/search';
import { SearchFilters, SearchFiltersValue } from './components/SearchFilters';
import { SearchResultsGrid } from './components/SearchResultsGrid';

type SortOption = 'relevance' | 'newest' | 'oldest' | 'name_asc' | 'name_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'newest', label: 'Mais recente' },
  { value: 'oldest', label: 'Mais antigo' },
  { value: 'name_asc', label: 'Nome A-Z' },
  { value: 'name_desc', label: 'Nome Z-A' },
];

const PAGE_SIZE = 20;

export default function InstanceSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial query from URL
  const initialQuery = searchParams?.get('q') || '';

  // State
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFiltersValue>({});
  const [sort, setSort] = useState<SortOption>('relevance');
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Hooks
  const {
    search,
    searchResult,
    loading,
    error,
    getSuggestions,
    suggestionsLoading,
    getHealth,
    health,
    reindex,
    reindexing,
  } = useInstanceSearch();

  // Fetch object types for filters
  const { data: objectTypesData } = useQuery<GetAllObjectTypesWithFieldsResponse>(
    GET_ALL_OBJECT_TYPES_WITH_FIELDS,
    { variables: { first: 100 } }
  );

  const objectTypes = useMemo(
    () =>
      objectTypesData?.objectTypes?.nodes?.map((t) => ({
        id: t.id,
        name: t.name,
      })) || [],
    [objectTypesData]
  );

  // Search effect
  useEffect(() => {
    const doSearch = async () => {
      const options: InstanceSearchOptions = {
        query,
        filters: {
          objectTypeId: filters.objectTypeId,
          status: filters.status,
          createdAfter: filters.createdAfter,
          createdBefore: filters.createdBefore,
        },
        sort,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        includeFacets: true,
      };

      await search(options);
    };

    // Always search - even with empty query (returns all)
    doSearch();
  }, [query, filters, sort, page, search]);

  // Check health on mount
  useEffect(() => {
    getHealth();
  }, [getHealth]);

  // Debounced suggestions
  useEffect(() => {
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await getSuggestions(inputValue, filters.objectTypeId);
      setSuggestions(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, filters.objectTypeId, getSuggestions]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setQuery(inputValue);
      setPage(0);
      setShowSuggestions(false);

      // Update URL
      const url = new URL(window.location.href);
      if (inputValue) {
        url.searchParams.set('q', inputValue);
      } else {
        url.searchParams.delete('q');
      }
      router.replace(url.pathname + url.search);
    },
    [inputValue, router]
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    setQuery(suggestion);
    setPage(0);
    setShowSuggestions(false);
  }, []);

  const handleFilterChange = useCallback((newFilters: SearchFiltersValue) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleReindex = useCallback(async () => {
    const result = await reindex();
    if (result) {
      toast.success(`Reindexado: ${result.indexed} instancias`, {
        description: result.failed > 0 ? `${result.failed} falhas` : undefined,
      });
    } else {
      toast.error('Falha ao reindexar');
    }
  }, [reindex]);

  const totalPages = Math.ceil((searchResult?.total || 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/backoffice/instances')}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h1 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
                Busca de Instancias
              </h1>
              {searchResult && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {searchResult.total} resultado(s) em {searchResult.processingTimeMs}ms
                </p>
              )}
            </div>

            {/* Health indicator */}
            {health && (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    health.healthy ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-500">
                  {health.healthy ? 'Online' : 'Offline'}
                </span>
              </div>
            )}

            {/* Reindex button (admin) */}
            <button
              type="button"
              onClick={handleReindex}
              disabled={reindexing}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900
                         hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Reindexar todas as instancias"
            >
              <ArrowPathIcon className={`w-4 h-4 ${reindexing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Buscar instancias por nome, tipo ou conteudo..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg
                           text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                           text-lg"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                         disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors
                         flex items-center gap-2"
            >
              {loading ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <BoltIcon className="w-5 h-5" />
              )}
              Buscar
            </button>
          </form>

          {/* Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <Cog6ToothIcon className="w-4 h-4" />
                Filtros
              </button>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  setPage(0);
                }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg
                           text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View mode */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Bars3Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <SearchFilters
                  value={filters}
                  onChange={handleFilterChange}
                  facets={searchResult?.facets}
                  objectTypes={objectTypes}
                />
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">Erro na busca: {error.message}</p>
                <button
                  type="button"
                  onClick={() => setQuery(query)}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                <SearchResultsGrid
                  instances={searchResult?.instances || []}
                  query={query}
                  loading={loading}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    <span className="px-4 py-2 text-gray-500">
                      Pagina {page + 1} de {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
