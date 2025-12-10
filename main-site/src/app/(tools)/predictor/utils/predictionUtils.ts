/**
 * Calculate prediction confidence using hybrid approach
 * Combines distance-based (how close to thresholds) and gap-based (how wide the range is)
 * 
 * @returns Confidence score 0-100
 */
export function calculateConfidence(
    userRank: number,
    openingRank: number,
    closingRank: number,
    prediction: string
): number {
    // Defensive validation - protect against invalid/corrupted data
    if (userRank <= 0 || openingRank <= 0 || closingRank <= 0) {
        console.warn('Invalid confidence calculation: Negative or zero rank detected', {
            userRank, openingRank, closingRank
        });
        return 50; // Safe fallback
    }

    if (openingRank > closingRank) {
        console.warn('Invalid confidence calculation: Inverted ranks (OR > CR)', {
            openingRank, closingRank
        });
        return 50; // Safe fallback
    }

    const gap = closingRank - openingRank;

    // Base confidence from gap size (wider gap = more predictable)
    let gapConfidence: number;
    if (gap < 100) {
        gapConfidence = 50; // Very tight race, less predictable
    } else if (gap < 500) {
        gapConfidence = 65;
    } else if (gap < 2000) {
        gapConfidence = 75;
    } else if (gap < 5000) {
        gapConfidence = 85;
    } else {
        gapConfidence = 90; // Wide gap, very predictable
    }

    // Distance-based confidence (how well-positioned within tier)
    let distanceConfidence: number;

    switch (prediction) {
        case 'Confirm':
            // Better than opening rank - very confident
            const marginBelowOpening = openingRank - userRank;

            // FIX: "Topper Penalty" - If margin is strong (>100), ignore gap penalty
            // Elite colleges (small gaps) shouldn't penalize deserving students
            if (marginBelowOpening > 500) {
                distanceConfidence = 100;
                // For toppers with huge margins, override gap penalty
                gapConfidence = Math.max(gapConfidence, 95);
            } else if (marginBelowOpening > 100) {
                distanceConfidence = 95;
                // For strong margins, boost gap confidence to at least 85%
                gapConfidence = Math.max(gapConfidence, 85);
            } else {
                distanceConfidence = 90;
            }
            break;

        case 'Great':
            // Top 30% of batch
            const greatThreshold = openingRank + (gap * 0.30);
            const greatPosition = (greatThreshold - userRank) / (gap * 0.30);
            distanceConfidence = 70 + (greatPosition * 20); // 70-90%
            break;

        case 'Good':
            // Within admitted range
            const positionInRange = (closingRank - userRank) / gap;
            distanceConfidence = 60 + (positionInRange * 25); // 60-85%
            break;

        case 'Borderline':
            // Just outside cutoff - less certain
            distanceConfidence = 45;
            break;

        case 'No Chance':
            // Far outside - very certain it's no chance
            // FIX: "No Chance Confusion" - High confidence here means "confident it won't happen"
            // This is handled by hiding the info icon in UI (prevents user confusion)
            distanceConfidence = 85;
            break;

        default:
            distanceConfidence = 50;
    }

    // Hybrid: 60% distance + 40% gap
    const hybrid = (distanceConfidence * 0.6) + (gapConfidence * 0.4);

    // Clamp to 0-100
    return Math.max(0, Math.min(100, Math.round(hybrid)));
}

/**
 * Generate human-readable reasoning text explaining the prediction
 */
export function getPredictionReasoning(
    userRank: number,
    openingRank: number,
    closingRank: number,
    prediction: string
): string {
    const gap = closingRank - openingRank;
    const margin = openingRank - userRank;
    const overshoot = userRank - closingRank;

    switch (prediction) {
        case 'Confirm':
            if (margin > 1000) {
                return `Your rank (${userRank.toLocaleString()}) is ${margin.toLocaleString()} ranks better than last year's opening rank. Excellent chances!`;
            } else if (margin > 100) {
                return `Your rank is ${margin.toLocaleString()} ranks better than the opening rank (${openingRank.toLocaleString()}). Strong chance!`;
            } else {
                return `Your rank (${userRank.toLocaleString()}) is just better than the opening rank (${openingRank.toLocaleString()}).`;
            }

        case 'Great':
            const greatThreshold = openingRank + (gap * 0.30);
            return `You're in the top 30% of last year's admitted batch (${openingRank.toLocaleString()} - ${Math.round(greatThreshold).toLocaleString()}). Very good chance!`;

        case 'Good':
            const percentage = Math.round(((closingRank - userRank) / gap) * 100);
            return `Your rank (${userRank.toLocaleString()}) falls within the admitted range. You're at the ${100 - percentage}th percentile of last year's batch.`;

        case 'Borderline':
            if (overshoot > 0) {
                return `You're ${overshoot.toLocaleString()} ranks outside the cutoff (${closingRank.toLocaleString()}). Worth trying, but uncertain.`;
            } else {
                return `Very close to the cutoff (${closingRank.toLocaleString()}). Worth a shot!`;
            }

        case 'No Chance':
            const distance = userRank - closingRank;
            if (distance > 10000) {
                return `Your rank is ${distance.toLocaleString()} ranks beyond last year's cutoff. Highly unlikely.`;
            } else {
                return `${distance.toLocaleString()} ranks beyond the cutoff (${closingRank.toLocaleString()}). Very unlikely.`;
            }

        default:
            return 'Prediction data unavailable';
    }
}

/**
 * Get confidence level label
 */
export function getConfidenceLabel(confidence: number): string {
    if (confidence >= 85) return 'Very High Confidence';
    if (confidence >= 70) return 'High Confidence';
    if (confidence >= 55) return 'Good Confidence';
    if (confidence >= 40) return 'Moderate Confidence';
    return 'Limited Confidence';
}

/**
 * Get confidence color class
 */
export function getConfidenceColor(confidence: number): string {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
}
