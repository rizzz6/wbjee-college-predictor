import { useState, useMemo, useCallback } from 'react';

interface CollegeData {
    id: string;
    round: string;
    institute: string;
    branch: string;
    seat_type: string;
    quota: string;
    category: string;
    opening_rank: number | null;
    closing_rank: number | null;
    year: number | null;
    prediction: {
        text: string;
        order: number;
    };
}

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

interface UsePredictorFiltersReturn {
    activeFilters: Filters;
    setActiveFilters: React.Dispatch<React.SetStateAction<Filters>>;
    showFilters: boolean;
    setShowFilters: (value: boolean) => void;
    isSmartFilteringEnabled: boolean;
    setIsSmartFilteringEnabled: (value: boolean) => void;
    rankError: string;
    setRankError: (error: string) => void;
    hasSearched: boolean;
    setHasSearched: (value: boolean) => void;
    filterSearchTerms: Record<string, string>;
    setFilterSearchTerms: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    validateRank: (rank: string) => string;
    handleRankChange: (rank: string) => void;
    filteredResults: CollegeData[];
    resetFilters: () => void;
}

const DEFAULT_FILTERS: Filters = {
    rank: '',
    institute: [],
    branch: [],
    category: [],
    year: [],
    round: [],
    quota: [],
    seat_type: []
};

export function usePredictorFilters(
    filteredData: CollegeData[],
    favorites: Set<string>,
    isShowingFavorites: boolean,
    setCurrentPage: (page: number) => void
): UsePredictorFiltersReturn {
    const [activeFilters, setActiveFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(true);
    const [isSmartFilteringEnabled, setIsSmartFilteringEnabled] = useState(true);
    const [rankError, setRankError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [filterSearchTerms, setFilterSearchTerms] = useState<Record<string, string>>({});

    // Form validation function
    const validateRank = useCallback((rank: string) => {
        if (!rank.trim()) return "Please enter your WBJEE rank";
        if (isNaN(Number(rank))) return "Please enter a valid number";
        if (Number(rank) < 1) return "Rank must be greater than 0";
        if (Number(rank) > 50000) return "Please enter a realistic rank (under 50,000)";
        return "";
    }, []);

    const handleRankChange = useCallback((rank: string) => {
        setActiveFilters(prev => ({ ...prev, rank }));
        setCurrentPage(1);

        // Clear error when user starts typing
        if (rankError) setRankError('');

        // Validate rank in real-time
        const error = validateRank(rank);
        if (error) {
            setRankError(error);
        } else {
            setRankError('');
            setHasSearched(true);
        }
    }, [rankError, validateRank, setCurrentPage]);

    // ⚡ OPTIMIZATION: Trust the API's smart filtering. 
    // Client-side filtering is now only for instant feedback on secondary 
    // selections (Category, Round, etc.) within the fetched result set.
    const filteredResults = useMemo(() => {
        let results = filteredData;

        // 1. Filter by Favorites (if enabled)
        if (isShowingFavorites) {
            results = results.filter(item => favorites.has(item.id));
        }

        // 2. Apply secondary UI filters (Institute, Branch, Category, etc.)
        // These are applied client-side so the UI updates instantly without an API call.
        // We only apply filters that have active selections.
        const activeFilterKeys = (Object.keys(activeFilters) as Array<keyof Filters>)
            .filter(key => key !== 'rank' && activeFilters[key].length > 0);

        if (activeFilterKeys.length > 0) {
            results = results.filter(item => {
                for (const key of activeFilterKeys) {
                    const val = String(item[key as keyof CollegeData]);
                    if (!activeFilters[key].includes(val)) return false;
                }
                return true;
            });
        }

        return results;
    }, [filteredData, activeFilters, favorites, isShowingFavorites]);

    const resetFilters = useCallback(() => {
        setActiveFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
        setFilterSearchTerms({});
        setHasSearched(false);
        setRankError('');
    }, [setCurrentPage]);

    return {
        activeFilters,
        setActiveFilters,
        showFilters,
        setShowFilters,
        isSmartFilteringEnabled,
        setIsSmartFilteringEnabled,
        rankError,
        setRankError,
        hasSearched,
        setHasSearched,
        filterSearchTerms,
        setFilterSearchTerms,
        validateRank,
        handleRankChange,
        filteredResults,
        resetFilters,
    };
}

