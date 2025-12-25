/**
 * Fix Duplicate Institute & Program Names in Supabase
 * 
 * Problem: Names have inconsistent capitalization:
 * - 16 institutes: "ANAND COLLEGE..." vs "Anand College..."
 * - 92 programs: "COMPUTER SCIENCE & ENGINEERING" vs "Computer Science & Engineering"
 * 
 * Solution: Normalize all names to Title Case
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

/**
 * Smart Title Case Conversion
 * Handles: acronyms, punctuation, special cases
 */
function toTitleCase(str: string): string {
    // Check if it's an acronym (all caps with periods like "P.G.")
    const isAcronym = (word: string) => /^[A-Z]\.([A-Z]\.)+$/.test(word);

    // Words that should stay lowercase (unless first word or after punctuation)
    const lowercaseWords = new Set([
        'of', 'and', 'the', 'in', 'at', 'to', 'for', 'a', 'an',
        'or', 'but', 'nor', 'on', 'with', 'by'
    ]);

    // Split by spaces but track punctuation context
    const words = str.split(/\s+/);

    return words.map((word, index) => {
        // Handle empty/whitespace
        if (!word) return word;

        // Preserve acronyms
        if (isAcronym(word)) {
            return word.toUpperCase(); // P.G. stays P.G.
        }

        // Check if word starts with punctuation
        const startsWithPunctuation = /^[(\[\{,]/.test(word);
        const afterPunctuation = index > 0 && /[,;\-]$/.test(words[index - 1]);

        // First word, after punctuation, or starts with punctuation → always capitalize
        const shouldCapitalize = index === 0 || afterPunctuation || startsWithPunctuation;

        const lowerWord = word.toLowerCase();

        // Handle words with internal punctuation (e.g., "D.H.Road")
        if (word.includes('.') && word.length <= 6) {
            // Likely abbreviation - capitalize each part
            return word.split('.').map(part =>
                part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''
            ).join('.');
        }

        if (shouldCapitalize || !lowercaseWords.has(lowerWord.replace(/^[(\[\{,]/, ''))) {
            // Capitalize first letter (after any leading punctuation)
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        return lowerWord;
    }).join(' ');
}

async function fixDuplicateNames() {
    console.log('🔧 Starting Name Normalization (Institutes & Programs)\n');

    try {
        // 1. Fetch ALL records using pagination
        console.log('📥 Fetching all records from Supabase...');

        let allRecords: Array<{ id: number; institute: string; program: string }> = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('cutoffs')
                .select('id, institute, program')
                .range(from, from + batchSize - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allRecords = allRecords.concat(data);
                console.log(`   Batch ${Math.floor(from / batchSize) + 1}: ${data.length} records (total: ${allRecords.length})`);
                from += batchSize;
                hasMore = data.length === batchSize;
            } else {
                hasMore = false;
            }
        }

        console.log(`✅ Fetched ${allRecords.length} total records\n`);

        // 2. Find duplicates for INSTITUTES
        const uniqueInstitutes = new Set<string>();
        const instituteNormalizationMap = new Map<string, string>();

        allRecords.forEach(record => {
            const normalized = toTitleCase(record.institute);
            uniqueInstitutes.add(normalized);

            if (record.institute !== normalized) {
                instituteNormalizationMap.set(record.institute, normalized);
            }
        });

        console.log(`📊 Institute Statistics:`);
        console.log(`   Unique institutes (after normalization): ${uniqueInstitutes.size}`);
        console.log(`   Institute records to update: ${instituteNormalizationMap.size}\n`);

        // 3. Find duplicates for PROGRAMS
        const uniquePrograms = new Set<string>();
        const programNormalizationMap = new Map<string, string>();

        allRecords.forEach(record => {
            const normalized = toTitleCase(record.program);
            uniquePrograms.add(normalized);

            if (record.program !== normalized) {
                programNormalizationMap.set(record.program, normalized);
            }
        });

        console.log(`📊 Program Statistics:`);
        console.log(`   Unique programs (after normalization): ${uniquePrograms.size}`);
        console.log(`   Program records to update: ${programNormalizationMap.size}\n`);

        // 4. Show what will change for INSTITUTES
        if (instituteNormalizationMap.size > 0) {
            console.log('📝 Institute Changes:\n');
            let count = 0;
            for (const [original, normalized] of instituteNormalizationMap.entries()) {
                count++;
                console.log(`${count}. "${original}"`);
                console.log(`   → "${normalized}"\n`);
                if (count >= 10) {
                    console.log(`   ... and ${instituteNormalizationMap.size - 10} more\n`);
                    break;
                }
            }
        }

        // 5. Show what will change for PROGRAMS
        if (programNormalizationMap.size > 0) {
            console.log('📝 Program Changes:\n');
            let count = 0;
            for (const [original, normalized] of programNormalizationMap.entries()) {
                count++;
                console.log(`${count}. "${original}"`);
                console.log(`   → "${normalized}"\n`);
                if (count >= 10) {
                    console.log(`   ... and ${programNormalizationMap.size - 10} more\n`);
                    break;
                }
            }
        }

        if (instituteNormalizationMap.size === 0 && programNormalizationMap.size === 0) {
            console.log('✅ No duplicates found - data is already clean!');
            return;
        }

        // 6. Update INSTITUTES
        if (instituteNormalizationMap.size > 0) {
            console.log('🔄 Updating institutes...\n');

            let updated = 0;
            for (const [original, normalized] of instituteNormalizationMap.entries()) {
                const { error } = await supabase
                    .from('cutoffs')
                    .update({ institute: normalized })
                    .eq('institute', original);

                if (error) {
                    console.error(`❌ Error updating institute "${original}":`, error);
                } else {
                    updated++;
                    if (updated % 5 === 0) {
                        console.log(`   Updated ${updated}/${instituteNormalizationMap.size} institutes...`);
                    }
                }
            }

            console.log(`\n✅ Successfully normalized ${updated} institute names!`);
        }

        // 7. Update PROGRAMS
        if (programNormalizationMap.size > 0) {
            console.log('\n🔄 Updating programs...\n');

            let updated = 0;
            for (const [original, normalized] of programNormalizationMap.entries()) {
                const { error } = await supabase
                    .from('cutoffs')
                    .update({ program: normalized })
                    .eq('program', original);

                if (error) {
                    console.error(`❌ Error updating program "${original}":`, error);
                } else {
                    updated++;
                    if (updated % 10 === 0) {
                        console.log(`   Updated ${updated}/${programNormalizationMap.size} programs...`);
                    }
                }
            }

            console.log(`\n✅ Successfully normalized ${updated} program names!`);
        }

        console.log(`\n📋 Next steps:`);
        console.log(`   1. Run: npm run build:metadata (regenerate metadata)`);
        console.log(`   2. Verify: Check that metadata-lookup.json has ${uniqueInstitutes.size} colleges and ${uniquePrograms.size} programs`);
        console.log(`   3. Expected reduction: ~35% smaller file size`);
        console.log(`   4. Deploy: Push changes to production\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDuplicateNames();

