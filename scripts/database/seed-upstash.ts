import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { getPayload } from 'payload';

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
    console.log('🌱 Seeding Upstash Redis with Blob Strategy from Payload...');

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

    console.log('📥 Initializing Payload...');
    const { default: payloadConfig } = await import('../../payload.config');
    const payload = await getPayload({ config: payloadConfig });

    console.log('📥 Fetching data from Payload (college_cutoffs)...');
    
    // Fetch all documents. Since we only have ~138 college_cutoffs docs (each containing many cutoffs in an array),
    // this single query is fine without pagination.
    const { docs } = await payload.find({
        collection: 'college_cutoffs',
        limit: 1000,
        pagination: false,
    });

    const data: CollegeData[] = [];

    for (const doc of docs) {
        if (doc.cutoffs && Array.isArray(doc.cutoffs)) {
            for (const cutoff of doc.cutoffs) {
                data.push({
                    id: `${doc.institute}-${cutoff.program}-${cutoff.category}-${cutoff.round}-${cutoff.year}-${cutoff.quota}-${cutoff.seatType}`,
                    round: cutoff.round || '',
                    institute: doc.institute || '',
                    branch: cutoff.program || '',
                    seat_type: cutoff.seatType || '',
                    quota: cutoff.quota || '',
                    category: cutoff.category || '',
                    opening_rank: cutoff.openingRank || null,
                    closing_rank: cutoff.closingRank || null,
                    year: cutoff.year || null,
                    prediction: { text: '-', order: 6 }
                });
            }
        }
    }

    console.log(`📊 Total records: ${data.length}`);

    if (data.length === 0) {
        console.warn('⚠️ No data found in Payload! Aborting seed.');
        process.exit(0);
    }

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
