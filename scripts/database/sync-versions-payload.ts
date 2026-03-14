
import { getPayload } from 'payload'
import config from '../../payload.config'

async function run() {
  const payload = await getPayload({ config })
  
  const collections = ['colleges', 'posts', 'timeline'] as const;

  for (const collectionName of collections) {
    console.log(`Syncing ${collectionName}...`);
    
    const docs = await payload.find({
      collection: collectionName,
      limit: 1000,
      pagination: false,
    });

    console.log(`Found ${docs.docs.length} documents in ${collectionName}.`);

    for (const doc of docs.docs) {
      try {
        // Updating the document (even with same data) should trigger version creation 
        // if versions are enabled in the collection config.
        await payload.update({
          collection: collectionName,
          id: doc.id,
          data: {
            ...doc,
          },
          // Ensure we don't accidentally revert to draft if they were effectively published
          autosave: false, 
        });
        console.log(`  Updated doc ${doc.id}`);
      } catch (err: any) {
        console.error(`  Error updating doc ${doc.id}:`, err.message);
      }
    }
    console.log(`Finished ${collectionName}.`);
  }

  process.exit(0);
}

run().catch(console.error);
