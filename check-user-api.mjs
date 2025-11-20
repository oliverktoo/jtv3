async function checkUser() {
  try {
    console.log('🔍 Checking for user: oliverkiptook@gmail.com\n');
    
    const response = await fetch('http://localhost:5000/api/users/check-email?email=oliverkiptook@gmail.com');
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('❌ User NOT FOUND');
        console.log('\nThe email oliverkiptook@gmail.com does not exist in the database.');
        console.log('\n📝 To create this account:');
        console.log('1. Start frontend: npm run dev');
        console.log('2. Visit: http://localhost:5173/auth/signup');
        console.log('3. Fill in:');
        console.log('   - First Name: Oliver');
        console.log('   - Last Name: Kiptoo');
        console.log('   - Email: oliverkiptook@gmail.com');
        console.log('   - Organization Name: (your organization)');
        console.log('   - Role: ORG_ADMIN');
        console.log('   - Password: (your password)');
        console.log('\n4. After signup, I will update you to SUPER_ADMIN in the database');
        return;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    const user = result.data;
    
    console.log('✅ User FOUND!\n');
    console.log('User Details:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  First Name:', user.firstName || 'Not set');
    console.log('  Last Name:', user.lastName || 'Not set');
    console.log('  Is Super Admin:', user.isSuperAdmin ? '✅ YES' : '❌ NO');
    console.log('  Created:', new Date(user.createdAt).toLocaleString());
    
    if (user.roles && user.roles.length > 0) {
      console.log('\nUser Roles:');
      user.roles.forEach(r => {
        console.log(`  - ${r.role} in ${r.organization?.name || 'Unknown Org'}`);
      });
    }
    
    if (!user.isSuperAdmin) {
      console.log('\n⚠️  This user is NOT a super admin yet.');
      console.log('\n🔧 Making user SUPER ADMIN...');
      
      // Update to super admin
      const updateResponse = await fetch('http://localhost:5000/api/users/make-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'oliverkiptook@gmail.com' })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Successfully updated to SUPER ADMIN!');
        console.log('\n🎉 oliverkiptook@gmail.com is now a SUPER ADMIN!');
        console.log('\nYou can now log in with full system access.');
      } else {
        console.log('❌ Failed to update. Please run this SQL in Supabase:');
        console.log(`\nUPDATE users SET is_super_admin = true WHERE email = 'oliverkiptook@gmail.com';\n`);
      }
    } else {
      console.log('\n🎉 This user is already a SUPER ADMIN!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.log('\n⚠️  Backend server is not running!');
      console.log('Please start the server first:');
      console.log('  npm run dev:server:working');
    }
  }
}

checkUser();
