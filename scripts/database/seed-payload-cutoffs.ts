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
  console.log('📊 Starting Payload Cutoff Seed...\n')

  // --- Init Payload ---
  const { default: config } = await import('../../payload.config')
  const payload = await getPayload({ config })

  // --- Init Supabase ---
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SECRET_KEY!

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Clients initialized\n')

  // --- Fetch all cutoffs from Supabase with pagination ---
  console.log('📥 Fetching cutoffs from Supabase...')
  let allRows: SupabaseCutoff[] = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('cutoffs')
      .select('institute, year, program, quota, category, seat_type, round, opening_rank, closing_rank')
      .range(from, from + batchSize - 1)

    if (error) {
      console.error('❌ Supabase error:', error)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    allRows = allRows.concat(data)
    from += batchSize
    process.stdout.write(`\r   Fetched ${allRows.length} rows...`)
    if (data.length < batchSize) break
  }

  console.log(`\n📊 Total rows: ${allRows.length}\n`)

  // --- Group by institute ---
  const grouped: Record<string, SupabaseCutoff[]> = {}
  for (const row of allRows) {
    if (!grouped[row.institute]) grouped[row.institute] = []
    grouped[row.institute].push(row)
  }

  const institutes = Object.keys(grouped)
  console.log(`🧩 Found ${institutes.length} institutes.\n`)

  // --- Pre-load all Payload colleges for lookup ---
  console.log('🔍 Loading Payload colleges for matching...')
  const allColleges = await payload.find({
    collection: 'colleges',
    limit: 500,
    pagination: false,
  })
  // Build lookup: cutoffIdentifier → payloadId, and name → payloadId
  const collegeMap = new Map<string, number>()
  for (const doc of allColleges.docs) {
    if (doc.cutoffIdentifier) collegeMap.set(doc.cutoffIdentifier, doc.id as number)
    collegeMap.set(doc.name, doc.id as number)
  }
  console.log(`   Loaded ${allColleges.docs.length} colleges.\n`)

  // --- Insert cutoffs ---
  let created = 0
  let unmatched = 0
  let errors = 0

  for (const [index, inst] of institutes.entries()) {
    const rows = grouped[inst]
    const collegeId = collegeMap.get(inst)

    if (!collegeId) {
      unmatched++
      // Still create the document, just without the relationship
    }

    process.stdout.write(`\r   Processing ${index + 1}/${institutes.length}: ${inst.substring(0, 40)}...`)

    try {
      await payload.create({
        collection: 'college_cutoffs',
        data: {
          institute: inst,
          college: collegeId || undefined,
          cutoffs: rows.map((r) => ({
            year: r.year,
            program: r.program,
            quota: r.quota,
            category: r.category,
            seatType: r.seat_type,
            round: r.round,
            openingRank: r.opening_rank,
            closingRank: r.closing_rank,
          })),
        },
      })
      created++
    } catch (err) {
      console.error(`\n❌ Error for ${inst}:`, err)
      errors++
    }
  }

  console.log(`\n\n✅ Seed Complete!`)
  console.log(`   Created:   ${created}`)
  console.log(`   Unmatched: ${unmatched} (created without college link)`)
  console.log(`   Errors:    ${errors}`)
  process.exit(0)
}

seedCutoffs().catch(console.error)
