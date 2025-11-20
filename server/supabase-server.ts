import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      database: 'supabase-connected',
      timestamp: new Date().toISOString(),
      message: 'Server is running and connected to Supabase'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'supabase-error',
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic organizations endpoint
app.get('/api/organizations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    res.json({ data, success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Basic tournaments endpoint
app.get('/api/tournaments', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    
    res.json({ data, success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Team registrations endpoint
app.get('/api/tournaments/:tournamentId/team-registrations', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const { data, error } = await supabase
      .from('team_tournament_registrations')
      .select(`
        *,
        teams (
          id,
          name,
          code,
          logo_url
        )
      `)
      .eq('tournament_id', tournamentId);
    
    if (error) throw error;
    
    res.json({ data, success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Jamii Tourney server running on http://127.0.0.1:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🗄️ Database: Supabase`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});