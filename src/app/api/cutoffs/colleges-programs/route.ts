import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/cutoffs/colleges-programs
 * Returns list of colleges and their programs
 */
export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'colleges-programs.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (error) {
        console.error('Error loading colleges-programs:', error);
        return NextResponse.json(
            { error: 'Failed to load data' },
            { status: 500 }
        );
    }
}
