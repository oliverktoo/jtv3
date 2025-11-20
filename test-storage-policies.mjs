// Test storage policies after setup
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testStorageAfterPolicies() {
  console.log('🧪 Testing storage after RLS policies setup...\n');
  
  const testBuckets = ['player-documents', 'player-photos'];
  const testFile = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header
  
  for (const bucketName of testBuckets) {
    try {
      const fileName = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.png`;
      const folder = bucketName === 'player-documents' ? 'documents' : 'selfies';
      const filePath = `${folder}/${fileName}`;
      
      console.log(`📁 Testing bucket: ${bucketName}`);
      console.log(`📄 File path: ${filePath}`);
      
      // Test upload
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, testFile, {
          contentType: 'image/png',
          upsert: false
        });
        
      if (error) {
        console.log(`❌ Upload failed: ${error.message}`);
        if (error.message.includes('row-level security')) {
          console.log('   🔒 RLS policies still blocking uploads');
          console.log('   💡 Run the SQL policies from setup-storage-policies.sql');
        }
      } else {
        console.log(`✅ Upload successful!`);
        console.log(`   📍 Path: ${data.path}`);
        
        // Test getting public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        console.log(`   🔗 URL: ${urlData.publicUrl}`);
        
        // Cleanup - delete test file
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
          
        if (!deleteError) {
          console.log(`   🗑️  Test file cleaned up`);
        }
      }
      
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
    }
    
    console.log(''); // Empty line
  }
}

testStorageAfterPolicies().catch(console.error);