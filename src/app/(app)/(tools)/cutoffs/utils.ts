/**
 * Shared utilities for Cutoff Finder (Desktop & Mobile)
 * Extracted to eliminate code duplication
 */

import type { SearchResult } from '@/types/cutoff-finder';

/**
 * Category border color coding - returns hex color
 * Used for visual categorization of cutoff results
 */
export function getCategoryBorderColor(category: string): string {
    if (category === 'GENERAL') return '#3b82f6'; // blue-500
    if (category.startsWith('OBC')) return '#22c55e'; // green-500
    if (category.startsWith('SC')) return '#a855f7'; // purple-500
    if (category.startsWith('ST')) return '#f97316'; // orange-500
    if (category === 'EWS') return '#eab308'; // yellow-500
    if (category.startsWith('Open')) return '#06b6d4'; // cyan-500
    return '#9ca3af'; // gray-400
}

/**
 * Build hierarchical grouping of results for compact display
 * Groups by: Program → Seat Type → Sorted cutoffs
 * 
 * Sorting within groups: Category (alphabetical) → Year (newest first) → Round
 */
export function buildHierarchicalResults(
    results: SearchResult[]
): Record<string, Record<string, SearchResult[]>> {
    const byProgram: Record<string, Record<string, SearchResult[]>> = {};

    results.forEach(result => {
        // Create program group
        if (!byProgram[result.program]) {
            byProgram[result.program] = {};
        }

        // Create seat type sub-group
        if (!byProgram[result.program][result.seatType]) {
            byProgram[result.program][result.seatType] = [];
        }

        byProgram[result.program][result.seatType].push(result);
    });

    // Sort each group: Category (alphabetical) → Year (newest first) → Round
    Object.keys(byProgram).forEach(program => {
        Object.keys(byProgram[program]).forEach(seatType => {
            byProgram[program][seatType].sort((a, b) => {
                // First by category
                if (a.category !== b.category) {
                    return a.category.localeCompare(b.category);
                }
                // Then by year (descending - newest first)
                if (a.year !== b.year) {
                    return b.year - a.year;
                }
                // Finally by round
                return a.round.localeCompare(b.round);
            });
        });
    });

    return byProgram;
}
