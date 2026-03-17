/**
 * Seed Payload CollegeCutoffs from Supabase cutoffs table
 *
 * Usage: npx dotenv-cli -e .env.local -- tsx scripts/database/seed-payload-cutoffs.ts
 */

import dotenv from 'dotenv'
import path from 'path'
import { getPayload } from 'payload'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

interface SupabaseCutoff {
  institute: string
  year: number
  program: string
  quota: string
  category: string
  seat_type: string
  round: string
  opening_rank: number
  closing_rank: number
}

async function seedCutoffs() {
  console.log('Starting Payload Cutoff Seed...\n')

  const { default: config } = await import('../../payload.config')
  const payload = await getPayload({ config })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SECRET_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log('Clients initialized\n')

  console.log('Fetching cutoffs from Supabase...')
  let allRows: SupabaseCutoff[] = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('cutoffs')
      .select('institute, year, program, quota, category, seat_type, round, opening_rank, closing_rank')
      .range(from, from + batchSize - 1)

    if (error) {
      console.error('Supabase error:', error)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    allRows = allRows.concat(data)
    from += batchSize
    process.stdout.write(`\r   Fetched ${allRows.length} rows...`)
    if (data.length < batchSize) break
  }

  console.log(`\nTotal rows: ${allRows.length}\n`)

  const grouped: Record<string, SupabaseCutoff[]> = {}
  for (const row of allRows) {
    if (!grouped[row.institute]) grouped[row.institute] = []
    grouped[row.institute].push(row)
  }

  const institutes = Object.keys(grouped)
  console.log(`Found ${institutes.length} institutes.\n`)

  console.log('Loading Payload colleges for matching...')
  const allColleges = await payload.find({
    collection: 'colleges',
    limit: 500,
    pagination: false,
  })

  const collegeMap = new Map<string, number>()
  for (const doc of allColleges.docs) {
    if (doc.cutoffSourceName) collegeMap.set(doc.cutoffSourceName, doc.id as number)
    collegeMap.set(doc.name, doc.id as number)
  }
  console.log(`   Loaded ${allColleges.docs.length} colleges.\n`)

  console.log('Clearing existing cutoffs...')
  const { errors: deleteErrors } = await payload.delete({
    collection: 'college_cutoffs',
    where: {
      id: { exists: true },
    },
  })

  if (deleteErrors && deleteErrors.length > 0) {
    console.error('Failed to clear some cutoffs:', deleteErrors)
  } else {
    console.log('   Cutoffs cleared successfully.\n')
  }

  let created = 0
  let unmatched = 0
  let errors = 0

  for (const [index, institute] of institutes.entries()) {
    const rows = grouped[institute]
    const collegeId = collegeMap.get(institute)

    if (!collegeId) {
      unmatched++
    }

    process.stdout.write(`\r   Processing ${index + 1}/${institutes.length}: ${institute.substring(0, 40)}...`)

    try {
      await payload.create({
        collection: 'college_cutoffs',
        data: {
          institute,
          college: collegeId || undefined,
          cutoffs: rows.map((row) => ({
            year: row.year,
            program: row.program,
            quota: row.quota,
            category: row.category,
            seatType: row.seat_type,
            round: row.round,
            openingRank: row.opening_rank,
            closingRank: row.closing_rank,
          })),
        },
      })
      created++
    } catch (err) {
      console.error(`\nError for ${institute}:`, err)
      errors++
    }
  }

  console.log(`\n\nSeed Complete!`)
  console.log(`   Created:   ${created}`)
  console.log(`   Unmatched: ${unmatched} (created without college link)`)
  console.log(`   Errors:    ${errors}`)
  process.exit(0)
}

seedCutoffs().catch(console.error)