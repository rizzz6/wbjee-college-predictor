import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import zlib from 'zlib';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip);

// Initialize Redis client
const redis = Redis.fromEnv();

/**
 * GET /api/predictor/metadata
 * Returns filter metadata (unique institutes, branches, categories, etc.)
 * for instant filter display without needing to search first
 */
export async function GET() {
    try {
        // Try to get cached metadata
        const cachedMetadata = await redis.get('wbjee:metadata');

        if (cachedMetadata) {
            // Upstash Redis sometimes auto-parses JSON, check type
            if (typeof cachedMetadata === 'string') {
                return NextResponse.json(JSON.parse(cachedMetadata));
            } else {
                // Already an object
                return NextResponse.json(cachedMetadata);
            }
        }

        // If metadata doesn't exist, build it from master data
        const masterDataRaw = await redis.get('wbjee:master_data');

        if (!masterDataRaw) {
            return NextResponse.json(
                { error: 'Master data not available' },
                { status: 500 }
            );
        }

        // Handle gzip compression
        let masterData;
        if (typeof masterDataRaw === 'string' && masterDataRaw.startsWith('H4sI')) {
            // Decompress gzip data
            const buffer = Buffer.from(masterDataRaw, 'base64');
            const decompressed = await gunzip(buffer);
            masterData = JSON.parse(decompressed.toString('utf-8'));
        } else if (typeof masterDataRaw === 'string') {
            masterData = JSON.parse(masterDataRaw);
        } else {
            masterData = masterDataRaw;
        }

        interface MasterDataRecord {
            institute: string;
            branch: string;
            category: string;
            quota: string;
            seat_type: string;
            year: number;
            round: string;
        }

        const typedData = masterData as MasterDataRecord[];

        // Extract unique values for each filter field
        const metadata = {
            institutes: [...new Set(typedData.map(r => r.institute))].filter(Boolean).sort(),
            branches: [...new Set(typedData.map(r => r.branch))].filter(Boolean).sort(),
            categories: [...new Set(typedData.map(r => r.category))].filter(Boolean).sort(),
            quotas: [...new Set(typedData.map(r => r.quota))].filter(Boolean).sort(),
            seat_types: [...new Set(typedData.map(r => r.seat_type).filter(Boolean))].sort(),
            years: [...new Set(typedData.map(r => r.year).filter(Boolean))].sort(),
            rounds: [...new Set(typedData.map(r => r.round))].filter(Boolean).sort()
        };

        // Cache metadata for future requests (6-month TTL)
        await redis.set('wbjee:metadata', JSON.stringify(metadata), {
            ex: 15552000  // 6 months in seconds (180 days)
        });

        return NextResponse.json(metadata);

    } catch (error) {
        console.error('Error fetching metadata:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metadata' },
            { status: 500 }
        );
    }
}
