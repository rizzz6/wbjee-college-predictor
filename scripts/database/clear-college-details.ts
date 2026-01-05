/**
 * Clear College Details Fields
 * 
 * Clears highlights, placements, and body from all college documents.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
});

async function clearFields() {
    console.log('🗑️  Clearing pre-filled college details...\n');

    const colleges = await sanity.fetch(`*[_type == "college"]{_id, name}`);
    console.log(`Found ${colleges.length} colleges.`);

    let cleared = 0;
    for (const college of colleges) {
        try {
            await sanity.patch(college._id).unset(['highlights', 'placements', 'body']).commit();
            cleared++;
            process.stdout.write('.');
        } catch (err) {
            console.error(`\n❌ Error clearing ${college.name}:`, err);
        }
    }

    console.log(`\n\n✅ Cleared ${cleared} colleges.`);
}

clearFields().catch(console.error);
