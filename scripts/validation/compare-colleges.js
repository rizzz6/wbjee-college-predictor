const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./public/data.json', 'utf8'));
const lookup = JSON.parse(fs.readFileSync('./public/metadata-lookup.json', 'utf8'));

// Extract unique institutes from data.json (note capital I in "Institute")
const dataColleges = [...new Set(data.map(r => r.Institute))].sort();

// Get colleges from metadata
const lookupColleges = lookup.colleges.sort();

console.log('\n' + '='.repeat(70));
console.log('INSTITUTE COUNT INVESTIGATION');
console.log('='.repeat(70));

console.log(`\ndata.json: ${dataColleges.length} colleges`);
console.log(`metadata-lookup.json: ${lookupColleges.length} colleges`);
console.log(`Difference: ${lookupColleges.length - dataColleges.length} extra colleges in metadata\n`);

// Find colleges in metadata but NOT in data.json
const extraInMetadata = lookupColleges.filter(c => !dataColleges.includes(c));

console.log(`Extra colleges in METADATA (not in data.json): ${extraInMetadata.length}`);
console.log('-'.repeat(70));
extraInMetadata.forEach((c, i) => {
    console.log(`${(i + 1).toString().padStart(3)}. ${c}`);
});

// Find colleges in data.json but NOT in metadata
const missingInMetadata = dataColleges.filter(c => !lookupColleges.includes(c));

if (missingInMetadata.length > 0) {
    console.log(`\nColleges in DATA.JSON but MISSING from metadata: ${missingInMetadata.length}`);
    console.log('-'.repeat(70));
    missingInMetadata.forEach((c, i) => {
        console.log(`${(i + 1).toString().padStart(3)}. ${c}`);
    });
}

console.log('\n' + '='.repeat(70));
