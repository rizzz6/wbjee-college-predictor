/**
 * Clear Supabase Data Script
 * 
 * WARNING: This deletes ALL cutoff data from Supabase!
 * Use this before importing fresh data.
 * 
 * Usage:
 *   npm run clear:supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

async function clearSupabase() {
    console.log('⚠️  CLEAR SUPABASE DATA\n');

    // Validate environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
        console.error('❌ Missing Supabase credentials');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // Check current count
        const { count } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (!count || count === 0) {
            console.log('✅ Database is already empty. Nothing to clear.\n');
            return;
        }

        console.log(`📊 Found ${count.toLocaleString()} records in database\n`);
        console.log('⚠️  This will DELETE ALL cutoff data!');
        console.log('⚠️  This action CANNOT be undone!\n');

        // Create readline interface for confirmation
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const answer = await new Promise<string>((resolve) => {
            rl.question('Type "DELETE" to confirm: ', (ans) => {
                rl.close();
                resolve(ans);
            });
        });

        if (answer.trim() !== 'DELETE') {
            console.log('\n🛑 Cancelled. No data was deleted.\n');
            return;
        }

        console.log('\n🗑️  Deleting all records...');

        const { error } = await supabase
            .from('cutoffs')
            .delete()
            .neq('id', 0); // Delete all rows (PostgreSQL always has id > 0)

        if (error) {
            console.error('❌ Delete failed:', error);
            throw error;
        }

        // Verify deletion
        const { count: finalCount } = await supabase
            .from('cutoffs')
            .select('*', { count: 'exact', head: true });

        if (finalCount === 0) {
            console.log('✅ All data deleted successfully!\n');
            console.log('📝 Next steps:');
            console.log('   1. Export fresh CSV from Google Sheets');
            console.log('   2. Run: npm run import:csv\n');
        } else {
            console.log(`⚠️  Warning: ${finalCount} records remaining`);
        }

    } catch (error) {
        console.error('\n❌ Operation failed:', error);
        process.exit(1);
    }
}

clearSupabase().catch(console.error);
