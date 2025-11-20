// Quick test of consent endpoint
import fetch from 'node-fetch';

async function testConsentEndpoint() {
    const playerId = '21ae4513-72b2-4e79-a841-12f83762be45';
    
    const consentData = {
        consentType: 'data_processing',
        granted: true,
        grantedAt: new Date().toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Test-Agent'
    };
    
    try {
        console.log('🧪 Testing consent endpoint...');
        const response = await fetch(`http://127.0.0.1:5000/api/player-registration/${playerId}/consent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consentData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Consent SUCCESS!');
            console.log('Message:', result.message);
            console.log('Consent ID:', result.data.id);
        } else {
            console.log('❌ Consent FAILED!');
            console.log('Error:', result.error);
        }
    } catch (error) {
        console.log('❌ Network error:', error.message);
    }
}

testConsentEndpoint();