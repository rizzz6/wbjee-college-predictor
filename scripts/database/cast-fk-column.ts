import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    console.log('Connecting to database to cast fk column...')
    await client.connect()

    // Explicitly cast the column from varchar to integer using the USING clause
    await client.query('ALTER TABLE payload.colleges ALTER COLUMN cutoff_identifier_id TYPE integer USING cutoff_identifier_id::integer;')
    
    console.log(`✅ Column cast successful.`)
  } catch (err) {
    console.error('❌ Error updating database:', err)
  } finally {
    await client.end()
    console.log('Database connection closed.')
  }
}

run()
