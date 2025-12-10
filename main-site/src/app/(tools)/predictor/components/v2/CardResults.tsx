import React from 'react';
import type { CollegeData } from '../../types';
import { useGroupedResults } from '../../hooks/useGroupedResults';
import { CollegeCard } from './CollegeCard';
import { AlertCircle } from 'lucide-react';

interface CardResultsProps {
    results: CollegeData[];
    userRank: number;
    favorites?: Set<string>;
    onToggleFavorite?: (id: string) => void;
}

/**
 * Card-based results container
 * Displays colleges in a responsive grid with grouped cards
 */
export function CardResults({ results, userRank, favorites, onToggleFavorite }: CardResultsProps) {
    const groupedColleges = useGroupedResults(results);

    if (results.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <AlertCircle className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No colleges found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your rank or filter criteria to see more results.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Results count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <strong className="font-semibold text-gray-900 dark:text-gray-100">{groupedColleges.length}</strong> {groupedColleges.length === 1 ? 'college' : 'colleges'} with <strong className="font-semibold text-gray-900 dark:text-gray-100">{results.length}</strong> {results.length === 1 ? 'branch' : 'branches'}
                </p>
            </div>

            {/* Mobile-first responsive grid */}
            <div className="
        grid gap-6
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        items-start
        max-w-7xl mx-auto
      ">
                {groupedColleges.map((college) => (
                    <CollegeCard
                        key={college.institute}
                        college={college}
                        userRank={userRank}
                        favorites={favorites}
                        onToggleFavorite={onToggleFavorite}
                    />
                ))}
            </div>
        </div>
    );
}
