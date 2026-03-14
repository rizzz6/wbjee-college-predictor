
import pg from 'pg';
const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.odahbrkrhaturgyiuutu:***REMOVED***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  await client.connect();

  console.log('--- BULK VERSION SYNC ---');

  const tables = [
    { main: 'colleges', version: '_colleges_v' },
    { main: 'posts', version: '_posts_v' },
    { main: 'timeline', version: '_timeline_v' }
  ];

  for (const t of tables) {
    try {
      console.log(`Syncing ${t.main}...`);
      await client.query('BEGIN');
      
      // Delete existing to avoid conflicts
      await client.query(`DELETE FROM "payload"."${t.version}"`);
      
      // Bulk insert
      const query = `
        INSERT INTO "payload"."${t.version}" (parent_id, version, latest, autosave, updated_at, created_at)
        SELECT id, row_to_json(main)::jsonb, true, false, updated_at, created_at
        FROM "payload"."${t.main}" main
      `;
      const res = await client.query(query);
      console.log(`  Inserted ${res.rowCount} versions for ${t.main}`);
      
      await client.query('COMMIT');
    } catch (e: any) {
      await client.query('ROLLBACK');
      console.error(`  Error syncing ${t.main}:`, e.message);
    }
  }

  await client.end();
  console.log('--- BULK VERSION SYNC COMPLETED ---');
}

run().catch(console.error);
