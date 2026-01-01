'use client';

import { useState, useCallback, useMemo } from 'react';
import { useStaticSlices } from '@/hooks/cutoffs/useStaticSlices';
import { FilterSelect } from './components/FilterSelect';
import { ActionButton } from './components/ActionButton';
import { Loader2, Smartphone, GraduationCap, Award } from 'lucide-react';
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
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const hasRequiredFilter = filters.program || filters.year || filters.round || filters.category;
    const canSearch = filters.college && hasRequiredFilter;

    const updateFilter = useCallback((key: keyof FilterState, value: string | number | undefined) => {
        setFilters(prev => {
            const next = { ...prev };

            // Update field
            if (value === undefined || value === '') {
                delete next[key];
            } else {
                if (key === 'year') {
                    next[key] = typeof value === 'string' ? parseInt(value) : value;
                } else {
                    next[key] = value as string;
                }
            }

            // College change: Reset all + trigger load (data not available yet)
            if (key === 'college') {
                if (value) selectCollege(value as string);
                return { college: next.college };
            }

            // Program change: 5-level validation (data already loaded)
            if (key === 'program') {
                if (!collegeData) return next;

                const activeProgram = value as string | undefined;
                const validRows = activeProgram
                    ? collegeData.cutoffs.filter(c => c.program === activeProgram)
                    : [];

                // LEVEL 1: Program
                if (activeProgram && validRows.length === 0) {
                    return { college: next.college };
                }

                // LEVEL 2: Year
                if (activeProgram && next.year) {
                    if (!validRows.some(c => c.year === next.year)) {
                        next.year = undefined;
                        next.round = undefined;
                    }
                }

                // LEVEL 3: Round
                if (activeProgram && next.round) {
                    const roundScope = next.year
                        ? validRows.filter(c => c.year === next.year)
                        : validRows;
                    if (!roundScope.some(c => c.round === next.round)) next.round = undefined;
                }

                // LEVEL 4: Category
                if (activeProgram && next.category) {
                    if (!validRows.some(c => c.category === next.category)) next.category = undefined;
                }

                // LEVEL 5: Seat Type
                if (activeProgram && next.seatType) {
                    if (!validRows.some(c => c.seatType === next.seatType)) next.seatType = undefined;
                }
            }

            // Year change: Validate Round
            else if (key === 'year' && next.program && next.round && value && collegeData) {
                const validRows = collegeData.cutoffs.filter(c =>
                    c.program === next.program && c.year === value
                );
                if (!validRows.some(c => c.round === next.round)) next.round = undefined;
            }

            return next;
        });
        setHasSearched(false);
    }, [selectCollege, collegeData]);

    const resetFilters = () => {
        setFilters({});
        setResults([]);
        setError(null);
        setHasSearched(false);
    };

    const handleSearch = () => {
        if (!canSearch || !collegeData) return;

        try {
            // Client-side search in the loaded slice
            const matchingCutoffs = collegeData.cutoffs.filter(c => {
                const matchesProgram = !filters.program || c.program === filters.program;
                const matchesYear = !filters.year || String(c.year) === String(filters.year);
                const matchesCategory = !filters.category || c.category === filters.category;
                const matchesRound = !filters.round || c.round === filters.round;
                const matchesSeatType = !filters.seatType || c.seatType === filters.seatType;

                return matchesProgram && matchesYear && matchesCategory && matchesRound && matchesSeatType;
            });

            if (matchingCutoffs.length > 0) {
                // Sort by closing rank (ascending)
                const sorted = matchingCutoffs
                    .map(c => ({
                        program: c.program,
                        year: c.year,
                        category: c.category,
                        round: c.round,
                        seatType: c.seatType,
                        openingRank: c.opening,
                        closingRank: c.closing
                    }))
                    .sort((a, b) => (a.closingRank ?? Infinity) - (b.closingRank ?? Infinity));

                setResults(sorted);
                setError(null);
            } else {
                setError('No cutoff data found for this combination.');
                setResults([]);
            }
            setHasSearched(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(`Failed to search cutoffs: ${errorMessage}`);
            console.error('[MobileCutoffFinder] Search error:', err);
        }
    };

    // Hierarchical grouping for compact display
    const hierarchicalResults = useMemo(() => {
        // Hierarchical grouping: Program → Seat Type → Sorted cutoffs
        const byProgram: Record<string, Record<string, SearchResult[]>> = {};

        results.forEach(result => {
            // Create program group
            if (!byProgram[result.program]) {
                byProgram[result.program] = {};
            }

            // Create seat type sub-group
            if (!byProgram[result.program][result.seatType]) {
                byProgram[result.program][result.seatType] = [];
            }

            byProgram[result.program][result.seatType].push(result);
        });

        // Sort each group: Category (alphabetical) → Year (newest first) → Round
        Object.keys(byProgram).forEach(program => {
            Object.keys(byProgram[program]).forEach(seatType => {
                byProgram[program][seatType].sort((a, b) => {
                    // First by category
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    // Then by year (descending - newest first)
                    if (a.year !== b.year) {
                        return b.year - a.year;
                    }
                    // Finally by round
                    return a.round.localeCompare(b.round);
                });
            });
        });

        return byProgram;
    }, [results]);

    // Category border color coding - returns hex color
    const getCategoryBorderColor = (category: string): string => {
        if (category === 'GENERAL') return '#3b82f6'; // blue-500
        if (category.startsWith('OBC')) return '#22c55e'; // green-500
        if (category.startsWith('SC')) return '#a855f7'; // purple-500
        if (category.startsWith('ST')) return '#f97316'; // orange-500
        if (category === 'EWS') return '#eab308'; // yellow-500
        if (category.startsWith('Open')) return '#06b6d4'; // cyan-500
        return '#9ca3af'; // gray-400
    };

    // Calculate available filter options - Master/Dependent pattern
    const availableOptions = useMemo(() => {
        if (!collegeData) return null;

        const source = collegeData.cutoffs;

        // MASTERS: Always show full list
        const programs = Array.from(new Set(source.map(c => c.program))).sort();

        // DEPENDENTS: Shrink based on active Program
        const programData = filters.program
            ? source.filter(c => c.program === filters.program)
            : source;

        return {
            programs,
            years: Array.from(new Set(programData.map(c => c.year))).sort((a, b) => b - a),
            categories: Array.from(new Set(programData.map(c => c.category))).sort(),
            rounds: Array.from(new Set(programData.map(c => c.round))).sort(),
            seatTypes: Array.from(new Set(programData.map(c => c.seatType))).sort()
        };
    }, [collegeData, filters.program]);

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


                {/* Other filters - disabled until college is selected and data loaded */}
                <FilterSelect
                    label="Program / Branch"
                    value={filters.program || ''}
                    onChange={(value) => updateFilter('program', value)}
                    options={[
                        { label: 'All Programs', value: '' },
                        ...(availableOptions?.programs.map(p => ({ label: p, value: p })) || [])
                    ]}
                    disabled={!filters.college || !collegeData || isLoadingSlice}
                    placeholder="Select Program"
                />

                <div className="grid grid-cols-2 gap-3">
                    <FilterSelect
                        label="Year"
                        value={filters.year?.toString() || ''}
                        onChange={(value) => updateFilter('year', value ? parseInt(value) : undefined)}
                        options={[
                            { label: 'All Years', value: '' },
                            ...(availableOptions?.years.map(y => ({ label: y.toString(), value: y.toString() })) || [])
                        ]}
                        disabled={!filters.college || !collegeData || isLoadingSlice}
                        placeholder="Select Year"
                    />

                    <FilterSelect
                        label="Round"
                        value={filters.round || ''}
                        onChange={(value) => updateFilter('round', value)}
                        options={[
                            { label: 'All Rounds', value: '' },
                            ...(availableOptions?.rounds.map(r => ({ label: r, value: r })) || [])
                        ]}
                        disabled={!filters.college || !collegeData || isLoadingSlice}
                        placeholder="Select Round"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <FilterSelect
                        label="Category"
                        value={filters.category || ''}
                        onChange={(value) => updateFilter('category', value)}
                        options={[
                            { label: 'All Categories', value: '' },
                            ...(availableOptions?.categories.map(c => ({ label: c, value: c })) || [])
                        ]}
                        disabled={!filters.college || !collegeData || isLoadingSlice}
                        placeholder="Select Category"
                    />

                    <FilterSelect
                        label="Seat Type"
                        value={filters.seatType || ''}
                        onChange={(value) => updateFilter('seatType', value)}
                        options={[
                            { label: 'All Seat Types', value: '' },
                            ...(availableOptions?.seatTypes.map(s => ({ label: s, value: s })) || [])
                        ]}
                        disabled={!filters.college || !collegeData || isLoadingSlice}
                        placeholder="Select Seat Type"
                    />
                </div>

                {/* Validation message */}
                {filters.college && !hasRequiredFilter && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Please select at least one of: Program, Year, Round, or Category
                        </p>
                    </div>
                )}


                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <ActionButton
                        onClick={handleSearch}
                        disabled={!canSearch}
                        variant="primary"
                    >
                        Search
                    </ActionButton>
                    <ActionButton
                        onClick={resetFilters}
                        variant="secondary"
                    >
                        Reset
                    </ActionButton>
                </div>

                {/* Error Message - Only show after search */}
                {hasSearched && error && results.length === 0 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Hierarchical Results - Only show after search button is clicked */}
                {hasSearched && results.length > 0 && (
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Found {results.length} cutoff{results.length > 1 ? 's' : ''} across {Object.keys(hierarchicalResults).length} program{Object.keys(hierarchicalResults).length > 1 ? 's' : ''}
                            </h3>
                        </div>

                        {Object.entries(hierarchicalResults).map(([program, seatTypeGroups]) => (
                            <div
                                key={program}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Program Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-3 border-b border-blue-200 dark:border-blue-800 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                                            {program}
                                        </h4>
                                    </div>
                                </div>

                                {/* Seat Type Groups */}
                                {Object.entries(seatTypeGroups).map(([seatType, cutoffs]) => (
                                    <div key={seatType}>
                                        {/* Seat Type Header */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Award className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {seatType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Cutoffs Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            Category
                                                        </th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            Year
                                                        </th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            Round
                                                        </th>
                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            OR
                                                        </th>
                                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            CR
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cutoffs.map((cutoff, index) => {
                                                        // Smart row merging logic
                                                        const prevCutoff = index > 0 ? cutoffs[index - 1] : null;
                                                        const showCategory = !prevCutoff || prevCutoff.category !== cutoff.category;
                                                        const showYear = !prevCutoff ||
                                                            prevCutoff.category !== cutoff.category ||
                                                            prevCutoff.year !== cutoff.year;

                                                        return (
                                                            <tr
                                                                key={index}
                                                                className="border-b border-gray-100 dark:border-gray-700"
                                                                style={showCategory ? {
                                                                    borderLeftWidth: '4px',
                                                                    borderLeftColor: getCategoryBorderColor(cutoff.category)
                                                                } : {
                                                                    borderLeftWidth: '4px',
                                                                    borderLeftColor: 'transparent'
                                                                }}
                                                            >
                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                    {showCategory && (
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                                                            {cutoff.category}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                                    {showYear ? cutoff.year : ''}
                                                                </td>
                                                                <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                                    {cutoff.round.replace('Round ', 'R')}
                                                                </td>
                                                                <td className="px-3 py-2 text-right whitespace-nowrap">
                                                                    <span className="text-green-600 dark:text-green-400 font-bold">
                                                                        {cutoff.openingRank?.toLocaleString() ?? '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-right whitespace-nowrap">
                                                                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                                        {cutoff.closingRank?.toLocaleString() ?? '-'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
