/**
 * Smart Title Case Normalization
 * Preserves acronyms, handles special punctuation, follows grammar rules
 */

export function toTitleCase(input: string): string {
    if (!input) return input;

    // Special cases: known acronyms/abbreviations that stay ALL CAPS
    const allCapsWords = new Set([
        // Degrees
        'MBA', 'MCA', 'BBA', 'BCA', 'LLB', 'LLM', 'MBBS', 'MD', 'MS',
        // Technical fields
        'AI', 'ML', 'IT', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'IOT', 'AR', 'VR',
        // Institutions
        'UEM', 'IEM', 'WBJEE', 'JEE', 'NEET', 'IIT', 'NIT', 'IIIT',
        // Accreditation/Regulatory
        'PCI', 'AICTE', 'NBA', 'NAAC', 'UGC', 'NCTE',
        // Seat types
        'TFW', 'GC',
        // Common abbreviations in names
        'IQ', 'BC', 'SC', 'OBC',
        // College-specific acronyms
        'BCDA', 'SKM', 'DMBH', 'MCKV', 'RCC', 'NSHM', 'IMPS',
        'JIS', 'JLD', 'ITME', 'BP',
        // Directions
        'N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'
    ]);

    // Titles and honorifics (should be Title Case with period)
    const titleCaseMap: Record<string, string> = {
        'dr': 'Dr.',
        'dr.': 'Dr.',
        'mr': 'Mr.',
        'mr.': 'Mr.',
        'ms': 'Ms.',
        'ms.': 'Ms.',
        'mrs': 'Mrs.',
        'mrs.': 'Mrs.',
        'st': 'St.',
        'st.': 'St.',
        'mt': 'Mt.',
        'mt.': 'Mt.'
    };

    // Words that should be lowercase (unless first word or after punctuation)
    const lowercaseWords = new Set([
        'of', 'and', 'the', 'in', 'at', 'to', 'for', 'a', 'an',
        'or', 'but', 'nor', 'on', 'with', 'by'
    ]);

    // Common degree abbreviations with specific casing
    const degreeMap: Record<string, string> = {
        'b.tech': 'B.Tech',
        'btech': 'B.Tech',
        'm.tech': 'M.Tech',
        'mtech': 'M.Tech',
        'b.e': 'B.E',
        'b.e.': 'B.E.',
        'be': 'B.E',
        'm.e': 'M.E',
        'm.e.': 'M.E.',
        'me': 'M.E',
        'b.sc': 'B.Sc',
        'bsc': 'B.Sc',
        'm.sc': 'M.Sc',
        'msc': 'M.Sc',
        'p.g': 'P.G.',
        'p.g.': 'P.G.',
        'pg': 'P.G',
        'd.h': 'D.H.',
        'd.h.': 'D.H.'
    };

    // Check if string is an acronym with dots (e.g., A.T, P.G.)
    const isAcronymWithDots = (word: string): boolean => {
        return /^[A-Z](\.[A-Z])+\.?$/i.test(word);
    };

    // Split by spaces
    const words = input.split(/\s+/);

    return words.map((word, index) => {
        if (!word) return word;

        // Check for title/honorific abbreviations first (Dr., Mr., St., etc.)
        let lowerWord = word.toLowerCase().replace(/\.$/, ''); // Remove trailing period

        // Handle cases like "Dr.sudhir" (title stuck to next word)
        if (lowerWord.length > 3 && (titleCaseMap[lowerWord.substring(0, 2)] || titleCaseMap[lowerWord.substring(0, 3)])) {
            // Check for 2-letter titles (Dr, Mr, Ms, St)
            if (titleCaseMap[lowerWord.substring(0, 2)]) {
                const title = titleCaseMap[lowerWord.substring(0, 2)];
                const rest = lowerWord.substring(2);
                return title + ' ' + toTitleCase(rest);
            }
            // Check for 3-letter titles (Mrs)
            if (titleCaseMap[lowerWord.substring(0, 3)]) {
                const title = titleCaseMap[lowerWord.substring(0, 3)];
                const rest = lowerWord.substring(3);
                return title + ' ' + toTitleCase(rest);
            }
        }

        if (titleCaseMap[lowerWord] || titleCaseMap[lowerWord + '.']) {
            return titleCaseMap[lowerWord] || titleCaseMap[lowerWord + '.'];
        }

        // Check for degree abbreviations
        if (degreeMap[lowerWord]) {
            return degreeMap[lowerWord];
        }

        // Preserve acronyms with dots (A.T, P.G., D.H.Road)
        if (isAcronymWithDots(word)) {
            return word.toUpperCase();
        }

        // Check if it's a known all-caps word (without punctuation)
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        if (allCapsWords.has(cleanWord.toUpperCase())) {
            // Preserve the punctuation but uppercase the word
            return word.replace(/[a-zA-Z]+/g, match => match.toUpperCase());
        }

        // Determine if this word should be capitalized
        const isFirstWord = index === 0;
        const previousWord = index > 0 ? words[index - 1] : '';

        // After these punctuation marks, capitalize the next word
        const afterSentencePunctuation = /[.!?:]$/.test(previousWord);
        const afterComma = /,$/.test(previousWord); // Locations after commas should be capitalized
        const startsWithParen = word.startsWith('(');

        const shouldCapitalize = isFirstWord || afterSentencePunctuation || afterComma || startsWithParen;

        // Handle hyphenated words (e.g., Self-Financing)
        // BUT preserve location names with numbers (e.g., 24-Parganas-South)
        if (word.includes('-')) {
            // If it starts with a number, keep it as-is (location name)
            if (/^\d/.test(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            // Otherwise, recursively title-case each part
            return word.split('-')
                .map(part => toTitleCase(part))
                .join('-');
        }

        // Handle words with internal parentheses/brackets
        // Extract leading/trailing punctuation
        const match = word.match(/^([([{]*)(.*?)([)\]}.,;:!?]*)$/);
        if (!match) return word;

        const [, leadingPunc, coreWord, trailingPunc] = match;

        if (!coreWord) return word;

        // Check if core word should be lowercase
        const coreLower = coreWord.toLowerCase();
        if (!shouldCapitalize && lowercaseWords.has(coreLower)) {
            return leadingPunc + coreLower + trailingPunc;
        }

        // Standard title case: capitalize first letter
        const titleCased = coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase();
        return leadingPunc + titleCased + trailingPunc;

    }).join(' ');
}
