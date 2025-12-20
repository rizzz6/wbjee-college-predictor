import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import path from 'path';
import fs from 'fs/promises';

const CACHE_TTL = 900000; // 15 minutes

let memoryCache: {
    data: any[] | null;
    timestamp: number;
} = { data: null, timestamp: 0 };

async function getMasterData() {
    const now = Date.now();

    // 1. Memory cache
    if (memoryCache.data && (now - memoryCache.timestamp < CACHE_TTL)) {
        return memoryCache.data;
    }

    // 2. Try Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });

            const cached = await redis.get('wbjee:cutoff_data');
            if (cached) {
                memoryCache = { data: cached as any[], timestamp: now };
                return cached;
            }
        } catch (error) {
            console.error('Redis fetch failed:', error);
        }
    }

    // 3. Load from file
    const filePath = path.join(process.cwd(), 'public', 'data.json');
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    memoryCache = { data, timestamp: now };

    // Cache in Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            await redis.set('wbjee:cutoff_data', data, { ex: 900 });
        } catch (error) {
            console.error('Redis set failed:', error);
        }
    }

    return data;
}

export async function GET(request: NextRequest) {
    const college = request.nextUrl.searchParams.get('college');

    if (!college) {
        return NextResponse.json({ error: 'College parameter required' }, { status: 400 });
    }

    try {
        const allData = await getMasterData();

        const programs = [...new Set(
            allData
                .filter((d: any) => d.Institute === college)
                .map((d: any) => d.Program)
        )].sort();

        return NextResponse.json({ programs });
    } catch (error) {
        console.error('Failed to load programs:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
