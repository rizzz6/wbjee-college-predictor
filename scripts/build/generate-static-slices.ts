import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { encodeColumnarData, createSlug, type Cutoff } from '../../src/utils/compression/cutoff-decoder';
import { FETCH_BATCH_SIZE, TABLES } from './config';

config({ path: '.env.local', quiet: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface RawCutoff {
    institute: string;
    program: string;
    year: number;
    category: string;
    round: string;
    seat_type: string;
    opening_rank: number;
    closing_rank: number;
}

async function generateStaticSlices() {
    console.log('Generating static slices for mobile...\n');

    // Fetch all cutoff data with pagination
    let allData: RawCutoff[] = [];
    let page = 0;

    console.log('Fetching data from Supabase...');
    while (true) {
        const { data, error } = await supabase
            .from(TABLES.CUTOFFS)
            .select('institute, program, year, category, round, seat_type, opening_rank, closing_rank')
            .range(page * FETCH_BATCH_SIZE, (page + 1) * FETCH_BATCH_SIZE - 1);

        if (error) {
            console.error('\nError fetching data:', error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        allData = allData.concat(data as RawCutoff[]);
        process.stdout.write(`\r   Fetched ${allData.length} records...`);

        if (data.length < FETCH_BATCH_SIZE) break;
        page++;
    }
    process.stdout.write('\n');

    console.log(`\nFetched ${allData.length} total records\n`);

    // Group by college
    const collegeMap = new Map<string, Cutoff[]>();

    allData.forEach(row => {
        const cutoff: Cutoff = {
            college: row.institute,
            program: row.program,
            year: row.year,
            category: row.category,
            round: row.round,
            seatType: row.seat_type,
            opening: row.opening_rank,
            closing: row.closing_rank
        };

        if (!collegeMap.has(row.institute)) {
            collegeMap.set(row.institute, []);
        }
        collegeMap.get(row.institute)!.push(cutoff);
    });

    console.log(`Grouped into ${collegeMap.size} colleges\n`);

    // Create output directories
    const publicDir = path.join(process.cwd(), 'public');
    const dataDir = path.join(publicDir, 'data');
    const tempDataDir = path.join(publicDir, '.tmp-data');
    const tempCollegesDir = path.join(tempDataDir, 'colleges');
    const backupDataDir = path.join(publicDir, '.data-backup');

    // Ensure directories exist
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    // Clean up temp directories from previous failed builds
    if (fs.existsSync(tempDataDir)) {
        fs.rmSync(tempDataDir, { recursive: true, force: true });
    }
    if (fs.existsSync(backupDataDir)) {
        fs.rmSync(backupDataDir, { recursive: true, force: true });
    }

    // Create temp directories for staged write
    fs.mkdirSync(tempCollegesDir, { recursive: true });

    // Preserve unrelated files already living under public/data
    if (fs.existsSync(dataDir)) {
        const existingEntries = fs.readdirSync(dataDir, { withFileTypes: true });
        for (const entry of existingEntries) {
            if (entry.name === 'colleges' || entry.name === 'mobile-index.json') {
                continue;
            }

            const sourcePath = path.join(dataDir, entry.name);
            const destinationPath = path.join(tempDataDir, entry.name);
            fs.cpSync(sourcePath, destinationPath, { recursive: true });
        }
    }

    // Cleanup handler for interruptions
    const cleanup = () => {
        if (fs.existsSync(tempDataDir)) {
            console.log('\n\nCleaning up temporary files...');
            fs.rmSync(tempDataDir, { recursive: true, force: true });
        }

        if (fs.existsSync(backupDataDir)) {
            if (!fs.existsSync(dataDir)) {
                console.log('Restoring previous data directory...');
                fs.renameSync(backupDataDir, dataDir);
            } else {
                fs.rmSync(backupDataDir, { recursive: true, force: true });
            }
        }
    };

    // Register cleanup handlers
    process.on('SIGINT', () => {
        cleanup();
        process.exit(1);
    });
    process.on('SIGTERM', () => {
        cleanup();
        process.exit(1);
    });

    // Generate index and slices
    const colleges: string[] = [];
    const slugs: string[] = [];
    let totalSliceSize = 0;
    let minSize = Infinity;
    let maxSize = 0;

    console.log('Generating slices...');

    let count = 0;
    const total = collegeMap.size;

    try {
        for (const [college, cutoffs] of collegeMap.entries()) {
            const slug = createSlug(college);

            // Validate slug
            if (!slug || slug === 'undefined') {
                console.warn(`\nSkipping invalid slug for college: ${college}`);
                continue;
            }

            colleges.push(college);
            slugs.push(slug);

            // Encode without college column (since the file itself represents the college)
            const compressed = encodeColumnarData(cutoffs, false);

            // Write slice file to TEMP directory
            const slicePath = path.join(tempCollegesDir, `${slug}.json`);
            const sliceContent = JSON.stringify(compressed);
            fs.writeFileSync(slicePath, sliceContent);

            const fileSize = fs.statSync(slicePath).size;
            totalSliceSize += fileSize;
            minSize = Math.min(minSize, fileSize);
            maxSize = Math.max(maxSize, fileSize);

            count++;
            process.stdout.write(`\r   Generated ${count}/${total} slices...`);
        }
        process.stdout.write('\n');

        // Generate index file in staged data directory
        const index = { colleges, slugs };
        const indexPath = path.join(tempDataDir, 'mobile-index.json');
        fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

        const indexSize = fs.statSync(indexPath).size;

        // Validate all files before commit
        const files = fs.readdirSync(tempCollegesDir);
        const emptyFiles = files.filter(file => {
            const filePath = path.join(tempCollegesDir, file);
            return fs.statSync(filePath).size === 0;
        });
        const undefinedFiles = files.filter(file => file.includes('undefined'));

        if (emptyFiles.length > 0) {
            throw new Error(`Found ${emptyFiles.length} empty files: ${emptyFiles.join(', ')}`);
        }

        if (undefinedFiles.length > 0) {
            throw new Error(`Found ${undefinedFiles.length} undefined files: ${undefinedFiles.join(', ')}`);
        }

        // ATOMIC COMMIT: swap the staged data directory into place as one unit.
        console.log('\nCommitting files atomically...');
        if (fs.existsSync(dataDir)) {
            fs.renameSync(dataDir, backupDataDir);
        }
        fs.renameSync(tempDataDir, dataDir);
        if (fs.existsSync(backupDataDir)) {
            fs.rmSync(backupDataDir, { recursive: true, force: true });
        }

        console.log('\nStatistics:');
        console.log(`   Colleges: ${colleges.length}`);
        console.log(`   Index size: ${(indexSize / 1024).toFixed(2)} KB`);
        console.log(`   Slice sizes: ${(minSize / 1024).toFixed(2)} KB - ${(maxSize / 1024).toFixed(2)} KB`);
        console.log(`   Average slice: ${(totalSliceSize / colleges.length / 1024).toFixed(2)} KB`);
        console.log(`   Total slices: ${(totalSliceSize / 1024).toFixed(2)} KB`);

        console.log('\nStatic slices generated successfully!');
        console.log(`   Output: public/data/`);
        console.log(`   - mobile-index.json`);
        console.log(`   - colleges/*.json (${files.length} files)\n`);
    } catch (error) {
        console.error('\n\nError during slice generation:', error);
        cleanup();
        process.exit(1);
    }
}

generateStaticSlices().catch(console.error);

