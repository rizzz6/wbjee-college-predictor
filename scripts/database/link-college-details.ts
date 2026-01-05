/**
 * Link College Details
 * 
 * Sets detailsIdentifier reference for each college.
 * Does NOT pre-fill data - component handles that via auto-pull.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { COLLEGE_NAME_MAP } from './college-name-map';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
});

interface SanityDoc {
    _id: string;
    name: string;
}

async function linkDetails() {
    console.log('🔗 Linking Colleges to Details...\n');

    const colleges: SanityDoc[] = await sanity.fetch(`*[_type == "college"]{_id, name}`);
    const collegeMap = new Map<string, string>(colleges.map(c => [c.name, c._id]));
    console.log(`☁️  Found ${colleges.length} colleges.`);

    const details: SanityDoc[] = await sanity.fetch(`*[_type == "collegeDetail"]{_id, name}`);
    const detailMap = new Map<string, string>(details.map(d => [d.name, d._id]));
    console.log(`☁️  Found ${details.length} detail records.\n`);

    let linked = 0;
    let skipped = 0;

    for (const [jsonName, sanityName] of Object.entries(COLLEGE_NAME_MAP)) {
        const collegeId = collegeMap.get(sanityName);
        const detailId = detailMap.get(jsonName);

        if (!collegeId) {
            console.log(`⚠️  College not found: "${sanityName}"`);
            skipped++;
            continue;
        }
        if (!detailId) {
            console.log(`⚠️  Detail not found: "${jsonName}"`);
            skipped++;
            continue;
        }

        try {
            await sanity.patch(collegeId).set({
                detailsIdentifier: { _type: 'reference', _ref: detailId },
            }).commit();

            process.stdout.write('.');
            linked++;
        } catch (err) {
            console.error(`\n❌ Error linking ${sanityName}:`, err);
        }
    }

    console.log(`\n\n✅ Linked ${linked} colleges.`);
    if (skipped > 0) console.log(`⚠️  Skipped ${skipped}.`);
}

linkDetails().catch(console.error);
