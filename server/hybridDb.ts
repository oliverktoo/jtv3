import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { createClient } from '@supabase/supabase-js';
import * as schema from "../shared/schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Primary database connection via PostgreSQL
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool, { schema });

// Fallback Supabase client for when direct connection fails
export const supabase = createClient(
  'https://siolrhalqvpzerthdluq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
);

// Test connection function
export async function testConnection() {
  try {
    // Try direct PostgreSQL connection first
    const result = await db.select().from(schema.organizations).limit(1);
    console.log('✅ Direct PostgreSQL connection working');
    return { method: 'postgresql', success: true, data: result };
  } catch (error) {
    console.log('⚠️ PostgreSQL connection failed, trying Supabase client...');
    
    try {
      // Fallback to Supabase client
      const { data, error: supabaseError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
      
      if (supabaseError) throw supabaseError;
      
      console.log('✅ Supabase client connection working');
      return { method: 'supabase', success: true, data };
    } catch (supabaseError) {
      console.error('❌ Both PostgreSQL and Supabase connections failed');
      return { method: 'none', success: false, error: supabaseError };
    }
  }
}

// Hybrid query function that tries PostgreSQL first, then Supabase
export async function hybridQuery(
  tableSchema: any,
  drizzleQueryFn: (db: any) => any,
  supabaseSql: string
): Promise<any[]> {
  try {
    // Try direct PostgreSQL with Drizzle first
    const result = await drizzleQueryFn(db);
    console.log(`✅ PostgreSQL query successful`);
    return result;
  } catch (pgError) {
    console.log(`⚠️ PostgreSQL query failed, falling back to Supabase REST API`);
    
    try {
      // For now, let's use a simple select all from the table name
      // Extract table name from the schema object
      const tableName = tableSchema._.name || tableSchema.tableName || 'organizations';
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      
      console.log(`✅ Supabase REST API query successful for ${tableName}`);
      return data || [];
    } catch (supabaseError) {
      console.error('❌ Both PostgreSQL and Supabase queries failed:', supabaseError);
      throw supabaseError;
    }
  }
}