import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { RawCutoffRow } from '../../src/utils/database/sync-engine';

// Promisify gzip
const gzip = promisify(zlib.gzip);

// Load .env.local explicitly
config({ path: path.join(process.cwd(), '.env.local') });

interface CollegeData {
    id: string;
    institute: string;
    branch: string;
    category: string;
    seat_type: string;
    quota: string;
    round: string;
    year: number | null;
    opening_rank: number | null;
    closing_rank: number | null;
    prediction: {
        text: string;
        order: number;
    };
}

async function seedUpstash() {
    console.log('🌱 Seeding Upstash Redis with Blob Strategy (from Raw Supabase Table)...');

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!supabaseUrl || !supabaseKey || !redisUrl || !redisToken) {
        console.error('❌ Missing credentials! Check your .env.local for Supabase and Upstash values.');
        process.exit(1);
    }

    // Initialize Clients
    const supabase = createClient(supabaseUrl, supabaseKey);
    const redis = new Redis({
        url: redisUrl,
        token: redisToken,
    });

    console.log('📥 Fetching all cutoff data from Supabase (raw "cutoffs" table)...');
    
    let allRows: RawCutoffRow[] = [];
    let from = 0;
    const BATCH_SIZE = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('institute, program, year, category, round, seat_type, quota, opening_rank, closing_rank')
            .range(from, from + BATCH_SIZE - 1);

        if (error) {
            console.error('❌ Supabase fetch failed:', error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;
        
        allRows = allRows.concat(data as RawCutoffRow[]);
        process.stdout.write(`\r   Fetched ${allRows.length} records...`);
        
        if (data.length < BATCH_SIZE) break;
        from += BATCH_SIZE;
    }

    process.stdout.write('\n');

    if (allRows.length === 0) {
        console.warn('⚠️ No data found in Supabase! Aborting seed.');
        process.exit(0);
    }

    // Transform raw Supabase rows to the format expected by the Predictor API
    const transformedData: CollegeData[] = allRows.map(row => ({
        id: `${row.institute}-${row.program}-${row.category}-${row.round}-${row.year}-${row.quota}-${row.seat_type}`,
        institute: row.institute || '',
        branch: row.program || '',
        category: row.category || '',
        seat_type: row.seat_type || '',
        quota: row.quota || '',
        round: row.round || '',
        year: row.year || null,
        opening_rank: row.opening_rank || null,
        closing_rank: row.closing_rank || null,
        prediction: { text: '-', order: 6 }
    }));

    // Compress data
    console.log(`🔄 Compressing ${transformedData.length} records (Gzip)...`);
    const jsonString = JSON.stringify(transformedData);
    const compressedBuffer = await gzip(jsonString);
    const base64Data = compressedBuffer.toString('base64');

    const originalSize = Buffer.byteLength(jsonString) / 1024 / 1024;
    const compressedSize = Buffer.byteLength(base64Data) / 1024 / 1024;

    console.log(`📉 Compression: ${originalSize.toFixed(2)} MB -> ${compressedSize.toFixed(2)} MB`);

    // Update Redis
    console.log('🗑️  Updating Redis keys...');
    const pipeline = redis.pipeline();
    pipeline.set('wbjee:master_data', base64Data);
    pipeline.set('wbjee:last_updated', new Date().toISOString());
    // Also store total record count for visibility
    pipeline.set('predictor:total-records', transformedData.length);

    await pipeline.exec();

    console.log('✅ Blob stored successfully in key: wbjee:master_data');
    process.exit(0);
}

seedUpstash().catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
