/**
 * Google Sheets URL → Supabase Import Script
 * 
 * Fetches data directly from a published Google Sheet and imports to Supabase.
 * No manual CSV export needed!
 * 
 * Setup:
 *   1. In Google Sheets: File → Share → Publish to web
 *   2. Choose: "Comma-separated values (.csv)" format
 *   3. Copy the URL
 *   4. Add to .env.local: GOOGLE_SHEETS_EXPORT_URL=your_url
 *   5. Run: npm run import:sheets
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';
import { toTitleCase } from '../utils/normalize-text';

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

async function fetchFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client.get(url, (res) => {
            // Handle all redirect codes (301, 302, 307, 308, etc.)
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
                const redirectUrl = res.headers.location;
                if (redirectUrl) {
                    console.log(`   Following redirect (${res.statusCode})...`);
                    fetchFromURL(redirectUrl).then(resolve).catch(reject);
                    return;
                }
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }

            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);
    });
}

async function importFromSheetsURL() {
    console.log('🚀 Starting Google Sheets → Supabase Import...\n');

    // Validate environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    const sheetsUrl = process.env.GOOGLE_SHEETS_EXPORT_URL;

    if (!supabaseUrl || !supabaseSecretKey) {
        console.error('❌ Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    if (!sheetsUrl) {
        console.error('❌ Missing Google Sheets URL!');
        console.error('\n📝 Setup Instructions:');
        console.error('   1. Open your Google Sheet');
        console.error('   2. File → Share → Publish to web');
        console.error('   3. Select: "Comma-separated values (.csv)"');
        console.error('   4. Click "Publish" and copy the URL');
        console.error('   5. Add to .env.local:');
        console.error('      GOOGLE_SHEETS_EXPORT_URL=your_published_url\n');
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
        // Fetch CSV from Google Sheets
        console.log('📥 Fetching data from Google Sheets...');
        console.log(`   URL: ${sheetsUrl.substring(0, 60)}...`);

        const csvContent = await fetchFromURL(sheetsUrl);

        if (!csvContent || csvContent.length < 100) {
            throw new Error('Downloaded content is too short. Check your sheet URL.');
        }

        console.log(`✅ Downloaded ${(csvContent.length / 1024).toFixed(1)} KB\n`);

        // Parse CSV
        console.log('🔄 Parsing CSV...');
        const csvData = parseCSV(csvContent);
        console.log(`📊 Parsed ${csvData.length.toLocaleString()} rows\n`);

        // Validate data
        if (csvData.length === 0) {
            throw new Error('No data found. Check your Google Sheet.');
        }

        // Transform data
        console.log('🔄 Transforming and normalizing data...');
        const transformed: TransformedCutoff[] = csvData.map(row => ({
            institute: toTitleCase(row.Institute),
            program: toTitleCase(row.Program),
            stream: toTitleCase(row.Stream),
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

        // Deduplicate based on all fields (in case CSV has duplicate rows with different casing)
        console.log('🔍 Checking for duplicates after normalization...');
        const seen = new Set<string>();
        const deduplicated: TransformedCutoff[] = [];
        let duplicatesRemoved = 0;

        transformed.forEach(record => {
            const key = JSON.stringify({
                institute: record.institute,
                program: record.program,
                stream: record.stream,
                quota: record.quota,
                category: record.category,
                seat_type: record.seat_type,
                round: record.round,
                year: record.year
            });

            if (!seen.has(key)) {
                seen.add(key);
                deduplicated.push(record);
            } else {
                duplicatesRemoved++;
            }
        });

        if (duplicatesRemoved > 0) {
            console.log(`   Removed ${duplicatesRemoved} duplicate rows (same data, different casing in source)\n`);
        } else {
            console.log('   No duplicates found\n');
        }

        // Check for existing data
        const { count: existingCount } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (existingCount && existingCount > 0) {
            console.log(`⚠️  Warning: ${existingCount.toLocaleString()} records already exist!`);
            console.log('   Run \`npm run clear:supabase\` first to avoid duplicates.\n');

            console.log('🛑 Aborting to prevent duplicates.');
            console.log('   Clear old data first, then re-run this script.\n');
            return;
        }

        // Batch insert
        const BATCH_SIZE = 1000;
        let inserted = 0;
        const totalBatches = Math.ceil(deduplicated.length / BATCH_SIZE);

        console.log(`📦 Starting batch insert (${totalBatches} batches)...\n`);

        for (let i = 0; i < deduplicated.length; i += BATCH_SIZE) {
            const batch = deduplicated.slice(i, i + BATCH_SIZE);
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
            const percentage = ((inserted / deduplicated.length) * 100).toFixed(1);
            console.log(`✅ (${inserted.toLocaleString()} / ${deduplicated.length.toLocaleString()} - ${percentage}%)`);
        }

        console.log('\n🎉 Import complete!');
        console.log(`   Total records inserted: ${inserted.toLocaleString()}\n`);

        // Verify
        console.log('🔍 Verifying...');
        const { count: finalCount } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        console.log(`✅ Verified: ${finalCount?.toLocaleString()} records in database`);

        if (finalCount === deduplicated.length) {
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

        process.exit(0);


    } catch (error) {
        console.error('\n❌ Import failed:', error);

        if (error instanceof Error) {
            if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                console.error('\n💡 Troubleshooting:');
                console.error('   - Check your internet connection');
                console.error('   - Verify the Google Sheets URL is correct');
                console.error('   - Make sure the sheet is published to web\n');
            }
        }

        process.exit(1);
    }
}

importFromSheetsURL().catch(console.error);
