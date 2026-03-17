import useSWR from 'swr';
import { useMemo } from 'react';

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

interface CollegeData {
    id: string;
    institute: string;
    branch: string;
    category: string;
    seat_type: string;
    quota: string;
    round: string;
    year: number | null;
    opening_rank: number | null;
    closing_rank: number | null;
    prediction: {
        text: string;
        order: number;
    };
}

interface PredictorResponse {
    results: CollegeData[];
    total: number;
    metadata: {
        filterUsed: { floor: number; ceiling: number; multiplier: { min: number; max: number } };
        rank: number;
        appliedFilters: Record<string, number>;
    };
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function usePredictorAPI(filters: Filters) {
    // ⚡ OPTIMIZATION: Memoize the URL to prevent useSWR from re-evaluating on every render
    const apiUrl = useMemo(() => {
        if (!filters.rank) return null;

        const params = new URLSearchParams();
        params.set('rank', filters.rank);

        if (filters.institute.length > 0) filters.institute.forEach(v => params.append('institute', v));
        if (filters.branch.length > 0) filters.branch.forEach(v => params.append('branch', v));
        if (filters.category.length > 0) filters.category.forEach(v => params.append('category', v));
        if (filters.year.length > 0) filters.year.forEach(v => params.append('year', v));
        if (filters.round.length > 0) filters.round.forEach(v => params.append('round', v));
        if (filters.quota.length > 0) filters.quota.forEach(v => params.append('quota', v));
        if (filters.seat_type.length > 0) filters.seat_type.forEach(v => params.append('seat_type', v));

        return `/api/predictor/filter?${params.toString()}`;
    }, [
        filters.rank,
        filters.institute,
        filters.branch,
        filters.category,
        filters.year,
        filters.round,
        filters.quota,
        filters.seat_type
    ]);

    const { data, error, isLoading, mutate } = useSWR<PredictorResponse>(
        apiUrl,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5000, // Don't refetch same query within 5s
        }
    );

    return {
        results: data?.results || [],
        total: data?.total || 0,
        metadata: data?.metadata,
        isLoading,
        error,
        refetch: mutate,
    };
}
