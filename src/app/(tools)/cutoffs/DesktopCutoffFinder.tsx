'use client';

import { useState, useMemo, useCallback } from 'react';
import { useCutoffsData } from '@/hooks/cutoffs/useCutoffsData';
import { FilterSelect } from './components/FilterSelect';
import { ActionButton } from './components/ActionButton';
import { Monitor, GraduationCap, Award } from 'lucide-react';
import type { FilterState, SearchResult } from '@/types/cutoff-finder';

export default function DesktopCutoffFinder() {
    const { colleges, getCutoffs, isLoading } = useCutoffsData();

    const [filters, setFilters] = useState<FilterState>({});
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Get cutoffs for selected college (memoized for performance)
    const selectedCollegeCutoffs = useMemo(() => {
        if (!filters.college) return null;
        const cutoffs = getCutoffs({ college: filters.college });
        return cutoffs;
    }, [filters.college, getCutoffs]);

    // Calculate available filter options - Master/Dependent pattern
    const availableOptions = useMemo(() => {
        if (!selectedCollegeCutoffs) {
            return { programs: [], years: [], categories: [], rounds: [], seatTypes: [] };
        }

        // MASTERS: Always show full list
        const programs = Array.from(new Set(selectedCollegeCutoffs.map(c => c.program))).sort();

        // DEPENDENTS: Shrink based on active Program
        const programData = filters.program
            ? selectedCollegeCutoffs.filter(c => c.program === filters.program)
            : selectedCollegeCutoffs;

        return {
            programs,
            years: Array.from(new Set(programData.map(c => c.year))).sort((a, b) => b - a),
            categories: Array.from(new Set(programData.map(c => c.category))).sort(),
            rounds: Array.from(new Set(programData.map(c => c.round))).sort(),
            seatTypes: Array.from(new Set(programData.map(c => c.seatType))).sort()
        };
    }, [selectedCollegeCutoffs, filters.program]);

    // Flexible search: college + at least one other filter
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

            // Smart Validation on College OR Program change
            if (key === 'college' || key === 'program') {

                // PERFORMANCE OPTIMIZATION:
                // If changing program (not college), use memoized selectedCollegeCutoffs
                // Only filter from getCutoffs when changing college
                const activeCollege = key === 'college' ? value as string | undefined : next.college;
                const collegeCutoffs = key === 'college'
                    ? (activeCollege ? getCutoffs({ college: activeCollege }) : [])
                    : (selectedCollegeCutoffs || []); // Use memoized data for program changes!

                const activeProgram = key === 'program' ? value as string | undefined : next.program;
                const validRows = activeProgram
                    ? collegeCutoffs.filter(c => c.program === activeProgram)
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
            else if (key === 'year' && next.program && next.round && value && selectedCollegeCutoffs) {
                const validRows = selectedCollegeCutoffs.filter(c =>
                    c.program === next.program && c.year === value
                );
                if (!validRows.some(c => c.round === next.round)) next.round = undefined;
            }

            return next;
        });
        setHasSearched(false);
    }, [getCutoffs, selectedCollegeCutoffs]);

    const resetFilters = () => {
        setFilters({});
        setResults([]);
        setError(null);
        setHasSearched(false);
    };

    const handleSearch = () => {
        if (!canSearch || !selectedCollegeCutoffs) return;

        try {
            // Filter cutoffs from memoized college data
            const matchingCutoffs = selectedCollegeCutoffs.filter(c => {
                if (filters.program && c.program !== filters.program) return false;
                if (filters.year && c.year !== filters.year) return false;
                if (filters.category && c.category !== filters.category) return false;
                if (filters.round && c.round !== filters.round) return false;
                if (filters.seatType && c.seatType !== filters.seatType) return false;
                return true;
            });

            if (matchingCutoffs.length > 0) {
                // Map to SearchResult and sort by closing rank
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
            console.error('[DesktopCutoffFinder] Search error:', err);
        }
    };

    // Hierarchical grouping for compact display
    const hierarchicalResults = useMemo(() => {
        const byProgram: Record<string, Record<string, SearchResult[]>> = {};

        results.forEach(result => {
            if (!byProgram[result.program]) {
                byProgram[result.program] = {};
            }

            if (!byProgram[result.program][result.seatType]) {
                byProgram[result.program][result.seatType] = [];
            }

            byProgram[result.program][result.seatType].push(result);
        });

        // Sort each group: Category (alphabetical) → Year (newest first) → Round
        Object.keys(byProgram).forEach(program => {
            Object.keys(byProgram[program]).forEach(seatType => {
                byProgram[program][seatType].sort((a, b) => {
                    if (a.category !== b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    if (a.year !== b.year) {
                        return b.year - a.year;
                    }
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

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl relative">
            {/* Subtle Mode Indicator - Top Right Corner */}
            <div className="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full opacity-50 hover:opacity-100 transition-opacity">
                <Monitor className="h-3 w-3" />
                <span>Desktop</span>
            </div>

            <div className="space-y-4">
                {/* College */}
                <FilterSelect
                    label="College / Institute"
                    value={filters.college || ''}
                    onChange={(value) => updateFilter('college', value)}
                    options={colleges.map(c => ({ label: c, value: c }))}
                    disabled={isLoading}
                    loading={isLoading}
                    placeholder="Select College"
                />


                {/* Other filters - disabled until college is selected */}
                <FilterSelect
                    label="Program / Branch"
                    value={filters.program || ''}
                    onChange={(value) => updateFilter('program', value)}
                    options={[
                        { label: 'All Programs', value: '' },
                        ...availableOptions.programs.map(p => ({ label: p, value: p }))
                    ]}
                    disabled={!filters.college}
                    placeholder="Select Program"
                />

                <div className="grid grid-cols-2 gap-3">
                    <FilterSelect
                        label="Year"
                        value={filters.year?.toString() || ''}
                        onChange={(value) => updateFilter('year', value ? parseInt(value) : undefined)}
                        options={[
                            { label: 'All Years', value: '' },
                            ...availableOptions.years.map(y => ({ label: y.toString(), value: y.toString() }))
                        ]}
                        disabled={!filters.college}
                        placeholder="Select Year"
                    />

                    <FilterSelect
                        label="Round"
                        value={filters.round || ''}
                        onChange={(value) => updateFilter('round', value)}
                        options={[
                            { label: 'All Rounds', value: '' },
                            ...availableOptions.rounds.map(r => ({ label: r, value: r }))
                        ]}
                        disabled={!filters.college}
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
                            ...availableOptions.categories.map(c => ({ label: c, value: c }))
                        ]}
                        disabled={!filters.college}
                        placeholder="Select Category"
                    />

                    <FilterSelect
                        label="Seat Type"
                        value={filters.seatType || ''}
                        onChange={(value) => updateFilter('seatType', value)}
                        options={[
                            { label: 'All Seat Types', value: '' },
                            ...availableOptions.seatTypes.map(s => ({ label: s, value: s }))
                        ]}
                        disabled={!filters.college}
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
                        loading={false}
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
