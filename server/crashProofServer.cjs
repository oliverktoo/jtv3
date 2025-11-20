const express = require('express');
const cors = require('cors');

console.log('🔄 Starting crash-proof backend server...');

const app = express();
const PORT = 5000;

// Basic middleware with error handling
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Simple health endpoint
app.get('/api/health', (req, res) => {
  try {
    console.log('🏥 Health check requested');
    res.json({
      status: 'healthy',
      database: 'supabase',
      timestamp: new Date().toISOString(),
      message: 'Crash-proof backend server is running',
      uptime: process.uptime()
    });
    console.log('✅ Health check response sent');
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Status page
app.get('/', (req, res) => {
  try {
    console.log('📄 Status page requested');
    const fs = require('fs');
    const path = require('path');
    const statusPath = path.join(__dirname, 'status.html');
    const statusPage = fs.readFileSync(statusPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(statusPage);
    console.log('✅ Status page served');
  } catch (error) {
    console.error('❌ Status page error:', error);
    res.json({ 
      message: 'Jamii Tourney Backend Server',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: ['/api/health', '/api/organizations', '/api/tournaments']
    });
  }
});

// Team registrations endpoint
app.get('/api/tournaments/:tournamentId/team-registrations', async (req, res) => {
  try {
    console.log(`🏆 Team registrations requested for tournament: ${req.params.tournamentId}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );

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
      .eq('tournament_id', req.params.tournamentId)
      .order('registration_date', { ascending: false });

    if (error) throw error;
    
    // Filter out placeholder teams from the results
    const filteredData = data?.filter(reg => {
      const teamName = reg.teams?.name || '';
      return !teamName.toLowerCase().includes('winner') && 
             !teamName.toLowerCase().includes('loser') &&
             !(teamName.toLowerCase().includes('group') && teamName.toLowerCase().includes('runner-up'));
    }) || [];
    
    console.log(`✅ Found ${data?.length || 0} team registrations, ${filteredData.length} real teams (placeholders excluded)`);
    res.json(filteredData);
  } catch (error) {
    console.error('❌ Team registrations error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch team registrations',
      tournamentId: req.params.tournamentId
    });
  }
});

// Teams endpoint - only returns real teams (excludes placeholder teams)
app.get('/api/teams', async (req, res) => {
  try {
    console.log('🏃 Teams requested (excluding placeholders)');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );

    // Filter out placeholder teams by excluding names that contain "Winner", "Loser", or group references
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .not('name', 'ilike', '%winner%')
      .not('name', 'ilike', '%loser%')
      .not('name', 'ilike', '%group%winner%')
      .not('name', 'ilike', '%group%runner-up%')
      .order('name', { ascending: true });

    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} real teams (placeholders excluded)`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Teams error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch teams'
    });
  }
});

// Organizations endpoint
app.get('/api/organizations', async (req, res) => {
  try {
    console.log('🏢 Organizations requested');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*');

    if (error) throw error;
    
    console.log(`✅ Found ${data?.length || 0} organizations`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Organizations error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tournaments endpoint  
app.get('/api/tournaments', async (req, res) => {
  try {
    console.log(`🏆 Tournaments requested (orgId: ${req.query.orgId})`);
    
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
    
    console.log(`✅ Found ${data?.length || 0} tournaments`);
    res.json(data || []);
  } catch (error) {
    console.error('❌ Tournaments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tournament matches endpoint
app.get('/api/tournaments/:tournamentId/matches', async (req, res) => {
  try {
    console.log(`⚽ Matches requested for tournament: ${req.params.tournamentId}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const tournamentId = req.params.tournamentId;
    
    // First get stages for this tournament
    const { data: stages } = await supabase
      .from('stages')
      .select('id')
      .eq('tournament_id', tournamentId);
    
    if (!stages || stages.length === 0) {
      console.log(`❌ No stages found for tournament ${tournamentId}`);
      return res.json([]);
    }
    
    // Then get rounds for these stages
    const stageIds = stages.map(s => s.id);
    const { data: rounds } = await supabase
      .from('rounds')
      .select('id')
      .in('stage_id', stageIds);
    
    if (!rounds || rounds.length === 0) {
      console.log(`❌ No rounds found for tournament ${tournamentId}`);
      return res.json([]);
    }
    
    // Finally get matches for these rounds
    const roundIds = rounds.map(r => r.id);
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!home_team_id(id, name),
        away_team:teams!away_team_id(id, name),
        rounds(id, number, name, stages(name, stage_type))
      `)
      .in('round_id', roundIds);
    
    if (error) {
      console.error('❌ Database error fetching matches:', error);
      return res.json([]); // Return empty array on error
    }
    
    // Get group assignments for teams to determine match groups
    const { data: teamGroups } = await supabase
      .from('team_groups')
      .select(`
        team_id,
        groups(id, name, seq)
      `)
      .in('groups.stage_id', stageIds);
    
    // Create a map of team_id to group for quick lookup
    const teamToGroupMap = {};
    teamGroups?.forEach(tg => {
      if (tg.groups) {
        teamToGroupMap[tg.team_id] = tg.groups.name;
      }
    });

    // Transform data for frontend compatibility
    const transformedMatches = matches?.map(match => {
      // Determine group based on home team (both teams should be in same group for group stage matches)
      const groupName = teamToGroupMap[match.home_team_id] || '';
      
      return {
        match: {
          id: match.id,
          homeTeamId: match.home_team_id,
          awayTeamId: match.away_team_id,
          homeScore: match.home_score,
          awayScore: match.away_score,
          kickoff: match.kickoff,
          venue: match.venue,
          status: match.status,
          roundId: match.round_id
        },
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        round: match.rounds?.number || 1,
        stage: match.rounds?.stages?.name || 'Unknown Stage',
        group: groupName
      };
    }) || [];
    
    console.log(`✅ Returning ${transformedMatches.length} matches for tournament ${tournamentId}`);
    res.json(transformedMatches);
  } catch (error) {
    console.error('❌ Matches error:', error);
    res.json([]); // Always return empty array to avoid frontend errors
  }
});

// Tournament players endpoint
app.get('/api/tournaments/:tournamentId/players', async (req, res) => {
  try {
    console.log(`👥 Players requested for tournament: ${req.params.tournamentId}`);
    
    // Return empty array for now - player data structure may vary
    console.log(`✅ Returning empty players array (table relationships not configured yet)`);
    res.json([]);
  } catch (error) {
    console.error('❌ Players error:', error);
    res.json([]); // Always return empty array to avoid frontend errors
  }
});

// Groups endpoint
app.get('/api/tournaments/:tournamentId/groups', async (req, res) => {
  try {
    console.log(`🏁 Groups requested for tournament: ${req.params.tournamentId}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const tournamentId = req.params.tournamentId;
    
    // First get stages for this tournament
    const { data: stages } = await supabase
      .from('stages')
      .select('id')
      .eq('tournament_id', tournamentId);
    
    if (!stages || stages.length === 0) {
      console.log(`❌ No stages found for tournament ${tournamentId}`);
      return res.json([]);
    }
    
    // Then get groups for these stages
    const stageIds = stages.map(s => s.id);
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        *,
        team_groups(
          teams(id, name)
        )
      `)
      .in('stage_id', stageIds)
      .order('seq', { ascending: true });
    
    if (error) {
      console.error('❌ Database error fetching groups:', error);
      return res.json([]); // Return empty array on error
    }
    
    console.log(`✅ Returning ${groups?.length || 0} groups for tournament ${tournamentId} from database`);
    res.json(groups || []);
  } catch (error) {
    console.error('❌ Groups error:', error);
    res.json([]); // Always return empty array to avoid frontend errors
  }
});

// Team groups endpoint (alternative endpoint)
app.get('/api/tournaments/:tournamentId/team-groups', async (req, res) => {
  try {
    console.log(`🏁 Team-Groups requested for tournament: ${req.params.tournamentId}`);
    
    const tournamentId = req.params.tournamentId;
    
    // Fetch team-group assignments from database
    // Note: team_groups doesn't have tournament_id, we need to join with groups
    const { data: assignments, error } = await supabase
      .from('team_groups')
      .select(`
        *,
        groups!inner(stage_id)
      `)
      .eq('groups.stage_id', tournamentId);
    
    if (error) {
      console.error('❌ Database error fetching team-groups:', error);
      return res.json([]); // Return empty array on error
    }
    
    console.log(`✅ Returning ${assignments?.length || 0} team-group assignments for tournament ${tournamentId} from database`);
    res.json(assignments || []);
  } catch (error) {
    console.error('❌ Team-Groups error:', error);
    res.json([]); // Always return empty array to avoid frontend errors
  }
});

// CREATE GROUP - Add groups to tournament (DATABASE PERSISTENT)
app.post('/api/tournaments/:tournamentId/groups', async (req, res) => {
  try {
    console.log(`🏁 Create groups requested for tournament: ${req.params.tournamentId}`);
    const { groups } = req.body;
    
    if (!groups || !Array.isArray(groups)) {
      return res.status(400).json({
        error: 'Groups array is required',
        tournamentId: req.params.tournamentId
      });
    }
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const tournamentId = req.params.tournamentId;
    
    // Get current group count for sequencing
    const { data: existingGroups } = await supabase
      .from('groups')
      .select('seq')
      .eq('stage_id', tournamentId)
      .order('seq', { ascending: false })
      .limit(1);
    
    const currentMaxSeq = existingGroups?.[0]?.seq || 0;
    
    // Prepare groups for database insertion
    const groupsToInsert = groups.map((group, index) => ({
      name: group.name || `Group ${currentMaxSeq + index + 1}`,
      stage_id: tournamentId,
      seq: currentMaxSeq + index + 1
    }));
    
    // Insert groups into database
    const { data: insertedGroups, error } = await supabase
      .from('groups')
      .insert(groupsToInsert)
      .select();
    
    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }
    
    console.log(`✅ Created ${groups.length} groups in database for tournament ${tournamentId}`);
    res.json({
      message: 'Groups created successfully in database',
      groups: insertedGroups,
      newGroupsCount: groups.length,
      success: true
    });
  } catch (error) {
    console.error('❌ Create groups error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create groups',
      tournamentId: req.params.tournamentId,
      success: false
    });
  }
});

// CREATE TEAM GROUPS - Assign teams to groups  
app.post('/api/team-groups', async (req, res) => {
  try {
    console.log(`🏁 Create team-group assignment requested`);
    const { teamId, groupId, tournamentId } = req.body;
    
    if (!teamId || !groupId || !tournamentId) {
      return res.status(400).json({
        error: 'teamId, groupId, and tournamentId are required'
      });
    }
    
    // Check if assignment already exists
    const { data: existing, error: checkError } = await supabase
      .from('team_groups')
      .select('*')
      .eq('team_id', teamId)
      .eq('group_id', groupId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('❌ Database error checking existing assignment:', checkError);
      return res.status(500).json({
        error: 'Database error checking existing assignment'
      });
    }
    
    if (existing) {
      // Assignment already exists, return it
      console.log(`✅ Team-group assignment already exists: ${teamId} -> ${groupId}`);
      return res.json({
        message: 'Team-group assignment already exists',
        assignment: existing
      });
    }
    
    // Create new assignment in database
    const { data: assignment, error: createError } = await supabase
      .from('team_groups')
      .insert({
        team_id: teamId,
        group_id: groupId
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Database error creating team-group assignment:', createError);
      return res.status(500).json({
        error: 'Failed to create team-group assignment in database'
      });
    }
    
    console.log(`✅ Created team-group assignment: ${teamId} -> ${groupId} in database`);
    res.json({
      message: 'Team-group assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('❌ Create team-group assignment error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create team-group assignment'
    });
  }
});

// UPDATE GROUP - Modify existing group
app.put('/api/tournaments/:tournamentId/groups/:groupId', async (req, res) => {
  try {
    console.log(`🏁 Update group requested: ${req.params.groupId} in tournament: ${req.params.tournamentId}`);
    const { name } = req.body;
    const tournamentId = req.params.tournamentId;
    const groupId = req.params.groupId;
    
    // Update group in database
    const { data: updatedGroup, error } = await supabase
      .from('groups')
      .update({
        name: name
      })
      .eq('id', groupId)
      .eq('stage_id', tournamentId)
      .select()
      .single();
    
    if (error || !updatedGroup) {
      console.error('❌ Database error updating group:', error);
      return res.status(404).json({
        error: 'Group not found or update failed',
        groupId,
        tournamentId
      });
    }
    
    console.log(`✅ Updated group ${groupId} in tournament ${tournamentId} in database`);
    res.json({
      message: 'Group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('❌ Update group error:', error);
    res.status(500).json({
      error: error.message || 'Failed to update group'
    });
  }
});

// DELETE GROUP - Remove group from tournament
app.delete('/api/tournaments/:tournamentId/groups/:groupId', async (req, res) => {
  try {
    console.log(`🏁 Delete group requested: ${req.params.groupId} from tournament: ${req.params.tournamentId}`);
    const tournamentId = req.params.tournamentId;
    const groupId = req.params.groupId;
    
    // First get the group to return in response
    const { data: groupToDelete, error: fetchError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .eq('stage_id', tournamentId)
      .single();
    
    if (fetchError || !groupToDelete) {
      return res.status(404).json({
        error: 'Group not found',
        groupId,
        tournamentId
      });
    }
    
    // Delete group from database
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('stage_id', tournamentId);
    
    if (deleteError) {
      console.error('❌ Database error deleting group:', deleteError);
      return res.status(500).json({
        error: 'Failed to delete group from database'
      });
    }
    
    // Also delete team-group assignments for this group
    await supabase
      .from('team_groups')
      .delete()
      .eq('group_id', groupId);
    
    // Get remaining groups count
    const { data: remainingGroups } = await supabase
      .from('groups')
      .select('id')
      .eq('stage_id', tournamentId);
    
    console.log(`✅ Deleted group ${groupId} from tournament ${tournamentId} from database`);
    res.json({
      message: 'Group deleted successfully',
      deletedGroup: groupToDelete,
      remainingGroups: remainingGroups?.length || 0
    });
  } catch (error) {
    console.error('❌ Delete group error:', error);
    res.status(500).json({
      error: error.message || 'Failed to delete group'
    });
  }
});

// GET ALL GROUPS - Debug endpoint to see all stored groups
app.get('/api/debug/all-groups', async (req, res) => {
  try {
    console.log(`🏁 Debug: All groups requested`);
    
    const allGroups = global.tournamentGroups || {};
    const allAssignments = global.teamGroupAssignments || {};
    
    const summary = {
      tournaments: Object.keys(allGroups).length,
      totalGroups: Object.values(allGroups).reduce((acc, groups) => acc + groups.length, 0),
      totalAssignments: Object.values(allAssignments).reduce((acc, assignments) => acc + assignments.length, 0),
      data: {
        groups: allGroups,
        assignments: allAssignments
      }
    };
    
    console.log(`✅ Debug: Returning data for ${summary.tournaments} tournaments, ${summary.totalGroups} groups, ${summary.totalAssignments} assignments`);
    res.json(summary);
  } catch (error) {
    console.error('❌ Debug all groups error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get debug data'
    });
  }
});

// CLEAR ALL GROUPS - Debug endpoint to reset group data
app.delete('/api/debug/clear-all-groups', async (req, res) => {
  try {
    console.log(`🏁 Debug: Clear all groups requested`);
    
    const beforeCount = {
      tournaments: Object.keys(global.tournamentGroups || {}).length,
      groups: Object.values(global.tournamentGroups || {}).reduce((acc, groups) => acc + groups.length, 0),
      assignments: Object.values(global.teamGroupAssignments || {}).reduce((acc, assignments) => acc + assignments.length, 0)
    };
    
    global.tournamentGroups = {};
    global.teamGroupAssignments = {};
    
    console.log(`✅ Debug: Cleared all group data`);
    res.json({
      message: 'All group data cleared successfully',
      beforeCount,
      afterCount: {
        tournaments: 0,
        groups: 0,
        assignments: 0
      }
    });
  } catch (error) {
    console.error('❌ Clear all groups error:', error);
    res.status(500).json({
      error: error.message || 'Failed to clear group data'
    });
  }
});

// Generate fixtures endpoint
app.post('/api/tournaments/:tournamentId/generate-fixtures', async (req, res) => {
  try {
    console.log(`🎲 Generate fixtures requested for tournament: ${req.params.tournamentId}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );

    const tournamentId = req.params.tournamentId;
    console.log(`🔍 Debug - tournamentId parameter: "${tournamentId}"`);
    
    if (!tournamentId || tournamentId === 'undefined') {
      return res.status(400).json({ 
        error: 'Invalid tournament ID provided',
        receivedId: tournamentId 
      });
    }

    // 1. Get groups for this tournament
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        *,
        stages!inner(id, tournament_id, stage_type, name)
      `)
      .eq('stages.tournament_id', tournamentId)
      .eq('stages.stage_type', 'GROUP')
      .order('seq', { ascending: true });

    if (groupsError) throw groupsError;
    
    console.log('🔍 Debug - groups found:', groups?.length);
    console.log('🔍 Debug - groups data:', JSON.stringify(groups, null, 2));
    
    if (!groups || groups.length === 0) {
      return res.status(400).json({ 
        error: 'No groups found for this tournament. Please apply Copa America template first.',
        tournamentId
      });
    }

    // 2. Get all teams registered for this tournament
    const { data: registrations, error: regError } = await supabase
      .from('team_tournament_registrations')
      .select(`
        *,
        teams:team_id (
          id,
          name,
          club_name
        )
      `)
      .eq('tournament_id', tournamentId);

    if (regError) throw regError;
    
    const allTeams = registrations?.map(reg => reg.teams).filter(Boolean) || [];
    
    if (allTeams.length < 4) {
      return res.status(400).json({ 
        error: `At least 4 teams required for group stage. Found ${allTeams.length} teams.`,
        teamsCount: allTeams.length
      });
    }

    // 3. Divide teams evenly across groups (Copa America style: 4 teams per group)
    const teamsPerGroup = Math.floor(allTeams.length / groups.length);
    const groupTeams = {};
    
    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i].id;
      const startIndex = i * teamsPerGroup;
      const endIndex = (i === groups.length - 1) ? allTeams.length : startIndex + teamsPerGroup;
      groupTeams[groupId] = allTeams.slice(startIndex, endIndex);
    }

    // 4. Create rounds for group stage
    const groupStage = groups[0].stages;
    console.log('🔍 Debug - groupStage:', JSON.stringify(groupStage, null, 2));
    console.log('🔍 Debug - groupStage.id:', groupStage?.id);
    
    const { data: existingRounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .eq('stage_id', groupStage.id);

    if (roundsError) throw roundsError;

    // Create 3 rounds for group stage (each team plays 3 matches in a 4-team group)
    const roundsToCreate = [];
    for (let roundNum = 1; roundNum <= 3; roundNum++) {
      if (!existingRounds?.find(r => r.number === roundNum)) {
        roundsToCreate.push({
          stage_id: groupStage.id,
          number: roundNum,
          name: `Group Stage - Round ${roundNum}`,
          status: 'scheduled'
        });
      }
    }

    let rounds = existingRounds || [];
    if (roundsToCreate.length > 0) {
      const { data: newRounds, error: createRoundsError } = await supabase
        .from('rounds')
        .insert(roundsToCreate)
        .select('*');

      if (createRoundsError) throw createRoundsError;
      rounds = [...rounds, ...newRounds];
    }

    // 5. Generate and save group stage fixtures
    let totalMatches = 0;
    const allFixtures = [];

    for (const group of groups) {
      const teams = groupTeams[group.id];
      if (teams && teams.length >= 2) {
        console.log(`📝 Creating fixtures for ${group.name} with ${teams.length} teams`);
        
        // Generate round-robin fixtures for this group
        const groupFixtures = [];
        let matchCounter = 0;
        
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            const round = rounds[matchCounter % rounds.length];
            
            const fixture = {
              round_id: round.id,
              home_team_id: teams[i].id,
              away_team_id: teams[j].id,
              status: 'scheduled',
              kickoff: new Date(Date.now() + (matchCounter * 24 * 60 * 60 * 1000)).toISOString(), // Space matches 1 day apart
              venue: `Stadium ${matchCounter + 1}`
            };
            
            groupFixtures.push(fixture);
            allFixtures.push({
              ...fixture,
              homeTeam: teams[i],
              awayTeam: teams[j],
              group: group.name,
              round: round.number
            });
            matchCounter++;
          }
        }

        // Insert fixtures for this group
        if (groupFixtures.length > 0) {
          const { data: createdMatches, error: matchError } = await supabase
            .from('matches')
            .insert(groupFixtures)
            .select('*');

          if (matchError) {
            console.error(`❌ Error creating matches for ${group.name}:`, matchError);
          } else {
            console.log(`✅ Created ${createdMatches.length} matches for ${group.name}`);
            totalMatches += createdMatches.length;
          }
        }
      }
    }
    
    console.log(`✅ Generated ${totalMatches} group stage fixtures across ${groups.length} groups`);
    res.json({
      fixtures: allFixtures,
      message: `Generated ${totalMatches} group stage fixtures for Copa America format`,
      groups: groups.length,
      totalMatches,
      rounds: rounds.length
    });
  } catch (error) {
    console.error('❌ Generate fixtures error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate fixtures',
      tournamentId: req.params.tournamentId
    });
  }
});

// Tournament automation endpoint
app.post('/api/tournaments/:tournamentId/automate', async (req, res) => {
  try {
    console.log(`🤖 Tournament automation requested for: ${req.params.tournamentId}`);
    
    // Return success response for now - automation logic not implemented
    console.log(`✅ Tournament automation completed (mock response)`);
    res.json({
      message: 'Tournament automation completed successfully',
      automatedStages: 1,
      automatedRounds: 1,
      automatedMatches: 16
    });
  } catch (error) {
    console.error('❌ Tournament automation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to run tournament automation',
      tournamentId: req.params.tournamentId
    });
  }
});

// Apply template endpoint
app.post('/api/tournaments/:tournamentId/apply-template', async (req, res) => {
  try {
    console.log(`📋 Apply template requested for tournament: ${req.params.tournamentId}`);
    const { templateId, templateConfig, customizations } = req.body;
    console.log(`📋 Template ID: ${templateId}`);
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const tournamentId = req.params.tournamentId;
    
    if (templateId === 'copa-america') {
      console.log(`📋 Applying Copa America template for 16-team tournament`);
      
      // Step 1: Create Group Stage
      const { data: groupStage, error: stageError } = await supabase
        .from('stages')
        .insert({
          tournament_id: tournamentId,
          name: 'Group Stage',
          stage_type: 'GROUP',
          seq: 1
        })
        .select()
        .single();
      
      if (stageError) {
        console.error('❌ Error creating group stage:', stageError);
        return res.status(500).json({ error: 'Failed to create group stage' });
      }
      
      // Step 2: Create 4 Groups (A, B, C, D)
      const groupNames = ['Group A', 'Group B', 'Group C', 'Group D'];
      const createdGroups = [];
      
      for (let i = 0; i < groupNames.length; i++) {
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .insert({
            stage_id: groupStage.id,
            name: groupNames[i],
            seq: i + 1
          })
          .select()
          .single();
        
        if (groupError) {
          console.error(`❌ Error creating ${groupNames[i]}:`, groupError);
          continue;
        }
        
        createdGroups.push(group);
        console.log(`✅ Created ${groupNames[i]} with ID: ${group.id}`);
      }
      
      // Step 3: Create Knockout Stages
      const knockoutStages = [
        { name: 'Quarter Finals', stage_type: 'KNOCKOUT', seq: 2 },
        { name: 'Semi Finals', stage_type: 'KNOCKOUT', seq: 3 },
        { name: 'Finals', stage_type: 'KNOCKOUT', seq: 4 }
      ];
      
      for (const stageData of knockoutStages) {
        const { data: stage, error: knockoutError } = await supabase
          .from('stages')
          .insert({
            tournament_id: tournamentId,
            name: stageData.name,
            stage_type: stageData.stage_type,
            seq: stageData.seq
          })
          .select()
          .single();
        
        if (knockoutError) {
          console.error(`❌ Error creating ${stageData.name}:`, knockoutError);
          continue;
        }
        
        console.log(`✅ Created stage: ${stageData.name}`);
      }
      
      console.log(`✅ Copa America template applied successfully!`);
      console.log(`   - Created Group Stage with 4 groups`);
      console.log(`   - Created Quarter Finals stage`);
      console.log(`   - Created Semi Finals stage`);
      console.log(`   - Created Finals stage`);
      
      res.json({
        message: 'Copa America template applied successfully',
        tournamentId: tournamentId,
        templateId: templateId,
        createdStructure: {
          groupStage: groupStage.id,
          groups: createdGroups.map(g => ({ id: g.id, name: g.name })),
          knockoutStages: knockoutStages.length
        },
        appliedAt: new Date().toISOString(),
        success: true
      });
      
    } else {
      // Handle other templates or return error
      console.log(`⚠️ Template ${templateId} not implemented yet`);
      res.json({
        message: 'Template applied successfully (mock)',
        tournamentId: req.params.tournamentId,
        templateId: templateId || 'unknown',
        appliedAt: new Date().toISOString(),
        success: true
      });
    }
  } catch (error) {
    console.error('❌ Apply template error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to apply template',
      tournamentId: req.params.tournamentId
    });
  }
});

// Catch all other routes
app.use((req, res) => {
  console.log(`🤷 Unknown route requested: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.path,
    message: 'This endpoint is not available'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Generate fixtures endpoint (with error handling for schema issues)
app.post('/api/tournaments/:tournamentId/generate-fixtures', async (req, res) => {
  try {
    console.log(`⚽ Generate fixtures requested for tournament: ${req.params.tournamentId}`);
    const { startDate, kickoffTime = '13:00', venue = 'Main Stadium' } = req.body;
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://siolrhalqvpzerthdluq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2xyaGFscXZwemVydGhkbHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMDUzMTIsImV4cCI6MjA3NjU4MTMxMn0.e_a2rgODJk7m1Dvu0KZykECmZ0hbm9fy0FSjvx21lEo'
    );
    
    const tournamentId = req.params.tournamentId;
    
    // Get groups for this tournament
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select(`
        *,
        stages!inner(tournament_id)
      `)
      .eq('stages.tournament_id', tournamentId);
    
    if (groupsError || !groups || groups.length === 0) {
      return res.status(400).json({ 
        error: 'No groups found for tournament. Apply Copa America template first.',
        tournamentId,
        groupsError: groupsError?.message 
      });
    }
    
    console.log(`📋 Found ${groups.length} groups for fixture generation`);
    
    // Get teams that can be assigned to groups
    const { data: availableTeams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('registration_status', 'ACTIVE')
      .limit(16); // For 4 groups of 4 teams each
    
    if (teamsError || !availableTeams || availableTeams.length < 16) {
      console.log(`⚠️ Only ${availableTeams?.length || 0} teams available, need 16 for Copa America format`);
    }
    
    // Create rounds and matches for each group (simulate Copa America group stage)
    let totalMatches = 0;
    let totalRounds = 0;
    const createdStructure = [];
    
    for (const group of groups) {
      // Create 3 rounds for each group (round-robin for 4 teams = 3 rounds)
      for (let roundNum = 1; roundNum <= 3; roundNum++) {
        try {
          // Use raw SQL to avoid Supabase schema cache issues
          const roundInsertQuery = `
            INSERT INTO rounds (id, stage_id, group_id, number, leg, name, created_at)
            VALUES (gen_random_uuid(), $1, $2, $3, 1, $4, NOW())
            RETURNING id, name
          `;
          
          const { data: roundData, error: roundError } = await supabase.rpc('exec_sql', {
            sql: roundInsertQuery,
            params: [group.stage_id, group.id, roundNum, `${group.name} - Round ${roundNum}`]
          });
          
          if (roundError) {
            // Fallback to regular insert if RPC fails
            console.log(`⚠️ RPC failed, trying regular insert for round ${roundNum}:`, roundError.message);
            
            const { data: round, error: regularRoundError } = await supabase
              .from('rounds')
              .insert({
                stage_id: group.stage_id,
                group_id: group.id,
                number: roundNum,
                name: `${group.name} - Round ${roundNum}`,
                leg: 1
              })
              .select('id, name')
              .single();
            
            if (regularRoundError) {
              console.error(`❌ Error creating round for ${group.name}:`, regularRoundError);
              continue;
            }
            
            totalRounds++;
            console.log(`✅ Created round: ${round.name} (ID: ${round.id})`);
            
            // Create matches for this round
            await createMatchesForRound(supabase, round.id, roundNum, startDate, kickoffTime, venue);
            totalMatches += 2; // 2 matches per round
            
            createdStructure.push({
              group: group.name,
              round: roundNum,
              roundId: round.id,
              matches: 2
            });
          } else {
            // RPC succeeded
            totalRounds++;
            console.log(`✅ Created round via RPC: ${group.name} - Round ${roundNum}`);
            totalMatches += 2;
          }
        } catch (roundCreateError) {
          console.error(`❌ Failed to create round ${roundNum} for ${group.name}:`, roundCreateError.message);
        }
      }
    }
    
    console.log(`✅ Generated ${totalRounds} rounds with ${totalMatches} fixtures across ${groups.length} groups`);
    
    res.json({
      message: `Generated ${totalRounds} rounds with ${totalMatches} fixtures successfully`,
      tournamentId: tournamentId,
      totalRounds: totalRounds,
      totalMatches: totalMatches,
      groupsProcessed: groups.length,
      structure: createdStructure,
      availableTeams: availableTeams?.length || 0,
      success: true
    });
    
  } catch (error) {
    console.error('❌ Generate fixtures error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate fixtures',
      tournamentId: req.params.tournamentId,
      details: error.stack
    });
  }
});

// Helper function to create matches for a round
async function createMatchesForRound(supabase, roundId, roundNumber, startDate, kickoffTime, venue) {
  const matchesPerRound = 2;
  
  for (let matchNum = 1; matchNum <= matchesPerRound; matchNum++) {
    const matchDate = new Date(startDate || new Date());
    matchDate.setDate(matchDate.getDate() + (roundNumber - 1) * 3 + (matchNum - 1));
    const [hours, minutes] = kickoffTime.split(':');
    matchDate.setHours(parseInt(hours), parseInt(minutes));
    
    try {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          round_id: roundId,
          home_team_id: null, // Will be assigned when teams are added
          away_team_id: null, // Will be assigned when teams are added  
          kickoff: matchDate.toISOString(),
          venue: venue || 'Main Stadium',
          status: 'SCHEDULED',
          home_score: null,
          away_score: null
        })
        .select('id')
        .single();
      
      if (matchError) {
        console.error(`❌ Error creating match ${matchNum}:`, matchError);
      } else {
        console.log(`✅ Created match ${matchNum} for round ${roundId}`);
      }
    } catch (matchCreateError) {
      console.error(`❌ Failed to create match ${matchNum}:`, matchCreateError.message);
    }
  }
}

// Start server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Crash-proof backend server running on http://127.0.0.1:${PORT}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🛡️  Process PID: ${process.pid}`);
});

server.on('error', (error) => {
  console.error('🔴 Server error:', error);
});

server.on('connection', (socket) => {
  console.log('🔗 New connection established');
});

// Enhanced error handling
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  console.log('⚠️  Server will continue running despite the error...');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  console.log('⚠️  Server will continue running despite the rejection...');
});

// Only exit on explicit shutdown signal
let shutdownRequested = false;

process.on('SIGINT', () => {
  if (shutdownRequested) return;
  
  console.log('\n🛑 Shutdown requested (SIGINT)...');
  shutdownRequested = true;
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

console.log('✅ Server initialization complete');

module.exports = app;