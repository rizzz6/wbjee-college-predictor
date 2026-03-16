import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function fix() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  try {
    await client.connect()
    console.log('--- Targeted Fee Column Fix ---')
    
    const queries = [
      `ALTER TABLE payload."_colleges_v" ADD COLUMN IF NOT EXISTS "version_fees_stats_total_course_fee_amount" NUMERIC`,
      `ALTER TABLE payload."_colleges_v" ADD COLUMN IF NOT EXISTS "version_fees_stats_semester_fee_amount" NUMERIC`,
      `ALTER TABLE payload."_colleges_v" ADD COLUMN IF NOT EXISTS "version_fees_stats_currency_code" TEXT`,
      `ALTER TABLE payload."_colleges_v" ADD COLUMN IF NOT EXISTS "version_fees_stats_fee_notes" TEXT`
    ]
    
    for (const q of queries) {
      try {
        await client.query(q)
        console.log(` ✅ Executed: ${q}`)
      } catch (e: unknown) {
        console.error(` ❌ Failed: ${q} - ${(e as Error).message}`)
      }
    }
    
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
}

fix()
