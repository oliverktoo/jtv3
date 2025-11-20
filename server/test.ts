import dotenv from 'dotenv';
dotenv.config();

async function test() {
  console.log('Environment variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  console.log('PORT:', process.env.PORT);

  try {
    console.log('Testing imports...');
    
    console.log('1. Importing db...');
    const { db } = await import('./db.js');
    console.log('✅ DB imported successfully');
    
    console.log('2. Testing db connection...');
    // Simple query to test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  }
}

test();