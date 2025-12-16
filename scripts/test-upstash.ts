import { config } from 'dotenv';
import { Redis } from '@upstash/redis';
import path from 'path';

// Load .env.local
config({ path: path.join(process.cwd(), '.env.local') });

async function testUpstash() {
    console.log('🔍 Testing Upstash Redis connection...');

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    console.log('✅ Connected to Upstash');

    // Get the data
    const rawData = await redis.get('predictor:data');

    console.log('📊 Data type:', typeof rawData);
    console.log('📊 Is Array:', Array.isArray(rawData));
    console.log('📊 Is String:', typeof rawData === 'string');

    if (Array.isArray(rawData)) {
        console.log('✅ Data is an array with', rawData.length, 'items');
        console.log('First item:', JSON.stringify(rawData[0], null, 2));
    } else if (typeof rawData === 'string') {
        console.log('⚠️  Data is a string, first 200 chars:', rawData.substring(0, 200));
        try {
            const parsed = JSON.parse(rawData);
            console.log('✅ String parses to array with', parsed.length, 'items');
        } catch {
            console.log('❌ Failed to parse string as JSON');
        }
    } else {
        console.log('❌ Data is neither array nor string:', rawData);
    }
}

testUpstash().then(() => process.exit(0)).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
