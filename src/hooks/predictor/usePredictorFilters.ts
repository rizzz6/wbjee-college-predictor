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

    // Apply filters
    const filteredResults = useMemo(() => {
        let results = filteredData;

        if (isShowingFavorites) {
            results = results.filter(item => favorites.has(item.id));
        }

        // Apply smart filtering if enabled
        if (isSmartFilteringEnabled && activeFilters.rank && !isNaN(parseInt(activeFilters.rank))) {
            const userRank = parseInt(activeFilters.rank);
            // Smooth dynamic multiplier: eliminates cliff effects
            // Formula: max(1.5, 3 - (log10(rank) * 0.425))
            const getDynamicMultiplier = (rank: number) => {
                if (rank <= 0) return 1.5;
                const logRank = Math.log10(rank);
                const multiplier = 3 - (logRank * 0.425);
                return Math.max(1.5, multiplier);
            };

            const multiplier = getDynamicMultiplier(userRank);
            const maxDisplayRank = Math.round(userRank * multiplier);

            results = results.filter(item => {
                // Filter by rank range: show colleges where user has a realistic chance
                // User can get into colleges where closing_rank is between user_rank and maxDisplayRank
                if (item.closing_rank === null ||
                    item.closing_rank < userRank ||
                    item.closing_rank > maxDisplayRank) {
                    return false;
                }

                // Apply other filters
                for (const key of ['institute', 'branch', 'category', 'year', 'round', 'quota', 'seat_type']) {
                    if (activeFilters[key as keyof Filters].length > 0 && !activeFilters[key as keyof Filters].includes(String(item[key as keyof CollegeData]))) {
                        return false;
                    }
                }
                return true;
            });
        } else {
            // Apply other filters normally
            Object.entries(activeFilters).forEach(([key, values]) => {
                if (key === 'rank' || values.length === 0) return;
                results = results.filter(item => values.includes(String(item[key as keyof CollegeData])));
            });
        }

        return results;
    }, [filteredData, activeFilters, favorites, isShowingFavorites, isSmartFilteringEnabled]);

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

