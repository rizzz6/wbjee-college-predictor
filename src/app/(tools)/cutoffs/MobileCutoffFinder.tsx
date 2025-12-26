'use client';

import { useState, useCallback } from 'react';
import { useStaticSlices } from '@/hooks/cutoffs/useStaticSlices';
import { FilterSelect } from './components/FilterSelect';
import { ActionButton } from './components/ActionButton';
import { ResultCard } from './components/ResultCard';
import { Loader2, Smartphone } from 'lucide-react';
import type { FilterState, SearchResult } from '@/types/cutoff-finder';

export default function MobileCutoffFinder() {
    const {
        colleges,
        isLoadingIndex,
        collegeData,
        isLoadingSlice,
        sliceError,
        selectCollege,
        retrySlice
    } = useStaticSlices();

    const [filters, setFilters] = useState<FilterState>({});
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canSearch = filters.college && filters.program && filters.year &&
        filters.category && filters.round && filters.seatType;

    const updateFilter = useCallback((key: keyof FilterState, value: string | number | undefined) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // Reset dependent filters
            if (key === 'college') {
                newFilters.program = undefined;
                newFilters.year = undefined;
                newFilters.category = undefined;
                newFilters.round = undefined;
                newFilters.seatType = undefined;

                // Load college data
                if (value) {
                    selectCollege(value as string);
                }
            } else if (key === 'program') {
                newFilters.year = undefined;
                newFilters.category = undefined;
                newFilters.round = undefined;
                newFilters.seatType = undefined;
            }

            return newFilters;
        });
        setResult(null);
        setError(null);
    }, [selectCollege]);

    const resetFilters = () => {
        setFilters({});
        setResult(null);
        setError(null);
    };

    const handleSearch = () => {
        if (!canSearch || !collegeData) return;

        try {
            // Client-side search in the loaded slice
            const found = collegeData.cutoffs.find(c =>
                c.program === filters.program &&
                c.year === filters.year &&
                c.category === filters.category &&
                c.round === filters.round &&
                c.seatType === filters.seatType
            );

            if (found) {
                setResult({
                    openingRank: found.opening,
                    closingRank: found.closing
                });
                setError(null);
            } else {
                setError('No cutoff data found for this combination. The college may not offer this program in the selected category.');
                setResult(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to search cutoffs: ${errorMessage}`);
            console.error('[MobileCutoffFinder] Search error:', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative">
            {/* Subtle Mode Indicator - Top Right Corner */}
            <div className="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
                <Smartphone className="h-3 w-3" />
                <span>Mobile</span>
            </div>

            <div className="space-y-4">
                {/* College */}
                <FilterSelect
                    label="College / Institute"
                    value={filters.college || ''}
                    onChange={(value) => updateFilter('college', value)}
                    options={colleges.map(c => ({ label: c, value: c }))}
                    disabled={isLoadingIndex}
                    loading={isLoadingIndex}
                    placeholder="Select College"
                />

                {/* Program */}
                <FilterSelect
                    label="Program / Branch"
                    value={filters.program || ''}
                    onChange={(value) => updateFilter('program', value)}
                    options={(collegeData?.programs || []).map(p => ({ label: p, value: p }))}
                    disabled={!filters.college || isLoadingIndex}
                    placeholder="Select Program"
                />

                {/* Loading state for college data */}
                {isLoadingSlice && (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading college data...</span>
                    </div>
                )}

                {/* Error state for college data */}
                {sliceError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 mb-3">
                            Failed to load college data. Please check your connection and try again.
                        </p>
                        <button
                            onClick={retrySlice}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Other filters - only show after college data loaded */}
                {filters.college && collegeData && !isLoadingSlice && (
                    <>
                        <FilterSelect
                            label="Year"
                            value={filters.year?.toString() || ''}
                            onChange={(value) => updateFilter('year', parseInt(value))}
                            options={collegeData.years.map(y => ({ label: y.toString(), value: y.toString() }))}
                            placeholder="Select Year"
                        />

                        <FilterSelect
                            label="Category"
                            value={filters.category || ''}
                            onChange={(value) => updateFilter('category', value)}
                            options={collegeData.categories.map(c => ({ label: c, value: c }))}
                            placeholder="Select Category"
                        />

                        <FilterSelect
                            label="Round"
                            value={filters.round || ''}
                            onChange={(value) => updateFilter('round', value)}
                            options={collegeData.rounds.map(r => ({ label: r, value: r }))}
                            placeholder="Select Round"
                        />

                        <FilterSelect
                            label="Seat Type"
                            value={filters.seatType || ''}
                            onChange={(value) => updateFilter('seatType', value)}
                            options={collegeData.seatTypes.map(s => ({ label: s, value: s }))}
                            placeholder="Select Seat Type"
                        />
                    </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <ActionButton
                        onClick={handleSearch}
                        disabled={!canSearch}
                        variant="primary"
                    >
                        Find Cutoff Ranks
                    </ActionButton>
                    <ActionButton
                        onClick={resetFilters}
                        variant="secondary"
                    >
                        Reset
                    </ActionButton>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && <ResultCard openingRank={result.openingRank} closingRank={result.closingRank} />}
            </div>
        </div>
    );
}
