
import pg from 'pg';
const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.odahbrkrhaturgyiuutu:***REMOVED***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  await client.connect();

  console.log('--- STARTING VERSION SYNC ---');

  const collections = [
    { name: 'colleges', versionTable: '_colleges_v' },
    { name: 'posts', versionTable: '_posts_v' },
    { name: 'timeline', versionTable: '_timeline_v' },
  ];

  for (const collection of collections) {
    console.log(`Syncing ${collection.name}...`);
    
    // Check if version table is empty
    const countRes = await client.query(`SELECT count(*) FROM "payload"."${collection.versionTable}"`);
    if (parseInt(countRes.rows[0].count) === 0) {
      console.log(`Version table ${collection.versionTable} is empty. Migrating...`);
      
      // Select all docs from main table
      const docsRes = await client.query(`SELECT * FROM "payload"."${collection.name}"`);
      
      for (const doc of docsRes.rows) {
        try {
          const insertQuery = `
            INSERT INTO "payload"."${collection.versionTable}" 
            (parent_id, version, latest, autosave, updated_at, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6)
          `;
          await client.query(insertQuery, [
            doc.id, 
            JSON.stringify(doc), 
            true, 
            false, 
            doc.updated_at || new Date(), 
            doc.created_at || new Date()
          ]);
        } catch (err: any) {
          console.error(`Error syncing doc ${doc.id} in ${collection.name}:`, err.message);
        }
      }
      console.log(`Finished ${collection.name}.`);
    } else {
      console.log(`${collection.name} already has versions. Skipping.`);
    }
  }

  await client.end();
  console.log('--- VERSION SYNC COMPLETED ---');
}

run().catch(console.error);
