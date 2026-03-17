import React, { useMemo } from 'react';
import { Star, Info } from 'lucide-react';
import type { CollegeData } from '../../types';
import { PredictionBadge } from './PredictionBadge';
import { calculateConfidence, getPredictionReasoning, getConfidenceLabel } from '../../utils/predictionUtils';

interface BranchItemProps {
    branch: CollegeData;
    userRank: number;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
}

/**
 * Individual branch item display within a college card
 * Shows branch details and admission prediction
 */
export const BranchItem = React.memo(function BranchItem({ branch, userRank, isFavorite, onToggleFavorite }: BranchItemProps) {
    // ⚡ OPTIMIZATION: Memoize tooltip content to avoid re-calculating on every render
    const tooltipContent = useMemo(() => {
        if (!branch.opening_rank || !branch.closing_rank || branch.prediction.text === 'No Chance') {
            return null;
        }

        const confidence = calculateConfidence(
            userRank,
            branch.opening_rank,
            branch.closing_rank,
            branch.prediction.text
        );
        const reasoning = getPredictionReasoning(
            userRank,
            branch.opening_rank,
            branch.closing_rank,
            branch.prediction.text
        );
        const label = getConfidenceLabel(confidence);
        return `${label} (${confidence}%)\n${reasoning}`;
    }, [branch.opening_rank, branch.closing_rank, branch.prediction.text, userRank]);

    return (
        <div className="group/branch p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-gray-800/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-200">
            <div className="flex flex-col gap-2 relative">
                {/* Row 1: Branch Name */}
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                    {branch.branch}
                </h4>

                {/* Row 2: Prediction Badge & Star (Justify Between) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <PredictionBadge prediction={branch.prediction.text} size="xs" />

                        {/* Info icon with tooltip */}
                        {tooltipContent && (
                            <div
                                className="group/info relative cursor-help"
                                title={tooltipContent}
                            >
                                <Info className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleFavorite) {
                                onToggleFavorite(branch.id);
                            }
                        }}
                        className={`p-1.5 md:p-2 rounded-full transition-colors ${isFavorite
                            ? 'text-yellow-400 hover:text-yellow-500 bg-yellow-400/10'
                            : 'text-gray-400 hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Star className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Row 3: Filter Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium">
                        {branch.category}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                        {branch.quota}
                    </span>
                    {branch.seat_type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                            {branch.seat_type}
                        </span>
                    )}
                </div>

                {/* Row 4: Rank details */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-500">Open:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {branch.opening_rank?.toLocaleString() || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-500">Close:</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {branch.closing_rank?.toLocaleString() || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap">
                        <span>
                            {branch.year || new Date().getFullYear()} R{branch.round.replace(/Round\s*/i, '')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
});
