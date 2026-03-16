import dotenv from 'dotenv'
import path from 'path'
import pg from 'pg'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function run() {
  const connectionString = process.env.DATABASE_URI
  if (!connectionString) {
    console.error('DATABASE_URI is not set')
    process.exit(1)
  }

  const client = new pg.Client({
    connectionString,
  })

  await client.connect()

  console.log('Connected to database.')

  // We check for both public and payload schemas just in case
  const schemas = ['payload', 'public']
  const tables = ['posts', 'colleges']
  
  for (const schema of schemas) {
    for (const table of tables) {
      const fullTableName = `"${schema}"."${table}"`
      console.log(`Checking table: ${fullTableName}`)
      
      const columnQueries = table === 'posts' 
        ? [
            { name: 'body', type: 'JSONB' },
            { name: 'author_name', type: 'TEXT' }
          ]
        : [
            { name: 'overview', type: 'JSONB' },
            { name: 'cutoff_source_name', type: 'TEXT' }
          ]

      for (const col of columnQueries) {
        const query = `ALTER TABLE ${fullTableName} ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
        console.log(`Executing: ${query}`)
        try {
          await client.query(query)
          console.log('Success.')
        } catch (err) {
          console.log(`Skipped or failed for ${fullTableName}: ${(err as Error).message}`)
        }
      }
    }
    
    // Also handle version tables
    const versionTables = ['_posts_v', '_colleges_v']
    for (const table of versionTables) {
        const fullTableName = `"${schema}"."${table}"`
        const colName = table === '_posts_v' ? 'version_body' : 'version_overview'
        const query = `ALTER TABLE ${fullTableName} ADD COLUMN IF NOT EXISTS "${colName}" JSONB`
        console.log(`Executing: ${query}`)
        try {
          await client.query(query)
          console.log('Success.')
        } catch (err) {
          console.log(`Skipped or failed for ${fullTableName}: ${(err as Error).message}`)
        }
    }
  }

  await client.end()
  console.log('Database schema update complete.')
}

run().catch(console.error)
