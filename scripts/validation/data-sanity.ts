
import { Redis } from '@upstash/redis';
import zlib from 'zlib';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const gunzip = promisify(zlib.gunzip);

interface MasterDataRecord {
    year: number;
    opening_rank: number | null;
    closing_rank: number | null;
    institute: string;
    branch: string;
    category: string;
    quota: string;
    seat_type: string;
}

async function runDataSanity() {
    console.log('🧪 Starting Data Sanity Check (Production/Redis Data)...\n');

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        console.error('❌ Redis credentials missing. Please check .env.local');
        process.exit(1);
    }

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    try {
        const base64Data = await redis.get<string>('wbjee:master_data');
        if (!base64Data) {
            console.error('❌ No data found in Redis (wbjee:master_data)');
            process.exit(1);
        }

        const buffer = Buffer.from(base64Data, 'base64');
        const decompressed = await gunzip(buffer);
        const data = JSON.parse(decompressed.toString()) as MasterDataRecord[];

        console.log(`📊 Total Records found: ${data.length}`);

        let invertedRanks = 0;
        let missingRanks = 0;
        let yearCounts: Record<number, number> = {};

        data.forEach(item => {
            // Check Year
            yearCounts[item.year] = (yearCounts[item.year] || 0) + 1;

            // Check OR/CR logic
            if (item.opening_rank !== null && item.closing_rank !== null) {
                if (item.opening_rank > item.closing_rank) {
                    invertedRanks++;
                }
            } else {
                missingRanks++;
            }
        });

        console.log('\n--- 📈 Data Distribution ---');
        Object.entries(yearCounts).sort().forEach(([year, count]) => {
            console.log(`${year}: ${count} records`);
        });

        console.log('\n--- 🛠️ Integrity Checks ---');
        if (invertedRanks === 0) {
            console.log('✅ No inverted ranks found (OR <= CR for all records).');
        } else {
            console.warn(`⚠️ Found ${invertedRanks} records with OR > CR! These will show as "Invalid Data" in predictor.`);
        }

        if (missingRanks === 0) {
            console.log('✅ All records have both OR and CR.');
        } else {
            console.warn(`⚠️ Found ${missingRanks} records with missing rank data.`);
        }

        const has2024 = yearCounts[2024] > 0;
        if (has2024) {
            console.log('✅ 2024 data is present and loaded.');
        } else {
            console.error('❌ 2024 data is MISSING from Redis!');
        }

    } catch (error) {
        console.error('Error during data sanity check:', error);
    }
}

runDataSanity();
