'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCutoffsData } from '@/hooks/cutoffs/useCutoffsData';
import { FilterSelect } from './components/FilterSelect';
import { ActionButton } from './components/ActionButton';
import { ResultCard } from './components/ResultCard';
import { Monitor } from 'lucide-react';
import type { FilterState } from '@/types/cutoff-finder';

export default function DesktopCutoffFinder() {
    const { colleges, getProgramsForCollege, getFilterOptions, getCutoffs, isLoading } = useCutoffsData();

    const [filters, setFilters] = useState<FilterState>({});
    const [result, setResult] = useState<{ openingRank: number; closingRank: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get programs for selected college
    const programs = useMemo(() => {
        return filters.college ? getProgramsForCollege(filters.college) : [];
    }, [filters.college, getProgramsForCollege]);

    // Get cascading filter options
    const filterOptions = useMemo(() => {
        return getFilterOptions({
            college: filters.college,
            program: filters.program,
            year: filters.year,
            category: filters.category,
            round: filters.round
        });
    }, [filters, getFilterOptions]);

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
    }, []);

    const handleSearch = () => {
        if (!canSearch) return;

        try {
            // Instant client-side search!
            const cutoffs = getCutoffs(filters);

            if (cutoffs.length > 0) {
                setResult({
                    openingRank: cutoffs[0].opening,
                    closingRank: cutoffs[0].closing
                });
                setError(null);
            } else {
                setError('No cutoff data found for the selected combination. Try adjusting your filters.');
                setResult(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to search cutoffs: ${errorMessage}`);
            console.error('[DesktopCutoffFinder] Search error:', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative">
            {/* Subtle Mode Indicator - Top Right Corner */}
            <div className="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
            </div>

            <div className="space-y-4">
                {/* All filters available immediately */}
                <FilterSelect
                    label="College / Institute"
                    value={filters.college || ''}
                    onChange={(value) => updateFilter('college', value)}
                    options={colleges.map(c => ({ label: c, value: c }))}
                    disabled={isLoading}
                    loading={isLoading}
                    placeholder="Select College"
                />

                <FilterSelect
                    label="Program / Branch"
                    value={filters.program || ''}
                    onChange={(value) => updateFilter('program', value)}
                    options={programs.map(p => ({ label: p, value: p }))}
                    disabled={!filters.college}
                    placeholder="Select Program"
                />

                <FilterSelect
                    label="Year"
                    value={filters.year?.toString() || ''}
                    onChange={(value) => updateFilter('year', parseInt(value))}
                    options={filterOptions.years.map(y => ({ label: y.toString(), value: y.toString() }))}
                    disabled={!filters.program}
                    placeholder="Select Year"
                />

                <FilterSelect
                    label="Category"
                    value={filters.category || ''}
                    onChange={(value) => updateFilter('category', value)}
                    options={filterOptions.categories.map(c => ({ label: c, value: c }))}
                    disabled={!filters.program}
                    placeholder="Select Category"
                />

                <FilterSelect
                    label="Round"
                    value={filters.round || ''}
                    onChange={(value) => updateFilter('round', value)}
                    options={filterOptions.rounds.map(r => ({ label: r, value: r }))}
                    disabled={!filters.program}
                    placeholder="Select Round"
                />

                <FilterSelect
                    label="Seat Type"
                    value={filters.seatType || ''}
                    onChange={(value) => updateFilter('seatType', value)}
                    options={filterOptions.seatTypes.map(s => ({ label: s, value: s }))}
                    disabled={!filters.program}
                    placeholder="Select Seat Type"
                />

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <ActionButton
                        onClick={handleSearch}
                        disabled={!canSearch}
                        loading={false}
                        variant="primary"
                    >
                        Find Cutoff Ranks
                    </ActionButton>
                    <ActionButton
                        onClick={() => {
                            setFilters({});
                            setResult(null);
                            setError(null);
                        }}
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

