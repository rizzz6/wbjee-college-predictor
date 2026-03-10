/**
 * Seed Payload Colleges from individual-college-details.json
 *
 * Usage: npx dotenv-cli -e .env.local -- tsx scripts/database/seed-payload-colleges.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { getPayload } from 'payload'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// The name map: JSON college_name → official cutoff institute name
import { COLLEGE_NAME_MAP } from './college-name-map'

function slugify(text: string) {
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

interface JsonCollege {
  college_name: string
  website?: string
  location?: string
  type?: string
  highlights?: string[]
  placement_stats?: {
    highest_package?: string | null
    average_package?: string | null
    nirf_median_salary?: string | null
    top_recruiters?: string[]
    source_reliability?: string
    data_source?: string
  }
  fees_stats?: {
    total_course_fee?: string | null
    fee_per_semester?: string | null
  }
  seo_desc?: string
  about?: {
    para1?: string
    para2?: string
  }
}

async function seedColleges() {
  console.log('🏛️  Starting Payload College Seed...\n')

  const { default: config } = await import('../../payload.config')
  const payload = await getPayload({ config })

  // Load JSON
  const jsonPath = path.join(process.cwd(), 'public/data/individual-college-details.json')
  const jsonData: JsonCollege[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`📄 Loaded ${jsonData.length} college records from JSON.\n`)

  let created = 0
  let skipped = 0
  let errors = 0

  for (const item of jsonData) {
    const jsonName = item.college_name
    // Use the map to get the official cutoff name, fallback to the JSON name
    const officialName = COLLEGE_NAME_MAP[jsonName] || jsonName

    // Determine slug
    const slug = slugify(jsonName)

    // Check for existing
    const existing = await payload.find({
      collection: 'colleges',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      skipped++
      process.stdout.write('.')
      continue
    }

    // Map type
    let collegeType: string | undefined = item.type
    if (collegeType === 'Govt') collegeType = 'Government'
    else if (collegeType === 'Pvt') collegeType = 'Private'
    // If it doesn't match a valid option, keep as-is (University, etc.)

    // Extract estYear from highlights (e.g. "Estd. 1955")
    const highlights = item.highlights || []
    const estdHighlight = highlights.find((h) => h.toLowerCase().includes('estd'))
    const estYearMatch = estdHighlight?.match(/\d{4}/)
    const estYear = estYearMatch ? parseInt(estYearMatch[0]) : undefined
    const filteredHighlights = highlights.filter((h) => !h.toLowerCase().includes('estd'))

    try {
      await payload.create({
        collection: 'colleges',
        data: {
          name: jsonName,
          slug,
          location: item.location || '',
          type: collegeType as 'Government' | 'Private' | 'Institutional' | 'University',
          website: item.website || '',
          isVisible: false,
          estYear,
          priority: 3,
          seoDescription: item.seo_desc || '',
          cutoffIdentifier: officialName,
          highlights: filteredHighlights.map((h) => ({ value: h })),
          about: {
            para1: item.about?.para1 || '',
            para2: item.about?.para2 || '',
          },
          placementStats: {
            highestPackage: item.placement_stats?.highest_package || '',
            averagePackage: item.placement_stats?.average_package || '',
            nirfMedianSalary: item.placement_stats?.nirf_median_salary || '',
            topRecruiters: (item.placement_stats?.top_recruiters || []).map((r) => ({ value: r })),
            sourceReliability: (item.placement_stats?.source_reliability as 'High' | 'Medium' | 'Low' | 'Official') || undefined,
            dataSource: item.placement_stats?.data_source || '',
          },
          feesStats: {
            totalCourseFee: item.fees_stats?.total_course_fee || '',
            feePerSemester: item.fees_stats?.fee_per_semester || '',
          },
        },
      })
      created++
      console.log(`✨ Created: ${jsonName}`)
    } catch (err) {
      console.error(`\n❌ Error creating ${jsonName}:`, err)
      errors++
    }
  }

  console.log(`\n\n✅ Seed Complete!`)
  console.log(`   Created: ${created}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Errors:  ${errors}`)
  process.exit(0)
}

seedColleges().catch(console.error)
