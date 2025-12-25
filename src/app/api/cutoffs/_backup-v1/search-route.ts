import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import path from 'path';
import fs from 'fs/promises';

const CACHE_TTL = 900000; // 15 minutes (match predictor)

let memoryCache: {
    data: RankEntry[] | null;
    timestamp: number;
} = { data: null, timestamp: 0 };

type RankEntry = {
    "Sr.No": string;
    Round: string;
    Institute: string;
    Program: string;
    Stream: string;
    Quota: string;
    Category: string;
    "Opening Rank": string;
    "Closing Rank": string;
    Year: number;
    "Seat Type": string;
};

async function getMasterData(): Promise<RankEntry[]> {
    const now = Date.now();

    // 1. Memory cache
    if (memoryCache.data && (now - memoryCache.timestamp < CACHE_TTL)) {
        console.log('✅ Cutoff cache HIT (memory)');
        return memoryCache.data;
    }

    // 2. Try Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });

            const cached = await redis.get<RankEntry[]>('wbjee:cutoff_data');
            if (cached) {
                console.log('✅ Cutoff cache HIT (Redis)');
                memoryCache = { data: cached, timestamp: now };
                return cached;
            }
        } catch (error) {
            console.error('Redis fetch failed:', error);
        }
    }

    // 3. Load from file
    console.log('❌ Cache MISS - loading from file');
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as RankEntry[];

    // Cache in memory
    memoryCache = { data, timestamp: now };

    // Cache in Redis (if available)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            await redis.set('wbjee:cutoff_data', data, { ex: 900 }); // 15 min
            console.log('💾 Cached cutoff data in Redis');
        } catch (error) {
            console.error('Redis set failed:', error);
        }
    }

    return data;
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const college = params.get('college') || '';
    const program = params.get('program') || '';
    const year = params.get('year') || '';
    const round = params.get('round') || '';
    const category = params.get('category') || '';
    const seatType = params.get('seat_type') || '';

    try {
        const allData = await getMasterData();

        // Filter server-side
        const result = allData.find(item =>
            item.Institute === college &&
            item.Program === program &&
            item.Year === parseInt(year) &&
            item.Round === round &&
            item.Category === category &&
            item["Seat Type"] === seatType
        );

        if (result) {
            return NextResponse.json({
                openingRank: parseInt(result["Opening Rank"]),
                closingRank: parseInt(result["Closing Rank"])
            });
        }

        return NextResponse.json({ error: 'No data found' }, { status: 404 });
    } catch (error) {
        console.error('Cutoff search error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
