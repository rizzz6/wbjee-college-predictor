import { useState, useMemo } from 'react';

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

interface UsePredictorPaginationReturn {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    entriesPerPage: number | 'all';
    setEntriesPerPage: (value: number | 'all') => void;
    paginatedResults: CollegeData[];
    totalPages: number;
}

export function usePredictorPagination(
    sortedData: CollegeData[],
    initialPerPage: number | 'all' = 50
): UsePredictorPaginationReturn {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState<number | 'all'>(initialPerPage);

    // Calculate total pages
    const totalPages = useMemo(() => {
        if (entriesPerPage === 'all') return 1;
        return Math.ceil(sortedData.length / entriesPerPage);
    }, [sortedData.length, entriesPerPage]);

    // Pagination
    const paginatedResults = useMemo(() => {
        if (entriesPerPage === 'all') return sortedData;
        const startIndex = (currentPage - 1) * entriesPerPage;
        const endIndex = startIndex + entriesPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, entriesPerPage]);

    return {
        currentPage,
        setCurrentPage,
        entriesPerPage,
        setEntriesPerPage,
        paginatedResults,
        totalPages,
    };
}
