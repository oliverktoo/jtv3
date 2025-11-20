// Netlify Function for venues endpoint
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://siolrhalqvpzerthdluq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get optional filters from query params
      const tournamentId = event.queryStringParameters?.tournamentId;
      const search = event.queryStringParameters?.search;
      
      // Build query
      let query = supabase
        .from('venues')
        .select(`
          *,
          counties(id, name),
          sub_counties(id, name),
          wards(id, name)
        `);
      
      // Filter by tournament (or get global venues if tournamentId is provided)
      if (tournamentId) {
        query = query.or(`tournament_id.eq.${tournamentId},tournament_id.is.null`);
      }
      
      // Search by name or location
      if (search) {
        query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
      }
      
      query = query.order('name');
      
      const { data: venues, error } = await query;

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          venues: venues || [],
          count: venues?.length || 0
        }),
      };
    }

    if (event.httpMethod === 'POST') {
      // Create new venue
      const body = JSON.parse(event.body);
      
      const { data: venue, error } = await supabase
        .from('venues')
        .insert({
          name: body.name,
          location: body.location,
          county_id: body.countyId,
          sub_county_id: body.subCountyId,
          ward_id: body.wardId,
          pitch_count: body.pitchCount || 1,
          facilities: body.facilities || [],
          coordinates: body.coordinates || null,
          tournament_id: body.tournamentId || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          venue
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // Update venue by ID from query params
      const venueId = event.queryStringParameters?.id;
      
      if (!venueId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Venue ID required' }),
        };
      }

      const body = JSON.parse(event.body);
      
      const { data: venue, error } = await supabase
        .from('venues')
        .update({
          name: body.name,
          location: body.location,
          county_id: body.countyId,
          sub_county_id: body.subCountyId,
          ward_id: body.wardId,
          pitch_count: body.pitchCount || 1,
          facilities: body.facilities || [],
          coordinates: body.coordinates || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', venueId)
        .select()
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          venue
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      // Delete venue by ID from query params
      const venueId = event.queryStringParameters?.id;
      
      if (!venueId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Venue ID required' }),
        };
      }

      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venueId);

      if (error) throw error;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Venues API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
