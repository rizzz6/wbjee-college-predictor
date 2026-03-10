/**
 * Verify Payload College Seed
 */

import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function verify() {
  console.log('🔍 Verifying Payload College Seed...\n')

  const { default: config } = await import('../../payload.config')
  const payload = await getPayload({ config })

  // 1. Check total colleges
  const allColleges = await payload.find({
    collection: 'colleges',
    limit: 0, // Get count
  })
  console.log(`📊 Total Colleges in database: ${allColleges.totalDocs}`)

  // 2. Fetch a few specific ones with complex data to check mapping
  const sampleColleges = await payload.find({
    collection: 'colleges',
    limit: 2,
    where: {
      type: {
        equals: 'Government',
      },
    },
  })

  console.log('\n📋 Sample College 1:')
  if (sampleColleges.docs[0]) {
      const c = sampleColleges.docs[0];
      console.log(`- Name: ${c.name}`)
      console.log(`- Slug: ${c.slug}`)
      console.log(`- Est Year: ${c.estYear}`)
      console.log(`- Highlights:`, c.highlights?.map(h => h.value).join(', '))
      console.log(`- Placement Stats (Highest): ${c.placementStats?.highestPackage}`)
      console.log(`- Placement Stats (Recruiters):`, c.placementStats?.topRecruiters?.map(r => r.value).join(', '))
      console.log(`- Fees (Total): ${c.feesStats?.totalCourseFee}`)
      console.log(`- About (Para 1 snippet): ${c.about?.para1?.substring(0, 50)}...`)
  }
  
  console.log('\n📋 Sample College 2:')
  if (sampleColleges.docs[1]) {
      const c = sampleColleges.docs[1];
      console.log(`- Name: ${c.name}`)
      console.log(`- Slug: ${c.slug}`)
      console.log(`- Est Year: ${c.estYear}`)
      console.log(`- Highlights:`, c.highlights?.map(h => h.value).join(', '))
      console.log(`- Placement Stats (Highest): ${c.placementStats?.highestPackage}`)
      console.log(`- Fees (Total): ${c.feesStats?.totalCourseFee}`)
  }

  // 3. Check cutoffs
  const allCutoffs = await payload.find({
    collection: 'college_cutoffs',
    limit: 1,
  })
  console.log(`\n📊 Total College Cutoff docs: ${allCutoffs.totalDocs}`)
  if (allCutoffs.docs[0]) {
      const cut = allCutoffs.docs[0];
      console.log(`\n📋 Sample Cutoff Doc:`)
      console.log(`- Institute: ${cut.institute}`)
      console.log(`- Linked College ID: ${cut.college}`)
      console.log(`- Number of cutoff rows: ${cut.cutoffs?.length}`)
      if (cut.cutoffs?.[0]) {
          console.log(`- First row: ${cut.cutoffs[0].year} ${cut.cutoffs[0].program} ${cut.cutoffs[0].category} O:${cut.cutoffs[0].openingRank} C:${cut.cutoffs[0].closingRank}`)
      }
  }

  process.exit(0)
}

verify().catch(console.error)
