import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { encodeColumnarData, createSlug, type Cutoff } from '../../src/utils/compression/cutoff-decoder';

config({ path: '.env.local' });

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
    console.log('🔧 Generating static slices for mobile...\\n');

    // Fetch all cutoff data with pagination
    let allData: RawCutoff[] = [];
    let page = 0;
    const pageSize = 1000;

    console.log('📥 Fetching data from Supabase...');
    while (true) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('institute, program, year, category, round, seat_type, opening_rank, closing_rank')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('❌ Error fetching data:', error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        allData = allData.concat(data as RawCutoff[]);
        console.log(`   Page ${page + 1}: ${data.length} records (total: ${allData.length})`);

        if (data.length < pageSize) break;
        page++;
    }

    console.log(`\\n✅ Fetched ${allData.length} total records\\n`);

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

    console.log(`📊 Grouped into ${collegeMap.size} colleges\\n`);

    // Create output directory
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const collegesDir = path.join(dataDir, 'colleges');

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(collegesDir)) {
        fs.mkdirSync(collegesDir, { recursive: true });
    }

    // Generate index and slices
    const colleges: string[] = [];
    const slugs: string[] = [];
    let totalSliceSize = 0;
    let minSize = Infinity;
    let maxSize = 0;

    console.log('🔨 Generating slices...');

    for (const [college, cutoffs] of collegeMap.entries()) {
        const slug = createSlug(college);

        // Validate slug
        if (!slug || slug === 'undefined') {
            console.warn(`⚠️  Skipping invalid slug for college: ${college}`);
            continue;
        }

        colleges.push(college);
        slugs.push(slug);

        // Encode without college column (since the file itself represents the college)
        const compressed = encodeColumnarData(cutoffs, false);

        // Write slice file
        const slicePath = path.join(collegesDir, `${slug}.json`);
        const sliceContent = JSON.stringify(compressed);
        fs.writeFileSync(slicePath, sliceContent);

        const fileSize = fs.statSync(slicePath).size;
        totalSliceSize += fileSize;
        minSize = Math.min(minSize, fileSize);
        maxSize = Math.max(maxSize, fileSize);

        console.log(`   ✓ ${college} → ${slug}.json (${(fileSize / 1024).toFixed(2)} KB)`);
    }

    // Generate index file
    const index = { colleges, slugs };
    const indexPath = path.join(dataDir, 'mobile-index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

    const indexSize = fs.statSync(indexPath).size;

    // Ghost check: verify no empty or undefined files
    const files = fs.readdirSync(collegesDir);
    const emptyFiles = files.filter(file => {
        const filePath = path.join(collegesDir, file);
        return fs.statSync(filePath).size === 0;
    });
    const undefinedFiles = files.filter(file => file.includes('undefined'));

    console.log('\\n📈 Statistics:');
    console.log(`   Colleges: ${colleges.length}`);
    console.log(`   Index size: ${(indexSize / 1024).toFixed(2)} KB`);
    console.log(`   Slice sizes: ${(minSize / 1024).toFixed(2)} KB - ${(maxSize / 1024).toFixed(2)} KB`);
    console.log(`   Average slice: ${(totalSliceSize / colleges.length / 1024).toFixed(2)} KB`);
    console.log(`   Total slices: ${(totalSliceSize / 1024).toFixed(2)} KB`);

    if (emptyFiles.length > 0) {
        console.error(`\\n❌ Found ${emptyFiles.length} empty files:`, emptyFiles);
        process.exit(1);
    }

    if (undefinedFiles.length > 0) {
        console.error(`\\n❌ Found ${undefinedFiles.length} undefined files:`, undefinedFiles);
        process.exit(1);
    }

    console.log('\\n✅ Static slices generated successfully!');
    console.log(`   Output: public/data/`);
    console.log(`   - mobile-index.json`);
    console.log(`   - colleges/*.json (${colleges.length} files)\\n`);
}

generateStaticSlices().catch(console.error);
