import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { FETCH_BATCH_SIZE, TABLES } from '../build/config';

config({ path: '.env.local', quiet: true });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

interface CutoffRecord {
    institute: string;
    [key: string]: unknown;
}

async function checkDuplicates() {
    console.log('📥 Fetching data from Supabase...');

    // Fetch data from Supabase
    let data: CutoffRecord[] = [];
    let from = 0;

    while (true) {
        const { data: chunk, error } = await supabase
            .from(TABLES.CUTOFFS)
            .select('institute')
            .range(from, from + FETCH_BATCH_SIZE - 1);

        if (error) {
            console.error('❌ Error fetching data:', error);
            process.exit(1);
        }

        if (!chunk || chunk.length === 0) break;

        data = data.concat(chunk);
        process.stdout.write(`\r   Fetched ${data.length} records...`);
        from += FETCH_BATCH_SIZE;

        if (chunk.length < FETCH_BATCH_SIZE) break;
    }
    process.stdout.write('\n\n');

    // Get all institute names (with exact spelling/spacing)
    const allInstitutes = data.map(r => r.institute);

    // Count occurrences
    const instituteCounts: Record<string, number> = {};
    allInstitutes.forEach(inst => {
        instituteCounts[inst] = (instituteCounts[inst] || 0) + 1;
    });

    // Get unique institutes
    const uniqueInstitutes = Object.keys(instituteCounts).sort();

    console.log('\n' + '='.repeat(70));
    console.log('DETAILED INSTITUTE ANALYSIS');
    console.log('='.repeat(70));

    console.log(`\nTotal records: ${data.length}`);
    console.log(`Unique institute names: ${uniqueInstitutes.length}`);

    // Check for potential duplicates (similar names)
    console.log('\nLooking for potential duplicate/variant names...\n');

    const normalized: Record<string, string[]> = {};
    uniqueInstitutes.forEach(inst => {
        // Normalize: lowercase, remove extra spaces, remove special chars
        const norm = inst.toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[.,&()-]/g, '')
            .trim();

        if (!normalized[norm]) {
            normalized[norm] = [];
        }
        normalized[norm].push(inst);
    });

    // Find institutes with variants
    let variantCount = 0;
    Object.entries(normalized).forEach(([_norm, variants]) => {
        if (variants.length > 1) {
            variantCount++;
            console.log(`Variant group ${variantCount}:`);
            variants.forEach(v => console.log(`  - "${v}"`));
            console.log('');
        }
    });

    console.log('='.repeat(70));
    console.log(`\nTotal unique names (exact): ${uniqueInstitutes.length}`);
    console.log(`Variant groups found: ${variantCount}`);
    console.log(`Likely true unique institutes: ${uniqueInstitutes.length - variantCount}`);
    console.log('\n' + '='.repeat(70));
}

checkDuplicates().catch(console.error);
