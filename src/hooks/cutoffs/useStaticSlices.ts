import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { decodeColumnarData, type CompressedData, type Cutoff } from '@/utils/compression/cutoff-decoder';

interface MobileIndex {
    colleges: string[];
    slugs: string[];
}

interface CollegeData {
    programs: string[];
    years: number[];
    categories: string[];
    rounds: string[];
    seatTypes: string[];
    cutoffs: Cutoff[];
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

/**
 * Decodes slice data and extracts unique filter values
 */
function decodeSliceData(sliceData: CompressedData): CollegeData {
    const cutoffs = decodeColumnarData(sliceData);

    // Extract unique values for filters
    const programs = new Set<string>();
    const years = new Set<number>();
    const categories = new Set<string>();
    const rounds = new Set<string>();
    const seatTypes = new Set<string>();

    cutoffs.forEach(cutoff => {
        programs.add(cutoff.program);
        years.add(cutoff.year);
        categories.add(cutoff.category);
        rounds.add(cutoff.round);
        seatTypes.add(cutoff.seatType);
    });

    return {
        programs: Array.from(programs).sort(),
        years: Array.from(years).sort((a, b) => b - a),
        categories: Array.from(categories).sort(),
        rounds: Array.from(rounds).sort(),
        seatTypes: Array.from(seatTypes).sort(),
        cutoffs
    };
}

/**
 * Hook for managing mobile cutoff data with lazy-loaded slices
 * 
 * Features:
 * - Loads college list from index (~2KB)
 * - Lazy-loads individual college data on selection (~3-8KB per college)
 * - Automatic retry with exponential backoff on network failures
 * - Extracts filter options from loaded slice
 * 
 * @returns {Object} Mobile slice data and actions
 * @returns {string[]} colleges - List of all colleges from index
 * @returns {CollegeData | null} collegeData - Currently loaded college data with filters
 * @returns {Function} selectCollege - Load data for a specific college
 * @returns {Function} retrySlice - Manually retry failed slice load
 * @returns {boolean} isLoadingIndex - Index loading state
 * @returns {boolean} isLoadingSlice - College slice loading state
 * @returns {Error | undefined} sliceError - Error from slice loading
 * 
 * @example
 * const { colleges, selectCollege, collegeData } = useStaticSlices();
 * selectCollege('Jadavpur University');
 * // collegeData will contain programs, years, categories, etc.
 */
export function useStaticSlices() {
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    // Load the index file
    const { data: index, error: indexError, isLoading: isLoadingIndex } = useSWR<MobileIndex>(
        '/data/mobile-index.json',
        fetcher,
        { revalidateOnFocus: false }
    );

    // Load the selected college slice with retry logic
    const sliceUrl = selectedSlug ? `/data/colleges/${selectedSlug}.json` : null;
    const {
        data: sliceData,
        error: sliceError,
        isLoading: isLoadingSlice,
        mutate: mutateSlice
    } = useSWR<CompressedData>(
        sliceUrl,
        fetcher,
        {
            revalidateOnFocus: false,
            errorRetryCount: 3,
            errorRetryInterval: 2000,
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                // Stop retrying after 3 attempts
                if (retryCount >= 3) return;

                // Exponential backoff: 2s, 4s, 8s
                const timeout = 2000 * Math.pow(2, retryCount);
                setTimeout(() => revalidate({ retryCount }), timeout);
            }
        }
    );

    // Decode the slice data
    const collegeData: CollegeData | null = sliceData ? decodeSliceData(sliceData) : null;

    const selectCollege = useCallback((college: string) => {
        if (!index) return;
        const idx = index.colleges.indexOf(college);
        if (idx >= 0) {
            setSelectedSlug(index.slugs[idx]);
        }
    }, [index]);

    return {
        // Index data - sort colleges alphabetically
        colleges: index?.colleges.slice().sort() ?? [],
        isLoadingIndex,
        indexError,

        // College data
        collegeData,
        isLoadingSlice,
        sliceError,

        // Actions
        selectCollege,
        retrySlice: () => mutateSlice()
    };
}
