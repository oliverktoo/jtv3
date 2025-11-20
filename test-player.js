// Simple test to add a player registration for debugging
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestPlayer() {
  console.log('Creating test player registration...');
  
  const testPlayer = {
    org_id: '00000000-0000-0000-0000-000000000001',
    hashed_identity_keys: 'hash' + Date.now(),
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe' + Date.now() + '@test.com',
    phone: '+25471' + Date.now().toString().slice(-7),
    dob: '1995-06-15',
    sex: 'MALE',
    nationality: 'Kenyan',
    ward_id: 1, // Assuming ward ID 1 exists
    registration_status: 'SUBMITTED',
    status: 'ACTIVE'
  };

  const { data, error } = await supabase
    .from('player_registry')
    .insert(testPlayer)
    .select()
    .single();

  if (error) {
    console.error('Error creating test player:', error);
    return;
  }

  console.log('Test player created:', data);
}

createTestPlayer();