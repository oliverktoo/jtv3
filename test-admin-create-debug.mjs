import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testAdminCreate() {
  console.log('🧪 Testing admin creation endpoint...\n');

  const adminData = {
    email: `test.admin.${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'Admin',
    role: 'ORG_ADMIN',
    organizationName: `Test Tournament ${Date.now()}`,
    isSuperAdmin: false
  };

  console.log('📤 Sending request:', JSON.stringify(adminData, null, 2));

  try {
    const response = await fetch(`${API_BASE}/admin/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    console.log(`\n📥 Response status: ${response.status}`);
    
    const data = await response.json();
    console.log('📥 Response body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Admin created successfully!');
    } else {
      console.log('\n❌ Admin creation failed');
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testAdminCreate();
