/**
 * CSV to Supabase Migration Script
 * 
 * This script imports WBJEE cutoff data directly from CSV to Supabase
 * Eliminates the need for manual JSON conversion!
 * 
 * Usage:
 *   1. Export your Google Sheets as CSV (File → Download → CSV)
 *   2. Save as: public/cutoffs-import.csv
 *   3. Run: npm run import:csv
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface CSVRow {
    'Sr.No': string;
    'Round': string;
    'Institute': string;
    'Program': string;
    'Stream': string;
    'Quota': string;
    'Category': string;
    'Opening Rank': string;
    'Closing Rank': string;
    'Year': string;
    'Seat Type': string;
}

interface TransformedCutoff {
    institute: string;
    program: string;
    stream: string;
    quota: string;
    category: string;
    seat_type: string;
    round: string;
    year: number;
    opening_rank: number;
    closing_rank: number;
    sr_no: number;
}

function parseCSV(content: string): CSVRow[] {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle CSV with quoted values
        const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header] = cleanValues[index] || '';
        });

        rows.push(row as unknown as CSVRow);
    }

    return rows;
}

async function importFromCSV() {
    console.log('🚀 Starting CSV → Supabase Import...\n');

    // Validate environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('✅ Supabase client initialized\n');

    try {
        // Read CSV file
        const csvPath = path.join(process.cwd(), 'public', 'cutoffs-import.csv');

        if (!fs.existsSync(csvPath)) {
            console.error('❌ CSV file not found!');
            console.error(`   Expected location: ${csvPath}`);
            console.error('\n📝 Steps:');
            console.error('   1. Export your Google Sheets as CSV');
            console.error('   2. Save to: public/cutoffs-import.csv');
            console.error('   3. Run this script again\n');
            process.exit(1);
        }

        console.log(`📂 Reading CSV from: ${csvPath}`);
        const csvContent = fs.readFileSync(csvPath, 'utf8');

        // Parse CSV
        console.log('🔄 Parsing CSV...');
        const csvData = parseCSV(csvContent);
        console.log(`📊 Parsed ${csvData.length.toLocaleString()} rows\n`);

        // Transform data
        console.log('🔄 Transforming data...');
        const transformed: TransformedCutoff[] = csvData.map(row => ({
            institute: row.Institute,
            program: row.Program,
            stream: row.Stream,
            quota: row.Quota,
            category: row.Category,
            seat_type: row['Seat Type'],
            round: row.Round,
            year: parseInt(row.Year),
            opening_rank: Math.round(parseFloat(row['Opening Rank'])),
            closing_rank: Math.round(parseFloat(row['Closing Rank'])),
            sr_no: parseInt(row['Sr.No'])
        }));

        console.log('✅ Data transformation complete\n');

        // Check for existing data
        const { count: existingCount } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (existingCount && existingCount > 0) {
            console.log(`⚠️  Warning: ${existingCount.toLocaleString()} records already exist!`);
            console.log('   Run \`npm run clear:supabase\` first to avoid duplicates.\n');

            // Ask for confirmation (or auto-skip)
            console.log('🛑 Aborting to prevent duplicates.');
            console.log('   Clear old data first, then re-run this script.\n');
            return;
        }

        // Batch insert
        const BATCH_SIZE = 1000;
        let inserted = 0;
        const totalBatches = Math.ceil(transformed.length / BATCH_SIZE);

        console.log(`📦 Starting batch insert (${totalBatches} batches)...\n`);

        for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
            const batch = transformed.slice(i, i + BATCH_SIZE);
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1;

            process.stdout.write(`   Batch ${batchNumber}/${totalBatches}... `);

            const { error } = await supabase
                .from('cutoffs')
                .insert(batch);

            if (error) {
                console.error(`\n❌ Batch ${batchNumber} failed:`, error);
                throw error;
            }

            inserted += batch.length;
            const percentage = ((inserted / transformed.length) * 100).toFixed(1);
            console.log(`✅ (${inserted.toLocaleString()} / ${transformed.length.toLocaleString()} - ${percentage}%)`);
        }

        console.log('\n🎉 Import complete!');
        console.log(`   Total records inserted: ${inserted.toLocaleString()}\n`);

        // Verify
        console.log('🔍 Verifying...');
        const { count: finalCount } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        console.log(`✅ Verified: ${finalCount?.toLocaleString()} records in database`);

        if (finalCount === transformed.length) {
            console.log('✅ Count matches! Import successful.\n');
        }

        // Show sample
        console.log('📋 Sample records:');
        const { data: sample } = await supabase
            .from('cutoffs')
            .select('institute, program, year, opening_rank, closing_rank')
            .limit(3);

        if (sample) {
            console.table(sample);
        }

        console.log('\n✨ Next steps:');
        console.log('   1. Run: npm run build           # Rebuild all data files');
        console.log('   2. Run: npm run seed:upstash    # Update Redis cache\n');

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    }
}

importFromCSV().catch(console.error);
