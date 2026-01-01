import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { FETCH_BATCH_SIZE, TABLES } from '../build/config';

config({ path: '.env.local', quiet: true });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
);

interface CutoffRecord {
    institute: string;
    [key: string]: unknown;
}

async function analyzeDistribution() {
    console.log('📥 Fetching data from Supabase...');

    // Fetch data from Supabase
    let data: CutoffRecord[] = [];
    let from = 0;

    while (true) {
        const { data: chunk, error } = await supabase
            .from(TABLES.CUTOFFS)
            .select('*')
            .range(from, from + FETCH_BATCH_SIZE - 1);

        if (error) {
            console.error('❌ Error fetching data:', error);
            process.exit(1);
        }

        if (!chunk || chunk.length === 0) break;

        data = data.concat(chunk);
        process.stdout.write(`\r   Fetched ${data.length} records...`);
        from += FETCH_BATCH_SIZE;

        if (chunk.length < FETCH_BATCH_SIZE) break;
    }
    process.stdout.write('\n\n');

    // Group by institute
    const instituteMap: Record<string, CutoffRecord[]> = {};
    data.forEach(record => {
        if (!instituteMap[record.institute]) {
            instituteMap[record.institute] = [];
        }
        instituteMap[record.institute].push(record);
    });

    // Sort by record count
    const sorted = Object.entries(instituteMap)
        .map(([institute, records]) => ({
            institute,
            count: records.length,
            sizeKB: (JSON.stringify(records).length / 1024).toFixed(1)
        }))
        .sort((a, b) => b.count - a.count);

    console.log('\n📊 Institute Partition Analysis\n');
    console.log('Top 20 Largest Institutes:');
    console.log('─'.repeat(80));
    sorted.slice(0, 20).forEach((inst, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${inst.institute.padEnd(50)} ${inst.count.toString().padStart(4)} records  ${inst.sizeKB.padStart(6)} KB`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log(`\nTotal Statistics:`);
    console.log(`  Total Records: ${data.length}`);
    console.log(`  Total Institutes: ${sorted.length}`);
    console.log(`  Average Records per Institute: ${Math.round(data.length / sorted.length)}`);
    console.log(`  Largest Institute: ${sorted[0].institute} (${sorted[0].count} records, ${sorted[0].sizeKB} KB)`);
    console.log(`  Smallest Institute: ${sorted[sorted.length - 1].institute} (${sorted[sorted.length - 1].count} records)`);
    console.log(`\nSize Distribution:`);
    console.log(`  < 10KB: ${sorted.filter(i => parseFloat(i.sizeKB) < 10).length} institutes`);
    console.log(`  10-50KB: ${sorted.filter(i => parseFloat(i.sizeKB) >= 10 && parseFloat(i.sizeKB) < 50).length} institutes`);
    console.log(`  50-100KB: ${sorted.filter(i => parseFloat(i.sizeKB) >= 50 && parseFloat(i.sizeKB) < 100).length} institutes`);
    console.log(`  > 100KB: ${sorted.filter(i => parseFloat(i.sizeKB) >= 100).length} institutes`);
    console.log(`\nTotal Redis Storage: ${(sorted.reduce((sum, i) => sum + parseFloat(i.sizeKB), 0) / 1024).toFixed(2)} MB`);
}

analyzeDistribution().catch(console.error);
