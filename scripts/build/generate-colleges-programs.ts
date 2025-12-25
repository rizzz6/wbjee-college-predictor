import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateCollegesPrograms() {
    console.log('🔧 Generating colleges-programs.json...\n');

    // Fetch all unique college-program pairs with pagination
    let allData: Array<{ institute: string; program: string }> = [];
    let page = 0;
    const pageSize = 1000;

    while (true) {
        const { data, error } = await supabase
            .from('cutoffs')
            .select('institute, program')
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error('❌ Error fetching data:', error);
            process.exit(1);
        }

        if (!data || data.length === 0) break;

        allData = allData.concat(data);
        console.log(`   Fetched page ${page + 1}: ${data.length} records (total: ${allData.length})`);

        if (data.length < pageSize) break;
        page++;
    }

    // Group programs by college
    const lookup: Record<string, string[]> = {};

    allData.forEach(({ institute, program }) => {
        if (!lookup[institute]) {
            lookup[institute] = [];
        }
        if (!lookup[institute].includes(program)) {
            lookup[institute].push(program);
        }
    });

    // Sort colleges and programs
    const sorted: Record<string, string[]> = {};
    Object.keys(lookup).sort().forEach(college => {
        sorted[college] = lookup[college].sort();
    });

    // Write to public directory
    const outputPath = path.join(process.cwd(), 'public', 'colleges-programs.json');
    fs.writeFileSync(outputPath, JSON.stringify(sorted, null, 2));

    // Stats
    const colleges = Object.keys(sorted).length;
    const totalPrograms = Object.values(sorted).reduce((sum, progs) => sum + progs.length, 0);
    const fileSize = fs.statSync(outputPath).size;

    console.log('✅ Generated colleges-programs.json');
    console.log(`   Colleges: ${colleges}`);
    console.log(`   Programs: ${totalPrograms}`);
    console.log(`   Size: ${(fileSize / 1024).toFixed(2)} KB\n`);
}

generateCollegesPrograms().catch(console.error);
