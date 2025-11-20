import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://wpljtrixyqwjhgdzxlbg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbGp0cml4eXF3amhnZHp4bGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNTU4MjcsImV4cCI6MjA0OTkzMTgyN30.r7lYunFmxYK_zyU9yTvwOVxUCPQ7s8d2sY5DnmZdWQM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSuperAdminColumn() {
  try {
    console.log('🔧 Adding is_super_admin column to users table...\n');
    
    // Execute the SQL to add column and update user
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add is_super_admin column if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_super_admin'
          ) THEN
            ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
            RAISE NOTICE 'Column is_super_admin added';
          ELSE
            RAISE NOTICE 'Column is_super_admin already exists';
          END IF;
        END $$;
        
        -- Update oliverkiptook@gmail.com to super admin
        UPDATE users 
        SET is_super_admin = true 
        WHERE email = 'oliverkiptook@gmail.com';
      `
    });

    if (error) {
      console.log('⚠️  RPC function not available. Using direct table operations...\n');
      
      // Try direct approach - attempt update (will fail if column doesn't exist)
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ is_super_admin: true })
        .eq('email', 'oliverkiptook@gmail.com')
        .select();

      if (updateError) {
        console.log('❌ Column does not exist. Please run this SQL in Supabase Dashboard:\n');
        console.log('1. Go to: https://supabase.com/dashboard/project/wpljtrixyqwjhgdzxlbg/editor');
        console.log('2. Open SQL Editor');
        console.log('3. Run this SQL:\n');
        
        const sql = fs.readFileSync('add-super-admin-column.sql', 'utf-8');
        console.log(sql);
        console.log('\n4. Then run this script again.\n');
        return;
      }

      console.log('✅ User updated successfully!');
      console.log('Updated user:', updateData[0]);
      return;
    }

    console.log('✅ Migration completed!');
    
    // Verify the update
    const { data: user, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'oliverkiptook@gmail.com')
      .single();

    if (verifyError) throw verifyError;

    console.log('\n👤 User Status:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.first_name, user.last_name);
    console.log('  Super Admin:', user.is_super_admin ? '✅ YES' : '❌ NO');
    console.log('\n🎉 oliverkiptook@gmail.com is now a SUPER ADMIN!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Manual Steps:');
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and run the SQL from add-super-admin-column.sql\n');
  }
}

addSuperAdminColumn();
