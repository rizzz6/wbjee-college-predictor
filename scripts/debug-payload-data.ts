import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.odahbrkrhaturgyiuutu:***REMOVED***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  });
  await client.connect();

  let output = '';

  output += '--- USERS ---\n';
  const users = await client.query('SELECT id, email, role FROM payload.users');
  output += JSON.stringify(users.rows, null, 2) + '\n';

  output += '\n--- COLLEGES STATUS ---\n';
  const colleges = await client.query('SELECT _status, count(*) FROM payload.colleges GROUP BY _status');
  output += JSON.stringify(colleges.rows, null, 2) + '\n';

  output += '\n--- POSTS STATUS ---\n';
  const posts = await client.query('SELECT _status, count(*) FROM payload.posts GROUP BY _status');
  output += JSON.stringify(posts.rows, null, 2) + '\n';

  fs.writeFileSync('d:\\codes\\rwbjee\\debug-db-output.txt', output);
  console.log('Output written to debug-db-output.txt');

  await client.end();
}

run().catch(console.error);
