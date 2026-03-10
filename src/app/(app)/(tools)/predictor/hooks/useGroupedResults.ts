import { useMemo } from 'react';
import type { CollegeData, GroupedCollege } from '../types';
import { groupCollegesByInstitute } from '../utils/groupColleges';

/**
 * Custom hook to group flat college results by institute
 * Memoized to prevent unnecessary re-calculation
 * 
 * @param flatResults - Array of individual college/branch records from API
 * @returns Array of GroupedCollege objects sorted by best prediction
 */
export function useGroupedResults(flatResults: CollegeData[]): GroupedCollege[] {
    return useMemo(() => {
        if (!flatResults || flatResults.length === 0) {
            return [];
        }

        return groupCollegesByInstitute(flatResults);
    }, [flatResults]);
}
