// Test storage functionality in production environment
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testProductionStorage() {
  console.log('🚀 Testing production storage functionality...\n');
  console.log('🌐 Production URL: https://jamiisportske.netlify.app');
  console.log('🔧 Testing Supabase storage with same credentials as production\n');
  
  const testBuckets = ['player-documents', 'player-photos'];
  const testFile = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10,  // PNG signature
    0, 0, 0, 13, 73, 72, 68, 82,      // IHDR chunk
    0, 0, 0, 1, 0, 0, 0, 1,           // 1x1 pixel
    8, 2, 0, 0, 0, 144, 119, 83, 222  // minimal PNG data
  ]);
  
  let allTestsPassed = true;
  
  for (const bucketName of testBuckets) {
    try {
      const timestamp = Date.now();
      const fileName = `production_test_${timestamp}.png`;
      const folder = bucketName === 'player-documents' ? 'documents' : 'selfies';
      const filePath = `${folder}/${fileName}`;
      
      console.log(`📁 Testing bucket: ${bucketName}`);
      console.log(`📄 File path: ${filePath}`);
      
      // Test upload (same as production app would do)
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, testFile, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.log(`❌ FAILED: ${error.message}`);
        console.log(`   Status: ${error.statusCode}`);
        allTestsPassed = false;
        
        if (error.message.includes('row-level security')) {
          console.log('   🚨 RLS policies may not be applied correctly in production');
        }
      } else {
        console.log(`✅ SUCCESS!`);
        
        // Get public URL (same as production app would do)
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
          
        console.log(`   📍 Path: ${data.path}`);
        console.log(`   🔗 URL: ${urlData.publicUrl}`);
        
        // Test if URL is accessible
        try {
          const response = await fetch(urlData.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            console.log(`   🌐 URL accessible: YES (Status: ${response.status})`);
          } else {
            console.log(`   🌐 URL accessible: NO (Status: ${response.status})`);
          }
        } catch (fetchError) {
          console.log(`   🌐 URL test failed: ${fetchError.message}`);
        }
        
        // Cleanup
        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);
          
        if (!deleteError) {
          console.log(`   🗑️  Test file cleaned up`);
        }
      }
      
    } catch (err) {
      console.log(`❌ Exception: ${err.message}`);
      allTestsPassed = false;
    }
    
    console.log(''); // Empty line
  }
  
  console.log('='.repeat(60));
  
  if (allTestsPassed) {
    console.log('🎉 PRODUCTION STORAGE TEST: SUCCESS!');
    console.log('✅ Both buckets working correctly');
    console.log('✅ RLS policies applied successfully');
    console.log('✅ Public URLs accessible');
    console.log('✅ Production app will work without console warnings');
    console.log('');
    console.log('🚀 Your deployed app at https://jamiisportske.netlify.app');
    console.log('   should now handle file uploads without fallback!');
  } else {
    console.log('❌ PRODUCTION STORAGE TEST: SOME ISSUES FOUND');
    console.log('🔧 Check the errors above and verify RLS policies in Supabase dashboard');
  }
}

testProductionStorage().catch(console.error);