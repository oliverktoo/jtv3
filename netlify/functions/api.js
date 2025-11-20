import { createClient } from '@supabase/supabase-js';
import { createServer } from 'http';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Response helper
const respond = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { ...corsHeaders, ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body)
});

// Error handler
const handleError = (error) => {
  console.error('API Error:', error);
  return respond(500, { 
    error: error.message || 'Internal server error',
    success: false 
  });
};

// Route handlers
const routes = {
  // Health check
  'GET /health': async () => {
    return respond(200, {
      status: 'healthy',
      database: 'supabase-connected',
      timestamp: new Date().toISOString(),
      message: 'Netlify Functions API is running'
    });
  },

  // Auth routes
  'POST /auth/signup': async (event) => {
    const { email, password, firstName, lastName } = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName }
      }
    });
    
    if (error) throw error;
    return respond(201, { data, success: true });
  },

  'POST /auth/login': async (event) => {
    const { email, password } = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return respond(200, { data, success: true });
  },

  'POST /auth/logout': async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return respond(200, { message: 'Logged out successfully', success: true });
  },

  // User routes
  'GET /users/check-email': async (event) => {
    const email = event.queryStringParameters?.email;
    if (!email) throw new Error('Email parameter required');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    return respond(200, { exists: !!data, success: true });
  },

  'POST /users/make-super-admin': async (event) => {
    const { email } = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase
      .from('users')
      .update({ role: 'SUPER_ADMIN' })
      .eq('email', email)
      .select()
      .single();
    
    if (error) throw error;
    return respond(200, { data, success: true });
  },

  // Tournament routes
  'GET /tournaments': async (event) => {
    const status = event.queryStringParameters?.status;
    
    let query = supabase
      .from('tournaments')
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .order('created_at', { ascending: false });
    
    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.in('status', statuses);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return respond(200, { data, success: true });
  },

  'POST /tournaments': async (event) => {
    const tournamentData = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert([tournamentData])
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .single();
    
    if (error) throw error;
    return respond(201, { data, success: true });
  },

  'PUT /tournaments/:id': async (event) => {
    const { id } = event.pathParameters || {};
    const updateData = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase
      .from('tournaments')
      .update(updateData)
      .eq('id', id)
      .select('*, organizations(id, name, slug), sports(id, name, slug)')
      .single();
    
    if (error) throw error;
    return respond(200, { data, success: true });
  },

  'DELETE /tournaments/:id': async (event) => {
    const { id } = event.pathParameters || {};
    
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return respond(200, { message: 'Tournament deleted successfully', success: true });
  },

  // Team routes
  'GET /teams': async (event) => {
    const orgId = event.queryStringParameters?.orgId;
    
    let query = supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orgId) {
      query = query.eq('orgId', orgId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return respond(200, { data, success: true });
  },

  'POST /teams': async (event) => {
    const teamData = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select()
      .single();
    
    if (error) throw error;
    return respond(201, { data, success: true });
  },

  'DELETE /teams/:id': async (event) => {
    const { id } = event.pathParameters || {};
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return respond(200, { message: 'Team deleted successfully', success: true });
  },

  // Organization routes
  'GET /organizations': async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return respond(200, { data, success: true });
  },

  // Player routes
  'GET /players': async (event) => {
    const orgId = event.queryStringParameters?.orgId;
    
    let query = supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orgId) {
      query = query.eq('orgId', orgId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return respond(200, { data, success: true });
  },

  'POST /players': async (event) => {
    const playerData = JSON.parse(event.body || '{}');
    
    const { data, error } = await supabase
      .from('players')
      .insert([playerData])
      .select()
      .single();
    
    if (error) throw error;
    return respond(201, { data, success: true });
  },

  'GET /players/:id': async (event) => {
    const { id } = event.pathParameters || {};
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return respond(200, { data, success: true });
  },

  // Platform stats
  'GET /platform/stats': async () => {
    const [tournamentStats, teamStats, playerStats] = await Promise.all([
      supabase.from('tournaments').select('count', { count: 'exact', head: true }),
      supabase.from('teams').select('count', { count: 'exact', head: true }),
      supabase.from('players').select('count', { count: 'exact', head: true })
    ]);

    return respond(200, {
      data: {
        tournaments: tournamentStats.count || 0,
        teams: teamStats.count || 0,
        players: playerStats.count || 0
      },
      success: true
    });
  }
};

// Main handler
export const handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return respond(200, '');
  }

  try {
    // Extract path and method
    const path = event.path.replace('/.netlify/functions/api', '') || '/';
    const method = event.httpMethod;
    const routeKey = `${method} ${path}`;
    
    // Handle parameterized routes
    let handler = routes[routeKey];
    let pathParams = {};
    
    if (!handler) {
      // Try to match parameterized routes
      for (const [pattern, routeHandler] of Object.entries(routes)) {
        const [routeMethod, routePath] = pattern.split(' ');
        if (routeMethod !== method) continue;
        
        const pathRegex = routePath.replace(/:(\w+)/g, '(?<$1>[^/]+)');
        const match = path.match(new RegExp(`^${pathRegex}$`));
        
        if (match) {
          handler = routeHandler;
          pathParams = match.groups || {};
          break;
        }
      }
    }
    
    if (!handler) {
      return respond(404, { error: 'Route not found', path, method });
    }

    // Add path parameters to event
    event.pathParameters = pathParams;
    
    // Execute handler
    return await handler(event, context);

  } catch (error) {
    return handleError(error);
  }
};