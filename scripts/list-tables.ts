
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.odahbrkrhaturgyiuutu:***REMOVED***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  await client.connect();

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'payload'
    ORDER BY table_name;
  `);

  fs.writeFileSync('d:\\codes\\rwbjee\\payload-tables.txt', JSON.stringify(res.rows, null, 2));
  console.log('Tables listed in payload-tables.txt');

  await client.end();
}

run().catch(console.error);
