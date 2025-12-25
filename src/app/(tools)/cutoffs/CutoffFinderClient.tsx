"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, AlertCircle, ArrowDownToLine, ArrowUpFromLine, RotateCcw } from 'lucide-react';
import { useCascadingFilters } from '@/hooks/predictor/useCascadingFilters';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CutoffFinderClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    filters,
    colleges,
    programs,
    years,
    rounds,
    seatTypes,
    categories,
    isLoading,
    error: filterError,
    updateFilter,
    resetFilters,
  } = useCascadingFilters();

  const [result, setResult] = useState<{ openingRank: number; closingRank: number } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Load from URL on mount
  useEffect(() => {
    const collegeParam = searchParams.get('college');
    const programParam = searchParams.get('program');
    const yearParam = searchParams.get('year');
    const categoryParam = searchParams.get('category');
    const roundParam = searchParams.get('round');
    const seatTypeParam = searchParams.get('seat_type');

    if (collegeParam) updateFilter('college', collegeParam);
    if (programParam) updateFilter('program', programParam);
    if (yearParam) updateFilter('year', parseInt(yearParam));
    if (categoryParam) updateFilter('category', categoryParam);
    if (roundParam) updateFilter('round', roundParam);
    if (seatTypeParam) updateFilter('seatType', seatTypeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.college) params.set('college', filters.college);
    if (filters.program) params.set('program', filters.program);
    if (filters.year) params.set('year', filters.year.toString());
    if (filters.category) params.set('category', filters.category);
    if (filters.round) params.set('round', filters.round);
    if (filters.seatType) params.set('seat_type', filters.seatType);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  const handleSearch = async () => {
    if (!filters.college || !filters.program || !filters.year ||
      !filters.category || !filters.round || !filters.seatType) {
      setSearchError('Please select all filters');
      return;
    }

    setSearching(true);
    setSearchError("");
    setResult(null);

    try {
      const params = new URLSearchParams({
        college: filters.college,
        program: filters.program,
        year: filters.year.toString(),
        round: filters.round,
        category: filters.category,
        seat_type: filters.seatType,
      });

      const res = await fetch(`/api/cutoffs/search?${params}`);
      const data = await res.json();

      if (res.ok && !data.error) {
        setResult(data);
      } else {
        setSearchError(data.error || "No data found for the selected criteria.");
      }
    } catch (err) {
      setSearchError("An error occurred while fetching data.");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    resetFilters();
    setResult(null);
    setSearchError("");
  };

  // Show loading state while metadata loads
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading filters...</span>
      </div>
    );
  }

  // Show error if metadata fails to load
  if (filterError) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
        <p className="text-red-600 dark:text-red-400">Failed to load filter options</p>
        <p className="text-sm text-gray-500 mt-2">{filterError.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* COLLEGE - Tier 1 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              College <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={filters.college || ''}
              onChange={(e) => {
                updateFilter('college', e.target.value);
                setResult(null);
              }}
            >
              <option value="">-- Select College --</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* PROGRAM - Tier 2 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Program <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={filters.program || ''}
              onChange={(e) => {
                updateFilter('program', e.target.value);
                setResult(null);
              }}
              disabled={!filters.college}
            >
              <option value="">-- Select Program --</option>
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {programs.length === 0 && filters.college && (
              <p className="text-xs text-amber-600 dark:text-amber-400">No programs found for this college</p>
            )}
          </div>

          {/* YEAR - Tier 3 (appears after program) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={filters.year || ''}
              onChange={(e) => {
                updateFilter('year', parseInt(e.target.value));
                setResult(null);
              }}
              disabled={!filters.program}
            >
              <option value="">-- Select Year --</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* CATEGORY - Tier 3 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={filters.category || ''}
              onChange={(e) => {
                updateFilter('category', e.target.value);
                setResult(null);
              }}
              disabled={!filters.program}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* ROUND - Tier 3 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Round <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={filters.round || ''}
              onChange={(e) => {
                updateFilter('round', e.target.value);
                setResult(null);
              }}
              disabled={!filters.program}
            >
              <option value="">-- Select Round --</option>
              {rounds.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* SEAT TYPE - Tier 3 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Seat Type <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              value={filters.seatType || ''}
              onChange={(e) => {
                updateFilter('seatType', e.target.value);
                setResult(null);
              }}
              disabled={!filters.program}
            >
              <option value="">-- Select Seat Type --</option>
              {seatTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSearch}
            disabled={
              searching ||
              !filters.college || !filters.program || !filters.year ||
              !filters.category || !filters.round || !filters.seatType
            }
            className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" /> Finding Ranks...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" /> Find Cutoff Ranks
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Search Error Message */}
        {searchError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {searchError}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                Search Result
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-auto hidden md:inline">
                  {filters.year} • {filters.round}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Rank */}
                <div className="p-5 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ArrowUpFromLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Opening Rank</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white pl-1">
                    {result.openingRank.toLocaleString()}
                  </p>
                </div>

                {/* Closing Rank */}
                <div className="p-5 bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-900/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <ArrowDownToLine className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Closing Rank</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white pl-1">
                    {result.closingRank.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}