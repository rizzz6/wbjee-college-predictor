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

export function useStaticSlices() {
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

    // Load the index file
    const { data: index, error: indexError, isLoading: isLoadingIndex } = useSWR<MobileIndex>(
        '/data/mobile-index.json',
        fetcher,
        { revalidateOnFocus: false }
    );

    // Load the selected college slice
    const sliceUrl = selectedSlug ? `/data/colleges/${selectedSlug}.json` : null;
    const { data: sliceData, error: sliceError, isLoading: isLoadingSlice } = useSWR<CompressedData>(
        sliceUrl,
        fetcher,
        { revalidateOnFocus: false }
    );

    // Decode the slice data
    const collegeData: CollegeData | null = sliceData ? (() => {
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
    })() : null;

    const selectCollege = useCallback((college: string) => {
        if (!index) return;
        const idx = index.colleges.indexOf(college);
        if (idx >= 0) {
            setSelectedSlug(index.slugs[idx]);
        }
    }, [index]);

    return {
        // Index data
        colleges: index?.colleges ?? [],
        isLoadingIndex,
        indexError,

        // College data
        collegeData,
        isLoadingSlice,
        sliceError,

        // Actions
        selectCollege
    };
}
