import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';

interface FilterState {
    college?: string;
    program?: string;
    year?: number;
    category?: string;
    round?: string;
    seatType?: string;
}

interface ProgramMetadata {
    years: number[];
    rounds: string[];
    seatTypes: string[];
    categories: string[];
}

interface MetadataLookup {
    colleges: string[];
    collegeProgramMetadata: {
        [college: string]: {
            [program: string]: ProgramMetadata;
        };
    };
    allCategories: string[];
}

const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
});

export function useCascadingFilters() {
    const [filters, setFilters] = useState<FilterState>({});

    // Single API call - load metadata lookup
    const { data: lookup, error, isLoading } = useSWR<MetadataLookup>(
        '/api/cutoffs/metadata/lookup',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 3600000, // 1 hour - data rarely changes
        }
    );

    // Client-side filtering based on selections

    // All colleges (always available)
    const colleges = useMemo(() => {
        return lookup?.colleges || [];
    }, [lookup]);

    // Programs for selected college
    const programs = useMemo(() => {
        if (!lookup || !filters.college) return [];
        const collegeMeta = lookup.collegeProgramMetadata[filters.college];
        return collegeMeta ? Object.keys(collegeMeta).sort() : [];
    }, [lookup, filters.college]);

    // Metadata for selected college + program
    const programMetadata = useMemo(() => {
        if (!lookup || !filters.college || !filters.program) return null;
        return lookup.collegeProgramMetadata[filters.college]?.[filters.program];
    }, [lookup, filters.college, filters.program]);

    // Years, rounds, seatTypes (all appear after program selection)
    const years = useMemo(() => {
        return programMetadata?.years || [];
    }, [programMetadata]);

    const rounds = useMemo(() => {
        return programMetadata?.rounds || [];
    }, [programMetadata]);

    const seatTypes = useMemo(() => {
        return programMetadata?.seatTypes || [];
    }, [programMetadata]);

    // Categories (dependent on program selection)
    const categories = useMemo(() => {
        return programMetadata?.categories || [];
    }, [programMetadata]);

    // Update filter with smart reset logic
    const updateFilter = useCallback((key: keyof FilterState, value: string | number | undefined) => {
        setFilters(prev => {
            if (key === 'college') {
                // College changed: Reset everything except college
                return { college: value as string };
            }

            if (key === 'program') {
                // Program changed: Reset dependents (keep college)
                return {
                    college: prev.college,
                    program: value as string,
                };
            }

            // Year/Category/Round/SeatType changed: Just update that field
            return { ...prev, [key]: value };
        });
    }, []);

    // Reset all filters
    const resetFilters = useCallback(() => {
        setFilters({});
    }, []);

    return {
        // Filter state
        filters,

        // Available options (filtered based on selections)
        colleges,
        programs,
        years,
        rounds,
        seatTypes,
        categories,

        // Loading/error states
        isLoading,
        error,

        // Actions
        updateFilter,
        resetFilters,
    };
}
