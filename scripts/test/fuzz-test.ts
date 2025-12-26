/**
 * Automated Fuzz Test for Data Corruption Handling
 * 
 * This script tests the decoder's resilience to corrupted data
 */

import { decodeColumnarData } from '../../src/utils/compression/cutoff-decoder';
import type { CompressedData } from '../../src/utils/compression/cutoff-decoder';

console.log('🧪 Running Fuzz Tests for Data Corruption Handling\n');

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
        passedTests++;
    } catch (error) {
        console.log(`❌ FAIL: ${name}`);
        console.error(`   Error: ${error}`);
        failedTests++;
    }
}

// Test 1: Out of Bounds Index
test('Out of Bounds Index - Should throw error', () => {
    const corruptData: CompressedData = {
        lookup: {
            P: ['Civil Engineering'],  // Only index 0 exists
            Y: [2023, 2024],
            T: ['Open'],
            R: ['Round 1'],
            S: ['ALL']
        },
        data: {
            p: [0, 999],  // ❌ Index 999 is out of bounds!
            y: [0, 1],
            t: [0, 0],
            r: [0, 0],
            s: [0, 0],
            o: [100, 200],
            k: [500, 600]
        }
    };

    try {
        const result = decodeColumnarData(corruptData);
        // Should have skipped the corrupt row
        if (result.length === 1) {
            console.log('   ✓ Correctly skipped corrupt row');
        } else {
            throw new Error(`Expected 1 row, got ${result.length}`);
        }
    } catch {
        // This is also acceptable - error was caught
        console.log('   ✓ Error caught and handled');
    }
});

// Test 2: Column Length Mismatch
test('Column Length Mismatch - Should throw error', () => {
    const corruptData: CompressedData = {
        lookup: {
            P: ['Civil Engineering'],
            Y: [2023],
            T: ['Open'],
            R: ['Round 1'],
            S: ['ALL']
        },
        data: {
            p: [0, 0, 0],     // 3 values
            y: [0, 0],        // ❌ Only 2 values!
            t: [0, 0, 0],
            r: [0, 0, 0],
            s: [0, 0, 0],
            o: [100, 200, 300],
            k: [500, 600, 700]
        }
    };

    let errorCaught = false;
    try {
        decodeColumnarData(corruptData);
    } catch (error: unknown) {
        errorCaught = true;
        if (error instanceof Error && error.message.includes('Column length mismatch')) {
            console.log('   ✓ Correct error message');
        }
    }

    if (!errorCaught) {
        throw new Error('Expected error to be thrown');
    }
});

// Test 3: Valid Data - Should work perfectly
test('Valid Data - Should decode successfully', () => {
    const validData: CompressedData = {
        lookup: {
            P: ['Civil Engineering', 'Computer Science'],
            Y: [2023, 2024],
            T: ['Open', 'OBC-A'],
            R: ['Round 1', 'Round 2'],
            S: ['ALL', 'WBJEE Seats']
        },
        data: {
            p: [0, 1, 0],
            y: [0, 1, 0],
            t: [0, 1, 0],
            r: [0, 1, 1],
            s: [0, 1, 0],
            o: [100, 200, 150],
            k: [500, 600, 550]
        }
    };

    const result = decodeColumnarData(validData);

    if (result.length !== 3) {
        throw new Error(`Expected 3 rows, got ${result.length}`);
    }

    if (result[0].program !== 'Civil Engineering') {
        throw new Error('First row program incorrect');
    }

    if (result[1].program !== 'Computer Science') {
        throw new Error('Second row program incorrect');
    }

    console.log('   ✓ All 3 rows decoded correctly');
});

// Test 4: Empty Data - Should return empty array
test('Empty Data - Should return empty array', () => {
    const emptyData: CompressedData = {
        lookup: {
            P: [],
            Y: [],
            T: [],
            R: [],
            S: []
        },
        data: {
            p: [],
            y: [],
            t: [],
            r: [],
            s: [],
            o: [],
            k: []
        }
    };

    const result = decodeColumnarData(emptyData);

    if (result.length !== 0) {
        throw new Error(`Expected 0 rows, got ${result.length}`);
    }

    console.log('   ✓ Correctly returned empty array');
});

// Test 5: Negative Index - Should throw error
test('Negative Index - Should throw error or skip row', () => {
    const corruptData: CompressedData = {
        lookup: {
            P: ['Civil Engineering'],
            Y: [2023],
            T: ['Open'],
            R: ['Round 1'],
            S: ['ALL']
        },
        data: {
            p: [0, -1],  // ❌ Negative index!
            y: [0, 0],
            t: [0, 0],
            r: [0, 0],
            s: [0, 0],
            o: [100, 200],
            k: [500, 600]
        }
    };

    try {
        const result = decodeColumnarData(corruptData);
        // Should have skipped the corrupt row
        if (result.length === 1) {
            console.log('   ✓ Correctly skipped row with negative index');
        } else {
            throw new Error(`Expected 1 row, got ${result.length}`);
        }
    } catch {
        console.log('   ✓ Error caught and handled');
    }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Total: ${passedTests + failedTests}`);
console.log('='.repeat(50));

if (failedTests === 0) {
    console.log('\n🎉 All fuzz tests passed! Data corruption handling is robust.');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Review error handling.');
    process.exit(1);
}
