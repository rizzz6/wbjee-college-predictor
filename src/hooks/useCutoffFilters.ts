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
    // Extract unique values
    const uniqueYears = useMemo(
        () => [...new Set(cutoffs.map(c => c.year))].sort((a, b) => b - a),
        [cutoffs]
    )

    const uniqueRounds = useMemo(
        () => [...new Set(cutoffs.map(c => c.round))].sort(),
        [cutoffs]
    )

    const uniqueCategories = useMemo(
        () => [...new Set(cutoffs.map(c => c.category))].sort(),
        [cutoffs]
    )

    const uniquePrograms = useMemo(
        () => [...new Set(cutoffs.map(c => c.program))].sort(),
        [cutoffs]
    )

    const uniqueQuotas = useMemo(
        () => [...new Set(cutoffs.map(c => c.quota))].filter(Boolean).sort(),
        [cutoffs]
    )

    const uniqueSeatTypes = useMemo(
        () => [...new Set(cutoffs.map(c => c.seatType))].filter(Boolean).sort(),
        [cutoffs]
    )

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
