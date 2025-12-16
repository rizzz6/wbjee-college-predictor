/**
 * Manual Metadata Builder Script
 * 
 * Run this script to manually rebuild the metadata in Redis
 * Useful when:
 * - You upload new master data
 * - You want to refresh metadata without waiting for auto-build
 * - You want to pre-populate metadata before deployment
 * 
 * Usage:
 *   npm run build:metadata
 *   or
 *   npx tsx scripts/buildMetadata.ts
 */

import { config } from 'dotenv';
import { join } from 'path';
import { Redis } from '@upstash/redis';
import zlib from 'zlib';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip);

// Load environment variables from .env.local
config({ path: join(__dirname, '..', '.env.local') });

// Initialize Redis client
const redis = Redis.fromEnv();

interface CollegeData {
    institute: string;
    branch: string;
    category: string;
    quota: string;
    seat_type: string;
    year: number;
    round: string;
    [key: string]: string | number | null;
}

async function buildMetadata() {
    console.log('🚀 Starting metadata build...');

    try {
        // Fetch master data from Redis
        console.log('📦 Fetching master data from Redis...');
        const masterDataRaw = await redis.get('wbjee:master_data');

        if (!masterDataRaw) {
            console.error('❌ Error: wbjee:master_data not found in Redis');
            console.log('💡 Make sure you have uploaded the master data first');
            process.exit(1);
        }

        console.log('✅ Successfully fetched data from Redis');
        console.log(`📏 Data type: ${typeof masterDataRaw}`);

        // Parse data - handle gzip compression
        let masterData: CollegeData[];
        if (typeof masterDataRaw === 'string') {
            // Check if it's gzip compressed (base64 encoded)
            if (masterDataRaw.startsWith('H4sI')) {
                console.log('🗜️  Decompressing gzip data...');
                const buffer = Buffer.from(masterDataRaw, 'base64');
                const decompressed = await gunzip(buffer);
                masterData = JSON.parse(decompressed.toString('utf-8'));
                console.log('✅ Data decompressed successfully');
            } else {
                masterData = JSON.parse(masterDataRaw);
            }
        } else {
            masterData = masterDataRaw as CollegeData[];
        }

        console.log(`✅ Loaded ${masterData.length.toLocaleString()} records`);

        // Extract unique values for each filter field
        console.log('🔍 Extracting unique values...');

        const metadata = {
            institutes: [...new Set(masterData.map(r => r.institute))].filter(Boolean).sort(),
            branches: [...new Set(masterData.map(r => r.branch))].filter(Boolean).sort(),
            categories: [...new Set(masterData.map(r => r.category))].filter(Boolean).sort(),
            quotas: [...new Set(masterData.map(r => r.quota))].filter(Boolean).sort(),
            seat_types: [...new Set(masterData.map(r => r.seat_type))].filter(Boolean).sort(),
            years: [...new Set(masterData.map(r => r.year))].filter(Boolean).map(String).sort(),
            rounds: [...new Set(masterData.map(r => r.round))].filter(Boolean).sort()
        };

        // Display statistics
        console.log('\n📊 Metadata Statistics:');
        console.log(`   Institutes:  ${metadata.institutes.length}`);
        console.log(`   Branches:    ${metadata.branches.length}`);
        console.log(`   Categories:  ${metadata.categories.length}`);
        console.log(`   Quotas:      ${metadata.quotas.length}`);
        console.log(`   Seat Types:  ${metadata.seat_types.length}`);
        console.log(`   Years:       ${metadata.years.length}`);
        console.log(`   Rounds:      ${metadata.rounds.length}`);

        // Save to Redis
        console.log('\n💾 Saving metadata to Redis...');
        await redis.set('wbjee:metadata', JSON.stringify(metadata));

        console.log('✅ Metadata successfully saved to Redis key: wbjee:metadata');
        console.log('\n🎉 Build complete!');

        // Verify
        const verify = await redis.get('wbjee:metadata');
        if (verify) {
            console.log('✅ Verification: Metadata key exists in Redis');
        } else {
            console.log('⚠️  Warning: Could not verify metadata in Redis');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Error building metadata:');
        console.error(error);
        if (error instanceof Error) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

// Run the build
buildMetadata();
