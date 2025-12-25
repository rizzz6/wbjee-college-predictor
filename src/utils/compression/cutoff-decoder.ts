/**
 * Shared types and utilities for Flat Columnar compression/decompression
 * Used by both build scripts (Node.js) and frontend (Browser)
 */

export interface CompressedData {
    lookup: {
        C?: string[];  // Colleges (optional for mobile slices)
        P: string[];   // Programs
        Y: number[];   // Years
        T: string[];   // Categories
        R: string[];   // Rounds
        S: string[];   // Seat types
    };
    data: {
        c?: number[];  // College indices (optional for mobile slices)
        p: number[];   // Program indices
        y: number[];   // Year indices
        t: number[];   // Category indices
        r: number[];   // Round indices
        s: number[];   // Seat type indices
        o: number[];   // Opening ranks
        k: number[];   // Closing ranks
    };
}

export interface Cutoff {
    college?: string;  // Optional for mobile slices
    program: string;
    year: number;
    category: string;
    round: string;
    seatType: string;
    opening: number;
    closing: number;
}

/**
 * Decodes columnar compressed data into an array of cutoff objects
 * Handles both desktop (with college column) and mobile (without college column) formats
 */
export function decodeColumnarData(data: CompressedData): Cutoff[] {
    const { lookup, data: columns } = data;
    const count = columns.p.length;
    const results: Cutoff[] = [];

    for (let i = 0; i < count; i++) {
        const cutoff: Cutoff = {
            program: lookup.P[columns.p[i]],
            year: lookup.Y[columns.y[i]],
            category: lookup.T[columns.t[i]],
            round: lookup.R[columns.r[i]],
            seatType: lookup.S[columns.s[i]],
            opening: columns.o[i],
            closing: columns.k[i]
        };

        // Add college if present (desktop format)
        if (lookup.C && columns.c) {
            cutoff.college = lookup.C[columns.c[i]];
        }

        results.push(cutoff);
    }

    return results;
}

/**
 * Encodes an array of cutoff objects into columnar compressed format
 * Used by build scripts to generate compressed data files
 */
export function encodeColumnarData(cutoffs: Cutoff[], includeCollege: boolean = true): CompressedData {
    const colleges = new Set<string>();
    const programs = new Set<string>();
    const years = new Set<number>();
    const categories = new Set<string>();
    const rounds = new Set<string>();
    const seatTypes = new Set<string>();

    // Collect unique values
    cutoffs.forEach(cutoff => {
        if (includeCollege && cutoff.college) colleges.add(cutoff.college);
        programs.add(cutoff.program);
        years.add(cutoff.year);
        categories.add(cutoff.category);
        rounds.add(cutoff.round);
        seatTypes.add(cutoff.seatType);
    });

    // Create lookup arrays
    const lookup: CompressedData['lookup'] = {
        P: Array.from(programs).sort(),
        Y: Array.from(years).sort((a, b) => a - b),
        T: Array.from(categories).sort(),
        R: Array.from(rounds).sort(),
        S: Array.from(seatTypes).sort()
    };

    if (includeCollege) {
        lookup.C = Array.from(colleges).sort();
    }

    // Create index arrays
    const data: CompressedData['data'] = {
        p: [],
        y: [],
        t: [],
        r: [],
        s: [],
        o: [],
        k: []
    };

    if (includeCollege) {
        data.c = [];
    }

    // Encode each cutoff
    cutoffs.forEach(cutoff => {
        if (includeCollege && cutoff.college && lookup.C && data.c) {
            data.c.push(lookup.C.indexOf(cutoff.college));
        }
        data.p.push(lookup.P.indexOf(cutoff.program));
        data.y.push(lookup.Y.indexOf(cutoff.year));
        data.t.push(lookup.T.indexOf(cutoff.category));
        data.r.push(lookup.R.indexOf(cutoff.round));
        data.s.push(lookup.S.indexOf(cutoff.seatType));
        data.o.push(cutoff.opening);
        data.k.push(cutoff.closing);
    });

    return { lookup, data };
}

/**
 * Creates a URL-friendly slug from a college name
 */
export function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
