const fs = require('fs');

const lookup = JSON.parse(fs.readFileSync('./public/metadata-lookup.json', 'utf8'));

console.log('\n' + '='.repeat(70));
console.log('NORMALIZATION VERIFICATION');
console.log('='.repeat(70));

console.log(`\n✅ Total colleges in metadata: ${lookup.colleges.length}`);

console.log('\n📝 Sample of normalized names (checking problematic cases):\n');

const samples = [
    'P.G.',
    'Self',
    'Jalpaiguri',
    'THE',
    'ITME',
    'D.H.',
];

samples.forEach(search => {
    const matches = lookup.colleges.filter(c => c.toUpperCase().includes(search.toUpperCase()));
    if (matches.length > 0) {
        console.log(`${search}:`);
        matches.slice(0, 3).forEach(m => console.log(`  • ${m}`));
        if (matches.length > 3) console.log(`  ... and ${matches.length - 3} more`);
        console.log('');
    }
});

console.log('='.repeat(70));
