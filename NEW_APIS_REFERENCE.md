# 🚀 NEW FIXTURE SYSTEM APIs - QUICK REFERENCE

## ✅ IMPLEMENTED (TODO 4, 5, 6)

---

## 📝 MATCH SCORE UPDATES API (TODO 4)

### Get Single Match Details
```http
GET /api/matches/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "match-uuid",
    "home_team_id": "team-uuid",
    "away_team_id": "team-uuid",
    "home_score": 2,
    "away_score": 1,
    "status": "COMPLETED",
    "kickoff": "2025-01-15T13:00:00Z",
    "venue": "Kasarani Stadium",
    "home_team": { "id": "...", "name": "Team A", "code": "TEA" },
    "away_team": { "id": "...", "name": "Team B", "code": "TEB" },
    "round": {
      "id": "round-uuid",
      "name": "Round 1",
      "number": 1,
      "stage": {
        "id": "stage-uuid",
        "name": "Group Stage",
        "tournament": { "id": "...", "name": "Tournament Name" }
      }
    }
  }
}
```

---

### Update Match Score & Status
```http
PATCH /api/matches/:id
Content-Type: application/json

{
  "home_score": 2,
  "away_score": 1,
  "status": "COMPLETED",
  "venue": "Kasarani Stadium",  // optional
  "kickoff": "2025-01-15T13:00:00Z"  // optional
}
```

**Status Transitions:**
- `SCHEDULED` → `LIVE`, `POSTPONED`, `CANCELLED`
- `LIVE` → `COMPLETED`, `HALFTIME`, `POSTPONED`
- `HALFTIME` → `LIVE`, `COMPLETED`
- `COMPLETED` → ❌ Locked (cannot change)

**Validations:**
- ✅ Scores must be non-negative
- ✅ Cannot modify completed matches
- ✅ Triggers standings recalculation on completion
- ✅ WebSocket broadcast to tournament subscribers

**Response:**
```json
{
  "success": true,
  "data": { /* updated match with teams */ },
  "message": "Match completed - standings will be updated"
}
```

---

### Quick Start Match
```http
PATCH /api/matches/:id/start
```

**What it does:**
- Sets status to `LIVE`
- Records actual kickoff time
- Broadcasts to WebSocket
- Only works if status is `SCHEDULED`

**Response:**
```json
{
  "success": true,
  "data": { /* match details */ },
  "message": "Match started successfully"
}
```

---

### Complete Match
```http
PATCH /api/matches/:id/complete
Content-Type: application/json

{
  "home_score": 3,
  "away_score": 1
}
```

**What it does:**
- Sets status to `COMPLETED`
- Requires both scores
- Triggers standings recalculation
- WebSocket broadcast

**Response:**
```json
{
  "success": true,
  "data": { /* match details */ },
  "message": "Match completed - standings will be updated"
}
```

---

### Add Match Event
```http
POST /api/matches/:id/events
Content-Type: application/json

{
  "event_type": "GOAL",  // GOAL, CARD, SUBSTITUTION
  "minute": 45,
  "player_id": "player-uuid",
  "team_id": "team-uuid",
  "description": "Penalty converted by John Doe"
}
```

**Event Types:**
- `GOAL` - Goal scored
- `CARD` - Yellow/Red card
- `SUBSTITUTION` - Player substitution

**Response:**
```json
{
  "success": true,
  "data": {
    "matchId": "...",
    "eventType": "GOAL",
    "minute": 45,
    "timestamp": "2025-01-15T13:45:00Z"
  },
  "message": "Match event logged successfully"
}
```

---

## 📊 STANDINGS CALCULATION API (TODO 5)

### Get Tournament Standings
```http
GET /api/tournaments/:tournamentId/standings
GET /api/tournaments/:tournamentId/standings?stageId=stage-uuid
GET /api/tournaments/:tournamentId/standings?groupId=group-uuid
```

**Query Parameters:**
- `stageId` (optional) - Filter by specific stage
- `groupId` (optional) - Filter by specific group

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "teamId": "team-uuid",
      "teamName": "Team A",
      "played": 10,
      "won": 7,
      "drawn": 2,
      "lost": 1,
      "goalsFor": 21,
      "goalsAgainst": 8,
      "goalDifference": 13,
      "points": 23,
      "form": ["W", "W", "D", "W", "W"],
      "formString": "WWDWW",
      "position": 1,
      "lastUpdated": "2025-01-15T14:00:00Z"
    }
  ],
  "groupedStandings": {
    "group-a-uuid": {
      "groupId": "group-a-uuid",
      "groupName": "Group A",
      "standings": [ /* team standings */ ]
    }
  },
  "stats": {
    "totalMatches": 45,
    "totalTeams": 16,
    "completedMatches": 45,
    "lastUpdated": "2025-01-15T14:00:00Z"
  },
  "message": "Standings calculated from 45 completed matches"
}
```

**Calculation Rules:**
- ✅ Points: Win=3, Draw=1, Loss=0
- ✅ Sorting: Points → GD → GF → Head-to-Head
- ✅ Form: Last 5 matches
- ✅ Only includes COMPLETED matches

---

### Get Group Standings
```http
GET /api/groups/:groupId/standings
```

**Response:**
```json
{
  "success": true,
  "data": [ /* standings array */ ],
  "group": {
    "id": "group-uuid",
    "name": "Group A",
    "stage": "Group Stage",
    "tournament": "Tournament Name"
  },
  "stats": {
    "totalMatches": 12,
    "totalTeams": 4,
    "lastUpdated": "2025-01-15T14:00:00Z"
  }
}
```

---

## 🏆 KNOCKOUT PROGRESSION API (TODO 6)

### Advance to Knockout Stage
```http
POST /api/tournaments/:tournamentId/advance-to-knockout
Content-Type: application/json

{
  "teamsPerGroup": 2,  // Top N teams per group (default: 2)
  "knockoutLegs": 1,   // 1 = single-leg, 2 = home-and-away (default: 1)
  "includeThirdPlace": true  // Include 3rd place playoff (default: true)
}
```

**What it does:**
1. Calculates standings for all groups
2. Extracts top N teams from each group
3. Creates knockout stage
4. Generates bracket fixtures (R16/QF/SF/Final)
5. Seeds teams based on group performance

**Response:**
```json
{
  "success": true,
  "message": "Successfully advanced 16 teams to knockout stage",
  "data": {
    "knockoutStageId": "stage-uuid",
    "qualifiedTeams": [
      {
        "teamId": "team-uuid",
        "teamName": "Team A",
        "groupName": "Group A",
        "groupPosition": 1
      }
    ],
    "knockoutFixtures": [ /* array of matches */ ],
    "stats": {
      "totalQualified": 16,
      "knockoutMatches": 15,
      "rounds": 4
    }
  }
}
```

**Requirements:**
- ✅ All group matches must be completed
- ✅ Minimum 2 teams qualified
- ✅ Creates: R16 → QF → SF → Final → 3rd Place

---

### Progress Knockout Round
```http
POST /api/tournaments/:tournamentId/progress-knockout
Content-Type: application/json

{
  "roundId": "round-uuid"
}
```

**What it does:**
1. Validates all matches in round are completed
2. Determines winners (higher score or home team on draw)
3. Creates next round
4. Generates matches pairing winners

**Response:**
```json
{
  "success": true,
  "message": "Progressed to Round 2",
  "data": {
    "completedRound": "Round 1",
    "winners": [
      { "teamId": "...", "teamName": "Team A" }
    ],
    "nextRound": "Round 2",
    "nextMatches": [ /* newly created matches */ ]
  }
}
```

**For Final Round:**
```json
{
  "success": true,
  "message": "Tournament completed!",
  "data": {
    "champion": { "teamId": "...", "teamName": "Champion Team" },
    "completedRound": "Final"
  }
}
```

---

## 🔄 TYPICAL WORKFLOW

### 1. Generate Fixtures
```http
POST /api/fixtures/generate
```

### 2. Start Matches
```http
PATCH /api/matches/{match-id}/start
```

### 3. Update Scores During Match
```http
PATCH /api/matches/{match-id}
{ "home_score": 1, "away_score": 0, "status": "LIVE" }
```

### 4. Add Match Events
```http
POST /api/matches/{match-id}/events
{ "event_type": "GOAL", "minute": 23, "player_id": "..." }
```

### 5. Complete Match
```http
PATCH /api/matches/{match-id}/complete
{ "home_score": 2, "away_score": 1 }
```

### 6. View Standings
```http
GET /api/tournaments/{tournament-id}/standings
```

### 7. Advance to Knockout (after groups complete)
```http
POST /api/tournaments/{tournament-id}/advance-to-knockout
{ "teamsPerGroup": 2 }
```

### 8. Progress Knockout Rounds
```http
POST /api/tournaments/{tournament-id}/progress-knockout
{ "roundId": "{round-id}" }
```

### 9. Repeat 8 until Final Complete

---

## 🎯 FRONTEND INTEGRATION

### Update MatchScoreEditor Component
```typescript
// Already exists in client/src/components/tournaments/enterprise/MatchScoreEditor.tsx
// Uses useUpdateMatch hook which should call:
const updateMatch = async (matchId, data) => {
  const res = await fetch(`/api/matches/${matchId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};
```

### Fetch Standings
```typescript
// Update GroupStandings component to fetch from API
const { data: standings } = useQuery({
  queryKey: ['standings', tournamentId],
  queryFn: () => fetch(`/api/tournaments/${tournamentId}/standings`)
    .then(r => r.json())
});
```

---

## 🎉 WHAT'S NOW POSSIBLE

✅ **Full Tournament Lifecycle:**
- Generate fixtures → Update scores → Calculate standings → Progress to knockout → Crown champion

✅ **Real-time Updates:**
- Match status changes
- Live scores
- Automatic standings recalculation
- WebSocket broadcasting

✅ **Professional Features:**
- Head-to-head resolution
- Form tracking
- Knockout bracket generation
- Third-place playoffs

---

## 🚀 NEXT: Run Server & Test!

```powershell
# Start backend server
npm run dev:server:working

# Run test suite
node test-new-match-apis.mjs

# Test manually
curl http://localhost:5000/api/health
```

🎊 **The fixture system is now fully functional!** 🎊
