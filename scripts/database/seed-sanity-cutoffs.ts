
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Types
interface CutoffItem {
    _key: string;
    year: number;
    program: string;
    quota: string;
    category: string;
    seatType: string;
    round: string;
    openingRank: number;
    closingRank: number;
}

interface CollegeCutoffDoc {
    _type: 'collegeCutoff';
    institute: string;
    cutoffs: CutoffItem[];
}

async function seedCutoffs() {
    console.log('📊 Starting Sanity Cutoff Sync (Grouped)...');

    // 1. Init Clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-21';
    const sanityToken = process.env.SANITY_API_TOKEN;

    if (!supabaseUrl || !supabaseKey || !sanityProjectId || !sanityDataset || !sanityToken) {
        console.error('❌ Missing environment variables.');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const sanity = createSanityClient({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        useCdn: false,
        apiVersion: sanityApiVersion,
        token: sanityToken,
    });


    console.log('✅ Clients initialized');

    // 2. Fetch ALL data from Supabase with pagination
    console.log('📥 Fetching all cutoffs from Supabase...');

    let allRows: {
        institute: string;
        year: number;
        program: string;
        quota: string;
        category: string;
        seat_type: string;
        round: string;
        opening_rank: number;
        closing_rank: number;
    }[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('*')
            .range(from, from + batchSize - 1);

        if (error) {
            console.error('❌ Supabase error:', error);
            process.exit(1);
        }

        if (data && data.length > 0) {
            allRows = allRows.concat(data);
            from += batchSize;
            hasMore = data.length === batchSize;
        } else {
            hasMore = false;
        }
    }

    if (!allRows || allRows.length === 0) {
        console.error('❌ No data found in Supabase.');
        process.exit(1);
    }

    console.log(`📊 Fetched ${allRows.length} rows. Grouping by institute...`);

    // 3. Group by Institute
    const grouped: Record<string, CutoffItem[]> = {};

    for (const row of allRows) {
        const inst = row.institute;
        if (!grouped[inst]) grouped[inst] = [];

        grouped[inst].push({
            _key: crypto.randomUUID(), // Sanity arrays need keys
            year: row.year,
            program: row.program,
            quota: row.quota,
            category: row.category,
            seatType: row.seat_type,
            round: row.round,
            openingRank: row.opening_rank,
            closingRank: row.closing_rank
        });
    }

    const institutes = Object.keys(grouped);
    console.log(`🧩 Found ${institutes.length} institutes to sync.`);

    // 4. Delete ALL existing cutoff documents (Clean slate)
    console.log('🗑️  Deleting all existing collegeCutoff documents...');
    try {
        await sanity.delete({ query: '*[_type == "collegeCutoff"]' });
        console.log('✅ Deleted all old cutoff documents\n');
    } catch (err) {
        console.error('❌ Failed to delete old documents:', err);
        process.exit(1);
    }

    // 5. Create new cutoff documents
    let created = 0;
    let errors = 0;

    for (const [index, inst] of institutes.entries()) {
        const cutoffs = grouped[inst];
        process.stdout.write(`\r   Creating ${index + 1}/${institutes.length}: ${inst.substring(0, 30)}...`);

        try {
            const doc: CollegeCutoffDoc = {
                _type: 'collegeCutoff',
                institute: inst,
                cutoffs: cutoffs
            };
            await sanity.create(doc);
            created++;
        } catch (err) {
            console.error(`\n❌ Error creating ${inst}:`, err);
            errors++;
        }
    }

    console.log('\n\n✅ Sync Complete!');
    console.log(`   Created: ${created}`);
    console.log(`   Errors:  ${errors}`);
}


seedCutoffs().catch(console.error);
