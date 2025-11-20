const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'supabase',
    timestamp: new Date().toISOString(),
    message: 'Simple backend server is running'
  });
});

// Team registrations endpoint using Supabase client
app.get('/api/tournaments/:tournamentId/team-registrations', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );

    const tournamentId = req.params.tournamentId;
    
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select(`
        *,
        teams:team_id (
          id,
          name,
          club_name,
          contact_email,
          contact_phone,
          home_venue,
          logo_url,
          county_id,
          sub_county_id,
          ward_id
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('registration_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    res.json(data || []);
  } catch (error) {
    console.error('Team registrations endpoint error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch team registrations',
      tournamentId: req.params.tournamentId
    });
  }
});

// Organizations endpoint
app.get('/api/organizations', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*');

    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Organizations endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tournaments endpoint
app.get('/api/tournaments', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );

    const orgId = req.query.orgId;
    let query = supabase.from('tournaments').select('*');
    
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Tournaments endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generic error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server with proper error handling
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Simple backend server running on http://127.0.0.1:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  console.log('⚠️ Server will continue running...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  console.log('⚠️ Server will continue running...');
});

module.exports = app;