import useSWR from 'swr';
import { useMemo } from 'react';

interface CutoffData {
    lookup: {
        C: string[];  // Colleges
        P: string[];  // Programs
        Y: number[];  // Years
        T: string[];  // Categories
        R: string[];  // Rounds
        S: string[];  // Seat types
    };
    data: {
        c: number[];  // College indices
        p: number[];  // Program indices
        y: number[];  // Year indices
        t: number[];  // Category indices
        r: number[];  // Round indices
        s: number[];  // Seat type indices
        o: number[];  // Opening ranks
        k: number[];  // Closing ranks
    };
}

interface Cutoff {
    college: string;
    program: string;
    year: number;
    category: string;
    round: string;
    seatType: string;
    opening: number;
    closing: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useCutoffsData() {
    const { data, error, isLoading } = useSWR<CutoffData>(
        '/cutoffs-data.json',
        fetcher,
        { revalidateOnFocus: false }
    );

    // Get all unique colleges
    const colleges = useMemo(() => {
        return data?.lookup.C ?? [];
    }, [data]);

    // Get programs for a specific college
    const getProgramsForCollege = useMemo(() => {
        return (college: string) => {
            if (!data) return [];

            const collegeIdx = data.lookup.C.indexOf(college);
            const programIndices = new Set<number>();

            for (let i = 0; i < data.data.c.length; i++) {
                if (data.data.c[i] === collegeIdx) {
                    programIndices.add(data.data.p[i]);
                }
            }

            return Array.from(programIndices)
                .map(idx => data.lookup.P[idx])
                .sort();
        };
    }, [data]);

    // Get all cutoffs (with optional filters)
    const getCutoffs = useMemo(() => {
        return (filters?: {
            college?: string;
            program?: string;
            year?: number;
            category?: string;
            round?: string;
            seatType?: string;
        }): Cutoff[] => {
            if (!data) return [];

            const results: Cutoff[] = [];
            const collegeIdx = filters?.college ? data.lookup.C.indexOf(filters.college) : -1;
            const programIdx = filters?.program ? data.lookup.P.indexOf(filters.program) : -1;
            const yearIdx = filters?.year ? data.lookup.Y.indexOf(filters.year) : -1;
            const categoryIdx = filters?.category ? data.lookup.T.indexOf(filters.category) : -1;
            const roundIdx = filters?.round ? data.lookup.R.indexOf(filters.round) : -1;
            const seatTypeIdx = filters?.seatType ? data.lookup.S.indexOf(filters.seatType) : -1;

            for (let i = 0; i < data.data.c.length; i++) {
                // Apply filters
                if (collegeIdx >= 0 && data.data.c[i] !== collegeIdx) continue;
                if (programIdx >= 0 && data.data.p[i] !== programIdx) continue;
                if (yearIdx >= 0 && data.data.y[i] !== yearIdx) continue;
                if (categoryIdx >= 0 && data.data.t[i] !== categoryIdx) continue;
                if (roundIdx >= 0 && data.data.r[i] !== roundIdx) continue;
                if (seatTypeIdx >= 0 && data.data.s[i] !== seatTypeIdx) continue;

                // Reconstruct row
                results.push({
                    college: data.lookup.C[data.data.c[i]],
                    program: data.lookup.P[data.data.p[i]],
                    year: data.lookup.Y[data.data.y[i]],
                    category: data.lookup.T[data.data.t[i]],
                    round: data.lookup.R[data.data.r[i]],
                    seatType: data.lookup.S[data.data.s[i]],
                    opening: data.data.o[i],
                    closing: data.data.k[i]
                });
            }

            return results;
        };
    }, [data]);

    // Search by rank
    const searchByRank = useMemo(() => {
        return (rank: number, filters?: {
            program?: string;
            category?: string;
        }): Cutoff[] => {
            if (!data) return [];

            const programIdx = filters?.program ? data.lookup.P.indexOf(filters.program) : -1;
            const categoryIdx = filters?.category ? data.lookup.T.indexOf(filters.category) : -1;

            const results: Cutoff[] = [];

            for (let i = 0; i < data.data.c.length; i++) {
                // Apply filters
                if (programIdx >= 0 && data.data.p[i] !== programIdx) continue;
                if (categoryIdx >= 0 && data.data.t[i] !== categoryIdx) continue;

                // Check if rank falls in range
                if (rank >= data.data.o[i] && rank <= data.data.k[i]) {
                    results.push({
                        college: data.lookup.C[data.data.c[i]],
                        program: data.lookup.P[data.data.p[i]],
                        year: data.lookup.Y[data.data.y[i]],
                        category: data.lookup.T[data.data.t[i]],
                        round: data.lookup.R[data.data.r[i]],
                        seatType: data.lookup.S[data.data.s[i]],
                        opening: data.data.o[i],
                        closing: data.data.k[i]
                    });
                }
            }

            return results;
        };
    }, [data]);

    // Get available filter options for cascading
    const getFilterOptions = useMemo(() => {
        return (filters?: {
            college?: string;
            program?: string;
            year?: number;
            category?: string;
            round?: string;
        }) => {
            if (!data) return {
                years: [],
                categories: [],
                rounds: [],
                seatTypes: []
            };

            const collegeIdx = filters?.college ? data.lookup.C.indexOf(filters.college) : -1;
            const programIdx = filters?.program ? data.lookup.P.indexOf(filters.program) : -1;
            const yearIdx = filters?.year ? data.lookup.Y.indexOf(filters.year) : -1;
            const categoryIdx = filters?.category ? data.lookup.T.indexOf(filters.category) : -1;
            const roundIdx = filters?.round ? data.lookup.R.indexOf(filters.round) : -1;

            const years = new Set<number>();
            const categories = new Set<string>();
            const rounds = new Set<string>();
            const seatTypes = new Set<string>();

            for (let i = 0; i < data.data.c.length; i++) {
                if (collegeIdx >= 0 && data.data.c[i] !== collegeIdx) continue;
                if (programIdx >= 0 && data.data.p[i] !== programIdx) continue;
                if (yearIdx >= 0 && data.data.y[i] !== yearIdx) continue;
                if (categoryIdx >= 0 && data.data.t[i] !== categoryIdx) continue;
                if (roundIdx >= 0 && data.data.r[i] !== roundIdx) continue;

                years.add(data.lookup.Y[data.data.y[i]]);
                categories.add(data.lookup.T[data.data.t[i]]);
                rounds.add(data.lookup.R[data.data.r[i]]);
                seatTypes.add(data.lookup.S[data.data.s[i]]);
            }

            return {
                years: Array.from(years).sort((a, b) => b - a),
                categories: Array.from(categories).sort(),
                rounds: Array.from(rounds).sort(),
                seatTypes: Array.from(seatTypes).sort()
            };
        };
    }, [data]);

    return {
        data,
        isLoading,
        error,
        colleges,
        getProgramsForCollege,
        getCutoffs,
        searchByRank,
        getFilterOptions
    };
}
