
import pg from 'pg';
const { Client } = pg;
import fs from 'fs';

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.odahbrkrhaturgyiuutu:***REMOVED***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  await client.connect();

  let output = '--- TABLE COUNTS ---\n';
  
  const tables = ['colleges', '_colleges_v', 'posts', '_posts_v', 'timeline', '_timeline_v'];
  
  for (const table of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM payload."${table}"`);
      output += `${table}: ${res.rows[0].count}\n`;
    } catch (e: any) {
      output += `${table}: ERROR ${e.message}\n`;
    }
  }

  fs.writeFileSync('d:\\codes\\rwbjee\\debug-counts.txt', output);
  console.log('Counts written to debug-counts.txt');

  await client.end();
}

run().catch(console.error);
