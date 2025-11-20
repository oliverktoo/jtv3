// Check what data the platform stats endpoint returns
async function checkPlatformStats() {
  try {
    console.log('🔍 Checking platform stats endpoint...\n');
    
    const response = await fetch('http://127.0.0.1:5000/api/platform/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const stats = await response.json();
    
    console.log('📊 Platform Statistics:');
    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n📋 Available Data Fields:');
    Object.keys(stats).forEach(key => {
      console.log(`  - ${key}: ${stats[key]}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPlatformStats();