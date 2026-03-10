import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    console.log('Connecting to database to clear invalid FK data...')
    await client.connect()

    const res = await client.query('UPDATE payload.colleges SET cutoff_identifier_id = NULL;')
    
    console.log(`✅ Update successful. Modified ${res.rowCount} rows.`)
  } catch (err) {
    console.error('❌ Error updating database:', err)
  } finally {
    await client.end()
    console.log('Database connection closed.')
  }
}

run()
