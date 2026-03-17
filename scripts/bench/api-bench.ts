import dotenv from 'dotenv';
import path from 'path';
import { fetch } from 'undici';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const ENDPOINT = `${BASE_URL}/api/predictor/filter`;

interface BenchResult {
    rank: number;
    duration: number;
    status: number;
    resultsCount: number;
}

const TEST_RANKS = [1000, 5000, 15000, 35000, 55000];
const ITERATIONS_PER_RANK = 5;

interface PredictorApiResponse {
    results?: unknown[];
}

async function runBench() {
    console.log('🚀 Starting API Performance Benchmark');
    console.log(`📍 Targeting: ${ENDPOINT}`);
    console.log('='.repeat(50));

    const allResults: BenchResult[] = [];

    for (const rank of TEST_RANKS) {
        console.log(`\n📊 Testing Rank: ${rank}`);
        const rankResults: number[] = [];

        for (let i = 0; i < ITERATIONS_PER_RANK; i++) {
            const start = performance.now();
            try {
                const response = await fetch(`${ENDPOINT}?rank=${rank}`);
                const data = await response.json() as PredictorApiResponse;
                const duration = performance.now() - start;

                if (response.status !== 200) {
                    console.error(`   ❌ Iteration ${i + 1} failed with status ${response.status}`);
                    continue;
                }

                rankResults.push(duration);
                allResults.push({
                    rank,
                    duration,
                    status: response.status,
                    resultsCount: data.results?.length || 0
                });

                process.stdout.write(`   [${i + 1}] ${duration.toFixed(2)}ms (${data.results?.length || 0} results)  \r`);
            } catch (error) {
                console.error(`\n   ❌ Iteration ${i + 1} error:`, (error as Error).message);
            }
        }
        
        const avg = rankResults.reduce((a, b) => a + b, 0) / rankResults.length;
        const p95 = rankResults.sort((a, b) => a - b)[Math.floor(rankResults.length * 0.95)];
        console.log(`\n   ✅ Average: ${avg.toFixed(2)}ms | P95: ${p95.toFixed(2)}ms`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 GLOBAL SUMMARY');
    
    const overallAvg = allResults.reduce((acc, r) => acc + r.duration, 0) / allResults.length;
    console.log(`Overall Average Latency: ${overallAvg.toFixed(2)}ms`);
    console.log('='.repeat(50));

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync(
        path.join(process.cwd(), 'scripts/bench/results.json'), 
        JSON.stringify({ 
            timestamp: new Date().toISOString(),
            overallAvg,
            results: allResults,
            ranks: TEST_RANKS.map(rank => {
                const rankResults = allResults.filter(r => r.rank === rank).map(r => r.duration);
                return {
                    rank,
                    avg: rankResults.reduce((a, b) => a + b, 0) / rankResults.length,
                    p95: rankResults.sort((a, b) => a - b)[Math.floor(rankResults.length * 0.95)]
                };
            })
        }, null, 2)
    );
    console.log('✅ Results saved to scripts/bench/results.json');
}

runBench().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
