import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const tournamentId = event.path.split('/')[3]; // Extract from /api/tournaments/:id/groups

  try {
    if (event.httpMethod === 'GET') {
      // Get groups for tournament
      const { data: stages, error: stagesError } = await supabase
        .from('stages')
        .select('id')
        .eq('tournament_id', tournamentId);

      if (stagesError || !stages || stages.length === 0) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: [] })
        };
      }

      const stageId = stages[0].id;

      const { data: groups, error } = await supabase
        .from('groups')
        .select('*')
        .eq('stage_id', stageId)
        .order('seq');

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: groups || [] })
      };
    }

    if (event.httpMethod === 'POST') {
      // Create group
      const { name, seq, venue } = JSON.parse(event.body);

      // Get or create default stage
      let { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('tournament_id', tournamentId);

      let stageId;
      if (!stages || stages.length === 0) {
        const { data: newStage, error: stageError } = await supabase
          .from('stages')
          .insert({ tournament_id: tournamentId, name: 'Group Stage', stage_type: 'GROUP', seq: 1 })
          .select()
          .single();

        if (stageError) throw stageError;
        stageId = newStage.id;
      } else {
        stageId = stages[0].id;
      }

      const { data: group, error } = await supabase
        .from('groups')
        .insert({ 
          stage_id: stageId, 
          name, 
          seq,
          venue: venue || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: group })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Groups API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
