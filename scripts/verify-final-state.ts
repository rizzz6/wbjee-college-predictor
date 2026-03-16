import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function verify() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  try {
    await client.connect()
    console.log('--- FINAL MIGRATION VERIFICATION ---\n')

    // 1. Authors
    const authorRes = await client.query(`
      SELECT p.title, COUNT(pr.id) as author_count 
      FROM payload.posts p
      LEFT JOIN payload.posts_rels pr ON pr.parent_id = p.id AND pr.path = 'author'
      GROUP BY p.title
    `)
    console.log('Authors per Post:')
    authorRes.rows.forEach(row => {
      console.log(` - ${row.title}: ${row.author_count} authors`)
    })

    // 2. Fees
    const feeStats = await client.query(`
      SELECT 
        COUNT(*) as total_colleges,
        COUNT(fees_stats_total_course_fee_amount) as with_total_fee,
        COUNT(fees_stats_semester_fee_amount) as with_sem_fee,
        AVG(fees_stats_total_course_fee_amount)::bigint as avg_total_fee
      FROM payload.colleges
    `)
    console.log('\nFee Normalization Statistics:')
    console.log(` - Total Colleges: ${feeStats.rows[0].total_colleges}`)
    console.log(` - With Total Fee: ${feeStats.rows[0].with_total_fee}`)
    console.log(` - With Sem Fee: ${feeStats.rows[0].with_sem_fee}`)
    console.log(` - Average Total Fee: ${feeStats.rows[0].avg_total_fee}`)

    // 3. Bad Value Checks
    console.log('\nFee Validity Checks (Looking for issues):')
    const badFees = await client.query(`
      SELECT name, fees_stats_total_course_fee_amount as total, fees_stats_semester_fee_amount as sem
      FROM payload.colleges
      WHERE (fees_stats_total_course_fee_amount > 0 AND fees_stats_total_course_fee_amount < 1000)
         OR (fees_stats_total_course_fee_amount BETWEEN 1 AND 20)
         OR (fees_stats_semester_fee_amount > 500000)
         OR (fees_stats_semester_fee_amount BETWEEN 1 AND 20)
      LIMIT 20
    `)
    if (badFees.rows.length === 0) {
      console.log(' ✅ No obvious fee outliers or remnants found (e.g. 5.98 instead of 598000).')
    } else {
      console.log(' ❌ Found potential bad fee values:')
      badFees.rows.forEach(row => {
        console.log(`   - ${row.name}: Total=${row.total}, Sem=${row.sem}`)
      })
    }

    // 4. Sample College Checks
    console.log('\nNamed Sample Checks:')
    const samples = [
      'Heritage Institute of Technology',
      'Narula Institute of Technology',
      'Techno Main Salt Lake',
      'Guru Nanak Institute of Technology',
      'Adamas University'
    ]
    for (const name of samples) {
      const res = await client.query(`
        SELECT name, fees_stats_total_course_fee_amount, fees_stats_semester_fee_amount
        FROM payload.colleges
        WHERE name LIKE $1
      `, [`%${name}%`])
      if (res.rows.length > 0) {
        const row = res.rows[0]
        console.log(` - ${row.name}:`)
        console.log(`   Total: ${row.fees_stats_total_course_fee_amount}`)
        console.log(`   Sem:   ${row.fees_stats_semester_fee_amount}`)
      } else {
        console.log(` - ${name}: NOT FOUND`)
      }
    }

    // 5. Placements
    const placementRes = await client.query(`
      SELECT COUNT(*) as report_count, COUNT(DISTINCT college_id) as college_count 
      FROM payload.college_placement_reports
    `)
    console.log(`\nPlacement Reports: ${placementRes.rows[0].report_count} reports for ${placementRes.rows[0].college_count} colleges.`)

  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}

verify()
