import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { getServerSupabase } from '@/utils/database/supabase';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

interface ProgramData {
    filters: {
        years: number[];
        categories: string[];
        rounds: string[];
        seatTypes: string[];
    };
    cutoffs: Array<{
        year: number;
        category: string;
        round: string;
        seatType: string;
        openingRank: number;
        closingRank: number;
    }>;
}

/**
 * GET /api/cutoffs/program-data?college=X&program=Y
 * Returns filters and all cutoffs for a specific program
 */
export async function GET(request: NextRequest) {
    const college = request.nextUrl.searchParams.get('college');
    const program = request.nextUrl.searchParams.get('program');

    if (!college || !program) {
        return NextResponse.json(
            { error: 'Missing college or program parameter' },
            { status: 400 }
        );
    }

    try {
        const cacheKey = `program:${college}:${program}`;

        // Try Redis cache first
        if (redis) {
            const cached = await redis.get<ProgramData>(cacheKey);
            if (cached) {
                console.log('✅ Redis cache HIT:', cacheKey);
                return NextResponse.json(cached, {
                    headers: {
                        'X-Cache': 'HIT',
                        'X-Source': 'Redis'
                    }
                });
            }
            console.log('❌ Redis cache MISS:', cacheKey);
        }

        // Fallback to Supabase
        const supabase = getServerSupabase();
        const { data, error } = await supabase
            .from('cutoffs')
            .select('year, category, round, seat_type, opening_rank, closing_rank')
            .eq('institute', college)
            .eq('program', program);

        if (error) throw error;

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: 'No data found for this program' },
                { status: 404 }
            );
        }

        // Build response
        const response: ProgramData = {
            filters: {
                years: [...new Set(data.map(d => d.year))].sort((a, b) => b - a),
                categories: [...new Set(data.map(d => d.category))].sort(),
                rounds: [...new Set(data.map(d => d.round))].sort(),
                seatTypes: [...new Set(data.map(d => d.seat_type))].sort()
            },
            cutoffs: data.map(d => ({
                year: d.year,
                category: d.category,
                round: d.round,
                seatType: d.seat_type,
                openingRank: d.opening_rank,
                closingRank: d.closing_rank
            }))
        };

        // Cache for 1 hour
        if (redis) {
            await redis.set(cacheKey, response, { ex: 3600 });
            console.log('💾 Cached in Redis:', cacheKey);
        }

        return NextResponse.json(response, {
            headers: {
                'X-Cache': 'MISS',
                'X-Source': 'Supabase'
            }
        });

    } catch (error) {
        console.error('Error fetching program data:', error);
        return NextResponse.json(
            { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
