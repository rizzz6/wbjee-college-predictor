import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const client = createClient({
  projectId: 'ytfxpldt', 
  dataset: 'rwbjee-dataset',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

// Read the data.json file
const dataPath = path.join(__dirname, '..', 'public', 'data.json')
console.log('Reading data from:', dataPath)

const rawData = fs.readFileSync(dataPath, 'utf8')
const data = JSON.parse(rawData)

console.log(`Found ${data.length} records to import`)

// Function to import in batches
async function importCutoffs() {
  const batchSize = 500
  let imported = 0

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`)

    const transaction = client.transaction()

    batch.forEach((row) => {
      const doc = {
        _type: 'cutoff',
        institute: row['Institute'] || row.Institute,
        program: row['Program'] || row.Program,
        quota: row['Quota'] || row.Quota,
        category: row['Category'] || row.Category,
        seatType: 'WBJEE Seats', // Default as per schema
        year: parseInt(row['Year'] || row.Year),
        round: row['Round'] || row.Round,
        openingRank: parseInt(row['Opening Rank'] || row['OpeningRank']),
        closingRank: parseInt(row['Closing Rank'] || row['ClosingRank']),
      }

      transaction.create(doc)
    })

    try {
      await transaction.commit()
      imported += batch.length
      console.log(`✓ Imported ${imported}/${data.length} records`)
    } catch (error) {
      console.error('Error importing batch:', error)
      // Continue with next batch
    }
  }

  console.log('Import completed!')
}

// Run the import
importCutoffs().catch(console.error)