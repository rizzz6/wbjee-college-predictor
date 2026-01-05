/**
 * Seed College Details (Structured Schema)
 * 
 * Uploads individual-college-details.json to collegeDetail documents.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
});

async function seedDetails() {
    console.log('🌱 Seeding College Details...\n');

    const jsonPath = path.join(process.cwd(), 'public/data/individual-college-details.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`📄 Loaded ${jsonData.length} records.\n`);

    let created = 0;
    let errors = 0;

    for (const item of jsonData) {
        const name = item.college_name;

        try {
            await sanity.createOrReplace({
                _id: 'detail-' + name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
                _type: 'collegeDetail',
                name: name,
                location: item.location || '',
                type: item.type || '',
                website: item.website || '',
                seoDescription: item.seo_desc || '',
                highlights: item.highlights || [],
                about: item.about || {},
                feesStats: item.fees_stats || {},
                placementStats: {
                    highestPackage: item.placement_stats?.highest_package || '',
                    averagePackage: item.placement_stats?.average_package || '',
                    nirfMedianSalary: item.placement_stats?.nirf_median_salary || '',
                    topRecruiters: item.placement_stats?.top_recruiters || [],
                    sourceReliability: item.placement_stats?.source_reliability || '',
                    dataSource: item.placement_stats?.data_source || '',
                }
            });
            created++;
            process.stdout.write('.');
        } catch (err) {
            console.error(`\n❌ Error creating ${name}:`, err);
            errors++;
        }
    }

    console.log(`\n\n✅ Seeded ${created} detail records.`);
    if (errors > 0) console.log(`⚠️  ${errors} errors.`);
}

seedDetails().catch(console.error);
