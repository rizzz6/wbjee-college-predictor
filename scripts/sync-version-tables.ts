import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function sync() {
  const client = new Client({ connectionString: process.env.DATABASE_URI })
  try {
    await client.connect()
    console.log('--- Checking for Schema Mismatches ---')

    const pairs = [
      { main: 'colleges', version: '_colleges_v' },
      { main: 'posts', version: '_posts_v' }
    ]

    for (const { main, version } of pairs) {
      console.log(`\nSyncing ${version} from ${main}...`)
      const mainCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'payload' AND table_name = $1
      `, [main])

      const verCols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'payload' AND table_name = $1
      `, [version])

      const verColSet = new Set(verCols.rows.map(r => r.column_name))

      for (const mRow of mainCols.rows) {
        // Skip meta columns and ID
        if (['id', 'created_at', 'updated_at', '_status'].includes(mRow.column_name)) continue
        
        const expectedVerCol = `version_${mRow.column_name}`
        if (!verColSet.has(expectedVerCol)) {
          let dataType = mRow.data_type
          
          if (dataType === 'USER-DEFINED') {
            dataType = 'TEXT' 
          }

          const query = `ALTER TABLE payload."${version}" ADD COLUMN IF NOT EXISTS "${expectedVerCol}" ${dataType}`
          try {
            await client.query(query)
            console.log(` ✅ Added ${expectedVerCol} (${dataType})`)
          } catch (e: unknown) {
            console.error(` ❌ Failed: ${expectedVerCol} (${dataType}) - ${(e as Error).message}`)
          }
        }
      }
    }

    // Special check for relationship tables in versions
    // If Posts.author is hasMany, there should be a posts_rels table
    // And if versions are enabled, there should be a _posts_v_rels table (depending on Payload version/adapter)
    // Actually in Payload 3.0 with Drizzle/Postgres, versions relationships are often handled in the main _rels table or a separate one.
    // The error was specifically about a column, so let's focus on that first.

  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
    process.exit(0)
  }
}

sync()
