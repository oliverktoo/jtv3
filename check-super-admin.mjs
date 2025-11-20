import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wpljtrixyqwjhgdzxlbg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbGp0cml4eXF3amhnZHp4bGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNTU4MjcsImV4cCI6MjA0OTkzMTgyN30.r7lYunFmxYK_zyU9yTvwOVxUCPQ7s8d2sY5DnmZdWQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  try {
    console.log('🔍 Checking for user: oliverkiptook@gmail.com\n');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'oliverkiptook@gmail.com')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ User NOT FOUND');
        console.log('\nThe email oliverkiptook@gmail.com does not exist in the database.');
        console.log('\n📝 To create this account:');
        console.log('1. Visit: http://localhost:5173/auth/signup');
        console.log('2. Fill in your details');
        console.log('3. Use email: oliverkiptook@gmail.com');
        console.log('4. After signup, run this script again to make you super admin');
      } else {
        throw error;
      }
      return;
    }
    
    console.log('✅ User FOUND!\n');
    console.log('User Details:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  First Name:', user.first_name || 'Not set');
    console.log('  Last Name:', user.last_name || 'Not set');
    console.log('  Is Super Admin:', user.is_super_admin ? '✅ YES' : '❌ NO');
    console.log('  Created:', new Date(user.created_at).toLocaleString());
    
    // Check user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_organization_roles')
      .select(`
        id,
        role,
        org_id,
        organizations (name)
      `)
      .eq('user_id', user.id);
    
    if (!rolesError && roles && roles.length > 0) {
      console.log('\nUser Roles:');
      roles.forEach(r => {
        console.log(`  - ${r.role} in ${r.organizations?.name || 'Unknown Org'}`);
      });
    }
    
    if (!user.is_super_admin) {
      console.log('\n⚠️  This user is NOT a super admin yet.');
      console.log('\n🔧 To make this user a super admin:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Open SQL Editor');
      console.log('3. Run this query:');
      console.log(`\nUPDATE users SET is_super_admin = true WHERE email = 'oliverkiptook@gmail.com';\n`);
    } else {
      console.log('\n🎉 This user is already a SUPER ADMIN!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkUser();
