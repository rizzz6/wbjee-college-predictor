import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

// Group data by Institute
const groupedData = data.reduce((acc, row) => {
  const institute = row['Institute'] || row.Institute
  if (!acc[institute]) {
    acc[institute] = []
  }
  acc[institute].push({
    _key: crypto.randomUUID(),
    year: parseInt(row['Year'] || row.Year),
    program: row['Program'] || row.Program,
    quota: row['Quota'] || row.Quota,
    category: row['Category'] || row.Category,
    seatType: 'WBJEE Seats', // Default
    round: row['Round'] || row.Round,
    openingRank: parseInt(row['Opening Rank'] || row['OpeningRank']),
    closingRank: parseInt(row['Closing Rank'] || row['ClosingRank']),
  })
  return acc
}, {})

console.log(`Grouped into ${Object.keys(groupedData).length} institutes`)

// Create documents
const documents = Object.entries(groupedData).map(([institute, cutoffs]) => ({
  _type: 'collegeCutoff',
  institute,
  cutoffs,
}))

console.log(`Creating ${documents.length} documents`)

// Import using transaction
async function importGroupedCutoffs() {
  const transaction = client.transaction()

  documents.forEach((doc) => {
    transaction.create(doc)
  })

  try {
    await transaction.commit()
    console.log('Import completed successfully!')
  } catch (error) {
    console.error('Error importing grouped cutoffs:', error)
  }
}

importGroupedCutoffs()