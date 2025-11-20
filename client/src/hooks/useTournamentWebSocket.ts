import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Enterprise WebSocket Hook for Real-time Tournament Updates
 * Connects to backend EnterpriseWebSocketServer for live match scores, standings, and events
 */

export interface MatchUpdate {
  type: 'match:started' | 'match:completed' | 'match:event' | 'match:score_update';
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status?: string;
  event?: {
    type: 'GOAL' | 'CARD' | 'SUBSTITUTION';
    minute: number;
    player?: string;
    team?: string;
  };
  timestamp: string;
}

export interface StandingsUpdate {
  type: 'standings:updated';
  tournamentId: string;
  standings: Array<{
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
    position: number;
  }>;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
}

interface UseTournamentWebSocketOptions {
  tournamentId?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMatchUpdate?: (update: MatchUpdate) => void;
  onStandingsUpdate?: (update: StandingsUpdate) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export const useTournamentWebSocket = (options: UseTournamentWebSocketOptions = {}) => {
  const {
    tournamentId,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    onMatchUpdate,
    onStandingsUpdate,
    onConnectionChange
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });

  const [lastMatchUpdate, setLastMatchUpdate] = useState<MatchUpdate | null>(null);
  const [lastStandingsUpdate, setLastStandingsUpdate] = useState<StandingsUpdate | null>(null);

  // Update connection status and notify callback
  const updateConnectionStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  // Send message to WebSocket server
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('⚠️ WebSocket not connected, cannot send message');
    return false;
  }, []);

  // Subscribe to tournament updates
  const subscribe = useCallback((tournamentId: string) => {
    console.log(`📺 Subscribing to tournament: ${tournamentId}`);
    return send({ type: 'subscribe', tournamentId });
  }, [send]);

  // Unsubscribe from tournament updates
  const unsubscribe = useCallback((tournamentId: string) => {
    console.log(`📺 Unsubscribing from tournament: ${tournamentId}`);
    return send({ type: 'unsubscribe', tournamentId });
  }, [send]);

  // Request current standings
  const requestStandings = useCallback((tournamentId: string) => {
    return send({ type: 'get_standings', tournamentId });
  }, [send]);

  // Request current fixtures
  const requestFixtures = useCallback((tournamentId: string) => {
    return send({ type: 'get_fixtures', tournamentId });
  }, [send]);

  // Start heartbeat to keep connection alive
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ type: 'heartbeat' });
      }
    }, 30000); // Every 30 seconds
  }, [send]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connection':
          console.log('✅ WebSocket connected:', data.data.clientId);
          updateConnectionStatus({ connected: true, reconnecting: false });
          reconnectAttemptsRef.current = 0;
          startHeartbeat();
          
          // Auto-subscribe to tournament if provided
          if (tournamentId) {
            subscribe(tournamentId);
          }
          break;

        case 'subscribed':
          console.log(`📺 Subscribed to tournament: ${data.data.tournamentId}`);
          break;

        case 'unsubscribed':
          console.log(`📺 Unsubscribed from tournament: ${data.data.tournamentId}`);
          break;

        case 'match:started':
        case 'match:completed':
        case 'match:event':
        case 'match:score_update':
          const matchUpdate = data as MatchUpdate;
          setLastMatchUpdate(matchUpdate);
          onMatchUpdate?.(matchUpdate);
          console.log(`⚽ Match update: ${matchUpdate.type}`, matchUpdate);
          break;

        case 'standings:updated':
          const standingsUpdate = data as StandingsUpdate;
          setLastStandingsUpdate(standingsUpdate);
          onStandingsUpdate?.(standingsUpdate);
          console.log(`📊 Standings updated for tournament: ${standingsUpdate.tournamentId}`);
          break;

        case 'heartbeat':
          // Silent heartbeat response
          break;

        case 'error':
          console.error('❌ WebSocket error from server:', data.message);
          updateConnectionStatus({ 
            connected: true, 
            reconnecting: false, 
            error: data.message 
          });
          break;

        default:
          console.log('📨 Received WebSocket message:', data);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }, [tournamentId, subscribe, onMatchUpdate, onStandingsUpdate, updateConnectionStatus, startHeartbeat]);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:5000`;
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connection opened');
        updateConnectionStatus({ connected: true, reconnecting: false });
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        updateConnectionStatus({ 
          connected: false, 
          reconnecting: false, 
          error: 'Connection error' 
        });
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: Code ${event.code}, Reason: ${event.reason || 'N/A'}`);
        stopHeartbeat();
        updateConnectionStatus({ connected: false, reconnecting: false });

        // Auto-reconnect if not intentional close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          updateConnectionStatus({ 
            connected: false, 
            reconnecting: true 
          });

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('❌ Max reconnect attempts reached');
          updateConnectionStatus({ 
            connected: false, 
            reconnecting: false, 
            error: 'Max reconnect attempts reached' 
          });
        }
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      updateConnectionStatus({ 
        connected: false, 
        reconnecting: false, 
        error: 'Failed to create connection' 
      });
    }
  }, [handleMessage, reconnectInterval, maxReconnectAttempts, updateConnectionStatus, stopHeartbeat]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      // Unsubscribe from tournament before closing
      if (tournamentId) {
        unsubscribe(tournamentId);
      }
      
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    updateConnectionStatus({ connected: false, reconnecting: false });
    reconnectAttemptsRef.current = 0;
  }, [tournamentId, unsubscribe, stopHeartbeat, updateConnectionStatus]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Only run on mount/unmount

  // Handle tournament ID changes
  useEffect(() => {
    if (connectionStatus.connected && tournamentId) {
      subscribe(tournamentId);
      
      return () => {
        unsubscribe(tournamentId);
      };
    }
  }, [tournamentId, connectionStatus.connected, subscribe, unsubscribe]);

  return {
    // Connection status
    connected: connectionStatus.connected,
    reconnecting: connectionStatus.reconnecting,
    error: connectionStatus.error,

    // Latest updates
    lastMatchUpdate,
    lastStandingsUpdate,

    // Actions
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    requestStandings,
    requestFixtures,
    send,

    // Raw WebSocket reference (for advanced usage)
    ws: wsRef.current
  };
};
