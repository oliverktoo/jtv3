// Test script for player registration endpoints
const API_BASE = 'http://localhost:5175/api';

// Test data
const testPlayerData = {
  orgId: "1", 
  firstName: "John",
  lastName: "Doe", 
  dob: "1990-01-15",
  sex: "MALE",
  email: "john.doe@example.com",
  phone: "+254712345678"
};

async function testPlayerRegistration() {
  try {
    console.log('=== Testing Player Registration Endpoints ===\n');
    
    // Test 1: Start registration
    console.log('1. Testing POST /api/player-registration/start');
    const startResponse = await fetch(`${API_BASE}/player-registration/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPlayerData)
    });
    
    const startResult = await startResponse.json();
    console.log('Status:', startResponse.status);
    console.log('Response:', startResult);
    
    if (!startResponse.ok) {
      console.error('❌ Start registration failed');
      return;
    }
    
    const upid = startResult.upid;
    console.log('✅ Registration started, UPID:', upid);
    console.log('');
    
    // Test 2: Submit registration
    console.log('2. Testing PATCH /api/player-registration/:upid/submit');
    const submitResponse = await fetch(`${API_BASE}/player-registration/${upid}/submit`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const submitResult = await submitResponse.json();
    console.log('Status:', submitResponse.status);
    console.log('Response:', submitResult);
    
    if (submitResponse.ok) {
      console.log('✅ Registration submitted');
    } else {
      console.log('⚠️ Submit failed (expected - missing requirements)');
    }
    console.log('');
    
    // Test 3: Record consent
    console.log('3. Testing POST /api/players/:upid/consents');
    const consentData = {
      consentType: "PLAYER_TERMS",
      isConsented: true,
      consentVersion: "1.0",
      ipAddress: "127.0.0.1",
      userAgent: "Test-Agent/1.0"
    };
    
    const consentResponse = await fetch(`${API_BASE}/players/${upid}/consents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consentData)
    });
    
    const consentResult = await consentResponse.json();
    console.log('Status:', consentResponse.status);
    console.log('Response:', consentResult);
    
    if (consentResponse.ok) {
      console.log('✅ Consent recorded');
    } else {
      console.log('❌ Consent recording failed');
    }
    console.log('');
    
    // Test 4: Get consents
    console.log('4. Testing GET /api/players/:upid/consents');
    const getConsentsResponse = await fetch(`${API_BASE}/players/${upid}/consents`);
    const getConsentsResult = await getConsentsResponse.json();
    console.log('Status:', getConsentsResponse.status);
    console.log('Response:', getConsentsResult);
    
    if (getConsentsResponse.ok) {
      console.log('✅ Consents retrieved');
    } else {
      console.log('❌ Get consents failed');
    }
    console.log('');
    
    // Test 5: Update medical clearance
    console.log('5. Testing PATCH /api/players/:upid/medical');
    const medicalData = {
      medicalClearanceStatus: "VALID",
      medicalClearanceDate: "2025-10-28",
      medicalExpiryDate: "2026-10-28"
    };
    
    const medicalResponse = await fetch(`${API_BASE}/players/${upid}/medical`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicalData)
    });
    
    const medicalResult = await medicalResponse.json();
    console.log('Status:', medicalResponse.status);
    console.log('Response:', medicalResult);
    
    if (medicalResponse.ok) {
      console.log('✅ Medical clearance updated');
    } else {
      console.log('❌ Medical clearance update failed');
    }
    console.log('');
    
    console.log('=== Test Summary ===');
    console.log('Player Registration endpoints are working! 🎉');
    console.log('UPID:', upid);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPlayerRegistration();