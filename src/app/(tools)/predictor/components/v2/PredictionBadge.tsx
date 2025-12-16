import React from 'react';
import { PREDICTION_COLORS } from '../../types';

interface PredictionBadgeProps {
    prediction: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showDot?: boolean;
}

/**
 * Color-coded prediction badge component
 * Shows admission chance with visual styling
 */
export function PredictionBadge({ prediction, size = 'md', showDot = true }: PredictionBadgeProps) {
    const colors = PREDICTION_COLORS[prediction] || PREDICTION_COLORS['-'];

    const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-[10px] leading-none',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const isTopPrediction = prediction === 'Confirm' || prediction === 'Great';

    return (
        <span className={`
      inline-flex items-center ${size === 'xs' ? 'gap-1' : 'gap-2'} 
      ${sizeClasses[size]}
      ${colors.badge}
      rounded-full font-semibold border
      ${isTopPrediction ? 'shadow-sm' : ''}
      transition-all duration-200
    `}>
            {showDot && (
                <span className={`
          ${size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full 
          ${colors.text}
          ${isTopPrediction ? 'animate-pulse' : ''}
        `}
                    style={{ backgroundColor: 'currentColor' }}
                />
            )}
            {prediction.toUpperCase()}
        </span>
    );
}
