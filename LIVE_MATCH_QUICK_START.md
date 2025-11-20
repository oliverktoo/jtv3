# Live Match Features - Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### **Step 1: Apply Database Migration**
```powershell
# Option A: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project → SQL Editor
3. Copy entire contents of: migrations/live_match_features.sql
4. Paste and click "Run"
5. Verify success messages

# Option B: Node Script
node apply-live-match-migration.mjs
```

### **Step 2: Start Server**
```powershell
npm run dev:server:working
```

### **Step 3: Test Implementation**
```powershell
node test-live-match-features.mjs
# Expected: 15/15 tests passing ✅
```

---

## 📝 API Usage Examples

### **1. Add Match Event (Goal)**
```javascript
const response = await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'GOAL',
    minute: 23,
    added_time: 0,
    team_id: 'team-uuid',
    player_id: 'player-uuid', // Optional
    description: 'Header from corner kick',
    metadata: {
      assist: 'player2-uuid',
      technique: 'header',
      bodyPart: 'head'
    }
  })
});

const result = await response.json();
// { success: true, data: { id: '...', event_type: 'GOAL', ... } }
```

### **2. Add Yellow/Red Card**
```javascript
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'YELLOW_CARD', // or 'RED_CARD'
    minute: 45,
    added_time: 2,
    team_id: 'team-uuid',
    player_id: 'player-uuid',
    description: 'Dangerous tackle - caution',
    metadata: {
      reason: 'foul',
      severity: 'high'
    }
  })
});

// Statistics automatically increment home_yellow_cards or away_yellow_cards
```

### **3. Add Substitution**
```javascript
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'SUBSTITUTION',
    minute: 60,
    team_id: 'team-uuid',
    description: 'Tactical substitution',
    metadata: {
      player_in: 'player-in-uuid',
      player_out: 'player-out-uuid',
      reason: 'tactical'
    }
  })
});
```

### **4. Get All Match Events**
```javascript
const response = await fetch('/api/matches/MATCH_ID/events');
const { data: events } = await response.json();

// Returns array sorted by minute:
// [
//   { event_type: 'KICK_OFF', minute: 0, ... },
//   { event_type: 'GOAL', minute: 23, ... },
//   { event_type: 'YELLOW_CARD', minute: 35, ... },
//   { event_type: 'HALF_TIME', minute: 45, ... },
//   ...
// ]
```

### **5. Update Live Statistics**
```javascript
await fetch('/api/matches/MATCH_ID/statistics', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Possession (must total 100)
    home_possession: 58,
    away_possession: 42,
    
    // Shots
    home_shots: 12,
    away_shots: 8,
    home_shots_on_target: 5,
    away_shots_on_target: 3,
    
    // Corners, Fouls, etc.
    home_corners: 6,
    away_corners: 3,
    home_fouls: 8,
    away_fouls: 11,
    
    // Match time
    current_minute: 67,
    period: 'SECOND_HALF' // FIRST_HALF, HALF_TIME, SECOND_HALF, EXTRA_TIME, PENALTIES
  })
});

// Broadcasts update via WebSocket automatically
```

### **6. Add Live Commentary**
```javascript
await fetch('/api/matches/MATCH_ID/commentary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    commentary: 'Exciting first half! Home team leads 2-1 with dominant possession. Away team fighting back with counter-attacks.'
  })
});
```

### **7. Get Match Statistics**
```javascript
const response = await fetch('/api/matches/MATCH_ID/statistics');
const { data: stats } = await response.json();

// Returns:
// {
//   home_possession: 58,
//   away_possession: 42,
//   home_shots: 12,
//   away_shots: 8,
//   home_yellow_cards: 2,
//   away_red_cards: 1,
//   commentary: '...',
//   current_minute: 67,
//   period: 'SECOND_HALF'
// }
```

---

## ⚡ Real-Time Updates (WebSocket)

### **Subscribe to Live Updates**
```typescript
import { useTournamentWebSocket } from '@/hooks/useTournamentWebSocket';

function LiveMatchComponent({ tournamentId, matchId }) {
  const { subscribe } = useTournamentWebSocket(tournamentId);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      // New match event
      if (message.type === 'match:event' && message.matchId === matchId) {
        setEvents(prev => [...prev, message.event]);
      }
      
      // Statistics update
      if (message.type === 'match:statistics' && message.matchId === matchId) {
        setStats(message.statistics);
      }
      
      // Commentary update
      if (message.type === 'match:commentary' && message.matchId === matchId) {
        setCommentary(message.commentary);
      }
    });

    return unsubscribe;
  }, [tournamentId, matchId]);

  return (
    <div>
      {/* Display live data */}
      <h2>Live Statistics</h2>
      <p>Possession: {stats.home_possession}% - {stats.away_possession}%</p>
      
      <h2>Match Events</h2>
      {events.map(event => (
        <div key={event.id}>
          {event.minute}' - {event.event_type}: {event.description}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Common Workflows

### **Workflow 1: Complete Match Tracking**

```javascript
// 1. Match starts
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  body: JSON.stringify({ event_type: 'KICK_OFF', minute: 0, team_id: 'home-team' })
});

// 2. Update possession every 5 minutes
setInterval(async () => {
  await fetch('/api/matches/MATCH_ID/statistics', {
    method: 'PATCH',
    body: JSON.stringify({
      home_possession: calculatePossession(),
      away_possession: 100 - calculatePossession(),
      current_minute: getCurrentMinute()
    })
  });
}, 300000); // Every 5 minutes

// 3. Add events as they happen
async function onGoal(minute, teamId, playerId) {
  await fetch('/api/matches/MATCH_ID/events', {
    method: 'POST',
    body: JSON.stringify({
      event_type: 'GOAL',
      minute,
      team_id: teamId,
      player_id: playerId,
      description: 'Goal scored!'
    })
  });
  
  // Auto-updates match score and broadcasts to viewers
}

// 4. Half-time
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  body: JSON.stringify({ event_type: 'HALF_TIME', minute: 45, team_id: 'home-team' })
});

await fetch('/api/matches/MATCH_ID/statistics', {
  method: 'PATCH',
  body: JSON.stringify({ period: 'HALF_TIME', current_minute: 45 })
});

// 5. Second half
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  body: JSON.stringify({ event_type: 'KICK_OFF', minute: 46, team_id: 'away-team' })
});

await fetch('/api/matches/MATCH_ID/statistics', {
  method: 'PATCH',
  body: JSON.stringify({ period: 'SECOND_HALF', current_minute: 46 })
});

// 6. Final whistle
await fetch('/api/matches/MATCH_ID/events', {
  method: 'POST',
  body: JSON.stringify({ event_type: 'FULL_TIME', minute: 90, team_id: 'home-team' })
});

await fetch('/api/matches/MATCH_ID', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'COMPLETED' })
});
```

### **Workflow 2: Live Statistics Dashboard**

```javascript
// Fetch initial data
const [events, stats] = await Promise.all([
  fetch('/api/matches/MATCH_ID/events').then(r => r.json()),
  fetch('/api/matches/MATCH_ID/statistics').then(r => r.json())
]);

// Display dashboard
function renderDashboard(events, stats) {
  return `
    <div class="live-dashboard">
      <div class="stats">
        <div class="possession">
          <span>${stats.home_possession}%</span>
          <div class="bar">
            <div style="width: ${stats.home_possession}%"></div>
          </div>
          <span>${stats.away_possession}%</span>
        </div>
        
        <div class="shots">
          <span>${stats.home_shots} (${stats.home_shots_on_target} on target)</span>
          <span>Shots</span>
          <span>${stats.away_shots} (${stats.away_shots_on_target} on target)</span>
        </div>
        
        <div class="cards">
          <span>🟨 ${stats.home_yellow_cards} 🟥 ${stats.home_red_cards}</span>
          <span>Cards</span>
          <span>🟨 ${stats.away_yellow_cards} 🟥 ${stats.away_red_cards}</span>
        </div>
      </div>
      
      <div class="events-timeline">
        ${events.map(e => `
          <div class="event ${e.event_type.toLowerCase()}">
            <span class="minute">${e.minute}'</span>
            <span class="type">${e.event_type}</span>
            <span class="desc">${e.description}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="commentary">
        <p>${stats.commentary}</p>
      </div>
    </div>
  `;
}

// Subscribe to updates
useTournamentWebSocket(tournamentId).subscribe((message) => {
  if (message.matchId === MATCH_ID) {
    updateDashboard(message);
  }
});
```

---

## 🔍 Database Queries

### **Query 1: Get All Goals in a Match**
```sql
SELECT 
    me.minute,
    me.added_time,
    me.description,
    t.name as team_name,
    me.metadata
FROM match_events me
JOIN teams t ON me.team_id = t.id
WHERE me.match_id = 'MATCH_ID'
    AND me.event_type = 'GOAL'
ORDER BY me.minute, me.created_at;
```

### **Query 2: Get Live Match Dashboard**
```sql
SELECT * FROM live_match_dashboard
WHERE match_id = 'MATCH_ID';

-- Returns complete match overview with events and statistics
```

### **Query 3: Match Events with Team Names**
```sql
SELECT * FROM match_events_detailed
WHERE match_id = 'MATCH_ID'
ORDER BY minute, created_at;
```

### **Query 4: Cards Summary**
```sql
SELECT 
    t.name as team_name,
    COUNT(*) FILTER (WHERE me.event_type = 'YELLOW_CARD') as yellow_cards,
    COUNT(*) FILTER (WHERE me.event_type = 'RED_CARD') as red_cards
FROM match_events me
JOIN teams t ON me.team_id = t.id
WHERE me.match_id = 'MATCH_ID'
GROUP BY t.name;
```

---

## 🎨 UI Component Examples

### **Live Match Event Feed**
```tsx
import { useQuery } from '@tanstack/react-query';
import { useTournamentWebSocket } from '@/hooks/useTournamentWebSocket';

function LiveEventFeed({ matchId, tournamentId }) {
  const [liveEvents, setLiveEvents] = useState([]);
  
  // Initial data
  const { data: initialEvents } = useQuery({
    queryKey: ['match-events', matchId],
    queryFn: () => fetch(`/api/matches/${matchId}/events`).then(r => r.json())
  });
  
  // Live updates
  const { subscribe } = useTournamentWebSocket(tournamentId);
  
  useEffect(() => {
    return subscribe((message) => {
      if (message.type === 'match:event' && message.matchId === matchId) {
        setLiveEvents(prev => [...prev, message.event]);
      }
    });
  }, [matchId]);
  
  const allEvents = [...(initialEvents?.data || []), ...liveEvents];
  
  return (
    <div className="event-feed">
      {allEvents.map(event => (
        <div key={event.id} className={`event ${event.event_type}`}>
          <span className="minute">{event.minute}'</span>
          {event.event_type === 'GOAL' && '⚽'}
          {event.event_type === 'YELLOW_CARD' && '🟨'}
          {event.event_type === 'RED_CARD' && '🟥'}
          {event.event_type === 'SUBSTITUTION' && '🔄'}
          <span className="description">{event.description}</span>
        </div>
      ))}
    </div>
  );
}
```

### **Live Statistics Panel**
```tsx
function LiveStatsPanel({ matchId }) {
  const { data: stats } = useQuery({
    queryKey: ['match-stats', matchId],
    queryFn: () => fetch(`/api/matches/${matchId}/statistics`).then(r => r.json()),
    refetchInterval: 10000 // Refetch every 10 seconds
  });
  
  if (!stats?.data) return <div>Loading...</div>;
  
  const { home_possession, away_possession, home_shots, away_shots, 
          home_shots_on_target, away_shots_on_target } = stats.data;
  
  return (
    <div className="stats-panel">
      <StatBar 
        label="Possession"
        homeValue={home_possession}
        awayValue={away_possession}
        unit="%"
      />
      <StatBar 
        label="Shots"
        homeValue={home_shots}
        awayValue={away_shots}
        homeDetail={`${home_shots_on_target} on target`}
        awayDetail={`${away_shots_on_target} on target`}
      />
      <StatBar 
        label="Corners"
        homeValue={stats.data.home_corners}
        awayValue={stats.data.away_corners}
      />
    </div>
  );
}
```

---

## ✅ Checklist for Go-Live

- [ ] Migration applied successfully
- [ ] Server running on port 5000
- [ ] All 15 tests passing
- [ ] WebSocket server initialized
- [ ] Test match event creation
- [ ] Test statistics update
- [ ] Test commentary addition
- [ ] Verify WebSocket broadcasts
- [ ] Check database views work
- [ ] Test with live match
- [ ] Monitor performance
- [ ] Ready for production! 🚀

---

## 📚 Additional Resources

- **Full Documentation:** `LIVE_MATCH_FEATURES_COMPLETE.md`
- **Migration SQL:** `migrations/live_match_features.sql`
- **Test Suite:** `test-live-match-features.mjs`
- **Schema Definitions:** `shared/schema.ts`
- **API Implementation:** `server/working-server.mjs`

---

**Questions?** Check `LIVE_MATCH_FEATURES_COMPLETE.md` for comprehensive documentation!
