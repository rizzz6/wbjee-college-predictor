import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import zlib from 'zlib';
import { promisify } from 'util';
import { getServerSupabase } from '@/utils/database/supabase';

// Switch to Node.js runtime for zlib support
export const runtime = 'nodejs';
export const maxDuration = 10;

const gunzip = promisify(zlib.gunzip);

// Initialize Redis
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

// ============================================
// FIELD MAPPER (Handles program/branch mismatch)
// ============================================
interface RedisRecord {
    id: string;
    institute: string;
    branch: string;        // ⚠️ Redis uses "branch"
    category: string;
    seat_type: string;
    quota: string;
    round: string;
    year: number | null;
    opening_rank: number | null;
    closing_rank: number | null;
}

interface SearchParams {
    college: string;
    program: string;       // ⚠️ Frontend sends "program"
    year: string;
    round: string;
    category: string;
    seatType: string;
}

/**
 * Field Mapper: Handles naming differences between frontend and Redis data
 */
function recordMatches(record: RedisRecord, params: SearchParams): boolean {
    return (
        record.institute === params.college &&
        record.branch === params.program &&      // ✅ Map program → branch
        record.year === parseInt(params.year) &&
        record.category === params.category &&
        record.round === params.round &&
        record.seat_type === params.seatType
    );
}

// ============================================
// IN-MEMORY CACHE (Addresses Cold Start)
// ============================================
let memoryCache: {
    data: RedisRecord[] | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Load data with multi-tier caching:
 * Tier 1: In-Memory Cache (fastest, ~1ms)
 * Tier 2: Redis Cache (~5ms + decompress ~10ms)
 * Tier 3: Supabase Fallback (~200ms)
 */
async function loadRecords(): Promise<RedisRecord[]> {
    // Tier 1: Check in-memory cache
    if (memoryCache.data && Date.now() - memoryCache.timestamp < CACHE_TTL) {
        console.log('✅ Memory cache HIT');
        return memoryCache.data;
    }

    // Tier 2: Check Redis
    if (redis) {
        try {
            const base64Data = await redis.get<string>('wbjee:master_data');

            if (base64Data) {
                console.log('✅ Redis cache HIT - decompressing...');
                const buffer = Buffer.from(base64Data, 'base64');
                const decompressed = await gunzip(buffer);
                const records = JSON.parse(decompressed.toString()) as RedisRecord[];

                // Store in memory cache
                memoryCache = {
                    data: records,
                    timestamp: Date.now()
                };

                console.log(`✅ Decompressed ${records.length} records into memory`);
                return records;
            }

            console.log('⚠️ Redis cache MISS - falling back to Supabase');
        } catch (redisError) {
            console.error('❌ Redis error:', redisError);
        }
    }

    // Tier 3: Fallback to Supabase
    console.log('⚠️ Falling back to Supabase (Redis unavailable or empty)');
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from('cutoffs')
        .select('*');

    if (error) {
        throw new Error(`Supabase error: ${error.message}`);
    }

    // Map Supabase fields to Redis format
    const records: RedisRecord[] = data.map(row => ({
        id: row.id.toString(),
        institute: row.institute,
        branch: row.program,    // ✅ Map program → branch
        category: row.category,
        seat_type: row.seat_type,
        quota: row.quota || '',
        round: row.round,
        year: row.year,
        opening_rank: row.opening_rank,
        closing_rank: row.closing_rank,
    }));

    // Cache in memory
    memoryCache = {
        data: records,
        timestamp: Date.now()
    };

    return records;
}

// ============================================
// SEARCH ENDPOINT
// ============================================
export async function GET(request: NextRequest) {
    const startTime = Date.now();
    const params = request.nextUrl.searchParams;

    const searchParams: SearchParams = {
        college: params.get('college') || '',
        program: params.get('program') || '',
        year: params.get('year') || '',
        round: params.get('round') || '',
        category: params.get('category') || '',
        seatType: params.get('seat_type') || '',
    };

    // Validate required params
    if (!searchParams.college || !searchParams.program || !searchParams.year ||
        !searchParams.round || !searchParams.category || !searchParams.seatType) {
        return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    try {
        // Load records (uses multi-tier caching)
        const allRecords = await loadRecords();

        // Find matching record using field mapper
        const result = allRecords.find(record => recordMatches(record, searchParams));

        const searchTime = Date.now() - startTime;

        if (!result) {
            console.log(`❌ No data found for: ${searchParams.college} - ${searchParams.program} (${searchTime}ms)`);
            return NextResponse.json(
                {
                    error: 'No data found for the selected criteria',
                    debug: {
                        college: searchParams.college,
                        program: searchParams.program,
                        year: searchParams.year,
                    }
                },
                { status: 404 }
            );
        }

        console.log(`✅ Search successful: ${searchParams.college} - ${searchParams.program} (${searchTime}ms)`);

        return NextResponse.json({
            openingRank: result.opening_rank,
            closingRank: result.closing_rank
        }, {
            headers: {
                'X-Source': memoryCache.data ? 'Memory-Cache' : 'Redis-MasterData',
                'X-Search-Time': `${searchTime}ms`,
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
            }
        });

    } catch (error) {
        console.error('❌ Search error:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
