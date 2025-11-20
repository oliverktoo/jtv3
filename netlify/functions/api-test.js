// Simple test function for debugging
export const handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract path and method
    const path = event.path.replace('/.netlify/functions/api-test', '') || '/';
    const method = event.httpMethod;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Netlify Function is working!',
        path: path,
        method: method,
        originalPath: event.path,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};