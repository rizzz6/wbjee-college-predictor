'use client';

import { PREDICTION_COLORS } from '../types';

interface PredictionBadgeProps {
    prediction: string;
    size?: 'sm' | 'default';
    className?: string; // For external positioning (ml-2, mt-1, etc.)
}

/**
 * Reusable badge component for displaying prediction status
 * Uses consistent styling from PREDICTION_COLORS constant
 */
export function PredictionBadge({
    prediction,
    size = 'default',
    className = ''
}: PredictionBadgeProps) {
    const colors = PREDICTION_COLORS[prediction] || PREDICTION_COLORS['No Chance'];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold border ${colors.badge} ${sizeClasses} ${className}`.trim()}
        >
            {prediction}
        </span>
    );
}
