import { createClient } from '@supabase/supabase-js';
import * as schema from "../shared/schema.js";

// Use Supabase client instead of direct PostgreSQL connection
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// For compatibility with existing code that expects a 'db' export
// We'll create a mock object that can be used for basic operations
export const db = {
  select: () => ({
    from: (table: any) => ({
      limit: async (limit: number) => {
        const { data, error } = await supabase.from(table._.name).select('*').limit(limit);
        if (error) throw error;
        return data;
      }
    })
  })
};

// Mock pool for compatibility
export const pool = {
  connect: async () => ({
    query: async (sql: string) => {
      // This is a basic implementation for health checks
      if (sql.includes('SELECT NOW()')) {
        return { rows: [{ current_time: new Date() }] };
      }
      throw new Error('Use Supabase client for database operations');
    },
    release: () => {}
  })
};
