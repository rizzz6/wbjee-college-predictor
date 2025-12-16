import React, { useMemo } from 'react';

interface RankVisualizationProps {
    userRank: number;
    openingRank: number | null;
    closingRank: number | null;
}

/**
 * Interactive rank visualization bar
 * Shows user's position relative to opening and closing ranks
 */
export function RankVisualization({ userRank, openingRank, closingRank }: RankVisualizationProps) {
    const visualization = useMemo(() => {
        if (!openingRank || !closingRank) {
            return null;
        }

        // Calculate percentages for visualization
        const range = closingRank - openingRank;
        const userPosition = userRank - openingRank;

        // Calculate safe zone (opening to user rank)
        const safePercentage = Math.max(0, Math.min(100, (userPosition / range) * 100));

        // Calculate risk zone (user rank to closing)
        const riskPercentage = Math.max(0, Math.min(100, 100 - safePercentage));

        // User marker position
        const userPositionPercent = Math.max(0, Math.min(100, safePercentage));

        // Status message
        let status = 'Outside range';
        let statusColor = 'text-gray-600 dark:text-gray-400';

        if (userRank < openingRank) {
            status = 'Confirm - Well above cutoff';
            statusColor = 'text-green-600 dark:text-green-400';
        } else if (userRank <= closingRank * 0.75) {
            status = 'Safe zone - Great chances';
            statusColor = 'text-green-600 dark:text-green-400';
        } else if (userRank <= closingRank * 0.95) {
            status = 'Good position';
            statusColor = 'text-yellow-600 dark:text-yellow-400';
        } else if (userRank <= closingRank) {
            status = 'Risky - Just within cutoff';
            statusColor = 'text-orange-600 dark:text-orange-400';
        } else {
            status = 'Outside cutoff range';
            statusColor = 'text-red-600 dark:text-red-400';
        }

        return {
            safePercentage,
            riskPercentage,
            userPositionPercent,
            status,
            statusColor,
            isOutside: userRank > closingRank
        };
    }, [userRank, openingRank, closingRank]);

    if (!visualization) {
        return null;
    }

    return (
        <div className="space-y-2">
            {/* Rank labels */}
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                <span className="flex flex-col">
                    <span className="text-[10px] uppercase text-gray-500 dark:text-gray-500">Opening</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{openingRank?.toLocaleString()}</span>
                </span>
                <span className="flex flex-col items-center">
                    <span className="text-[10px] uppercase text-purple-600 dark:text-purple-400">Your Rank</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{userRank.toLocaleString()}</span>
                </span>
                <span className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-gray-500 dark:text-gray-500">Closing</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{closingRank?.toLocaleString()}</span>
                </span>
            </div>

            {/* Visual rank bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                {!visualization.isOutside && (
                    <>
                        {/* Safe zone (Opening to User Rank) */}
                        <div
                            className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                            style={{ width: `${visualization.safePercentage}%` }}
                        />

                        {/* Risk zone (User Rank to Closing) */}
                        <div
                            className="absolute h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                            style={{
                                left: `${visualization.safePercentage}%`,
                                width: `${visualization.riskPercentage}%`
                            }}
                        />
                    </>
                )}

                {/* User position marker */}
                {!visualization.isOutside && (
                    <div
                        className="absolute top-0 w-1 h-full bg-purple-600 shadow-lg transition-all duration-500 z-10"
                        style={{ left: `${visualization.userPositionPercent}%` }}
                    >
                        {/* Marker dot */}
                        <div className="absolute -top-1.5 -left-2 w-4 h-4 bg-purple-600 rounded-full border-2 border-white dark:border-gray-900 shadow-md" />
                    </div>
                )}
            </div>

            {/* Status message */}
            <p className={`text-xs text-center font-medium ${visualization.statusColor}`}>
                {visualization.status}
            </p>
        </div>
    );
}
