/**
 * Utility to parse Indian currency strings and ranges into absolute INR numeric values.
 *
 * Requirements:
 * - Return absolute INR integer values only.
 * - Use the lower bound for ranges (e.g., '24,000-48,000' -> 24000).
 * - Strip commas, currency symbols, and other noise before parsing.
 * - Normalize units carefully: cr, crore, crores, l, lac, lakh, lakhs, k.
 * - If no unit exists, treat the parsed number as plain INR.
 * - Handle units attached as suffixes (e.g., '5.98L') or as separate words.
 *
 * @param value The string or number to parse.
 * @returns The parsed numeric value in absolute INR, or null if parsing fails.
 */
export function parseIndianMoneyBound(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;

  let str = String(value).trim();
  if (!str) return null;

  // 1. Take the lower bound of any range
  str = str.split(/\s*(?:-|to)\s*/i)[0];

  // 2. Clean noise like currency symbols, commas, and irrelevant trailing text
  let cleaned = str.toLowerCase()
    .replace(/₹|inr|,|\/-|per semester|per year|annually/gi, '')
    .trim();

  // 3. Extract numeric part (including decimals)
  const numericMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!numericMatch) return null;

  const num = parseFloat(numericMatch[0]);
  if (isNaN(num)) return null;

  // 4. Determine multiplier
  let multiplier = 1;

  // Unit detection. We check for units as standalone words (\bunit\b) 
  // OR as suffixes immediately following a digit ((?<=\d)unit\b).
  if (cleaned.match(/(?<=\d)(cr|crore|crores)\b|\b(cr|crore|crores)\b/)) {
    multiplier = 10000000;
  } else if (cleaned.match(/(?<=\d)(lakh|lakhs|lac|l)\b|\b(lakh|lakhs|lac|l)\b/)) {
    multiplier = 100000;
  } else if (cleaned.match(/(?<=\d)k\b|\bk\b/)) {
    multiplier = 1000;
  }

  return Math.round(num * multiplier);
}
