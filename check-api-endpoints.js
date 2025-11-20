// Check available API endpoints and their data
async function checkAPIEndpoints() {
  try {
    console.log('🔍 Checking available API endpoints...\n');
    
    const endpoints = [
      '/api/platform/stats',
      '/api/organizations',
      '/api/tournaments/all', 
      '/api/teams/all'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`📡 Testing ${endpoint}:`);
      
      try {
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            console.log(`  ✅ Returns array with ${data.length} items`);
            if (data.length > 0) {
              console.log(`  📋 Sample item keys: ${Object.keys(data[0]).join(', ')}`);
            }
          } else if (data.data && Array.isArray(data.data)) {
            console.log(`  ✅ Returns object with data array (${data.data.length} items)`);
            if (data.data.length > 0) {
              console.log(`  📋 Sample item keys: ${Object.keys(data.data[0]).join(', ')}`);
            }
          } else {
            console.log(`  ✅ Returns object with keys: ${Object.keys(data).join(', ')}`);
          }
        } else {
          console.log(`  ❌ Failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAPIEndpoints();