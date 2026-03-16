import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  })

  try {
    await client.connect()
    console.log('--- Checking Migration Status ---')
    
    const tagsCount = await client.query('SELECT count(*) FROM payload.tags;')
    console.log('Normalized Tags count:', tagsCount.rows[0].count)
    
    const authorsCount = await client.query('SELECT count(*) FROM payload.authors;')
    console.log('Normalized Authors count:', authorsCount.rows[0].count)
    
    const reportsCount = await client.query('SELECT count(*) FROM payload.college_placement_reports;')
    console.log('Placement Reports count:', reportsCount.rows[0].count)

    const relsCount = await client.query('SELECT count(*) FROM payload.posts_rels;')
    console.log('Post Relationships count:', relsCount.rows[0].count)

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.end()
    process.exit(0)
  }
}

run()
