/**
 * Validate College Details
 * 
 * Generates comprehensive data quality report for college details.
 * Checks for missing data, orphaned records, and data inconsistencies.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
});

interface ValidationResult {
    category: string;
    item: string;
    issue: string;
    severity: 'Critical' | 'Warning' | 'Info';
}

async function validateCollegeDetails() {
    console.log('🔍 Validating College Details...\n');

    const results: ValidationResult[] = [];

    // Fetch all colleges and details
    const colleges = await sanity.fetch(`
        *[_type == "college"]{
            _id,
            name,
            detailsIdentifier,
            highlights,
            body,
            placements,
            feeStructure,
            estYear,
            lastSyncedAt
        }
    `);

    const details = await sanity.fetch(`
        *[_type == "collegeDetail"]{
            _id,
            name,
            highlights,
            about,
            placementStats,
            feesStats
        }
    `);

    console.log(`📊 Found ${colleges.length} colleges, ${details.length} detail records\n`);

    // 1. Colleges without detailsIdentifier
    const noReference = colleges.filter((c: any) => !c.detailsIdentifier);
    if (noReference.length > 0) {
        noReference.forEach((c: any) => {
            results.push({
                category: 'Missing Reference',
                item: c.name,
                issue: 'No collegeDetail reference set',
                severity: 'Warning'
            });
        });
    }

    // 2. Colleges with no highlights
    const noHighlights = colleges.filter((c: any) => !c.highlights || c.highlights.length === 0);
    if (noHighlights.length > 0) {
        noHighlights.forEach((c: any) => {
            results.push({
                category: 'Missing Data',
                item: c.name,
                issue: 'No highlights',
                severity: 'Critical'
            });
        });
    }

    // 3. Colleges with no about content
    const noAbout = colleges.filter((c: any) => !c.body || c.body.length === 0);
    if (noAbout.length > 0) {
        noAbout.forEach((c: any) => {
            results.push({
                category: 'Missing Data',
                item: c.name,
                issue: 'No about content',
                severity: 'Warning'
            });
        });
    }

    // 4. Colleges with no placements
    const noPlacements = colleges.filter((c: any) => !c.placements || !c.placements.rows || c.placements.rows.length <= 1);
    if (noPlacements.length > 0) {
        noPlacements.forEach((c: any) => {
            results.push({
                category: 'Missing Data',
                item: c.name,
                issue: 'No placement data',
                severity: 'Warning'
            });
        });
    }

    // 5. Colleges with no establishment year
    const noEstYear = colleges.filter((c: any) => !c.estYear);
    if (noEstYear.length > 0) {
        noEstYear.forEach((c: any) => {
            results.push({
                category: 'Missing Data',
                item: c.name,
                issue: 'No establishment year',
                severity: 'Info'
            });
        });
    }

    // 6. Colleges never synced
    const neverSynced = colleges.filter((c: any) => c.detailsIdentifier && !c.lastSyncedAt);
    if (neverSynced.length > 0) {
        neverSynced.forEach((c: any) => {
            results.push({
                category: 'Sync Status',
                item: c.name,
                issue: 'Has reference but never synced',
                severity: 'Warning'
            });
        });
    }

    // 7. Orphaned collegeDetail records (not linked to any college)
    const linkedDetailIds = new Set(
        colleges
            .filter((c: any) => c.detailsIdentifier?._ref)
            .map((c: any) => c.detailsIdentifier._ref)
    );

    const orphanedDetails = details.filter((d: any) => !linkedDetailIds.has(d._id));
    if (orphanedDetails.length > 0) {
        orphanedDetails.forEach((d: any) => {
            results.push({
                category: 'Orphaned Records',
                item: d.name,
                issue: 'CollegeDetail not linked to any college',
                severity: 'Info'
            });
        });
    }

    // 8. Details with missing highlights
    const detailsNoHighlights = details.filter((d: any) => !d.highlights || d.highlights.length === 0);
    if (detailsNoHighlights.length > 0) {
        detailsNoHighlights.forEach((d: any) => {
            results.push({
                category: 'Source Data Issues',
                item: d.name,
                issue: 'CollegeDetail has no highlights',
                severity: 'Critical'
            });
        });
    }

    // Generate CSV report
    const csvPath = path.join(process.cwd(), 'college-details-validation-report.csv');
    const csvContent = [
        'Category,Item,Issue,Severity',
        ...results.map(r => `"${r.category}","${r.item}","${r.issue}",${r.severity}`)
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);

    // Summary
    console.log('📋 Validation Summary:\n');
    console.log(`   Total Issues: ${results.length}`);
    console.log(`   Critical: ${results.filter(r => r.severity === 'Critical').length}`);
    console.log(`   Warning: ${results.filter(r => r.severity === 'Warning').length}`);
    console.log(`   Info: ${results.filter(r => r.severity === 'Info').length}`);
    console.log(`\n✅ Report saved to: ${csvPath}`);

    // Group by category
    const grouped = results.reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r);
        return acc;
    }, {} as Record<string, ValidationResult[]>);

    console.log('\n📊 Issues by Category:\n');
    Object.entries(grouped).forEach(([category, issues]) => {
        console.log(`   ${category}: ${issues.length}`);
    });
}

validateCollegeDetails().catch(console.error);
