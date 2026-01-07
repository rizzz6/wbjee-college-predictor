/**
 * List Sanity Colleges
 * Shows all colleges currently in Sanity CMS
 */

import { createClient as createSanityClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function listSanityColleges() {
    console.log('📊 Fetching colleges from Sanity CMS...\n');

    const sanity = createSanityClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
        useCdn: false,
        apiVersion: '2024-01-01',
        token: process.env.SANITY_API_TOKEN!,
    });

    try {
        const colleges = await sanity.fetch(`*[_type == "college"] | order(name asc) { _id, name, slug }`);

        console.log(`Total colleges: ${colleges.length}\n`);
        console.log('College Names:');
        console.log('='.repeat(80));

        colleges.forEach((college: { name: string }, index: number) => {
            console.log(`${(index + 1).toString().padStart(3)}. ${college.name}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log(`\nTotal: ${colleges.length} colleges in Sanity\n`);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

listSanityColleges().catch(console.error);
