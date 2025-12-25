/**
 * Shared type definitions for the Cutoff Finder feature
 */

export interface FilterState {
    college?: string;
    program?: string;
    year?: number;
    category?: string;
    round?: string;
    seatType?: string;
}

export interface SearchResult {
    openingRank: number;
    closingRank: number;
}

export interface Cutoff {
    college?: string;
    program: string;
    year: number;
    category: string;
    round: string;
    seatType: string;
    opening: number;
    closing: number;
}
