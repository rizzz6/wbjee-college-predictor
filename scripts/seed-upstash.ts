import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

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
    console.log('🌱 Seeding Upstash Redis with Blob Strategy...');

    // Validate environment variables
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error('❌ Missing Upstash credentials!');
        process.exit(1);
    }

    // Initialize Redis
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Read data
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const rawData = JSON.parse(raw);

    // Transform data
    const data: CollegeData[] = rawData.map((item: Record<string, unknown>) => ({
        id: `${item["Institute"]}-${item["Program"]}-${item["Category"]}-${item["Round"]}-${item["Year"]}-${item["Quota"]}-${item["Seat Type"]}`,
        round: item["Round"] as string || '',
        institute: item["Institute"] as string || '',
        branch: item["Program"] as string || '',
        seat_type: item["Seat Type"] as string || '',
        quota: item["Quota"] as string || '',
        category: item["Category"] as string || '',
        opening_rank: item["Opening Rank"] ? parseInt(String(item["Opening Rank"])) : null,
        closing_rank: item["Closing Rank"] ? parseInt(String(item["Closing Rank"])) : null,
        year: item["Year"] ? parseInt(String(item["Year"])) : null,
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
