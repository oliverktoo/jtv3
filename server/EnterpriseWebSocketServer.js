import { WebSocketServer } from 'ws';
import { createClient } from '@supabase/supabase-js';

/**
 * Enterprise WebSocket Server for Real-time Match Updates
 * Provides live standings, fixture updates, and match events
 * Compatible with professional sports platforms like SofaScore/ESPN
 */

export class EnterpriseWebSocketServer {
  constructor(server, supabaseClient) {
    this.wss = new WebSocketServer({ server });
    this.supabase = supabaseClient;
    this.clients = new Map(); // client -> {tournamentIds: Set, lastHeartbeat: Date}
    this.channels = new Map(); // tournamentId -> Set of clients
    
    this.setupServer();
    this.startHeartbeat();
    
    console.log('🚀 Enterprise WebSocket Server initialized');
  }

  setupServer() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      console.log(`📡 New WebSocket connection: ${clientId}`);
      
      // Initialize client tracking
      this.clients.set(ws, {
        id: clientId,
        tournamentIds: new Set(),
        lastHeartbeat: new Date(),
        connectedAt: new Date()
      });

      // Set up message handling
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('❌ Invalid WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.handleDisconnection(ws);
      });

      // Send welcome message
      this.send(ws, {
        type: 'connection',
        data: {
          clientId,
          message: 'Connected to Enterprise Live Updates',
          serverTime: new Date().toISOString()
        }
      });
    });
  }

  handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.lastHeartbeat = new Date();

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(ws, message.tournamentId);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscribe(ws, message.tournamentId);
        break;
      
      case 'heartbeat':
        this.send(ws, { type: 'heartbeat', data: { serverTime: new Date().toISOString() } });
        break;
      
      case 'get_standings':
        this.handleGetStandings(ws, message.tournamentId);
        break;
      
      case 'get_fixtures':
        this.handleGetFixtures(ws, message.tournamentId);
        break;
      
      default:
        console.warn('⚠️ Unknown message type:', message.type);
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  handleSubscribe(ws, tournamentId) {
    if (!tournamentId) {
      this.sendError(ws, 'Tournament ID required for subscription');
      return;
    }

    const client = this.clients.get(ws);
    client.tournamentIds.add(tournamentId);

    // Add to channel
    if (!this.channels.has(tournamentId)) {
      this.channels.set(tournamentId, new Set());
    }
    this.channels.get(tournamentId).add(ws);

    console.log(`📺 Client ${client.id} subscribed to tournament ${tournamentId}`);
    
    this.send(ws, {
      type: 'subscribed',
      data: {
        tournamentId,
        message: `Subscribed to live updates for tournament ${tournamentId}`
      }
    });

    // Send current standings immediately
    this.handleGetStandings(ws, tournamentId);
  }

  handleUnsubscribe(ws, tournamentId) {
    const client = this.clients.get(ws);
    if (!client) return;

    client.tournamentIds.delete(tournamentId);
    
    if (this.channels.has(tournamentId)) {
      this.channels.get(tournamentId).delete(ws);
      if (this.channels.get(tournamentId).size === 0) {
        this.channels.delete(tournamentId);
      }
    }

    console.log(`📺 Client ${client.id} unsubscribed from tournament ${tournamentId}`);
    
    this.send(ws, {
      type: 'unsubscribed',
      data: { tournamentId }
    });
  }

  async handleGetStandings(ws, tournamentId) {
    try {
      const { data: standings, error } = await this.supabase
        .from('current_standings')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('position', { ascending: true });

      if (error) {
        console.error('❌ Error fetching standings:', error);
        this.sendError(ws, 'Failed to fetch standings');
        return;
      }

      this.send(ws, {
        type: 'standings_update',
        data: {
          tournamentId,
          standings: standings || [],
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Standings query error:', error);
      this.sendError(ws, 'Database error fetching standings');
    }
  }

  async handleGetFixtures(ws, tournamentId) {
    try {
      const { data: fixtures, error } = await this.supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_code),
          away_team:teams!matches_away_team_id_fkey(id, name, short_code)
        `)
        .eq('tournament_id', tournamentId)
        .order('match_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching fixtures:', error);
        this.sendError(ws, 'Failed to fetch fixtures');
        return;
      }

      this.send(ws, {
        type: 'fixtures_update',
        data: {
          tournamentId,
          fixtures: fixtures || [],
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Fixtures query error:', error);
      this.sendError(ws, 'Database error fetching fixtures');
    }
  }

  handleDisconnection(ws) {
    const client = this.clients.get(ws);
    if (client) {
      console.log(`📡 Client ${client.id} disconnected`);
      
      // Remove from all channels
      for (const tournamentId of client.tournamentIds) {
        if (this.channels.has(tournamentId)) {
          this.channels.get(tournamentId).delete(ws);
          if (this.channels.get(tournamentId).size === 0) {
            this.channels.delete(tournamentId);
          }
        }
      }
      
      this.clients.delete(ws);
    }
  }

  // Broadcast match updates to all subscribers
  broadcastMatchUpdate(tournamentId, matchData) {
    const channel = this.channels.get(tournamentId);
    if (!channel) return;

    const message = {
      type: 'match_update',
      data: {
        tournamentId,
        match: matchData,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`📻 Broadcasting match update to ${channel.size} clients`);
    
    for (const client of channel) {
      this.send(client, message);
    }
  }

  // Broadcast standings updates to all subscribers
  broadcastStandingsUpdate(tournamentId, standings) {
    const channel = this.channels.get(tournamentId);
    if (!channel) return;

    const message = {
      type: 'standings_update',
      data: {
        tournamentId,
        standings,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`📊 Broadcasting standings update to ${channel.size} clients`);
    
    for (const client of channel) {
      this.send(client, message);
    }
  }

  // Send message with error handling
  send(ws, message) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
      }
    }
  }

  sendError(ws, message) {
    this.send(ws, {
      type: 'error',
      data: { message, timestamp: new Date().toISOString() }
    });
  }

  // Heartbeat mechanism to detect dead connections
  startHeartbeat() {
    setInterval(() => {
      const now = new Date();
      const deadConnections = [];

      for (const [ws, client] of this.clients.entries()) {
        const timeSinceHeartbeat = now - client.lastHeartbeat;
        
        if (timeSinceHeartbeat > 60000) { // 60 seconds timeout
          console.log(`💔 Dead connection detected: ${client.id}`);
          deadConnections.push(ws);
        }
      }

      // Clean up dead connections
      for (const ws of deadConnections) {
        this.handleDisconnection(ws);
        if (ws.readyState === ws.OPEN) {
          ws.terminate();
        }
      }

    }, 30000); // Check every 30 seconds
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get server statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      activeChannels: this.channels.size,
      channelSubscriptions: Array.from(this.channels.entries()).map(([tournamentId, clients]) => ({
        tournamentId,
        subscriberCount: clients.size
      }))
    };
  }
}

export default EnterpriseWebSocketServer;