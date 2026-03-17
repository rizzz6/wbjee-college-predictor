'use client'

import { useState, useMemo, useCallback } from 'react'

interface Cutoff {
    year: number
    round: string
    openingRank: number
    closingRank: number
    category: string
    quota: string
    seatType?: string
    program: string
}

interface FilterState {
    year: number | 'all'
    round: string
    category: string
    program: string
    quota: string
    seatType: string
}

interface UseCutoffFiltersProps {
    cutoffs: Cutoff[]
    initialRowCount?: number
}

/**
 * Custom hook to manage cutoff table filters and data visibility
 */
export function useCutoffFilters({ cutoffs, initialRowCount = 10 }: UseCutoffFiltersProps) {
    // ⚡ OPTIMIZATION: Extract all unique values in a single O(n) pass
    const {
        uniqueYears,
        uniqueRounds,
        uniqueCategories,
        uniquePrograms,
        uniqueQuotas,
        uniqueSeatTypes
    } = useMemo(() => {
        const years = new Set<number>();
        const rounds = new Set<string>();
        const categories = new Set<string>();
        const programs = new Set<string>();
        const quotas = new Set<string>();
        const seatTypes = new Set<string>();

        for (const c of cutoffs) {
            years.add(c.year);
            rounds.add(c.round);
            categories.add(c.category);
            programs.add(c.program);
            if (c.quota) quotas.add(c.quota);
            if (c.seatType) seatTypes.add(c.seatType);
        }

        return {
            uniqueYears: Array.from(years).sort((a, b) => b - a),
            uniqueRounds: Array.from(rounds).sort(),
            uniqueCategories: Array.from(categories).sort(),
            uniquePrograms: Array.from(programs).sort(),
            uniqueQuotas: Array.from(quotas).sort(),
            uniqueSeatTypes: Array.from(seatTypes).sort()
        };
    }, [cutoffs]);

    // Determine which filters to show
    const showQuota = uniqueQuotas.length > 1
    const showSeatType = uniqueSeatTypes.length > 1

    // Initialize filter state
    const [filters, setFilters] = useState<FilterState>(() => ({
        year: uniqueYears.length > 0 ? uniqueYears[0] : 'all',
        round: uniqueRounds.includes('Round 1') ? 'Round 1' : 'all',
        category: 'all',
        program: 'all',
        quota: 'all',
        seatType: 'all'
    }))

    // Expansion state
    const [isExpanded, setIsExpanded] = useState(false)

    // Filter logic
    const filteredData = useMemo(() => {
        return cutoffs.filter(c => {
            const matchYear = filters.year === 'all' || c.year === filters.year
            const matchRound = filters.round === 'all' || c.round === filters.round
            const matchCategory = filters.category === 'all' || c.category === filters.category
            const matchProgram = filters.program === 'all' || c.program === filters.program
            const matchQuota = !showQuota || filters.quota === 'all' || c.quota === filters.quota
            const matchSeatType = !showSeatType || filters.seatType === 'all' || c.seatType === filters.seatType

            return matchYear && matchRound && matchCategory && matchProgram && matchQuota && matchSeatType
        }).sort((a, b) => a.openingRank - b.openingRank)
    }, [cutoffs, filters, showQuota, showSeatType])

    const visibleRows = isExpanded ? filteredData : filteredData.slice(0, initialRowCount)

    // Update individual filter
    const updateFilter = useCallback((key: keyof FilterState, value: string | number) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({
            year: uniqueYears.length > 0 ? uniqueYears[0] : 'all',
            round: uniqueRounds.includes('Round 1') ? 'Round 1' : 'all',
            category: 'all',
            program: 'all',
            quota: 'all',
            seatType: 'all'
        })
        setIsExpanded(false)
    }, [uniqueYears, uniqueRounds])

    return {
        // Filter state
        filters,
        updateFilter,
        resetFilters,

        // Available options
        uniqueYears,
        uniqueRounds,
        uniqueCategories,
        uniquePrograms,
        uniqueQuotas,
        uniqueSeatTypes,

        // Display flags
        showQuota,
        showSeatType,

        // Filtered data
        filteredData,
        visibleRows,

        // Expansion
        isExpanded,
        setIsExpanded,

        // Stats
        totalResults: filteredData.length,
        hasMoreResults: filteredData.length > initialRowCount
    }
}
