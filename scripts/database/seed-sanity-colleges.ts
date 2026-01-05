
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Types
interface SanityCollege {
    _id?: string;
    _type: 'college';
    name: string;
    slug: { _type: 'slug'; current: string };
    isVisible: boolean;
    cutoffIdentifier: string;
    location: string;
    type: 'Government' | 'Private';
}

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function seedColleges() {
    console.log('🏛️  Starting Sanity College Sync...');

    // 1. Init Clients
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY;
    const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-11-21';
    // We need a write token for Sanity
    const sanityToken = process.env.SANITY_API_TOKEN;

    if (!supabaseUrl || !supabaseKey || !sanityProjectId || !sanityDataset || !sanityToken) {
        console.error('❌ Missing environment variables.');
        console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN');
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

    // 2. Fetch unique institutes from Supabase
    console.log('📥 Fetching unique institutes from Supabase...');

    // We fetch all distinct institutes
    // Supabase .select with distinct is tricky, so we'll fetch 'institute' column and uniquify in JS
    // For 17k records, this is cheap enough.

    const { data: allRows, error } = await supabase
        .from('cutoffs')
        .select('institute');

    if (error) {
        console.error('❌ Supabase error:', error);
        process.exit(1);
    }

    if (!allRows || allRows.length === 0) {
        console.error('❌ No data found in Supabase.');
        process.exit(1);
    }

    const uniqueInstitutes = Array.from(new Set(allRows.map(r => r.institute || '').filter(Boolean))).sort();
    console.log(`📊 Found ${uniqueInstitutes.length} unique institutes`);

    // 3. Sync with Sanity
    let created = 0;
    let skipped = 0;

    for (const instituteName of uniqueInstitutes) {
        // Check if exists
        // We use a query to check existence by name
        const query = `*[_type == "college" && name == $name][0]`;
        const existing = await sanity.fetch(query, { name: instituteName });

        if (existing) {
            skipped++;
            process.stdout.write('.'); // Progress dot
            continue;
        }

        // Determine Type (Heuristic)
        const isGov = /govt|government|university|jadavpur/i.test(instituteName);
        const type = isGov ? 'Government' : 'Private';

        const doc: SanityCollege = {
            _type: 'college',
            name: instituteName,
            isVisible: false, // Default to hidden, review manually
            cutoffIdentifier: instituteName, // Used for linking
            slug: {
                _type: 'slug',
                current: slugify(instituteName)
            },
            location: 'West Bengal', // Default
            type: type
        };

        try {
            await sanity.create(doc);
            created++;
            console.log(`\n✨ Created: ${instituteName}`);
        } catch (err) {
            console.error(`\n❌ Failed to create ${instituteName}:`, err);
        }
    }

    console.log('\n\n✅ Sync Complete!');
    console.log(`   Existing: ${skipped}`);
    console.log(`   Created:  ${created}`);
}

seedColleges().catch(console.error);
