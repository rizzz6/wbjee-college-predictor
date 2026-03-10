import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { Redis } from '@upstash/redis';
import zlib from 'zlib';
import { promisify } from 'util';

// Switch to Node.js runtime to support zlib and persistent caching
export const runtime = 'nodejs';
// Increase max duration for decompression if needed (optional)
export const maxDuration = 10;

const gunzip = promisify(zlib.gunzip);

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
    prediction?: {
        text: string;
        order: number;
    };
}

// In-Memory Cache (Global variable persists across Lambda invocations)
let memoryCache: {
    data: CollegeData[] | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds

// Initialize Redis with environment validation
const getRedisClient = () => {
    try {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            logger.warn('[Filter API] Redis credentials not found in environment');
            return null;
        }
        return new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } catch (error) {
        logger.error('[Filter API] Failed to initialize Redis:', error);
        return null;
    }
};

const redis = getRedisClient();

/**
 * Calculate adaptive floor and ceiling multipliers based on rank tier
 */
function getAdaptiveMultipliers(rank: number): { min: number; max: number } {
    if (rank <= 5000) {
        return { min: 0.6, max: 1.4 };
    } else if (rank <= 15000) {
        return { min: 0.7, max: 1.3 };
    } else if (rank <= 30000) {
        return { min: 0.8, max: 1.2 };
    } else if (rank <= 50000) {
        return { min: 0.85, max: 1.15 };
    } else {
        return { min: 0.9, max: 1.1 };
    }
}


async function getMasterData(): Promise<CollegeData[]> {
    const now = Date.now();

    // 1. Serve from Memory Cache if valid
    if (memoryCache.data && (now - memoryCache.timestamp < CACHE_TTL)) {
        return memoryCache.data;
    }

    // 2. Ensure Redis is available
    if (!redis) {
        logger.error('❌ Redis client not initialized');
        throw new Error('Database unavailable - Redis credentials missing');
    }

    logger.debug('🔄 Cache stale or empty. Fetching from Upstash...');

    try {
        // 3. Fetch Compressed Blob from Redis
        const base64Data = await redis.get<string>('wbjee:master_data');

        if (!base64Data) {
            logger.error('❌ No data found in Redis key: wbjee:master_data');
            throw new Error('Database not seeded - run seed-upstash script');
        }

        // 4. Decompress
        const buffer = Buffer.from(base64Data, 'base64');
        const decompressed = await gunzip(buffer);
        const data = JSON.parse(decompressed.toString()) as CollegeData[];

        // 5. Update Cache
        memoryCache = {
            data: data,
            timestamp: now
        };

        logger.debug(`✅ Data loaded from Redis. Records: ${data.length}`);
        return data;

    } catch (error) {
        logger.error('❌ Redis fetch failed:', error);
        throw new Error('Service temporarily unavailable');
    }
}


export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const rank = parseInt(searchParams.get('rank') || '0');

        if (!rank || rank <= 0) {
            return NextResponse.json({ error: 'Valid rank is required' }, { status: 400 });
        }

        // Parse filters
        const filters = {
            institutes: searchParams.getAll('institute'),
            branches: searchParams.getAll('branch'),
            categories: searchParams.getAll('category'),
            years: searchParams.getAll('year'),
            rounds: searchParams.getAll('round'),
            quotas: searchParams.getAll('quota'),
            seatTypes: searchParams.getAll('seat_type'),
        };

        // Get Master Data (Cached or Fresh)
        const allData = await getMasterData();

        // Calculate Adaptive Range
        const adaptive = getAdaptiveMultipliers(rank);
        const floor = Math.floor(rank * adaptive.min);
        const ceiling = Math.ceil(rank * adaptive.max);

        // Filter Data
        const filtered = allData.filter(item => {
            // Rank Filter
            if (!item.closing_rank || item.closing_rank < floor || item.closing_rank > ceiling) {
                return false;
            }
            // Category Filters
            if (filters.institutes.length > 0 && !filters.institutes.includes(item.institute)) return false;
            if (filters.branches.length > 0 && !filters.branches.includes(item.branch)) return false;
            // Note: Add other filters as needed, keeping it minimal for speed
            if (filters.categories.length > 0 && !filters.categories.includes(item.category)) return false;
            if (filters.years.length > 0 && !filters.years.includes(String(item.year))) return false;
            if (filters.rounds.length > 0 && !filters.rounds.includes(item.round)) return false;
            if (filters.quotas.length > 0 && !filters.quotas.includes(item.quota)) return false;
            if (filters.seatTypes.length > 0 && !filters.seatTypes.includes(item.seat_type)) return false;

            return true;
        });

        // Add Predictions & Limit Results (Pagination: Top 50)
        // Sort by how close closing_rank is to user rank (optional, but good for relevance)
        // For now, prediction logic + simple slice

        const withPredictions = filtered.slice(0, 100).map(item => {
            let prediction = { text: '-', order: 6 };

            // ===== DATA VALIDATION =====
            if (item.opening_rank === null || item.closing_rank === null || rank <= 0) {
                return { ...item, prediction };
            }

            // Handle inverted data (OR > CR) - treat as invalid
            if (item.opening_rank > item.closing_rank) {
                logger.warn(`Invalid data for ${item.institute} - ${item.branch}: OR (${item.opening_rank}) > CR (${item.closing_rank})`);
                return { ...item, prediction };
            }

            const gap = item.closing_rank - item.opening_rank;

            // ===== 1. CONFIRM: Better than best admitted student =====
            if (rank < item.opening_rank) {
                prediction = { text: 'Confirm', order: 1 };
                return { ...item, prediction };
            }

            // ===== EDGE CASE: Zero Gap (OR = CR) =====
            // If gap is 0, only "Confirm" (<OR) or "Borderline" (=OR) or "No Chance" (>OR) makes sense
            if (gap === 0) {
                if (rank === item.closing_rank) {
                    prediction = { text: 'Borderline', order: 4 };
                } else {
                    prediction = { text: 'No Chance', order: 5 };
                }
                return { ...item, prediction };
            }

            // ===== 2. GREAT: Top 30% of the admitted batch =====
            // Use gap-relative threshold, not absolute percentage of CR
            const greatThreshold = item.opening_rank + (gap * 0.30);
            if (rank <= greatThreshold) {
                prediction = { text: 'Great', order: 2 };
                return { ...item, prediction };
            }

            // ===== 3. GOOD: Within the admitted range (including exact match) =====
            // Use <= to include students at exactly the closing rank
            if (rank <= item.closing_rank) {
                prediction = { text: 'Good', order: 3 };
                return { ...item, prediction };
            }

            // ===== 4. BORDERLINE: Dynamic buffer with absolute cap =====
            // Problem: Percentage buffers create huge windows at high ranks
            // Solution: Use smaller of (percentage buffer OR absolute cap)

            let bufferPercent: number;
            let absoluteCap: number;

            if (item.closing_rank < 5000) {
                // Top-tier: 8% buffer, max 400 ranks
                bufferPercent = 0.08;
                absoluteCap = 400;
            } else if (item.closing_rank < 20000) {
                // Mid-tier: 12% buffer, max 2000 ranks
                bufferPercent = 0.12;
                absoluteCap = 2000;
            } else {
                // Lower-tier: 15% buffer, max 5000 ranks
                bufferPercent = 0.15;
                absoluteCap = 5000;
            }

            const percentageBuffer = item.closing_rank * bufferPercent;
            const actualBuffer = Math.min(percentageBuffer, absoluteCap);
            const borderlineThreshold = item.closing_rank + actualBuffer;

            if (rank <= borderlineThreshold) {
                prediction = { text: 'Borderline', order: 4 };
                return { ...item, prediction };
            }

            // ===== 5. NO CHANCE: Beyond borderline =====
            prediction = { text: 'No Chance', order: 5 };
            return { ...item, prediction };
        });

        return NextResponse.json({
            results: withPredictions,
            total: filtered.length, // Return total matches for UI
            metadata: {
                filterUsed: { floor, ceiling, min: adaptive.min, max: adaptive.max },
                rank,
                appliedFilters: Object.keys(filters).reduce((acc, key) => ({
                    ...acc, [key]: filters[key as keyof typeof filters].length
                }), {})
            }
        }, {
            headers: {
                // Browser cache: 5 minutes. serverless cache (if any): 10 minutes
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        logger.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
