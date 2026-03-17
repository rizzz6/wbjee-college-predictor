import React, { useMemo } from 'react';
import { MapPin, GraduationCap } from 'lucide-react';
import type { GroupedCollege } from '../../types';
import { PREDICTION_COLORS } from '../../types';
import { PredictionBadge } from './PredictionBadge';
import { BranchList } from './BranchList';

interface CollegeCardProps {
    college: GroupedCollege;
    userRank: number;
    favorites?: Set<string>;
    onToggleFavorite?: (id: string) => void;
}

/**
 * Premium college card with gradient border
 * Displays institute info, best prediction, rank visualization, and expandable branches
 */
export const CollegeCard = React.memo(function CollegeCard({ college, userRank, favorites, onToggleFavorite }: CollegeCardProps) {
    const colors = PREDICTION_COLORS[college.bestPrediction.text] || PREDICTION_COLORS['-'];

    // ⚡ OPTIMIZATION: Memoize initials to avoid redundant string splitting
    const initials = useMemo(() => {
        const words = college.institute.split(' ');
        if (words.length >= 2) {
            return words[0][0] + words[1][0];
        }
        return college.institute.substring(0, 2);
    }, [college.institute]);

    return (
        <div className="group relative overflow-hidden">
            {/* Gradient border - changes based on prediction */}
            <div
                className={`
          absolute inset-0 rounded-2xl p-[2px] 
          bg-gradient-to-br ${colors.gradient}
          opacity-75 
        `}
            />
            {/* Card content */}
            <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-6 relative">
                    {/* Mobile: Top Row with Logo and Badge */}
                    <div className="flex w-full sm:w-auto items-center justify-between sm:block">
                        {/* Institute logo/initials */}
                        <div className="flex-shrink-0">
                            <div className={`
                w-12 h-12 sm:w-16 sm:h-16 rounded-xl 
                bg-gradient-to-br ${colors.gradient}
                flex items-center justify-center 
                text-white text-lg sm:text-xl font-bold shadow-md
              `}>
                                {initials}
                            </div>
                        </div>

                        {/* Mobile Badge (Visible only on mobile) */}
                        <div className="sm:hidden">
                            <PredictionBadge prediction={college.bestPrediction.text} size="sm" />
                        </div>
                    </div>

                    {/* Institute info */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto mt-1 sm:mt-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 truncate leading-tight">
                            {college.institute}
                        </h3>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{college.location}</span>
                        </div>
                    </div>

                    {/* Desktop Badge (Hidden on mobile) */}
                    <div className="hidden sm:block flex-shrink-0">
                        <PredictionBadge prediction={college.bestPrediction.text} size="md" />
                    </div>
                </div>

                <div className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                                <strong className="font-semibold">{college.branches.length}</strong> {college.branches.length === 1 ? 'branch' : 'branches'} available for your rank
                            </span>
                        </div>
                    </div>
                </div>

                {/* Expandable branch list */}
                <BranchList
                    branches={college.branches}
                    userRank={userRank}
                    isDefaultExpanded={false}
                    favorites={favorites}
                    onToggleFavorite={onToggleFavorite}
                />
            </div>
        </div>
    );
});
