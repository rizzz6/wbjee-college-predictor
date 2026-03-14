import { getPayload } from 'payload'
import config from '../payload.config'
import fs from 'fs'

async function run() {
  const payload = await getPayload({ config })
  
  let output = '--- PAYLOAD FIND TEST ---\n';
  
  try {
    const colleges = await payload.find({
      collection: 'colleges',
      limit: 5,
    });
    output += `COLLEGES: totalDocs=${colleges.totalDocs}, docsCount=${colleges.docs.length}\n`;
    output += JSON.stringify(colleges.docs.map(d => ({ id: d.id, name: d.name, _status: (d as any)._status })), null, 2) + '\n';
  } catch (e: any) {
    output += `COLLEGES ERROR: ${e.message}\n`;
  }

  try {
    const posts = await payload.find({
      collection: 'posts',
      limit: 5,
    });
    output += `\nPOSTS: totalDocs=${posts.totalDocs}, docsCount=${posts.docs.length}\n`;
    output += JSON.stringify(posts.docs.map(d => ({ id: d.id, title: d.title, _status: (d as any)._status })), null, 2) + '\n';
  } catch (e: any) {
    output += `POSTS ERROR: ${e.message}\n`;
  }

  fs.writeFileSync('d:\\codes\\rwbjee\\payload-find-test.txt', output);
  console.log('Results written to payload-find-test.txt');
  process.exit(0);
}

run().catch(console.error);
