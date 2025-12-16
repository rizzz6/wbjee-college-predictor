import useSWR from 'swr';

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
    // Build query params
    const params = new URLSearchParams();

    if (filters.rank) params.set('rank', filters.rank);

    filters.institute.forEach(v => params.append('institute', v));
    filters.branch.forEach(v => params.append('branch', v));
    filters.category.forEach(v => params.append('category', v));
    filters.year.forEach(v => params.append('year', v));
    filters.round.forEach(v => params.append('round', v));
    filters.quota.forEach(v => params.append('quota', v));
    filters.seat_type.forEach(v => params.append('seat_type', v));

    const { data, error, isLoading, mutate } = useSWR<PredictorResponse>(
        filters.rank ? `/api/predictor/filter?${params.toString()}` : null,
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
