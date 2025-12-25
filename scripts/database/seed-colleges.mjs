import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
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

// Simple slugify function
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Read the data.json file
const dataPath = path.join(__dirname, '..', 'public', 'data.json')
console.log('Reading data from:', dataPath)

const rawData = fs.readFileSync(dataPath, 'utf8')
const data = JSON.parse(rawData)

console.log(`Found ${data.length} records`)

// Extract unique institutes
const uniqueInstitutes = [...new Set(data.map(row => row['Institute'] || row.Institute).filter(Boolean))]

console.log(`Found ${uniqueInstitutes.length} unique institutes`)

async function seedColleges() {
  let created = 0

  for (const institute of uniqueInstitutes) {
    try {
      // Check if college already exists
      const existing = await client.fetch(`*[_type == "college" && name == $name][0]`, { name: institute })

      if (existing) {
        console.log(`College already exists: ${institute}`)
        continue
      }

      // Determine type
      const isGovernment = /govt|university/i.test(institute)
      const type = isGovernment ? 'Government' : 'Private'

      // Create college document
      const doc = {
        _type: 'college',
        name: institute,
        isVisible: false,
        cutoffIdentifier: institute,
        slug: {
          _type: 'slug',
          current: slugify(institute),
        },
        location: 'West Bengal',
        type: type,
      }

      await client.create(doc)
      created++
      console.log(`Created college: ${institute}`)

    } catch (error) {
      console.error(`Error processing ${institute}:`, error)
    }
  }

  console.log(`Seeding complete. Created ${created} new colleges.`)
}

seedColleges()