/**
 * Comprehensive Data Quality Verification Script
 * 
 * Checks ALL data sources for:
 * - Duplicate entries
 * - Non-normalized names (case variations)
 * - Data consistency across platforms
 * 
 * Platforms checked:
 * - Supabase (PostgreSQL)
 * - Upstash Redis
 * - Sanity CMS
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { toTitleCase } from '../utils/normalize-text';

const gunzip = promisify(zlib.gunzip);

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface ValidationResult {
    platform: string;
    duplicates: number;
    nonNormalized: number;
    issues: string[];
}

async function verifySupabase(): Promise<ValidationResult> {
    console.log('\n📊 Checking Supabase...');

    const result: ValidationResult = {
        platform: 'Supabase',
        duplicates: 0,
        nonNormalized: 0,
        issues: []
    };

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!
        );

        // Fetch all records with pagination
        let allRecords: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase
                .from('cutoffs')
                .select('id, institute, program, year, category, quota, seat_type, round, opening_rank, closing_rank')
                .range(from, from + batchSize - 1);

            if (error) throw error;

            if (data && data.length > 0) {
                allRecords = allRecords.concat(data);
                from += batchSize;
                hasMore = data.length === batchSize;
            } else {
                hasMore = false;
            }
        }

        if (!allRecords || allRecords.length === 0) throw new Error('No data found');

        console.log(`   Total records: ${allRecords.length.toLocaleString()}`);

        // Check for exact duplicates
        const seen = new Set<string>();
        allRecords.forEach(record => {
            const key = JSON.stringify({
                institute: record.institute,
                program: record.program,
                year: record.year,
                category: record.category,
                quota: record.quota,
                seat_type: record.seat_type,
                round: record.round
            });

            if (seen.has(key)) {
                result.duplicates++;
                result.issues.push(`Duplicate: ${record.institute} - ${record.program} (${record.year})`);
            }
            seen.add(key);
        });

        // Check for non-normalized names
        const instituteIssues = new Set<string>();
        const programIssues = new Set<string>();

        allRecords.forEach(record => {
            const normalizedInstitute = toTitleCase(record.institute);
            const normalizedProgram = toTitleCase(record.program);

            if (record.institute !== normalizedInstitute) {
                instituteIssues.add(`"${record.institute}" should be "${normalizedInstitute}"`);
                result.nonNormalized++;
            }

            if (record.program !== normalizedProgram) {
                programIssues.add(`"${record.program}" should be "${normalizedProgram}"`);
                result.nonNormalized++;
            }
        });

        instituteIssues.forEach(issue => result.issues.push(`Institute: ${issue}`));
        programIssues.forEach(issue => result.issues.push(`Program: ${issue}`));

        console.log(`   ✅ Duplicates: ${result.duplicates}`);
        console.log(`   ✅ Non-normalized: ${result.nonNormalized}`);

    } catch (error) {
        console.error('   ❌ Error:', error);
        result.issues.push(`Error: ${error}`);
    }

    return result;
}

async function verifyUpstash(): Promise<ValidationResult> {
    console.log('\n📊 Checking Upstash Redis...');

    const result: ValidationResult = {
        platform: 'Upstash Redis',
        duplicates: 0,
        nonNormalized: 0,
        issues: []
    };

    try {
        const redis = Redis.fromEnv();

        // Fetch master data
        const masterDataRaw = await redis.get('wbjee:master_data');

        if (!masterDataRaw) {
            result.issues.push('No master data found in Redis');
            return result;
        }

        // Decompress if needed
        let masterData: any[];
        if (typeof masterDataRaw === 'string' && masterDataRaw.startsWith('H4sI')) {
            const buffer = Buffer.from(masterDataRaw, 'base64');
            const decompressed = await gunzip(buffer);
            masterData = JSON.parse(decompressed.toString('utf-8'));
        } else if (typeof masterDataRaw === 'string') {
            masterData = JSON.parse(masterDataRaw);
        } else {
            masterData = masterDataRaw as any[];
        }

        console.log(`   Total records: ${masterData.length.toLocaleString()}`);

        // Check for duplicates
        const seen = new Set<string>();
        masterData.forEach((record: any) => {
            const key = JSON.stringify({
                institute: record.institute,
                branch: record.branch,
                year: record.year,
                category: record.category,
                quota: record.quota,
                seat_type: record.seat_type,
                round: record.round
            });

            if (seen.has(key)) {
                result.duplicates++;
                result.issues.push(`Duplicate: ${record.institute} - ${record.branch} (${record.year})`);
            }
            seen.add(key);
        });

        // Check for non-normalized names
        const instituteIssues = new Set<string>();
        const branchIssues = new Set<string>();

        masterData.forEach((record: any) => {
            const normalizedInstitute = toTitleCase(record.institute);
            const normalizedBranch = toTitleCase(record.branch);

            if (record.institute !== normalizedInstitute) {
                instituteIssues.add(`"${record.institute}" should be "${normalizedInstitute}"`);
                result.nonNormalized++;
            }

            if (record.branch !== normalizedBranch) {
                branchIssues.add(`"${record.branch}" should be "${normalizedBranch}"`);
                result.nonNormalized++;
            }
        });

        instituteIssues.forEach(issue => result.issues.push(`Institute: ${issue}`));
        branchIssues.forEach(issue => result.issues.push(`Branch: ${issue}`));

        console.log(`   ✅ Duplicates: ${result.duplicates}`);
        console.log(`   ✅ Non-normalized: ${result.nonNormalized}`);

    } catch (error) {
        console.error('   ❌ Error:', error);
        result.issues.push(`Error: ${error}`);
    }

    return result;
}

async function verifySanity(): Promise<ValidationResult> {
    console.log('\n📊 Checking Sanity CMS...');

    const result: ValidationResult = {
        platform: 'Sanity CMS',
        duplicates: 0,
        nonNormalized: 0,
        issues: []
    };

    try {
        const sanity = createSanityClient({
            projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
            dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
            useCdn: false,
            apiVersion: '2024-01-01',
            token: process.env.SANITY_API_TOKEN
        });

        // Fetch all colleges
        const colleges = await sanity.fetch(`*[_type == "college"]{ name, slug }`);
        console.log(`   Total colleges: ${colleges.length}`);

        // Check for duplicate names
        const namesSeen = new Set<string>();
        colleges.forEach((college: any) => {
            if (namesSeen.has(college.name)) {
                result.duplicates++;
                result.issues.push(`Duplicate college: ${college.name}`);
            }
            namesSeen.add(college.name);
        });

        // Check for non-normalized names
        colleges.forEach((college: any) => {
            const normalized = toTitleCase(college.name);
            if (college.name !== normalized) {
                result.nonNormalized++;
                result.issues.push(`College: "${college.name}" should be "${normalized}"`);
            }
        });

        // Fetch all collegeCutoff documents
        const cutoffs = await sanity.fetch(`*[_type == "collegeCutoff"]{ institute }`);
        console.log(`   Total cutoff documents: ${cutoffs.length}`);

        // Check for duplicate institutes
        const institutesSeen = new Set<string>();
        cutoffs.forEach((cutoff: any) => {
            if (institutesSeen.has(cutoff.institute)) {
                result.duplicates++;
                result.issues.push(`Duplicate cutoff document: ${cutoff.institute}`);
            }
            institutesSeen.add(cutoff.institute);
        });

        // Check for non-normalized institutes
        cutoffs.forEach((cutoff: any) => {
            const normalized = toTitleCase(cutoff.institute);
            if (cutoff.institute !== normalized) {
                result.nonNormalized++;
                result.issues.push(`Cutoff institute: "${cutoff.institute}" should be "${normalized}"`);
            }
        });

        console.log(`   ✅ Duplicates: ${result.duplicates}`);
        console.log(`   ✅ Non-normalized: ${result.nonNormalized}`);

    } catch (error) {
        console.error('   ❌ Error:', error);
        result.issues.push(`Error: ${error}`);
    }

    return result;
}

async function runVerification() {
    console.log('🔍 Starting Comprehensive Data Quality Verification\n');
    console.log('='.repeat(60));

    const results: ValidationResult[] = [];

    // Check all platforms
    results.push(await verifySupabase());
    results.push(await verifyUpstash());
    results.push(await verifySanity());

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 SUMMARY\n');

    let totalDuplicates = 0;
    let totalNonNormalized = 0;
    let totalIssues = 0;

    results.forEach(result => {
        totalDuplicates += result.duplicates;
        totalNonNormalized += result.nonNormalized;
        totalIssues += result.issues.length;

        console.log(`${result.platform}:`);
        console.log(`   Duplicates: ${result.duplicates}`);
        console.log(`   Non-normalized: ${result.nonNormalized}`);
        console.log(`   Total issues: ${result.issues.length}\n`);
    });

    console.log('Overall:');
    console.log(`   Total duplicates: ${totalDuplicates}`);
    console.log(`   Total non-normalized: ${totalNonNormalized}`);
    console.log(`   Total issues: ${totalIssues}\n`);

    // Show detailed issues if any
    if (totalIssues > 0) {
        console.log('='.repeat(60));
        console.log('\n⚠️  DETAILED ISSUES\n');

        results.forEach(result => {
            if (result.issues.length > 0) {
                console.log(`\n${result.platform}:`);
                result.issues.slice(0, 10).forEach(issue => {
                    console.log(`   - ${issue}`);
                });
                if (result.issues.length > 10) {
                    console.log(`   ... and ${result.issues.length - 10} more issues`);
                }
            }
        });
    }

    // Exit code
    if (totalDuplicates > 0 || totalNonNormalized > 0) {
        console.log('\n❌ Verification FAILED - Issues found!\n');
        process.exit(1);
    } else {
        console.log('\n✅ Verification PASSED - All data is clean!\n');
        process.exit(0);
    }
}

runVerification().catch(console.error);
