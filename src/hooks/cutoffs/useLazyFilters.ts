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

interface ProgramData {
    filters: {
        years: number[];
        categories: string[];
        rounds: string[];
        seatTypes: string[];
    };
    cutoffs: Array<{
        year: number;
        category: string;
        round: string;
        seatType: string;
        openingRank: number;
        closingRank: number;
    }>;
}

const fetcher = (url: string) => fetch(url).then(r => {
    if (!r.ok) throw new Error('Failed to fetch');
    return r.json();
});

export function useLazyFilters() {
    const [filters, setFilters] = useState<FilterState>({});

    // Load colleges+programs
    const { data: collegesPrograms, error } = useSWR<Record<string, string[]>>(
        '/api/cutoffs/colleges-programs',
        fetcher,
        { revalidateOnFocus: false }
    );

    // Load program data when both selected
    const programDataUrl = filters.college && filters.program
        ? `/api/cutoffs/program-data?college=${encodeURIComponent(filters.college)}&program=${encodeURIComponent(filters.program)}`
        : null;

    const { data: programData, error: programError, isLoading: isProgramLoading } = useSWR<ProgramData>(
        programDataUrl,
        fetcher,
        { revalidateOnFocus: false }
    );

    const colleges = useMemo(() =>
        Object.keys(collegesPrograms || {}).sort(),
        [collegesPrograms]
    );

    const programs = useMemo(() =>
        filters.college ? collegesPrograms?.[filters.college] || [] : [],
        [collegesPrograms, filters.college]
    );

    const years = useMemo(() => programData?.filters.years || [], [programData]);
    const categories = useMemo(() => programData?.filters.categories || [], [programData]);
    const rounds = useMemo(() => programData?.filters.rounds || [], [programData]);
    const seatTypes = useMemo(() => programData?.filters.seatTypes || [], [programData]);

    const updateFilter = useCallback((key: keyof FilterState, value: string | number | undefined) => {
        setFilters(prev => {
            if (key === 'college') return { college: value as string };
            if (key === 'program') return { college: prev.college, program: value as string };
            return { ...prev, [key]: value };
        });
    }, []);

    const resetFilters = useCallback(() => setFilters({}), []);

    return {
        filters,
        updateFilter,
        resetFilters,
        colleges,
        programs,
        years,
        categories,
        rounds,
        seatTypes,
        isLoading: !collegesPrograms && !error,
        isProgramLoading,
        error: error || programError,
        cutoffs: programData?.cutoffs
    };
}
