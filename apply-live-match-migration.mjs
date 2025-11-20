/**
 * Apply Live Match Features Migration
 * Creates match_events and match_statistics tables in Supabase
 * 
 * Run: node apply-live-match-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Starting live match features migration...\n');

async function applyMigration() {
  try {
    // Read migration SQL file
    const migrationPath = join(__dirname, 'migrations', 'live_match_features.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📖 Read migration file: migrations/live_match_features.sql');
    console.log(`   File size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`);

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^DO \$\$ BEGIN.*END \$\$$/s));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and DO blocks (they don't work well with Supabase client)
      if (statement.startsWith('--') || 
          statement.startsWith('/*') || 
          statement.includes('DO $$') ||
          statement.includes('RAISE NOTICE')) {
        continue;
      }

      try {
        console.log(`⚙️  Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some errors are acceptable (e.g., table already exists)
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist')) {
            console.log(`   ⚠️  Skipped: ${error.message.substring(0, 60)}...`);
          } else {
            throw error;
          }
        } else {
          successCount++;
          console.log('   ✅ Success');
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error: ${error.message.substring(0, 100)}`);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Summary:');
    console.log(`   Total statements: ${statements.length}`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`${'='.repeat(60)}\n`);

    // Verify tables were created
    console.log('🔍 Verifying table creation...\n');

    const { data: matchEventsExists, error: eventsError } = await supabase
      .from('match_events')
      .select('id')
      .limit(1);

    if (eventsError && !eventsError.message.includes('does not exist')) {
      console.log('✅ match_events table exists');
    } else if (!eventsError) {
      console.log('✅ match_events table exists and queryable');
    } else {
      console.log('❌ match_events table not found');
    }

    const { data: matchStatsExists, error: statsError } = await supabase
      .from('match_statistics')
      .select('id')
      .limit(1);

    if (statsError && !statsError.message.includes('does not exist')) {
      console.log('✅ match_statistics table exists');
    } else if (!statsError) {
      console.log('✅ match_statistics table exists and queryable');
    } else {
      console.log('❌ match_statistics table not found');
    }

    console.log('\n✨ Migration process completed!\n');
    console.log('📌 Next steps:');
    console.log('   1. Run: npm run dev:server:working');
    console.log('   2. Run: node test-live-match-features.mjs');
    console.log('   3. Check the test results\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Alternative: Direct SQL execution using Supabase SQL Editor
async function showManualInstructions() {
  console.log('\n📋 MANUAL MIGRATION INSTRUCTIONS\n');
  console.log('If automatic migration fails, follow these steps:\n');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy the contents of: migrations/live_match_features.sql');
  console.log('4. Paste into SQL Editor and run');
  console.log('5. Verify tables created successfully\n');
  console.log('Migration file location:');
  console.log(`   ${join(__dirname, 'migrations', 'live_match_features.sql')}\n`);
}

// Check if we can use direct SQL execution
console.log('⚠️  NOTE: Supabase JS client has limited SQL execution capabilities.\n');
console.log('Recommended approach:');
console.log('1. Use Supabase SQL Editor (Dashboard → SQL Editor)');
console.log('2. Copy contents of migrations/live_match_features.sql');
console.log('3. Execute in SQL Editor\n');
console.log('Or continue with automatic migration (may have limited success)...\n');

// Prompt user
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Continue with automatic migration? (y/n): ', async (answer) => {
  if (answer.toLowerCase() === 'y') {
    rl.close();
    await applyMigration();
  } else {
    rl.close();
    showManualInstructions();
  }
});
