/**
 * List Unique College Names from Supabase
 * Shows all unique institute names to check for duplicates
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listColleges() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!
    );

    console.log('📊 Fetching unique college names from Supabase...\n');

    // Fetch all records with pagination
    let allRecords: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('institute')
            .range(from, from + batchSize - 1);

        if (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }

        if (data && data.length > 0) {
            allRecords = allRecords.concat(data);
            from += batchSize;
            hasMore = data.length === batchSize;
        } else {
            hasMore = false;
        }
    }

    console.log(`Fetched ${allRecords.length.toLocaleString()} total records\n`);

    // Get unique names
    const uniqueNames = [...new Set(allRecords.map(row => row.institute))].sort();

    console.log(`Total unique colleges: ${uniqueNames.length}\n`);
    console.log('College Names:');
    console.log('='.repeat(80));

    uniqueNames.forEach((name, index) => {
        console.log(`${(index + 1).toString().padStart(3)}. ${name}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal: ${uniqueNames.length} unique colleges`);

    // Import normalization function
    const { toTitleCase } = await import('../utils/normalize-text');

    // Check each name against its normalized version
    const issues: Array<{ original: string; expected: string }> = [];

    uniqueNames.forEach(name => {
        const normalized = toTitleCase(name);
        if (name !== normalized) {
            issues.push({ original: name, expected: normalized });
        }
    });

    if (issues.length > 0) {
        console.log('\n⚠️  NORMALIZATION ISSUES FOUND:');
        console.log('='.repeat(80));
        console.log(`Found ${issues.length} colleges with normalization issues:\n`);

        issues.forEach(({ original, expected }, index) => {
            console.log(`${(index + 1).toString().padStart(3)}. Current:  "${original}"`);
            console.log(`    Expected: "${expected}"\n`);
        });
    } else {
        console.log('\n✅ All college names are properly normalized!');
    }

    process.exit(0);
}

listColleges().catch(console.error);
