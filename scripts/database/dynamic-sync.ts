
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { Client } = pg;

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URI,
  });
  await client.connect();

  console.log('--- DYNAMIC VERSION SYNC ---');

  const mappings = [
    { main: 'colleges', version: '_colleges_v' },
    { main: 'posts', version: '_posts_v' },
    { main: 'timeline', version: '_timeline_v' }
  ];

  for (const m of mappings) {
    console.log(`Processing ${m.main}...`);
    
    // 1. Get main columns
    const mainColsRes = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'payload' AND table_name = '${m.main}'
    `);
    const mainCols = mainColsRes.rows.map(r => r.column_name);
    
    // 2. Get version columns
    const vColsRes = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'payload' AND table_name = '${m.version}'
    `);
    const vCols = vColsRes.rows.map(r => r.column_name);

    // 3. Match columns
    // We want parent_id = id
    // version_xyz = xyz
    // updated_at = updated_at
    // created_at = created_at
    // latest = true
    // autosave = false
    
    // 3. Find enum columns
    const enumColsRes = await client.query(`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'payload' AND table_name = '${m.main}'
      AND (data_type = 'USER-DEFINED' OR udt_name LIKE 'enum_%')
    `);
    const enumCols = enumColsRes.rows.map(r => r.column_name);
    console.log(`  Found enum columns: ${enumCols.join(', ')}`);

    // 4. Match columns
    const insertCols: string[] = ['parent_id', 'latest', 'autosave'];
    const selectExprs: string[] = ['id', 'true', 'false'];

    for (const col of mainCols) {
      if (col === 'id') continue;
      
      const vCol = vCols.find(v => v === `version_${col}` || v === col);
      if (vCol) {
        insertCols.push(`"${vCol}"`);
        if (enumCols.includes(col)) {
          // Cast status to the version-specific enum type
          // Payload v3 sometimes names them differently (double underscores etc)
          // We'll try to find the exact enum type if needed, but the pattern is usually consistent.
          // Let's use a subquery or just a simple guess based on our previous enum-check.txt
          let targetEnum = `enum_${m.version}_version_${col.replace(/^_/, '')}`;
          if (col === '_status') targetEnum = `enum_${m.version}_version_status`;
          
          selectExprs.push(`"${col}"::text::"payload"."${targetEnum}"`);
        } else {
          selectExprs.push(`"${col}"`);
        }
      }
    }

    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM "payload"."${m.version}"`);
      
      const sql = `
        INSERT INTO "payload"."${m.version}" (${insertCols.join(', ')})
        SELECT ${selectExprs.join(', ')}
        FROM "payload"."${m.main}"
      `;
      // Fix double dot again
      const fixedSql = sql.replace('"payload"..', '"payload".');
      
      const res = await client.query(fixedSql);
      console.log(`  Synced ${res.rowCount} records.`);
      await client.query('COMMIT');
    } catch (err: unknown) {
      await client.query('ROLLBACK');
      console.error(`  Error syncing ${m.main}:`, (err as Error).message);
    }
  }

  await client.end();
}

run().catch(console.error);
