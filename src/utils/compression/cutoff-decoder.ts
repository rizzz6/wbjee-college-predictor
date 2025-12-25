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
 * Safely retrieves a value from a lookup array with bounds checking
 * @throws Error if index is out of bounds
 */
function getLookupValue<T>(array: T[], index: number, fieldName: string): T {
    if (index < 0 || index >= array.length) {
        throw new Error(
            `[Decoder] Invalid ${fieldName} index: ${index} (array length: ${array.length})`
        );
    }
    return array[index];
}

/**
 * Decodes columnar compressed data into an array of cutoff objects
 * Handles both desktop (with college column) and mobile (without college column) formats
 * @throws Error if data is malformed or indices are out of bounds
 */
export function decodeColumnarData(data: CompressedData): Cutoff[] {
    const { lookup, data: columns } = data;
    const count = columns.p.length;
    const results: Cutoff[] = [];

    // Validate column alignment
    const columnLengths = [
        columns.p.length,
        columns.y.length,
        columns.t.length,
        columns.r.length,
        columns.s.length,
        columns.o.length,
        columns.k.length
    ];

    if (columns.c) {
        columnLengths.push(columns.c.length);
    }

    if (!columnLengths.every(len => len === count)) {
        throw new Error(
            `[Decoder] Column length mismatch. Expected ${count}, got [${columnLengths.join(', ')}]`
        );
    }

    for (let i = 0; i < count; i++) {
        try {
            const cutoff: Cutoff = {
                program: getLookupValue(lookup.P, columns.p[i], 'program'),
                year: getLookupValue(lookup.Y, columns.y[i], 'year'),
                category: getLookupValue(lookup.T, columns.t[i], 'category'),
                round: getLookupValue(lookup.R, columns.r[i], 'round'),
                seatType: getLookupValue(lookup.S, columns.s[i], 'seatType'),
                opening: columns.o[i],
                closing: columns.k[i]
            };

            // Add college if present (desktop format)
            if (lookup.C && columns.c) {
                cutoff.college = getLookupValue(lookup.C, columns.c[i], 'college');
            }

            results.push(cutoff);
        } catch (error) {
            console.error(`[Decoder] Failed to decode row ${i}:`, error);
            // Skip corrupt row instead of crashing entire decode
            continue;
        }
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
