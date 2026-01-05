import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'ytfxpldt',
  dataset: 'rwbjee-dataset',
  apiVersion: '2024-01-01',
  useCdn: false
})

async function checkCollegeStructure() {
  // Get a sample college
  const sample = await client.fetch(`*[_type == "college" && !(_id in path("drafts.**"))][0]{
    name,
    collegeDetail,
    lastSyncedAt,
    highlights,
    _id
  }`)

  console.log('Sample college structure:')
  console.log(JSON.stringify(sample, null, 2))

  // Check counts
  const counts = await client.fetch(`{
    "total": count(*[_type == "college" && !(_id in path("drafts.**"))]),
    "hasCollegeDetailRef": count(*[_type == "college" && !(_id in path("drafts.**")) && defined(collegeDetail._ref)]),
    "hasCollegeDetailDefined": count(*[_type == "college" && !(_id in path("drafts.**")) && defined(collegeDetail)]),
    "hasLastSynced": count(*[_type == "college" && !(_id in path("drafts.**")) && defined(lastSyncedAt)]),
    "hasHighlights": count(*[_type == "college" && !(_id in path("drafts.**")) && count(highlights) > 0]),
    "noCollegeDetail": count(*[_type == "college" && !(_id in path("drafts.**")) && !defined(collegeDetail)])
  }`)

  console.log('\nCounts:')
  console.log(JSON.stringify(counts, null, 2))

  // Get a college with collegeDetail
  const withDetail = await client.fetch(`*[_type == "college" && !(_id in path("drafts.**")) && defined(collegeDetail)][0]{
    name,
    collegeDetail,
    lastSyncedAt,
    highlights
  }`)

  console.log('\nSample college WITH collegeDetail:')
  console.log(JSON.stringify(withDetail, null, 2))
}

checkCollegeStructure().catch(console.error)
