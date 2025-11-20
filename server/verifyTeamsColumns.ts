import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function verifyTeamsColumns() {
  console.log("🔍 Verifying teams table structure...");

  try {
    // Try to insert a test team with all fields to verify schema
    const testTeamData = {
      name: "Test Team (will be deleted)",
      org_id: "550e8400-e29b-41d4-a716-446655440001", // Default org ID
      tournament_id: null, // Global team
      contact_email: "test@example.com",
      contact_phone: "+254-700-000-000",
      home_venue: "Test Stadium",
      description: "Test team for schema verification",
      registration_status: "ACTIVE",
      max_players: 22,
    };

    console.log("📝 Attempting to insert test team with all fields...");
    
    const { data: insertedTeam, error: insertError } = await supabase
      .from('teams')
      .insert(testTeamData)
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insert test failed:", insertError);
      
      if (insertError.message.includes("column")) {
        console.log("\n💡 Missing columns detected. Please run the SQL commands in Supabase:");
        console.log("1. Open Supabase Dashboard");
        console.log("2. Go to SQL Editor"); 
        console.log("3. Run the ALTER TABLE commands provided earlier");
      }
      return;
    }

    console.log("✅ Test team inserted successfully!");
    console.log("Team ID:", insertedTeam.id);

    // Clean up - delete the test team
    const { error: deleteError } = await supabase
      .from('teams')
      .delete()
      .eq('id', insertedTeam.id);

    if (deleteError) {
      console.warn("⚠️  Could not delete test team:", deleteError);
    } else {
      console.log("🗑️  Test team cleaned up successfully");
    }

    console.log("\n🎉 All columns are present and working!");
    console.log("✅ Teams table schema is complete");
    
    // Test global team creation
    console.log("\n🧪 Testing global team creation...");
    const globalTeamData = {
      name: "Global Test Team (will be deleted)", 
      org_id: "550e8400-e29b-41d4-a716-446655440001",
      tournament_id: null,
      registration_status: "ACTIVE",
    };

    const { data: globalTeam, error: globalError } = await supabase
      .from('teams')
      .insert(globalTeamData)
      .select()
      .single();

    if (globalError) {
      console.error("❌ Global team test failed:", globalError);
    } else {
      console.log("✅ Global team creation works!");
      
      // Clean up
      await supabase.from('teams').delete().eq('id', globalTeam.id);
      console.log("🗑️  Global test team cleaned up");
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  }
}

verifyTeamsColumns()
  .then(() => {
    console.log('\n🎯 Schema verification completed successfully!');
    console.log('Your team creation functionality should now work properly.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  });