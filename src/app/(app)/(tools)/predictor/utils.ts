import type { CollegeData } from './types';

/**
 * Export predictor results to CSV file
 */
export function exportToCSV(data: CollegeData[]): void {
    const headers = ['Institute', 'Branch', 'Category', 'Opening Rank', 'Closing Rank', 'Year', 'Round', 'Quota', 'Seat Type', 'Prediction'];
    const csvContent = [
        headers.join(','),
        ...data.map(item => [
            `"${item.institute}"`,
            `"${item.branch}"`,
            `"${item.category}"`,
            item.opening_rank || '',
            item.closing_rank || '',
            item.year || '',
            `"${item.round}"`,
            `"${item.quota}"`,
            `"${item.seat_type}"`,
            `"${item.prediction.text}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'wbjee_predictor_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Copy text to clipboard with fallback
 */
export function copyToClipboard(text: string, successMessage: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }).catch(() => {
            alert(`Please copy manually:\n\n${text}`);
        });
    } else {
        alert(`Please copy manually:\n\n${text}`);
    }
}

/**
 * Format results as human-readable text for sharing
 */
export function formatResultsAsText(data: CollegeData[], userRank?: number): string {
    let text = `WBJEE College Predictor Results\n`;
    text += `Generated on: ${new Date().toLocaleDateString()}\n`;
    if (userRank && userRank > 0) text += `Your Rank: ${userRank.toLocaleString()}\n`;
    text += `Total Colleges Found: ${data.length}\n\n`;

    data.forEach((item, index) => {
        text += `${index + 1}. ${item.institute}\n`;
        text += `   Branch: ${item.branch}\n`;
        text += `   Category: ${item.category}\n`;
        text += `   Opening Rank: ${item.opening_rank?.toLocaleString() || 'N/A'}\n`;
        text += `   Closing Rank: ${item.closing_rank?.toLocaleString() || 'N/A'}\n`;
        text += `   Year: ${item.year || 'N/A'}\n`;
        text += `   Round: ${item.round || 'N/A'}\n`;
        text += `   Quota: ${item.quota || 'N/A'}\n`;
        text += `   Seat Type: ${item.seat_type || 'N/A'}\n\n`;
    });

    return text;
}

/**
 * Share results link
 */
export function createShareResultsUrl(rank: string): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?rank=${rank}`;
}

/**
 * Share shortlist link
 */
export function createShareShortlistUrl(favoriteIds: string[]): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?shortlist=${favoriteIds.join(',')}`;
}

/**
 * Extract unique college codes from data
 */
export function extractUniqueCodes(data: CollegeData[]): string[] {
    return data
        .map(item => item.institute)
        .filter((code, index, arr) => arr.indexOf(code) === index);
}
