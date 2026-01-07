/**
 * Bulk Resync All Colleges
 * 
 * Re-syncs all colleges that have a detailsIdentifier reference.
 * Uses the same transformation logic as the component.
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

async function bulkResync() {
    console.log('🔄 Bulk Resync All Colleges...\n');

    // Fetch all colleges with references
    const colleges = await sanity.fetch(`
        *[_type == "college" && defined(detailsIdentifier._ref)]{
            _id,
            name,
            "detailRef": detailsIdentifier._ref
        }
    `);

    console.log(`Found ${colleges.length} colleges with detail references.\n`);

    let synced = 0;
    let errors = 0;

    for (const college of colleges) {
        try {
            // Fetch the linked collegeDetail
            const detailDoc = await sanity.fetch(`
                *[_id == $id][0]{
                    highlights,
                    about,
                    location,
                    type,
                    website,
                    seoDescription,
                    feesStats,
                    placementStats
                }
            `, { id: college.detailRef });

            if (!detailDoc) {
                console.log(`⚠️  Detail not found for ${college.name}`);
                errors++;
                continue;
            }

            // Transform placements
            const pStats = detailDoc.placementStats || {};
            const placementRows = [{ _key: 'head', cells: ['Metric', 'Value'] }];
            if (pStats.highestPackage) placementRows.push({ _key: 'hp', cells: ['Highest Package', String(pStats.highestPackage)] });
            if (pStats.averagePackage) placementRows.push({ _key: 'ap', cells: ['Average Package', String(pStats.averagePackage)] });
            if (pStats.topRecruiters && Array.isArray(pStats.topRecruiters)) {
                placementRows.push({ _key: 'tr', cells: ['Top Recruiters', pStats.topRecruiters.join(', ')] });
            }

            // Transform fees
            const fees = detailDoc.feesStats || {};
            const feeRows = [{ _key: 'head', cells: ['Fee Type', 'Amount'] }];
            if (fees.tuitionFee) feeRows.push({ _key: 'tf', cells: ['Tuition Fee', String(fees.tuitionFee)] });
            if (fees.totalCost) feeRows.push({ _key: 'tc', cells: ['Total Cost', String(fees.totalCost)] });
            if (fees.scholarships) feeRows.push({ _key: 'sc', cells: ['Scholarships', String(fees.scholarships)] });

            // Transform about
            const aboutObj = detailDoc.about || {};
            const aboutBlocks = [];
            if (aboutObj.para1) aboutBlocks.push({ _type: 'block', _key: 'p1', style: 'normal', children: [{ _type: 'span', text: aboutObj.para1 }] });
            if (aboutObj.para2) aboutBlocks.push({ _type: 'block', _key: 'p2', style: 'normal', children: [{ _type: 'span', text: aboutObj.para2 }] });
            if (aboutObj.para3) aboutBlocks.push({ _type: 'block', _key: 'p3', style: 'normal', children: [{ _type: 'span', text: aboutObj.para3 }] });
            if (aboutObj.para4) aboutBlocks.push({ _type: 'block', _key: 'p4', style: 'normal', children: [{ _type: 'span', text: aboutObj.para4 }] });

            // Extract establishment year
            const highlights = detailDoc.highlights || [];
            const estdHighlight = highlights.find((h: string) => h.toLowerCase().includes('estd'));
            const estYearMatch = estdHighlight?.match(/\d{4}/);
            const estYear = estYearMatch ? parseInt(estYearMatch[0]) : undefined;

            // Filter out estd from highlights (it goes to estYear field instead)
            const filteredHighlights = highlights.filter((h: string) => !h.toLowerCase().includes('estd'));

            // Patch college
            await sanity.patch(college._id).set({
                highlights: filteredHighlights,
                placements: { rows: placementRows },
                feeStructure: { rows: feeRows },
                body: aboutBlocks,
                location: detailDoc.location || undefined,
                type: detailDoc.type === 'Govt' ? 'Government' : detailDoc.type === 'Pvt' ? 'Private' : detailDoc.type,
                website: detailDoc.website || undefined,
                description: detailDoc.seoDescription || undefined,
                estYear: estYear,
                lastSyncedAt: new Date().toISOString(),
            }).commit();

            synced++;
            process.stdout.write('.');
        } catch (err) {
            console.error(`\n❌ Error syncing ${college.name}:`, err);
            errors++;
        }
    }

    console.log(`\n\n✅ Bulk Resync Complete!`);
    console.log(`   Synced: ${synced}`);
    console.log(`   Errors: ${errors}`);
}

bulkResync().catch(console.error);
