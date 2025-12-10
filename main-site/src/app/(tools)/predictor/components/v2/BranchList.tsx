import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CollegeData } from '../../types';
import { BranchItem } from './BranchItem';

interface BranchListProps {
    branches: CollegeData[];
    userRank: number;
    isDefaultExpanded?: boolean;
    favorites?: Set<string>;
    onToggleFavorite?: (id: string) => void;
}

/**
 * Expandable branch list with smooth accordion animation
 * Shows available branches for a college
 */
export function BranchList({ branches, userRank, isDefaultExpanded = false, favorites, onToggleFavorite }: BranchListProps) {
    const [isExpanded, setIsExpanded] = useState(isDefaultExpanded);

    return (
        <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Accordion trigger */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Hide branches' : 'Show branches'}
            >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {isExpanded ? 'Hide' : 'Show'} Available Branches
                </span>

                <ChevronDown
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 ${isExpanded ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Accordion content */}
            <div
                className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[60vh] opacity-100 overflow-y-auto custom-scrollbar' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
            >
                <div className="px-4 pb-4 space-y-3">
                    {branches.map((branch) => (
                        <BranchItem
                            key={branch.id}
                            branch={branch}
                            userRank={userRank}
                            isFavorite={favorites?.has(branch.id)}
                            onToggleFavorite={onToggleFavorite}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
