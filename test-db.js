import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");
    
    // Try to connect and run a simple query
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    
    console.log("✅ Supabase connection successful!");
    console.log("Current time from database:", result.rows[0].current_time);
    
    // Test if we can see tables
    const client2 = await pool.connect();
    const tablesResult = await client2.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 10
    `);
    client2.release();
    
    console.log("Available tables:", tablesResult.rows.map(r => r.table_name));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Supabase connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();