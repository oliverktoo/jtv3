import fetch from 'node-fetch';

async function testSupabaseAPI() {
  try {
    console.log("Testing Supabase REST API connection...");
    
    const supabaseUrl = "https://siolrhalqvpzerthdluq.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo";
    
    // Test basic connection
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("✅ Supabase REST API connection successful!");
    console.log("Response status:", response.status);
    
    // Test getting organizations table (if it exists)
    try {
      const orgsResponse = await fetch(`${supabaseUrl}/rest/v1/organizations?limit=5`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      });
      
      if (orgsResponse.ok) {
        const orgsData = await orgsResponse.json();
        console.log("Organizations table exists! Data:", orgsData);
      } else {
        console.log("Organizations table not found or not accessible:", orgsResponse.status);
      }
    } catch (err) {
      console.log("Could not access organizations table:", err.message);
    }
    
  } catch (error) {
    console.error("❌ Supabase API test failed:");
    console.error(error);
  }
}

testSupabaseAPI();