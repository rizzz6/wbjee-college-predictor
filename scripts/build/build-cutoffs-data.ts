/**
 * Build Flat Columnar Cutoffs Data
 * 
 * Generates a compressed columnar JSON file containing all cutoff data
 * Reduces file size from 911 KB → ~180 KB (with Brotli)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', quiet: true });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

interface CutoffRow {
    institute: string;
    program: string;
    year: number;
    category: string;
    round: string;
    seat_type: string;
    opening_rank: number;
    closing_rank: number;
}

async function buildFlatColumnar() {
    console.log('[1/4] Building flat columnar cutoffs data...\n');

    // 1. Fetch all data from Supabase
    console.log('[2/4] Fetching data from Supabase...');
    let allData: CutoffRow[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('institute, program, year, category, round, seat_type, opening_rank, closing_rank')
            .order('institute, program, year, category, round')
            .range(from, from + batchSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allData = allData.concat(data);
        process.stdout.write(`\r   >> Fetched ${allData.length} records...`);
        from += batchSize;

        if (data.length < batchSize) break;
    }

    process.stdout.write('\n');
    console.log(`   >> Fetched ${allData.length} total records\n`);

    // 2. Build lookup tables
    console.log('[3/4] Building lookup tables...');
    const lookup = {
        C: [...new Set(allData.map(r => r.institute))].sort(),
        P: [...new Set(allData.map(r => r.program))].sort(),
        Y: [...new Set(allData.map(r => r.year))].sort(),
        T: [...new Set(allData.map(r => r.category))].sort(),
        R: [...new Set(allData.map(r => r.round))].sort(),
        S: [...new Set(allData.map(r => r.seat_type))].sort()
    };

    console.log(`   Colleges: ${lookup.C.length}`);
    console.log(`   Programs: ${lookup.P.length}`);
    console.log(`   Years: ${lookup.Y.length}`);
    console.log(`   Categories: ${lookup.T.length}`);
    console.log(`   Rounds: ${lookup.R.length}`);
    console.log(`   Seat Types: ${lookup.S.length}\n`);

    // 3. Build columnar arrays
    console.log('[4/4] Building columnar arrays...');
    const data = {
        c: [] as number[],  // College indices
        p: [] as number[],  // Program indices
        y: [] as number[],  // Year indices
        t: [] as number[],  // Category indices
        r: [] as number[],  // Round indices
        s: [] as number[],  // Seat type indices
        o: [] as number[],  // Opening ranks
        k: [] as number[]   // Closing ranks (using 'k' to avoid conflict with 'c')
    };

    for (const row of allData) {
        data.c.push(lookup.C.indexOf(row.institute));
        data.p.push(lookup.P.indexOf(row.program));
        data.y.push(lookup.Y.indexOf(row.year));
        data.t.push(lookup.T.indexOf(row.category));
        data.r.push(lookup.R.indexOf(row.round));
        data.s.push(lookup.S.indexOf(row.seat_type));
        data.o.push(row.opening_rank);
        data.k.push(row.closing_rank);
    }

    console.log(`   >> Built ${data.c.length} columnar entries\n`);

    // 4. Write to public directory
    const output = { lookup, data };
    const outputPath = 'public/cutoffs-data.json';

    fs.writeFileSync(outputPath, JSON.stringify(output));

    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    const estimatedGzip = Math.round(sizeKB * 0.6);
    const estimatedBrotli = Math.round(sizeKB * 0.4);

    console.log('[SUCCESS] File written:');
    console.log(`   Path: ${outputPath}`);
    console.log(`   Size (uncompressed): ${sizeKB} KB`);
    console.log(`   Estimated gzipped: ~${estimatedGzip} KB`);
    console.log(`   Estimated Brotli: ~${estimatedBrotli} KB`);
    console.log(`\nBuild complete!\n`);
}

buildFlatColumnar().catch(console.error);
