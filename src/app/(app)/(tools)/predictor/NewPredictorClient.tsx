"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import FloatingScrollbar from '@/components/ui/FloatingScrollbar';
import { PageHero } from '@/components/layout/PageHero';
import {
  AlertCircle, HelpCircle, Check, X, ChevronDown, Download,
  Share2, Copy, Star, ArrowUp, ArrowDown, Grid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { usePredictorFilters } from '@/hooks/predictor/usePredictorFilters';
import { usePredictorPagination } from '@/hooks/predictor/usePredictorPagination';
import { usePredictorAPI } from '@/hooks/predictor/usePredictorAPI';
import { CardResults } from './components/v2';
import { HelpContent } from './components/HelpContent';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { CollegeData } from './types';
import {
  exportToCSV,
  copyToClipboard,
  formatResultsAsText,
  createShareResultsUrl,
  createShareShortlistUrl,
  extractUniqueCodes
} from './utils';

interface Filters {
  rank: string;
  institute: string[];
  branch: string[];
  category: string[];
  year: string[];
  round: string[];
  quota: string[];
  seat_type: string[];
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | 'none';
  type: 'string' | 'number';
}

// Import modal components
const ChartModal = dynamic(() => import('./ChartModal'), {
  loading: () => <div className="p-4 text-center">Loading Chart...</div>,
  ssr: false
});

const ComparisonModal = dynamic(() => import('./ComparisonModal'), {
  loading: () => <div className="p-4 text-center">Loading Comparison...</div>,
  ssr: false
});
export default function NewPredictorClient() {
  // API search trigger states
  const [searchFilters, setSearchFilters] = useState<Filters>({
    rank: '',
    institute: [],
    branch: [],
    category: [],
    year: [],
    round: [],
    quota: [],
    seat_type: [],
  });

  // Use API hook for server-side filtering
  const { results: apiResults, total: apiTotal, metadata, isLoading: apiLoading, error: apiError } = usePredictorAPI(searchFilters);

  // Keep local state for display (API results + client predictions already included from server)
  const [filteredData, setFilteredData] = useState<CollegeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch filter metadata on mount
  useEffect(() => {
    fetch('/api/predictor/metadata')
      .then(res => res.json())
      .then(data => setFilterMetadata(data))
      .catch(err => console.error('Failed to load filter metadata:', err));
  }, []);
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: 'none',
    type: 'string'
  });

  // New features state
  const [showChartModal, setShowChartModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedCollegeForChart, setSelectedCollegeForChart] = useState<CollegeData | null>(null);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false); // Mobile filter drawer
  const [searchHistory, setSearchHistory] = useState<number[]>([]); // Recent searches

  // Filter metadata (loaded on mount for instant filter display)
  const [filterMetadata, setFilterMetadata] = useState<{
    institutes: string[];
    branches: string[];
    categories: string[];
    quotas: string[];
    seat_types: string[];
    years: string[];
    rounds: string[];
  } | null>(null);

  // Ref for table container (for floating scrollbar)
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  // Custom hooks for state management
  const { favorites, isShowingFavorites, toggleFavorite, setIsShowingFavorites } = useFavorites();

  // View mode: 'table' or 'cards'
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Pagination hook needs to be initialized first to get setCurrentPage
  const [tempCurrentPage, setTempCurrentPage] = useState(1);

  const {
    activeFilters,
    setActiveFilters,
    showFilters,
    setShowFilters,
    isSmartFilteringEnabled,
    setIsSmartFilteringEnabled,
    rankError,
    setRankError,
    hasSearched,
    setHasSearched,
    filterSearchTerms,
    setFilterSearchTerms,
    handleRankChange,
    filteredResults,
    resetFilters,
  } = usePredictorFilters(filteredData, favorites, isShowingFavorites, setTempCurrentPage);

  // Auto-save user preferences
  const saveUserPreferences = useCallback(() => {
    const preferences = {
      activeFilters,
      sortState,
      currentPage: tempCurrentPage,
      entriesPerPage: 50,
      isSmartFilteringEnabled,
      showFilters,
      filterSearchTerms,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('wbjeePredictorPreferences', JSON.stringify(preferences));
  }, [activeFilters, sortState, tempCurrentPage, isSmartFilteringEnabled, showFilters, filterSearchTerms]);

  // Load user preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('wbjeePredictorPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.activeFilters) setActiveFilters(preferences.activeFilters);
        if (preferences.sortState) setSortState(preferences.sortState);
        if (preferences.currentPage) setTempCurrentPage(preferences.currentPage);
        if (preferences.isSmartFilteringEnabled !== undefined) setIsSmartFilteringEnabled(preferences.isSmartFilteringEnabled);
        if (preferences.showFilters !== undefined) setShowFilters(preferences.showFilters);
        if (preferences.filterSearchTerms) setFilterSearchTerms(preferences.filterSearchTerms);
      } catch (error) {
        console.warn('Failed to load user preferences:', error);
      }
    }

    // Load search history
    const savedHistory = localStorage.getItem('wbjeeSearchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setSearchHistory(history);
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    }
  }, [setActiveFilters, setIsSmartFilteringEnabled, setShowFilters, setFilterSearchTerms]);

  // Auto-save preferences when they change
  useEffect(() => {
    const timeoutId = setTimeout(saveUserPreferences, 3000); // Debounce saves (reduced frequency)
    return () => clearTimeout(timeoutId);
  }, [saveUserPreferences]);


  // Pull-to-refresh functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(distance);
      setCanRefresh(distance > 80); // Threshold for refresh
    }
  }, [startY]);

  // Define handleRefresh BEFORE handleTouchEnd to avoid block-scoped variable error
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);

      // Re-trigger the current search to get fresh data from API
      if (searchFilters.rank) {
        // Force a re-fetch by updating search filters
        setSearchFilters({ ...searchFilters });
      }

      // Show success message
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Data refreshed successfully!';
      document.body.appendChild(notification);

      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);

    } catch (error) {
      console.error('Refresh failed:', error);
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      notification.textContent = 'Failed to refresh data';
      document.body.appendChild(notification);

      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } finally {
      setIsRefreshing(false);
    }
  }, [searchFilters]);

  const handleTouchEnd = useCallback(async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      await handleRefresh();
    }
    setPullDistance(0);
    setStartY(0);
    setCanRefresh(false);
  }, [canRefresh, isRefreshing, handleRefresh]);

  // Keep local display state in sync even when a search returns zero matches.
  useEffect(() => {
    setFilteredData(apiResults);
  }, [apiResults]);

  // Auto-switch to card view on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('cards');
      }
    };

    // Check initial load
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Manual search handler - only fetch when user clicks Search or presses Enter
  const handleSearch = useCallback(() => {
    // Validate rank
    const rank = parseInt(activeFilters.rank);
    if (!rank || rank <= 0) {
      setRankError('Please enter a valid rank (minimum: 1)');
      return;
    }

    // Check maximum rank (1.5M for JEE Mains compatibility)
    if (rank > 1500000) {
      setRankError('Rank cannot exceed 1,500,000');
      return;
    }

    // Clear any previous errors
    setRankError('');
    setError(null);

    // Set search filters to trigger API call
    setSearchFilters(activeFilters);

    // Mark as searched
    setHasSearched(true);

    // Save to search history
    const history = [rank, ...searchHistory.filter(r => r !== rank)].slice(0, 5);
    setSearchHistory(history);
    localStorage.setItem('wbjeeSearchHistory', JSON.stringify(history));
  }, [activeFilters, searchHistory, setRankError, setHasSearched]);

  // Enter key handler for rank input
  const handleRankKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Get filtered options for cascading filters (uses metadata when available)
  const getFilteredOptions = useMemo(() => {
    return {
      institute: filterMetadata?.institutes || [...new Set(filteredData.map(item => item.institute))].sort(),
      branch: filterMetadata?.branches || [...new Set(filteredData.map(item => item.branch))].sort(),
      category: filterMetadata?.categories || [...new Set(filteredData.map(item => item.category))].sort(),
      quota: filterMetadata?.quotas || [...new Set(filteredData.map(item => item.quota))].sort(),
      seat_type: filterMetadata?.seat_types || [...new Set(filteredData.map(item => item.seat_type))].sort(),
      year: filterMetadata?.years || [...new Set(filteredData.map(item => item.year).filter(Boolean))].map(String).sort(),
      round: filterMetadata?.rounds || [...new Set(filteredData.map(item => item.round))].sort()
    };
  }, [filterMetadata, filteredData]);

  // Apply sorting (filteredResults comes from usePredictorFilters hook)
  const sortedResults = useMemo(() => {
    if (sortState.direction === 'none' || !sortState.column) return filteredResults;

    return [...filteredResults].sort((a, b) => {
      let valA: string | number | null;
      let valB: string | number | null;

      // Special handling for prediction field
      if (sortState.column === 'prediction') {
        valA = a.prediction.order;
        valB = b.prediction.order;
      } else {
        valA = a[sortState.column as keyof CollegeData] as string | number | null;
        valB = b[sortState.column as keyof CollegeData] as string | number | null;
      }

      let comparison = 0;
      if (sortState.type === 'number' || sortState.column === 'prediction') {
        comparison = (valA as number || 0) - (valB as number || 0);
      } else {
        comparison = String(valA || '').localeCompare(String(valB || ''));
      }

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredResults, sortState]);

  // Use pagination hook
  const { currentPage, setCurrentPage, entriesPerPage, setEntriesPerPage, paginatedResults } = usePredictorPagination(sortedResults, 50);

  // Sync pagination with temp state
  useEffect(() => {
    setCurrentPage(tempCurrentPage);
  }, [tempCurrentPage, setCurrentPage]);



  // validateRank, handleRankChange, and toggleFavorite are now provided by custom hooks

  // Handler to apply a rank from search history
  const applyHistoryRank = useCallback((rank: number) => {
    handleRankChange(rank.toString());
  }, [handleRankChange]);

  // Handler to clear rank input
  const clearRank = useCallback(() => {
    handleRankChange('');
  }, [handleRankChange]);

  const handleSort = (column: string) => {
    setSortState(prev => {
      // Determine sort type
      const sortType = column.includes('rank') || column === 'prediction' ? 'number' : 'string';

      if (prev.column === column) {
        if (prev.direction === 'asc') {
          return { column, direction: 'desc', type: sortType };
        } else if (prev.direction === 'desc') {
          return { column: null, direction: 'none', type: 'string' };
        } else {
          return { column, direction: 'asc', type: sortType };
        }
      } else {
        return { column, direction: 'asc', type: sortType };
      }
    });
  };

  const showRankTrendChart = (college: CollegeData) => {
    setSelectedCollegeForChart(college);
    setShowChartModal(true);
  };

  const showComparison = () => {
    if (favorites.size >= 2 && favorites.size <= 4) {
      setShowComparisonModal(true);
    }
  };

  const shareResults = () => {
    if (!activeFilters.rank) {
      alert('Please enter a rank first to share results!');
      return;
    }
    const shareUrl = createShareResultsUrl(activeFilters.rank);
    copyToClipboard(shareUrl, 'Results link copied to clipboard!');
  };

  const shareShortlist = () => {
    if (favorites.size === 0) {
      alert('Your shortlist is empty. Add some colleges first!');
      return;
    }
    const shareUrl = createShareShortlistUrl(Array.from(favorites));
    copyToClipboard(shareUrl, 'Shortlist link copied to clipboard!');
  };

  const shareEverything = () => {
    copyToClipboard(window.location.href, 'Full page link copied to clipboard!');
  };

  const copyResultsText = () => {
    if (filteredResults.length === 0) {
      alert('No results to copy. Please search for colleges first!');
      return;
    }
    const userRank = parseInt(activeFilters.rank) || 0;
    const text = formatResultsAsText(filteredResults, userRank);
    copyToClipboard(text, 'Results copied as text!');
  };

  const copyCollegeCodes = () => {
    const dataToUse = isShowingFavorites ?
      filteredData.filter((item: CollegeData) => favorites.has(item.id)) :
      filteredResults;

    if (dataToUse.length === 0) {
      alert('No colleges to copy. Please search for colleges first!');
      return;
    }

    const codes = extractUniqueCodes(dataToUse);
    copyToClipboard(codes.join('\n'), 'College codes copied to clipboard!');
  };


  // No longer show loading state on initial mount - data comes from API on search

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-['Inter',sans-serif]">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <p className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">Unable to load data</p>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 font-['Inter',sans-serif]">
        {/* Skip Links for Keyboard Users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <a
          href="#rank-input"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to rank input
        </a>
        <a
          href="#filters"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-56 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to filters
        </a>
        <a
          href="#results"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to results
        </a>

        <div
          className="w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.5, 60)}px)` : 'none',
            transition: isRefreshing ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          {/* Hero Section */}
          <div className="relative">
            <button
              onClick={() => setShowHelpModal(true)}
              className="absolute top-12 right-6 md:right-12 w-10 h-10 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none z-10"
              title="Help & Guide"
              aria-label="Open help and guide modal"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <PageHero
              title={{ main: 'WBJEE', accent: 'College Predictor' }}
              description="Find your perfect engineering college and branch based on your WBJEE rank with detailed analysis and cutoff trends."
            />
          </div>

          {/* Content Wrapper for horizontal padding */}
          <div className="px-6 md:px-12">
            {/* Rank Input and Filters */}
            <section className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4 sm:mb-8">
              <div className="mb-4 sm:mb-6">
                <label className="block text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                  Your WBJEE Rank
                </label>
                <div className="space-y-2">
                  {/* Rank Input with Search Button */}
                  <div className="flex gap-3">
                    <div className="relative flex-1 max-w-md">
                      <input
                        id="rank-input"
                        type="number"
                        value={activeFilters.rank}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Sanitize input: prevent decimals and negatives from paste
                          if (val.includes('.')) val = val.split('.')[0];
                          val = val.replace(/[^0-9]/g, '');
                          setActiveFilters(prev => ({ ...prev, rank: val }));
                        }}
                        onKeyPress={handleRankKeyPress}
                        onKeyDown={(e) => {
                          // Block 'e', 'E', '+', '-', '.' (only allow digits)
                          if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="Enter your WBJEE rank (e.g., 5000)"
                        min="1"
                        max="1500000"
                        className={`w-full px-3 py-2 sm:px-4 sm:py-3 pr-12 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-base sm:text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${rankError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        aria-describedby="rank-help"
                        aria-invalid={!!rankError}
                      />
                      {/* Clear Button */}
                      {activeFilters.rank && (
                        <button
                          onClick={clearRank}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors"
                          aria-label="Clear rank input"
                          title="Clear rank"
                        >
                          <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </button>
                      )}
                    </div>

                    {/* Search Button */}
                    <button
                      onClick={handleSearch}
                      disabled={!activeFilters.rank || apiLoading}
                      className="px-3 py-2 sm:px-8 sm:py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-md transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none flex items-center gap-2"
                      title="Search for colleges (or press Enter)"
                    >
                      {apiLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="hidden sm:inline">Searching...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="hidden sm:inline">Search</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Validation Messages */}
                  {rankError && (
                    <div role="alert" className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {rankError}
                    </div>
                  )}

                  {/* API Error */}
                  {apiError && hasSearched && (
                    <div role="alert" className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Failed to load results. Please try again.
                    </div>
                  )}

                  {/* Success/Loading States */}
                  {activeFilters.rank && !rankError && hasSearched && !apiLoading && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                      <Check className="w-4 h-4" />
                      Showing {apiTotal || filteredResults.length} matching colleges
                      {metadata && ` (Rank ${Math.round(metadata.filterUsed.floor).toLocaleString()}-${Math.round(metadata.filterUsed.ceiling).toLocaleString()})`}
                    </div>
                  )}


                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent:</span>
                      {searchHistory.map((rank) => (
                        <button
                          key={rank}
                          onClick={() => applyHistoryRank(rank)}
                          className="px-3 py-1 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-200 dark:border-indigo-800"
                          title={`Search for rank ${rank}`}
                        >
                          {rank.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Desktop: Show/Hide Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden md:inline-flex px-6 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-expanded={showFilters}
                  aria-controls="filters"
                  aria-label={showFilters ? 'Hide filter options' : 'Show filter options'}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {/* Mobile: Open Filter Drawer Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  aria-label="Open filter options"
                >
                  Show Filters
                </button>
                <button
                  onClick={() => {
                    resetFilters();
                    setIsShowingFavorites(false);
                  }}
                  className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-medium transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  title="Reset all filters and settings"
                >
                  Reset All
                </button>
              </div>

              {/* Desktop Filters */}
              {showFilters && (
                <div id="filters" className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {(['institute', 'branch', 'category', 'year', 'round', 'quota', 'seat_type'] as const).map((filterKey) => {
                    const allOptions = getFilteredOptions[filterKey];
                    const searchTerm = filterSearchTerms[filterKey] || '';
                    const filteredOptions = allOptions.filter(option =>
                      String(option).toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    return (
                      <div key={filterKey} className="relative">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          {filterKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </label>
                        <div className="relative">
                          {(filterKey === 'institute' || filterKey === 'branch') && (
                            <input
                              type="text"
                              placeholder={`Search ${filterKey.replace('_', ' ').toLowerCase()}...`}
                              value={searchTerm}
                              onChange={(e) => setFilterSearchTerms(prev => ({ ...prev, [filterKey]: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                            />
                          )}
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => {
                                const visibleOptions = filteredOptions.map(String);
                                setActiveFilters(prev => ({
                                  ...prev,
                                  [filterKey]: visibleOptions
                                }));
                                setCurrentPage(1);
                              }}
                              className="flex-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            >
                              Select All Visible
                            </button>
                            <button
                              onClick={() => {
                                setActiveFilters(prev => ({
                                  ...prev,
                                  [filterKey]: []
                                }));
                                setCurrentPage(1);
                              }}
                              className="flex-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                            <div className="p-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={activeFilters[filterKey].length === filteredOptions.length && filteredOptions.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // If checking "All", select all visible options
                                      setActiveFilters(prev => ({
                                        ...prev,
                                        [filterKey]: filteredOptions.map(String)
                                      }));
                                    } else {
                                      // If unchecking "All", clear all selections
                                      setActiveFilters(prev => ({
                                        ...prev,
                                        [filterKey]: []
                                      }));
                                    }
                                    setCurrentPage(1);
                                  }}
                                  className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-slate-700 dark:text-slate-300">All {filterKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </label>
                              {filteredOptions.map((option) => (
                                <label key={option} className="flex items-center gap-2 text-sm py-1">
                                  <input
                                    type="checkbox"
                                    checked={activeFilters[filterKey].includes(String(option))}
                                    onChange={(e) => {
                                      const value = String(option);
                                      setActiveFilters(prev => ({
                                        ...prev,
                                        [filterKey]: e.target.checked
                                          ? [...prev[filterKey], value]
                                          : prev[filterKey].filter(v => v !== value)
                                      }));
                                      setCurrentPage(1);
                                    }}
                                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <span className="text-slate-700 dark:text-slate-300">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Mobile Filter Drawer (Bottom Sheet) */}
            {showMobileFilters && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setShowMobileFilters(false)}
                  aria-hidden="true"
                />

                {/* Drawer */}
                <div className="fixed inset-x-0 bottom-0 z-50 md:hidden bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filter Options</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Close filters"
                    >
                      <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>

                  {/* Drawer Content (Scrollable) */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-6">
                      {(['institute', 'branch', 'category', 'year', 'round', 'quota', 'seat_type'] as const).map((filterKey) => {
                        const allOptions = getFilteredOptions[filterKey];
                        const searchTerm = filterSearchTerms[filterKey] || '';
                        const filteredOptions = allOptions.filter(option =>
                          String(option).toLowerCase().includes(searchTerm.toLowerCase())
                        );

                        return (
                          <div key={filterKey} className="relative">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              {filterKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <div className="relative">
                              {(filterKey === 'institute' || filterKey === 'branch') && (
                                <input
                                  type="text"
                                  placeholder={`Search ${filterKey.replace('_', ' ').toLowerCase()}...`}
                                  value={searchTerm}
                                  onChange={(e) => setFilterSearchTerms(prev => ({ ...prev, [filterKey]: e.target.value }))}
                                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-2"
                                />
                              )}
                              <div className="flex gap-2 mb-2">
                                <button
                                  onClick={() => {
                                    const visibleOptions = filteredOptions.map(String);
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      [filterKey]: visibleOptions
                                    }));
                                    setCurrentPage(1);
                                  }}
                                  className="flex-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveFilters(prev => ({
                                      ...prev,
                                      [filterKey]: []
                                    }));
                                    setCurrentPage(1);
                                  }}
                                  className="flex-1 px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                  Clear
                                </button>
                              </div>
                              <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                                <div className="p-2 space-y-1">
                                  {filteredOptions.map((option) => (
                                    <label key={option} className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-600 rounded transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={activeFilters[filterKey].includes(String(option))}
                                        onChange={(e) => {
                                          const value = String(option);
                                          setActiveFilters(prev => ({
                                            ...prev,
                                            [filterKey]: e.target.checked
                                              ? [...prev[filterKey], value]
                                              : prev[filterKey].filter(v => v !== value)
                                          }));
                                          setCurrentPage(1);
                                        }}
                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <span className="text-slate-700 dark:text-slate-300">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Results Table */}
            <h2 className="sr-only">Results</h2><section id="results" className="bg-white dark:bg-slate-800 p-4 sm:p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mb-4 sm:mb-8">
              {/* Top Controls */}
              <div className="mb-4 sm:mb-6 space-y-4">
                {/* Pagination and Results Info - Visible for ALL views */}
                {/* Pagination and Results Info - Visible for ALL views */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-1">
                    <label htmlFor="entries-per-page" className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">Show:</label>
                    <select
                      id="entries-per-page"
                      value={entriesPerPage}
                      aria-label="Select number of rows per page"
                      onChange={(e) => {
                        setEntriesPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value="all">All</option>
                    </select>
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      (Total: {sortedResults.length})
                    </span>


                    {viewMode === 'table' && (
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium ml-2 hidden sm:block">
                        {((currentPage - 1) * (entriesPerPage === 'all' ? sortedResults.length : entriesPerPage)) + 1}-{Math.min(currentPage * (entriesPerPage === 'all' ? sortedResults.length : entriesPerPage), sortedResults.length)} of {sortedResults.length}
                      </div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {entriesPerPage !== 'all' && sortedResults.length > entriesPerPage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-9 w-9 p-0 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-1 text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                        {currentPage} / {Math.ceil(sortedResults.length / entriesPerPage)}
                      </span>
                      <button
                        onClick={() => setCurrentPage(Math.min(Math.ceil(sortedResults.length / (entriesPerPage as number)), currentPage + 1))}
                        disabled={currentPage >= Math.ceil(sortedResults.length / (entriesPerPage as number))}
                        className="h-9 w-9 p-0 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>


                {/* Action Buttons */}
                <div className="flex flex-row justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-3">
                    {/* View Toggle Buttons */}
                    <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'cards'
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        aria-label="Card view"
                      >
                        <Grid className="w-4 h-4 inline mr-2" />
                        Cards
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === 'table'
                          ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        aria-label="Table view"
                      >
                        <List className="w-4 h-4 inline mr-2" />
                        Table
                      </button>
                    </div>

                    <button
                      onClick={() => setIsShowingFavorites(!isShowingFavorites)}
                      className="h-9 md:h-auto px-3 py-2 md:px-6 md:py-2.5 text-sm md:text-base bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                      {isShowingFavorites ? 'Show All' : `Favorites (${favorites.size})`}
                    </button>
                    {favorites.size >= 2 && favorites.size <= 4 && (
                      <button
                        onClick={showComparison}
                        className="h-9 md:h-auto px-3 py-2 md:px-6 md:py-2.5 text-sm md:text-base bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                      >
                        Compare ({favorites.size})
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowShareDropdown(!showShareDropdown)}
                        className="h-9 md:h-auto px-3 py-2 md:px-6 md:py-2.5 text-sm md:text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Export & Share</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {showShareDropdown && (
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 z-50">
                          <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                              Export Options
                            </div>
                            <button
                              onClick={() => { exportToCSV(filteredResults); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Export Results (CSV)
                            </button>
                            <button
                              onClick={() => { exportToCSV(filteredData.filter((item: CollegeData) => favorites.has(item.id))); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Export Favorites (CSV)
                            </button>

                            <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600 mt-2">
                              Share Options
                            </div>
                            <button
                              onClick={() => { shareResults(); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share Results
                            </button>
                            <button
                              onClick={() => { shareShortlist(); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share Favorites
                            </button>
                            <button
                              onClick={() => { shareEverything(); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Share2 className="w-4 h-4" />
                              Share Page
                            </button>

                            <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-600 mt-2">
                              Copy Options
                            </div>
                            <button
                              onClick={() => { copyResultsText(); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Copy Results (Text)
                            </button>
                            <button
                              onClick={() => { copyCollegeCodes(); setShowShareDropdown(false); }}
                              className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Copy College Codes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card-based UI (V2) - Mobile and Desktop */}
              {viewMode === 'cards' && hasSearched && (
                <div className="mt-6">
                  <CardResults
                    results={paginatedResults}
                    userRank={parseInt(activeFilters.rank) || 0}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              )}
            </section>

            {/* Table View - Desktop Only */}
            {viewMode === 'table' && (
              <section id="results-table" className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                {/* Mobile Card View (Original Mobile Table) */}
                <div className="md:hidden space-y-4" role="region" aria-label="College prediction results" aria-live="polite">
                  {paginatedResults.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => showRankTrendChart(item)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${item.institute} ${item.branch}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          showRankTrendChart(item);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{item.institute}</h2>
                          <p className="text-slate-600 dark:text-slate-400">{item.branch}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className={`text-2xl ml-2 ${favorites.has(item.id) ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`}
                          aria-label={favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-6 h-6 ${favorites.has(item.id) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.prediction.text === 'Confirm' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100' :
                          item.prediction.text === 'Great' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100' :
                            item.prediction.text === 'Good' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-100' :
                              item.prediction.text === 'Borderline' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100'
                          }`}>
                          {item.prediction.text}
                        </span>
                        <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                          <div>Opening: <span className="font-mono font-semibold">{item.opening_rank || 'N/A'}</span></div>
                          <div>Closing: <span className="font-mono font-semibold">{item.closing_rank || 'N/A'}</span></div>
                        </div>
                      </div>

                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <div>Category: <span className="font-medium">{item.category}</span></div>
                        <div>Year: <span className="font-medium">{item.year || 'N/A'}</span></div>
                        {item.quota && <div>Quota: <span className="font-medium">{item.quota}</span></div>}
                        {item.seat_type && <div>Seat Type: <span className="font-medium">{item.seat_type}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div
                  ref={tableContainerRef}
                  className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
                  role="region"
                  aria-label="College prediction results"
                  aria-live="polite"
                >
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700" role="table" aria-label="WBJEE college predictions table">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-2 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Fav
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('prediction')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Prediction
                            {sortState.column === 'prediction' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('institute')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Institute
                            {sortState.column === 'institute' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('branch')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Branch
                            {sortState.column === 'branch' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('category')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Category
                            {sortState.column === 'category' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('opening_rank')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Opening Rank
                            {sortState.column === 'opening_rank' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('closing_rank')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Closing Rank
                            {sortState.column === 'closing_rank' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('year')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Year
                            {sortState.column === 'year' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('round')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Round
                            {sortState.column === 'round' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('quota')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Quota
                            {sortState.column === 'quota' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('seat_type')}
                            className="hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                          >
                            Seat Type
                            {sortState.column === 'seat_type' && (
                              sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            )}
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {paginatedResults.map((item) => (
                        <tr
                          key={item.id}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                          onClick={() => showRankTrendChart(item)}
                        >
                          <td className="px-2 py-4 whitespace-nowrap text-sm text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className="focus:outline-none"
                            >
                              <Star className={`w-5 h-5 ${favorites.has(item.id) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`} />
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${item.prediction.text === 'Confirm' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100' :
                              item.prediction.text === 'Great' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100' :
                                item.prediction.text === 'Good' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-100' :
                                  item.prediction.text === 'Borderline' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100'
                              }`}>
                              {item.prediction.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.institute}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-mono">
                            {item.opening_rank || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-mono">
                            {item.closing_rank || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.year || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.round || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.quota || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {item.seat_type || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Floating Scrollbar */}
                <FloatingScrollbar tableRef={tableContainerRef} />

                {paginatedResults.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No colleges match your criteria. Try adjusting your filters.
                  </div>
                )}
              </section>
            )}

            {/* Chart Modal */}
            {showChartModal && (
              <ChartModal
                isOpen={showChartModal}
                onClose={() => setShowChartModal(false)}
                college={selectedCollegeForChart}
                allData={filteredData}
              />
            )}

            {/* Comparison Modal */}
            {showComparisonModal && (
              <ComparisonModal
                isOpen={showComparisonModal}
                onClose={() => setShowComparisonModal(false)}
                favorites={favorites}
                allData={filteredData}
              />
            )}

            {/* Help Modal */}
            {showHelpModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Help & Guide</h3>
                    <button
                      onClick={() => setShowHelpModal(false)}
                      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-2xl"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                    <HelpContent />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Keywords Section */}
            <div className="mt-12 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-center">
                Discover the best engineering colleges in West Bengal for your WBJEE rank. Get personalized admission predictions, detailed cutoff analysis, and interactive trend charts for top engineering institutes across West Bengal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

