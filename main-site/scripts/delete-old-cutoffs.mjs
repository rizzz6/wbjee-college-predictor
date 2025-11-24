import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'ytfxpldt',
  dataset: 'rwbjee-dataset',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function deleteOldCutoffs() {
  try {
    await client.delete({ query: '*[_type == "collegeCutoff"]' })
    console.log('Old documents deleted.')
  } catch (error) {
    console.error('Error deleting old cutoffs:', error)
  }
}

deleteOldCutoffs()