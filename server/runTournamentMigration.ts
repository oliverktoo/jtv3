import { readFileSync } from 'fs';
import { pool } from './db.js';

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting tournament participation model migration...');
    
    // Read the migration SQL
    const migrationSQL = readFileSync('./migrations/0001_tournament_participation_model.sql', 'utf8');
    
    console.log('📋 Migration SQL loaded');
    
    // Run the migration in a transaction
    await client.query('BEGIN');
    
    console.log('🏁 Executing migration...');
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const result = await client.query(`
      SELECT 
        column_name, 
        is_nullable, 
        data_type,
        column_default
      FROM information_schema.columns 
      WHERE table_name IN ('tournaments', 'teams') 
        AND column_name IN ('participation_model', 'org_id')
      ORDER BY table_name, column_name;
    `);
    
    console.log('📊 Schema verification:');
    result.rows.forEach(row => {
      console.log(`  ${row.table_name}.${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check tournament participation models were set
    const tournamentCheck = await client.query(`
      SELECT 
        tournament_model, 
        participation_model, 
        COUNT(*) as count 
      FROM tournaments 
      GROUP BY tournament_model, participation_model 
      ORDER BY tournament_model;
    `);
    
    console.log('\n🏆 Tournament participation models:');
    tournamentCheck.rows.forEach(row => {
      console.log(`  ${row.tournament_model}: ${row.participation_model} (${row.count} tournaments)`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);