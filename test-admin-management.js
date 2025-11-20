/**
 * Test Admin Management Endpoints
 * 
 * Tests the complete admin creation and management workflow
 */

const BASE_URL = 'http://localhost:5000';

// Helper function for API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const result = await response.json();
  
  return { status: response.status, data: result };
}

// Test data
const testAdmin1 = {
  email: 'orgadmin@test-league.ke',
  password: 'SecurePass123',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'ORG_ADMIN',
  organizationName: 'Test County League',
  isSuperAdmin: false
};

const testAdmin2 = {
  email: 'registrar@test-league.ke',
  password: 'SecurePass456',
  firstName: 'Peter',
  lastName: 'Kimani',
  role: 'REGISTRAR',
  organizationName: 'Test County League',
  isSuperAdmin: false
};

const testAdmin3 = {
  email: 'compmanager@test-league.ke',
  password: 'SecurePass789',
  firstName: 'Mary',
  lastName: 'Wanjiku',
  role: 'COMPETITION_MANAGER',
  organizationName: 'Test County League',
  isSuperAdmin: false
};

async function runTests() {
  console.log('🧪 Starting Admin Management Tests\n');
  
  // Test 1: Create Organization Admin
  console.log('Test 1: Create Organization Admin');
  console.log('=====================================');
  const result1 = await apiCall('POST', '/api/admin/create', testAdmin1);
  console.log(`Status: ${result1.status}`);
  console.log(`Success: ${result1.data.success}`);
  if (result1.data.success) {
    console.log(`✅ Created admin: ${result1.data.data.user.email}`);
    console.log(`   Organization: ${result1.data.data.organization.name}`);
    console.log(`   Role: ${result1.data.data.role}`);
  } else {
    console.log(`❌ Error: ${result1.data.error}`);
  }
  console.log('');
  
  // Test 2: Create Registrar
  console.log('Test 2: Create Registrar');
  console.log('=====================================');
  const result2 = await apiCall('POST', '/api/admin/create', testAdmin2);
  console.log(`Status: ${result2.status}`);
  console.log(`Success: ${result2.data.success}`);
  if (result2.data.success) {
    console.log(`✅ Created admin: ${result2.data.data.user.email}`);
    console.log(`   Role: ${result2.data.data.role}`);
  } else {
    console.log(`❌ Error: ${result2.data.error}`);
  }
  console.log('');
  
  // Test 3: Create Competition Manager
  console.log('Test 3: Create Competition Manager');
  console.log('=====================================');
  const result3 = await apiCall('POST', '/api/admin/create', testAdmin3);
  console.log(`Status: ${result3.status}`);
  console.log(`Success: ${result3.data.success}`);
  if (result3.data.success) {
    console.log(`✅ Created admin: ${result3.data.data.user.email}`);
    console.log(`   Role: ${result3.data.data.role}`);
  } else {
    console.log(`❌ Error: ${result3.data.error}`);
  }
  console.log('');
  
  // Test 4: List All Admins
  console.log('Test 4: List All Admins');
  console.log('=====================================');
  const result4 = await apiCall('GET', '/api/admin/list');
  console.log(`Status: ${result4.status}`);
  console.log(`Success: ${result4.data.success}`);
  if (result4.data.success) {
    console.log(`✅ Found ${result4.data.data.length} admins:`);
    result4.data.data.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.firstName} ${admin.lastName} (${admin.email})`);
      console.log(`      Role: ${admin.role}`);
      console.log(`      Organization: ${admin.organizationName}`);
      console.log(`      Super Admin: ${admin.isSuperAdmin ? 'Yes' : 'No'}`);
    });
  } else {
    console.log(`❌ Error: ${result4.data.error}`);
  }
  console.log('');
  
  // Test 5: Try to create duplicate (should fail)
  console.log('Test 5: Duplicate Email Validation');
  console.log('=====================================');
  const result5 = await apiCall('POST', '/api/admin/create', testAdmin1);
  console.log(`Status: ${result5.status}`);
  console.log(`Success: ${result5.data.success}`);
  if (result5.status === 400 && !result5.data.success) {
    console.log(`✅ Correctly rejected duplicate: ${result5.data.error}`);
  } else {
    console.log(`❌ Should have rejected duplicate email`);
  }
  console.log('');
  
  // Test 6: Promote to Super Admin
  console.log('Test 6: Promote to Super Admin');
  console.log('=====================================');
  const result6 = await apiCall('POST', '/api/users/make-super-admin', {
    email: testAdmin1.email
  });
  console.log(`Status: ${result6.status}`);
  console.log(`Success: ${result6.data.success}`);
  if (result6.data.success) {
    console.log(`✅ Promoted ${testAdmin1.email} to Super Admin`);
  } else {
    console.log(`❌ Error: ${result6.data.error}`);
  }
  console.log('');
  
  // Test 7: Verify super admin in list
  console.log('Test 7: Verify Super Admin Status');
  console.log('=====================================');
  const result7 = await apiCall('GET', '/api/admin/list');
  if (result7.data.success) {
    const superAdmin = result7.data.data.find(a => a.email === testAdmin1.email);
    if (superAdmin && superAdmin.isSuperAdmin) {
      console.log(`✅ ${superAdmin.email} is now a Super Admin`);
    } else {
      console.log(`❌ Super Admin status not reflected`);
    }
  }
  console.log('');
  
  // Test 8: Test login for created admin
  console.log('Test 8: Test Admin Login');
  console.log('=====================================');
  const result8 = await apiCall('POST', '/api/auth/login', {
    email: testAdmin2.email,
    password: testAdmin2.password
  });
  console.log(`Status: ${result8.status}`);
  console.log(`Success: ${result8.data.success}`);
  if (result8.data.success) {
    console.log(`✅ Admin logged in successfully`);
    console.log(`   Token: ${result8.data.token.substring(0, 20)}...`);
    console.log(`   User: ${result8.data.user.firstName} ${result8.data.user.lastName}`);
  } else {
    console.log(`❌ Error: ${result8.data.error}`);
  }
  console.log('');
  
  console.log('🎉 Admin Management Tests Complete!');
  console.log('=====================================');
  console.log(`Total tests: 8`);
  console.log(`Backend: ${BASE_URL}`);
  console.log(`Frontend: http://localhost:5174`);
  console.log('\n📝 Next Steps:');
  console.log('1. Open http://localhost:5174 in browser');
  console.log('2. Login with oliverkiptook@gmail.com');
  console.log('3. Navigate to Admin Management tab');
  console.log('4. Create and manage admins through UI');
}

// Run tests
runTests().catch(console.error);
