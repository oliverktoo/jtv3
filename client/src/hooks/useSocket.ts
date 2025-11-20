import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Real-time registration update types
export interface RegistrationUpdatePayload {
  type: 'TEAMS_APPROVED' | 'TEAMS_REJECTED' | 'REGISTRATION_SUBMITTED';
  tournament_id: string;
  approved_teams?: Array<{
    registration_id: string;
    team_id: string;
    team_name: string;
    status: string;
  }>;
  rejected_teams?: Array<{
    registration_id: string;
    team_id: string;
    team_name: string;
    status: string;
    rejection_reason: string;
  }>;
  timestamp: string;
  approved_count?: number;
  rejected_count?: number;
}

interface UseSocketOptions {
  tournamentId?: string;
  onRegistrationUpdate?: (payload: RegistrationUpdatePayload) => void;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { tournamentId, onRegistrationUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RegistrationUpdatePayload | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = io('http://127.0.0.1:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id);
      setIsConnected(true);
      
      // Join tournament-specific room if provided
      if (tournamentId) {
        socket.emit('join-tournament', tournamentId);
        console.log(`📋 Joined tournament room: ${tournamentId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    // Registration update handler
    socket.on('registration-update', (payload: RegistrationUpdatePayload) => {
      console.log('🔔 Registration update received:', payload.type, payload);
      setLastUpdate(payload);
      
      // Call custom handler if provided
      if (onRegistrationUpdate) {
        onRegistrationUpdate(payload);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    return () => {
      if (tournamentId) {
        socket.emit('leave-tournament', tournamentId);
      }
      socket.disconnect();
    };
  }, [tournamentId, onRegistrationUpdate]);

  // Join a different tournament room
  const joinTournament = (newTournamentId: string) => {
    if (socketRef.current && isConnected) {
      // Leave current room if any
      if (tournamentId) {
        socketRef.current.emit('leave-tournament', tournamentId);
      }
      
      // Join new room
      socketRef.current.emit('join-tournament', newTournamentId);
      console.log(`📋 Switched to tournament room: ${newTournamentId}`);
    }
  };

  // Leave current tournament room
  const leaveTournament = () => {
    if (socketRef.current && isConnected && tournamentId) {
      socketRef.current.emit('leave-tournament', tournamentId);
      console.log(`📤 Left tournament room: ${tournamentId}`);
    }
  };

  // Send custom event (for future extensions)
  const emit = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    isConnected,
    lastUpdate,
    joinTournament,
    leaveTournament,
    emit,
    socket: socketRef.current
  };
};

// Specialized hook for tournament admin dashboard
export const useTournamentSocket = (tournamentId: string) => {
  const [registrationStats, setRegistrationStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });

  const handleRegistrationUpdate = (payload: RegistrationUpdatePayload) => {
    // Update local stats based on the update
    if (payload.type === 'TEAMS_APPROVED' && payload.approved_count) {
      setRegistrationStats(prev => ({
        ...prev,
        approved: prev.approved + payload.approved_count!,
        pending: prev.pending - payload.approved_count!
      }));
    } else if (payload.type === 'TEAMS_REJECTED' && payload.rejected_count) {
      setRegistrationStats(prev => ({
        ...prev,
        rejected: prev.rejected + payload.rejected_count!,
        pending: prev.pending - payload.rejected_count!
      }));
    }
  };

  const socket = useSocket({
    tournamentId,
    onRegistrationUpdate: handleRegistrationUpdate
  });

  return {
    ...socket,
    registrationStats,
    updateStats: setRegistrationStats
  };
};