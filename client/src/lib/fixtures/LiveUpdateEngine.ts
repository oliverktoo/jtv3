/**
 * Live Update Engine
 * Real-time match updates and standings broadcasting system
 * Enterprise-grade WebSocket management for football platforms
 */

import { Tournament, Match } from './TournamentEngine';
import { AdvancedStandingsEngine, TeamStanding } from './AdvancedStandingsEngine';

export interface LiveMatchUpdate {
  match_id: string;
  tournament_id: string;
  update_type: 'score' | 'status' | 'time' | 'event';
  timestamp: Date;
  data: {
    home_score?: number;
    away_score?: number;
    status?: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
    match_time?: number; // Minutes elapsed
    events?: MatchEvent[];
  };
  updated_by?: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty' | 'own_goal';
  minute: number;
  player_id?: string;
  player_name: string;
  team_id: string;
  description?: string;
  additional_data?: Record<string, any>;
}

export interface BroadcastChannel {
  id: string;
  name: string;
  pattern: string; // e.g., "tournament:{id}", "match:{id}"
  subscribers: Set<WebSocketConnection>;
  last_activity: Date;
}

export interface WebSocketConnection {
  id: string;
  socket: WebSocket | any; // Allow for different WebSocket implementations
  user_id?: string;
  subscribed_channels: Set<string>;
  connected_at: Date;
  last_ping: Date;
  metadata?: Record<string, any>;
}

export interface StandingsUpdate {
  tournament_id: string;
  previous_standings: TeamStanding[];
  current_standings: TeamStanding[];
  affected_teams: string[];
  position_changes: PositionChange[];
  triggered_by_match: string;
  update_time: Date;
}

export interface PositionChange {
  team_id: string;
  team_name: string;
  previous_position: number;
  current_position: number;
  change: number; // Positive = moved up, negative = moved down
}

export class LiveUpdateEngine {
  private channels: Map<string, BroadcastChannel> = new Map();
  private connections: Map<string, WebSocketConnection> = new Map();
  private standingsEngine: AdvancedStandingsEngine;
  private tournament: Tournament;
  
  // Configuration
  private config = {
    heartbeat_interval: 30000, // 30 seconds
    cleanup_interval: 300000, // 5 minutes
    max_connections: 1000,
    rate_limit: {
      updates_per_minute: 100,
      burst_limit: 20
    }
  };

  // Rate limiting
  private rateLimiter: Map<string, { count: number; window: Date }> = new Map();

  constructor(tournament: Tournament, standingsEngine: AdvancedStandingsEngine) {
    this.tournament = tournament;
    this.standingsEngine = standingsEngine;
    
    this.initializeChannels();
    this.startHeartbeat();
    this.startCleanup();
  }

  private initializeChannels(): void {
    // Tournament-wide channel
    this.createChannel(`tournament:${this.tournament.id}`, 'Tournament Updates');
    
    // Standings channel
    this.createChannel(`standings:${this.tournament.id}`, 'Live Standings');
    
    // Create match-specific channels for active matches
    // This would be called when matches become live
  }

  public createMatchChannel(matchId: string): void {
    this.createChannel(`match:${matchId}`, `Match ${matchId} Updates`);
  }

  private createChannel(channelId: string, name: string): BroadcastChannel {
    if (this.channels.has(channelId)) {
      return this.channels.get(channelId)!;
    }

    const channel: BroadcastChannel = {
      id: channelId,
      name,
      pattern: channelId,
      subscribers: new Set(),
      last_activity: new Date()
    };

    this.channels.set(channelId, channel);
    return channel;
  }

  public addConnection(connectionId: string, socket: any, userId?: string): void {
    if (this.connections.size >= this.config.max_connections) {
      socket.close(1013, 'Server at capacity');
      return;
    }

    const connection: WebSocketConnection = {
      id: connectionId,
      socket,
      user_id: userId,
      subscribed_channels: new Set(),
      connected_at: new Date(),
      last_ping: new Date()
    };

    this.connections.set(connectionId, connection);

    // Set up socket event handlers
    this.setupSocketHandlers(connection);

    console.log(`Connection ${connectionId} added. Total connections: ${this.connections.size}`);
  }

  private setupSocketHandlers(connection: WebSocketConnection): void {
    const socket = connection.socket;

    socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handleClientMessage(connection, message);
      } catch (error) {
        console.error('Invalid message format:', error);
        this.sendError(connection, 'Invalid message format');
      }
    });

    socket.on('close', () => {
      this.removeConnection(connection.id);
    });

    socket.on('error', (error: Error) => {
      console.error(`WebSocket error for ${connection.id}:`, error);
      this.removeConnection(connection.id);
    });

    socket.on('pong', () => {
      connection.last_ping = new Date();
    });
  }

  private handleClientMessage(connection: WebSocketConnection, message: any): void {
    // Rate limiting check
    if (!this.checkRateLimit(connection.id)) {
      this.sendError(connection, 'Rate limit exceeded');
      return;
    }

    switch (message.type) {
      case 'subscribe':
        this.subscribeToChannel(connection, message.channel);
        break;
      case 'unsubscribe':
        this.unsubscribeFromChannel(connection, message.channel);
        break;
      case 'ping':
        this.sendMessage(connection, { type: 'pong', timestamp: new Date() });
        break;
      case 'match_update':
        if (connection.user_id) {
          this.handleMatchUpdate(message.data, connection.user_id);
        }
        break;
      default:
        this.sendError(connection, 'Unknown message type');
    }
  }

  private checkRateLimit(connectionId: string): boolean {
    const now = new Date();
    const limit = this.rateLimiter.get(connectionId);

    if (!limit || (now.getTime() - limit.window.getTime()) > 60000) {
      // Reset window
      this.rateLimiter.set(connectionId, { count: 1, window: now });
      return true;
    }

    if (limit.count >= this.config.rate_limit.updates_per_minute) {
      return false;
    }

    limit.count++;
    return true;
  }

  public subscribeToChannel(connection: WebSocketConnection, channelId: string): void {
    const channel = this.channels.get(channelId);
    
    if (!channel) {
      this.sendError(connection, `Channel ${channelId} not found`);
      return;
    }

    channel.subscribers.add(connection);
    connection.subscribed_channels.add(channelId);

    this.sendMessage(connection, {
      type: 'subscription_confirmed',
      channel: channelId,
      message: `Subscribed to ${channel.name}`
    });

    console.log(`Connection ${connection.id} subscribed to ${channelId}`);
  }

  public unsubscribeFromChannel(connection: WebSocketConnection, channelId: string): void {
    const channel = this.channels.get(channelId);
    
    if (channel) {
      channel.subscribers.delete(connection);
    }
    
    connection.subscribed_channels.delete(channelId);

    this.sendMessage(connection, {
      type: 'unsubscription_confirmed',
      channel: channelId
    });
  }

  public removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    
    if (!connection) return;

    // Remove from all channels
    Array.from(connection.subscribed_channels).forEach(channelId => {
      const channel = this.channels.get(channelId);
      if (channel) {
        channel.subscribers.delete(connection);
      }
    });

    this.connections.delete(connectionId);
    this.rateLimiter.delete(connectionId);

    console.log(`Connection ${connectionId} removed. Total connections: ${this.connections.size}`);
  }

  public async handleMatchUpdate(update: LiveMatchUpdate, updatedBy?: string): Promise<void> {
    // Validate update
    if (!this.validateMatchUpdate(update)) {
      console.error('Invalid match update:', update);
      return;
    }

    try {
      // Store update in database (implementation would depend on your DB setup)
      await this.persistMatchUpdate(update);

      // Broadcast to match-specific channel
      const matchChannel = `match:${update.match_id}`;
      await this.broadcastToChannel(matchChannel, {
        type: 'match_update',
        data: update,
        timestamp: new Date()
      });

      // Broadcast to tournament channel
      const tournamentChannel = `tournament:${update.tournament_id}`;
      await this.broadcastToChannel(tournamentChannel, {
        type: 'match_update',
        data: update,
        timestamp: new Date()
      });

      // If match is finished, update standings
      if (update.data.status === 'finished' && 
          update.data.home_score !== undefined && 
          update.data.away_score !== undefined) {
        await this.updateAndBroadcastStandings(update);
      }

    } catch (error) {
      console.error('Error handling match update:', error);
    }
  }

  private validateMatchUpdate(update: LiveMatchUpdate): boolean {
    // Basic validation
    if (!update.match_id || !update.tournament_id || !update.update_type) {
      return false;
    }

    // Validate scores are non-negative
    if (update.data.home_score !== undefined && update.data.home_score < 0) return false;
    if (update.data.away_score !== undefined && update.data.away_score < 0) return false;

    // Validate match time
    if (update.data.match_time !== undefined && update.data.match_time < 0) return false;

    return true;
  }

  private async persistMatchUpdate(update: LiveMatchUpdate): Promise<void> {
    // Implementation would persist to database
    // For now, just log
    console.log('Persisting match update:', {
      match_id: update.match_id,
      type: update.update_type,
      timestamp: update.timestamp
    });
  }

  private async updateAndBroadcastStandings(matchUpdate: LiveMatchUpdate): Promise<void> {
    try {
      // Get all tournament matches
      const allMatches = await this.getTournamentMatches(matchUpdate.tournament_id);
      
      // Calculate new standings
      const previousStandings = this.standingsEngine.calculateStandings(
        allMatches.filter(m => m.id !== matchUpdate.match_id)
      );
      
      const currentStandings = this.standingsEngine.calculateStandings(allMatches);
      
      // Calculate position changes
      const positionChanges = this.calculatePositionChanges(previousStandings, currentStandings);
      
      const standingsUpdate: StandingsUpdate = {
        tournament_id: matchUpdate.tournament_id,
        previous_standings: previousStandings,
        current_standings: currentStandings,
        affected_teams: positionChanges.map(pc => pc.team_id),
        position_changes: positionChanges,
        triggered_by_match: matchUpdate.match_id,
        update_time: new Date()
      };

      // Broadcast standings update
      const standingsChannel = `standings:${matchUpdate.tournament_id}`;
      await this.broadcastToChannel(standingsChannel, {
        type: 'standings_update',
        data: standingsUpdate,
        timestamp: new Date()
      });

      // Also broadcast to tournament channel
      const tournamentChannel = `tournament:${matchUpdate.tournament_id}`;
      await this.broadcastToChannel(tournamentChannel, {
        type: 'standings_update',
        data: standingsUpdate,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error updating standings:', error);
    }
  }

  private calculatePositionChanges(
    previous: TeamStanding[], 
    current: TeamStanding[]
  ): PositionChange[] {
    const changes: PositionChange[] = [];
    
    for (const currentTeam of current) {
      const previousTeam = previous.find(p => p.team_id === currentTeam.team_id);
      
      if (previousTeam && previousTeam.position !== currentTeam.position) {
        changes.push({
          team_id: currentTeam.team_id,
          team_name: currentTeam.team_name,
          previous_position: previousTeam.position,
          current_position: currentTeam.position,
          change: previousTeam.position - currentTeam.position // Positive = moved up
        });
      }
    }
    
    return changes;
  }

  private async getTournamentMatches(tournamentId: string): Promise<Match[]> {
    // Implementation would fetch from database
    // For now, return tournament matches
    return this.tournament.matches.filter(m => m.tournament_id === tournamentId);
  }

  public async broadcastToChannel(channelId: string, message: any): Promise<void> {
    const channel = this.channels.get(channelId);
    
    if (!channel) {
      console.warn(`Attempted to broadcast to non-existent channel: ${channelId}`);
      return;
    }

    channel.last_activity = new Date();
    
    const broadcastPromises: Promise<void>[] = [];
    
    Array.from(channel.subscribers).forEach(connection => {
      broadcastPromises.push(this.sendMessage(connection, message));
    });

    await Promise.allSettled(broadcastPromises);
    
    console.log(`Broadcasted to ${channel.subscribers.size} subscribers on ${channelId}`);
  }

  private async sendMessage(connection: WebSocketConnection, message: any): Promise<void> {
    try {
      if (connection.socket.readyState === 1) { // WebSocket.OPEN
        connection.socket.send(JSON.stringify(message));
      } else {
        // Connection is closed, remove it
        this.removeConnection(connection.id);
      }
    } catch (error) {
      console.error(`Error sending message to ${connection.id}:`, error);
      this.removeConnection(connection.id);
    }
  }

  private sendError(connection: WebSocketConnection, error: string): void {
    this.sendMessage(connection, {
      type: 'error',
      message: error,
      timestamp: new Date()
    });
  }

  private startHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      
      Array.from(this.connections.entries()).forEach(([connectionId, connection]) => {
        // Check if connection is still alive
        const timeSinceLastPing = now.getTime() - connection.last_ping.getTime();
        
        if (timeSinceLastPing > this.config.heartbeat_interval * 2) {
          // Connection appears dead
          console.log(`Removing dead connection: ${connectionId}`);
          this.removeConnection(connectionId);
        } else if (timeSinceLastPing > this.config.heartbeat_interval) {
          // Send ping
          try {
            connection.socket.ping();
          } catch (error) {
            console.error(`Error pinging ${connectionId}:`, error);
            this.removeConnection(connectionId);
          }
        }
      });
    }, this.config.heartbeat_interval);
  }

  private startCleanup(): void {
    setInterval(() => {
      // Clean up inactive channels
      Array.from(this.channels.entries()).forEach(([channelId, channel]) => {
        if (channel.subscribers.size === 0 && 
            Date.now() - channel.last_activity.getTime() > this.config.cleanup_interval) {
          this.channels.delete(channelId);
          console.log(`Cleaned up inactive channel: ${channelId}`);
        }
      });

      // Clean up rate limiter entries
      const cutoff = Date.now() - 60000; // 1 minute ago
      Array.from(this.rateLimiter.entries()).forEach(([connectionId, limit]) => {
        if (limit.window.getTime() < cutoff) {
          this.rateLimiter.delete(connectionId);
        }
      });

    }, this.config.cleanup_interval);
  }

  // Public API methods for monitoring
  public getConnectionCount(): number {
    return this.connections.size;
  }

  public getChannelStats(): Array<{ id: string; name: string; subscribers: number; last_activity: Date }> {
    return Array.from(this.channels.values()).map(channel => ({
      id: channel.id,
      name: channel.name,
      subscribers: channel.subscribers.size,
      last_activity: channel.last_activity
    }));
  }

  public getConnectionStats(): Array<{ id: string; user_id?: string; channels: number; connected_at: Date }> {
    return Array.from(this.connections.values()).map(connection => ({
      id: connection.id,
      user_id: connection.user_id,
      channels: connection.subscribed_channels.size,
      connected_at: connection.connected_at
    }));
  }

  public shutdown(): void {
    // Close all connections
    Array.from(this.connections.values()).forEach(connection => {
      try {
        connection.socket.close(1001, 'Server shutting down');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    });

    this.connections.clear();
    this.channels.clear();
    this.rateLimiter.clear();

    console.log('Live update engine shutdown complete');
  }
}