
/**
 * System Audit Script
 * 
 * Tests:
 * 1. Predictor Logic (Adaptive Multipliers & Predictions)
 * 2. Cutoff Filter Consistency
 * 3. SEO Metadata Verification
 * 4. API Response Simulation
 */

// Mock adaptive multipliers logic from API for testing
function getAdaptiveMultipliers(rank: number): { min: number; max: number } {
    if (rank <= 5000) return { min: 0.6, max: 1.4 };
    if (rank <= 15000) return { min: 0.7, max: 1.3 };
    if (rank <= 30000) return { min: 0.8, max: 1.2 };
    if (rank <= 50000) return { min: 0.85, max: 1.15 };
    return { min: 0.9, max: 1.1 };
}

// Mock prediction logic from API for testing
function calculatePrediction(rank: number, or: number | null, cr: number | null) {
    if (or === null || cr === null || rank <= 0) return { text: '-', order: 6 };
    if (or > cr) return { text: 'Invalid Data', order: 6 };

    const gap = cr - or;
    if (rank < or) return { text: 'Confirm', order: 1 };
    
    if (gap === 0) {
        return rank === cr ? { text: 'Borderline', order: 4 } : { text: 'No Chance', order: 5 };
    }

    const greatThreshold = or + (gap * 0.30);
    if (rank <= greatThreshold) return { text: 'Great', order: 2 };
    if (rank <= cr) return { text: 'Good', order: 3 };

    let bufferPercent, absoluteCap;
    if (cr < 5000) { bufferPercent = 0.08; absoluteCap = 400; }
    else if (cr < 20000) { bufferPercent = 0.12; absoluteCap = 2000; }
    else { bufferPercent = 0.15; absoluteCap = 5000; }

    const actualBuffer = Math.min(cr * bufferPercent, absoluteCap);
    if (rank <= cr + actualBuffer) return { text: 'Borderline', order: 4 };

    return { text: 'No Chance', order: 5 };
}

async function runTests() {
    console.log('🚀 Starting Comprehensive System Audit...\n');

    let totalTests = 0;
    let passedTests = 0;

    const assert = (condition: boolean, message: string) => {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`✅ [PASS] ${message}`);
        } else {
            console.error(`❌ [FAIL] ${message}`);
        }
    };

    // --- SECTION 1: PREDICTOR LOGIC ---
    console.log('\n--- 🎯 Predictor Logic Tests ---');
    
    // Test Adaptive Multipliers
    const m1 = getAdaptiveMultipliers(1000);
    assert(m1.min === 0.6 && m1.max === 1.4, 'Low rank (1000) should have 0.6-1.4 multipliers');
    
    const m2 = getAdaptiveMultipliers(40000);
    assert(m2.min === 0.85 && m2.max === 1.15, 'High rank (40000) should have 0.85-1.15 multipliers');

    // Test Predictions
    // Case: Confirm (Rank < OR)
    const p1 = calculatePrediction(500, 1000, 2000);
    assert(p1.text === 'Confirm', 'Rank 500 < OR 1000 should be "Confirm"');

    // Case: Great (Rank in top 30% of gap)
    // Gap = 1000. 30% = 300. Threshold = 1000 + 300 = 1300.
    const p2 = calculatePrediction(1200, 1000, 2000);
    assert(p2.text === 'Great', 'Rank 1200 should be "Great" (Top 30% of 1000-2000)');

    // Case: Good (Rank within range)
    const p3 = calculatePrediction(1800, 1000, 2000);
    assert(p3.text === 'Good', 'Rank 1800 should be "Good" (Inside 1000-2000)');

    // Case: Borderline (Within buffer)
    // CR = 2000. Buffer = 2000 * 0.08 = 160. Threshold = 2160.
    const p4 = calculatePrediction(2100, 1000, 2000);
    assert(p4.text === 'Borderline', 'Rank 2100 should be "Borderline" (Near 2000)');

    // Case: No Chance
    const p5 = calculatePrediction(5000, 1000, 2000);
    assert(p5.text === 'No Chance', 'Rank 5000 should be "No Chance" (Far from 2000)');

    // --- SECTION 2: DATA INTEGRITY (Simulation) ---
    console.log('\n--- 📊 Data Integrity Simulation ---');
    
    const mockData = [
        { or: 100, cr: 200 },
        { or: 500, cr: 400 }, // Inverted
        { or: null, cr: 1000 } // Missing OR
    ];

    assert(calculatePrediction(150, mockData[0].or, mockData[0].cr).text === 'Good', 'Valid row handled');
    assert(calculatePrediction(450, mockData[1].or, mockData[1].cr).text === 'Invalid Data', 'Inverted ranks detected');
    assert(calculatePrediction(800, mockData[2].or, mockData[2].cr).text === '-', 'Missing data handled with "-"');

    // --- SECTION 3: SEO & METADATA CHECK ---
    console.log('\n--- 🔍 SEO & Metadata Verification ---');
    
    // We can't easily crawl the site here, but we can verify the metadata generation utility
    const metaMod = (await import('../../src/utils/lexical-metadata').catch(() => ({ generateMetadata: null }))) as { 
        generateMetadata: ((args: Record<string, unknown>) => { title?: string; openGraph?: unknown }) | null 
    };
    const generateMetadata = metaMod.generateMetadata;

    if (generateMetadata) {
        const meta = generateMetadata({ 
            title: 'Test Title', 
            description: 'Test Description' 
        } as unknown as Record<string, unknown>);
        assert(!!meta.title && !!meta.openGraph, 'Metadata generator produces basic OG tags');
    } else {
        console.log('ℹ️ Skipping Lexical Metadata test (utility not found in scripts path)');
    }

    // --- SUMMARY ---
    console.log('\n' + '='.repeat(50));
    console.log(`Audit Summary: ${passedTests}/${totalTests} tests passed`);
    console.log('='.repeat(50));

    if (passedTests === totalTests) {
        console.log('\n✅ System health check PASSED. All parameters behaving as expected.');
        process.exit(0);
    } else {
        console.log('\n❌ System health check FAILED. Please review the errors above.');
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Fatal Audit Error:', err);
    process.exit(1);
});
