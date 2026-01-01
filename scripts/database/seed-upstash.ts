import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { FETCH_BATCH_SIZE, TABLES } from '../build/config';

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

interface SupabaseRow {
    institute: string;
    program: string;
    category: string;
    round: string;
    year: number;
    quota: string;
    seat_type: string;
    opening_rank: number;
    closing_rank: number;
}

async function seedUpstash() {
    console.log('🌱 Seeding Upstash Redis with Blob Strategy...');

    // Validate environment variables
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error('❌ Missing Upstash credentials!');
        process.exit(1);
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
        console.error('❌ Missing Supabase credentials!');
        process.exit(1);
    }

    // Initialize Redis
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Initialize Supabase
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    );

    // Fetch data from Supabase with pagination
    console.log('📥 Fetching data from Supabase...');
    let allData: SupabaseRow[] = [];
    let from = 0;

    while (true) {
        const { data: chunk, error } = await supabase
            .from(TABLES.CUTOFFS)
            .select('institute, program, category, round, year, quota, seat_type, opening_rank, closing_rank')
            .range(from, from + FETCH_BATCH_SIZE - 1);

        if (error) {
            console.error('❌ Supabase fetch error:', error);
            process.exit(1);
        }

        if (!chunk || chunk.length === 0) break;

        allData = allData.concat(chunk);
        process.stdout.write(`\r   Fetched ${allData.length} records...`);
        from += FETCH_BATCH_SIZE;

        if (chunk.length < FETCH_BATCH_SIZE) break;
    }
    process.stdout.write('\n');

    // Transform data to match CollegeData interface
    const data: CollegeData[] = allData.map((item) => ({
        id: `${item.institute}-${item.program}-${item.category}-${item.round}-${item.year}-${item.quota}-${item.seat_type}`,
        round: item.round || '',
        institute: item.institute || '',
        branch: item.program || '',
        seat_type: item.seat_type || '',
        quota: item.quota || '',
        category: item.category || '',
        opening_rank: item.opening_rank || null,
        closing_rank: item.closing_rank || null,
        year: item.year || null,
        prediction: { text: '-', order: 6 }
    }));

    console.log(`📊 Total records: ${data.length}`);

    // Compress data
    console.log('🔄 Compressing data (Gzip)...');
    const jsonString = JSON.stringify(data);
    const compressedBuffer = await gzip(jsonString);
    const base64Data = compressedBuffer.toString('base64');

    const originalSize = Buffer.byteLength(jsonString) / 1024 / 1024;
    const compressedSize = Buffer.byteLength(base64Data) / 1024 / 1024;

    console.log(`📉 Compression: ${originalSize.toFixed(2)} MB -> ${compressedSize.toFixed(2)} MB`);

    // Clean up old keys
    console.log('🗑️  Cleaning up old keys...');
    const pipeline = redis.pipeline();
    pipeline.del('predictor:data');
    pipeline.del('colleges:by-rank');
    pipeline.set('wbjee:master_data', base64Data);
    pipeline.set('wbjee:last_updated', new Date().toISOString());

    await pipeline.exec();

    console.log('✅ Blob stored in key: wbjee:master_data');
    process.exit(0);
}

seedUpstash().catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
