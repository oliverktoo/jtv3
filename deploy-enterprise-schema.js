import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🚀 Deploying Enterprise Fixture System Database Schema...');
console.log('');

// Core enterprise tables that we need for the fixture system
const sqlStatements = [
  // Fixture generations table
  `CREATE TABLE IF NOT EXISTS fixture_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    generation_method VARCHAR(50) NOT NULL,
    config JSONB NOT NULL,
    total_rounds INTEGER,
    total_matches INTEGER,
    derby_matches INTEGER,
    optimization_score NUMERIC(10,2),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by UUID,
    status VARCHAR(20) DEFAULT 'draft',
    validation_results JSONB,
    CONSTRAINT check_positive_counts CHECK (
      total_rounds >= 0 AND total_matches >= 0 AND derby_matches >= 0
    )
  )`,

  // Stadium availability table
  `CREATE TABLE IF NOT EXISTS stadium_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stadium_id UUID REFERENCES stadiums(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    available BOOLEAN DEFAULT true,
    booking_type VARCHAR(50),
    booking_reference UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_valid_time_range CHECK (start_time < end_time)
  )`,

  // Match officials table
  `CREATE TABLE IF NOT EXISTS match_officials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    official_type VARCHAR(50) NOT NULL,
    official_name VARCHAR(255) NOT NULL,
    official_license VARCHAR(100),
    contact_info JSONB,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID
  )`,

  // Critical indexes
  `CREATE INDEX IF NOT EXISTS idx_fixture_generations_tournament ON fixture_generations(tournament_id)`,
  `CREATE INDEX IF NOT EXISTS idx_fixture_generations_status ON fixture_generations(status)`,
  `CREATE INDEX IF NOT EXISTS idx_stadium_availability_date ON stadium_availability(stadium_id, date)`,
  `CREATE INDEX IF NOT EXISTS idx_match_officials_match ON match_officials(match_id)`,
  `CREATE INDEX IF NOT EXISTS idx_matches_tournament_status ON matches(tournament_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date)`,
  `CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(tournament_id, match_round)`
];

async function deploySchema() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const statementName = sql.split(' ')[2] || `Statement ${i + 1}`;
    
    try {
      console.log(`📝 Executing: ${statementName}...`);
      
      // Execute SQL using raw query
      const { data, error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        console.log(`❌ ${statementName} - Error: ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${statementName} - Success`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${statementName} - Exception: ${err.message}`);
      errorCount++;
    }
    
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('📊 Deployment Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📈 Total: ${sqlStatements.length}`);
  
  if (errorCount === 0) {
    console.log('');
    console.log('🎉 Enterprise database schema deployed successfully!');
    console.log('🏢 Ready for professional fixture generation');
  } else {
    console.log('');
    console.log('⚠️  Some statements failed - check Supabase dashboard for manual execution');
  }
}

deploySchema().catch(console.error);