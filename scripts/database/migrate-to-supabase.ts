/**
 * Migration Script: data.json → Supabase
 * 
 * This script migrates all cutoff data from the static JSON file
 * to the Supabase PostgreSQL database.
 * 
 * Usage:
 *   1. Ensure .env.local has SUPABASE_SECRET_KEY
 *   2. Run: tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface RawCutoff {
    "Sr.No": number;
    Round: string;
    Institute: string;
    Program: string;
    Stream: string;
    Quota: string;
    Category: string;
    "Opening Rank": number;
    "Closing Rank": number;
    Year: number;
    "Seat Type": string;
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

async function migrateData() {
    console.log('🚀 Starting Supabase Migration...\n');

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY');
        process.exit(1);
    }

    // Initialize Supabase client with SECRET key (has full access)
    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('✅ Supabase client initialized\n');

    try {
        // Read data.json
        const filePath = path.join(process.cwd(), 'public', 'data.json');
        console.log(`📂 Reading data from: ${filePath}`);

        const raw = await fs.readFile(filePath, 'utf8');
        const data: RawCutoff[] = JSON.parse(raw);

        console.log(`📊 Loaded ${data.length.toLocaleString()} records from data.json\n`);

        // Transform data to match schema
        console.log('🔄 Transforming data...');
        const transformed: TransformedCutoff[] = data.map(item => ({
            institute: item.Institute,
            program: item.Program,
            stream: item.Stream,
            quota: item.Quota,
            category: item.Category,
            seat_type: item["Seat Type"],
            round: item.Round,
            year: item.Year,
            // Convert to integers (some data has decimals like 66.1)
            opening_rank: Math.round(Number(item["Opening Rank"])),
            closing_rank: Math.round(Number(item["Closing Rank"])),
            sr_no: item["Sr.No"]
        }));

        console.log('✅ Data transformation complete\n');

        // Check if data already exists
        const { count: existingCount, error: countError } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Error checking existing data:', countError);
            throw countError;
        }

        if (existingCount && existingCount > 0) {
            console.log(`⚠️  Warning: ${existingCount} records already exist in the database.`);
            console.log('   This script will add duplicate data if you continue.\n');

            // In a real scenario, you'd prompt for confirmation here
            // For now, we'll skip if data exists
            console.log('🛑 Skipping migration to avoid duplicates.');
            console.log('   Delete existing data first if you want to re-migrate.\n');
            return;
        }

        // Batch insert (Supabase allows up to 1000 rows per insert)
        const BATCH_SIZE = 1000;
        let inserted = 0;
        const totalBatches = Math.ceil(transformed.length / BATCH_SIZE);

        console.log(`📦 Starting batch insert (${totalBatches} batches of ${BATCH_SIZE} rows)...\n`);

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

        console.log('\n🎉 Migration complete!');
        console.log(`   Total records inserted: ${inserted.toLocaleString()}\n`);

        // Verify migration
        console.log('🔍 Verifying migration...');
        const { count: finalCount, error: verifyError } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (verifyError) {
            console.error('❌ Verification error:', verifyError);
            throw verifyError;
        }

        console.log(`✅ Verified: ${finalCount?.toLocaleString()} records in database`);

        if (finalCount === transformed.length) {
            console.log('✅ Record count matches! Migration successful.\n');
        } else {
            console.warn(`⚠️  Warning: Count mismatch (expected ${transformed.length}, got ${finalCount})`);
        }

        // Sample query to show data
        console.log('📋 Sample records:');
        const { data: sampleData, error: sampleError } = await supabase
            .from('cutoffs')
            .select('institute, program, year, opening_rank, closing_rank')
            .limit(3);

        if (!sampleError && sampleData) {
            console.table(sampleData);
        }

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData().catch(console.error);
