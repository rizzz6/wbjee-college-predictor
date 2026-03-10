/**
 * Type definitions for the Card-based UI
 */

export interface CollegeData {
    id: string;
    round: string;
    institute: string;
    branch: string;
    seat_type: string;
    quota: string;
    category: string;
    opening_rank: number | null;
    closing_rank: number | null;
    year: number | null;
    prediction: {
        text: string;
        order: number;
    };
}

export interface GroupedCollege {
    institute: string;
    location: string;
    branches: CollegeData[];
    bestPrediction: {
        text: string;
        order: number;
    };
    bestRank: number | null;
}

export type PredictionColorScheme = {
    gradient: string;
    badge: string;
    text: string;
    bg: string;
};

export const PREDICTION_COLORS: Record<string, PredictionColorScheme> = {
    'Confirm': {
        gradient: 'from-green-300 via-green-400 to-emerald-600',
        badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20'
    },
    'Great': {
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
        badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    'Good': {
        gradient: 'from-yellow-400 via-amber-400 to-orange-400',
        badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    'Borderline': {
        gradient: 'from-orange-400 via-orange-500 to-red-400',
        badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    'No Chance': {
        gradient: 'from-red-400 via-red-500 to-pink-500',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20'
    },
    '-': {
        gradient: 'from-gray-300 via-gray-400 to-gray-500',
        badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        text: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-900/20'
    }
};
