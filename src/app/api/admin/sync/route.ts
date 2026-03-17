
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SyncEngine, SyncProgress, RawCutoffRow } from '@/utils/database/sync-engine';
import { toTitleCase } from '@/utils/normalize-text';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes (requires Pro plan on Vercel, but works for most local/self-hosted)

export async function POST(req: NextRequest) {
    try {
        const payload = await getPayload({ config });
        
        // 1. Auth Check
        const { user } = await payload.auth(req);
        if (!user || user.collection !== 'users') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const action = formData.get('action') as string || 'full';

        if (!file && action === 'full') {
            return NextResponse.json({ error: 'CSV file required for full sync' }, { status: 400 });
        }

        const engine = new SyncEngine(payload);
        const logs: string[] = [];
        
        const track = (p: SyncProgress) => {
            logs.push(`[${p.step.toUpperCase()}] ${p.message} (${p.percentage}%)`);
            console.log(`Sync Progress: ${p.message}`);
        };

        // --- STEP 1: IMPORT CSV ---
        if (action === 'full' || action === 'import') {
            const buffer = Buffer.from(await file.arrayBuffer());
            const csvContent = buffer.toString('utf-8');
            
            // Minimal CSV parser
            const lines = csvContent.split(/\r?\n/);
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            
            const rows = lines.slice(1).filter(l => l.trim()).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const obj: Record<string, string> = {};
                headers.forEach((h, i) => obj[h] = values[i]);
                return obj;
            });

            const transformed: RawCutoffRow[] = rows.map(row => ({
                institute: toTitleCase(row.Institute),
                program: toTitleCase(row.Program),
                stream: toTitleCase(row.Stream),
                quota: row.Quota,
                category: row.Category,
                seat_type: row['Seat Type'],
                round: row.Round,
                year: parseInt(row.Year),
                opening_rank: Math.round(parseFloat(row['Opening Rank'])),
                closing_rank: Math.round(parseFloat(row['Closing Rank'])),
                sr_no: parseInt(row['Sr.No'])
            }));

            await engine.importCsvToSupabase(transformed, track);
        }

        // --- STEP 2: SYNC TO CMS ---
        if (action === 'full' || action === 'cms') {
            await engine.syncToPayloadCMS(track);
        }

        // --- STEP 3: SYNC TO REDIS ---
        if (action === 'full' || action === 'redis') {
            await engine.syncToRedis(track);
        }

        // --- STEP 4: GENERATE FINDER ASSETS ---
        if (action === 'full' || action === 'finder') {
            await engine.generatePublicAssets(track);
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Sync completed successfully',
            logs 
        });

    } catch (error: unknown) {
        console.error('Sync API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ 
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
}
