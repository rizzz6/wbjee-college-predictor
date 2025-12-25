import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

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

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data.json');
        const raw = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(raw) as RankEntry[];

        // Extract unique values for filters
        const metadata = {
            colleges: [...new Set(data.map(d => d.Institute))].sort(),
            categories: [...new Set(data.map(d => d.Category))].sort(),
            years: [...new Set(data.map(d => d.Year))].sort((a, b) => b - a),
            rounds: [...new Set(data.map(d => d.Round))].sort(),
            seatTypes: [...new Set(data.map(d => d["Seat Type"]))].sort(),
        };

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Failed to load cutoff metadata:', error);
        return NextResponse.json({ error: 'Failed to load metadata' }, { status: 500 });
    }
}
