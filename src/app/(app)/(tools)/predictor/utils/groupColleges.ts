import type { CollegeData, GroupedCollege } from '../types';

// ⚡ OPTIMIZATION: Cache for institute locations to avoid redundant regex/splitting
const locationCache = new Map<string, string>();

/**
 * Extract location from institute name
 * Examples: 
 *   "Jadavpur University (Kolkata)" -> "Kolkata"
 *   "IIT Kharagpur" -> "Kharagpur"  
 */
function extractLocation(institute: string): string {
    if (locationCache.has(institute)) {
        return locationCache.get(institute)!;
    }

    let location = 'West Bengal';

    // Try to extract from parentheses first
    const match = institute.match(/\(([^)]+)\)/);
    if (match) {
        location = match[1];
    } else {
        // Otherwise, try to extract from the last word
        const words = institute.split(' ');
        if (words.length >= 2) {
            location = words[words.length - 1];
        }
    }

    locationCache.set(institute, location);
    return location;
}

/**
 * Group flat college results by institute
 * Sorts branches within each institute by prediction quality
 * Returns sorted array of GroupedCollege objects
 */
export function groupCollegesByInstitute(flatResults: CollegeData[]): GroupedCollege[] {
    // 1. Create map: institute → branches
    const map = new Map<string, GroupedCollege>();

    flatResults.forEach(item => {
        if (!map.has(item.institute)) {
            map.set(item.institute, {
                institute: item.institute,
                location: extractLocation(item.institute),
                branches: [],
                bestPrediction: { text: '-', order: 6 },
                bestRank: null
            });
        }

        const college = map.get(item.institute)!;
        college.branches.push(item);

        // Track best prediction for preview (lowest order = best)
        if (item.prediction.order < college.bestPrediction.order) {
            college.bestPrediction = item.prediction;
        }

        // Track best closing rank (lowest = most competitive)
        if (item.closing_rank !== null) {
            if (college.bestRank === null || item.closing_rank < college.bestRank) {
                college.bestRank = item.closing_rank;
            }
        }
    });

    // 2. Sort branches within each institute by prediction order
    map.forEach(college => {
        college.branches.sort((a, b) => a.prediction.order - b.prediction.order);
    });

    // 3. Convert to array and sort institutes by best prediction, then by best rank
    return Array.from(map.values())
        .sort((a, b) => {
            // Primary sort: by best prediction order
            const predictionDiff = a.bestPrediction.order - b.bestPrediction.order;
            if (predictionDiff !== 0) return predictionDiff;

            // Secondary sort: by best rank (lower is better)
            if (a.bestRank === null && b.bestRank === null) return 0;
            if (a.bestRank === null) return 1;
            if (b.bestRank === null) return -1;
            return a.bestRank - b.bestRank;
        });
}
