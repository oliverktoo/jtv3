# Jamii Fixture Maker - Complete Guide

## 📋 Overview

The Jamii Fixture Maker is an intelligent fixture generation system that automatically creates tournament schedules based on geographic distribution and tournament format. This guide covers how to create matches/fixtures from start to finish.

---

## 🎯 Prerequisites

Before generating fixtures, ensure you have:

1. **✅ Created a Tournament**
   - Tournament name, dates, and location set
   - Tournament type selected (LEAGUE, ADMINISTRATIVE_WARD, etc.)

2. **✅ Registered Teams**
   - Minimum of 2 teams required
   - Teams must be registered to the tournament via `team_tournament_registrations` table
   - Teams should have location data (county, sub-county, ward) for geographic optimization
   - **⚠️ IMPORTANT**: Teams must have `registration_status = 'APPROVED'` to be included in fixture generation

3. **✅ Approved Team Registrations** ⭐
   - Navigate to **Tournament Super Hub** → Select Tournament → **Team Registrations Tab**
   - Review pending teams (status: SUBMITTED)
   - Select teams and click **"Approve Selected"** button
   - Only APPROVED teams will be fetched for fixture generation
   - **See [HOW_TO_APPROVE_TEAMS.md](./HOW_TO_APPROVE_TEAMS.md) for detailed approval guide**

4. **✅ Tournament Configuration**
   - Format: `group_knockout` or `round_robin`
   - Number of groups (for group_knockout format)
   - Number of legs (1 for single round-robin, 2 for home-and-away)

---

## 🚀 Method 1: Using the UI (Recommended for Users)

### Step 1: Navigate to Tournament Super Hub

1. Open the Jamii Tourney application in your browser
2. Go to **Tournaments** page
3. This opens the **Tournament Super Hub** with all tournaments
4. Click on the tournament card you want to generate fixtures for
5. The tournament details and management tabs will appear below

### Step 2: Generate Fixtures Dialog

1. In the Tournament Super Hub, find the **"Generate Fixtures"** button
2. Click the button to open the Generate Fixtures Dialog

### Step 3: Configure Fixture Settings

The dialog will present several configuration options:

#### Required Fields:
- **Start Date**: Select the date when the tournament should begin
  - Format: `YYYY-MM-DD`
  - Example: `2025-12-01`

#### Optional Fields:
- **Kickoff Time**: Default match start time (default: `13:00`)
  - Format: `HH:MM` (24-hour)
  - Example: `15:00` for 3:00 PM

- **Weekends Only**: Toggle to schedule matches only on Saturdays and Sundays
  - Enabled by default
  - When enabled: Matches scheduled for Saturdays (15:00) and Sundays (13:00)
  - When disabled: Matches can be scheduled any day of the week

- **Home and Away**: Toggle for home-and-away fixtures
  - Enabled by default
  - When enabled: Each team plays every other team twice (home and away)
  - When disabled: Each team plays every other team once (single round-robin)

- **Default Venue**: Default venue name for all matches
  - Optional field
  - If left empty, the system will assign venues based on home team location
  - Example: `Kasarani Stadium`

### Step 4: Generate Fixtures

1. Click the **"Generate Fixtures"** button in the dialog
2. The system will:
   - Validate all inputs
   - Fetch registered teams from the database
   - Apply the Jamii Enhanced Engine algorithm
   - Create database records for stages, groups, rounds, and matches
   - Return confirmation with fixture count

3. Success Toast will appear: `"Fixtures generated successfully"`
   - The dialog will close automatically
   - Fixtures are now stored in the database

### Step 5: View Generated Fixtures

After generation, you can view fixtures in multiple ways:

1. **FixturesList Component**: 
   - Displays all fixtures grouped by round
   - Filter by status (SCHEDULED, LIVE, COMPLETED, POSTPONED, CANCELLED)
   - Filter by round number
   - Click any fixture to view details

2. **Fixtures Tab** (in Tournament Super Hub):
   - Shows organized fixture list
   - Export to Excel (XLSX)
   - Download as PDF

3. **Match Details Page**:
   - Click any match card to view full details
   - Edit scores, status, venue, and kickoff time
   - View match statistics

---

## 🔧 Method 2: Using the API (For Developers)

### Step 1: Prepare the Request

**Endpoint**: `POST /api/fixtures/generate`

**Request Body**:
```json
{
  "tournamentId": "uuid-of-tournament",
  "teams": [
    {
      "id": "team-uuid-1",
      "name": "Team Alpha",
      "county": "Nairobi",
      "sub_county": "Westlands",
      "ward": "Parklands"
    },
    {
      "id": "team-uuid-2",
      "name": "Team Beta",
      "county": "Kiambu",
      "sub_county": "Kikuyu",
      "ward": "Kikuyu Central"
    }
    // ... more teams
  ],
  "config": {
    "format": "group_knockout",  // or "round_robin"
    "numberOfGroups": 4,         // For group_knockout only
    "numberOfLegs": 2,           // 1 = single round, 2 = home-and-away
    "startDate": "2025-12-01",
    "defaultVenue": "Main Stadium",
    "kickoffTime": "15:00",
    "weekendsOnly": true
  }
}
```

### Step 2: Fetch Teams from Database

Before making the API call, fetch teams registered for the tournament:

```javascript
// Fetch teams registered for tournament
const { data: teamRegs } = await supabase
  .from('team_tournament_registrations')
  .select(`
    team_id,
    teams (
      id,
      name,
      county,
      sub_county,
      ward,
      logo_url
    )
  `)
  .eq('tournament_id', tournamentId);

const teams = teamRegs.map(reg => reg.teams);
```

### Step 3: Make API Call

```javascript
const response = await fetch('http://127.0.0.1:5000/api/fixtures/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tournamentId,
    teams,
    config: {
      format: 'round_robin',
      numberOfLegs: 2,
      startDate: '2025-12-01',
      defaultVenue: 'Main Stadium',
      kickoffTime: '15:00',
      weekendsOnly: true
    }
  })
});

const result = await response.json();
```

### Step 4: Handle Response

**Success Response** (200):
```json
{
  "success": true,
  "message": "Fixtures generated and saved successfully",
  "algorithm": "Jamii Enhanced Fixtures Engine",
  "saved": true,
  "fixtures": [
    {
      "id": "match-uuid",
      "homeTeam": "Team Alpha",
      "awayTeam": "Team Beta",
      "kickoff": "2025-12-01T15:00:00.000Z",
      "venue": "Parklands Stadium",
      "status": "SCHEDULED",
      "round": 1
    }
    // ... more matches
  ],
  "conflicts": [],  // Array of scheduling conflicts (if any)
  "groups": [       // For group_knockout format
    {
      "name": "Group A",
      "teams": ["Team Alpha", "Team Beta", "Team Gamma"]
    }
  ],
  "stage": {
    "id": "stage-uuid",
    "name": "Group Stage",
    "tournament_id": "tournament-uuid"
  },
  "rounds": [
    {
      "id": "round-uuid",
      "number": 1,
      "name": "Round 1",
      "leg": 1
    }
  ]
}
```

**Error Response** (400/404/500):
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 📊 Understanding Tournament Formats

### 1. Round Robin Format (`round_robin`)

**Best For**: League tournaments, small tournaments (2-20 teams)

**How It Works**:
- Every team plays every other team
- Uses the "Circle Method" algorithm
- Automatically balances home/away fixtures
- Handles odd number of teams (assigns BYE)

**Configuration**:
```json
{
  "format": "round_robin",
  "numberOfLegs": 2,  // 1 = single round, 2 = home-and-away
  "startDate": "2025-12-01",
  "weekendsOnly": true
}
```

**Formula**:
- Single Round: `n * (n - 1) / 2` matches (where n = number of teams)
- Home-and-Away: `n * (n - 1)` matches

**Example**: 8 teams, home-and-away
- Total matches: `8 * 7 = 56` matches
- Rounds: 14 rounds (7 rounds per leg)
- Matches per round: 4 matches

### 2. Group Knockout Format (`group_knockout`)

**Best For**: Large tournaments (20+ teams), World Cup-style competitions

**How It Works**:
- Teams divided into groups based on geographic distribution
- Each group plays round-robin internally
- Top teams from each group advance (future feature)

**Configuration**:
```json
{
  "format": "group_knockout",
  "numberOfGroups": 4,
  "numberOfLegs": 1,  // Usually single round for group stage
  "startDate": "2025-12-01",
  "weekendsOnly": true
}
```

**Geographic Distribution**:
- Groups balanced by county representation
- Minimizes travel distance
- Considers administrative boundaries (counties → sub-counties → wards)

**Example**: 24 teams, 4 groups
- 6 teams per group
- Matches per group: `6 * 5 / 2 = 15` matches
- Total matches: `15 * 4 = 60` matches

---

## 🧠 The Jamii Enhanced Engine Algorithm

The fixture generation uses an intelligent 7-step algorithm:

### Step 1: Team Grouping & Geographic Distribution
- Teams grouped by county (Kenyan counties)
- Sub-divided by sub-county and ward
- Balances group sizes automatically

### Step 2: Fixture Skeleton Creation
- Generates all possible match combinations
- Applies round-robin logic
- Handles BYE rounds for odd team counts

### Step 3: Conflict Detection
- Checks for duplicate matches
- Verifies no team plays twice in same round
- Validates venue availability

### Step 4: Venue Assignment
- Home team's location used for venue
- Falls back to default venue if not specified
- Smart venue rotation for neutral games

### Step 5: Datetime Optimization
- Weekends: Saturday 15:00, Sunday 13:00
- Weekdays: Configurable kickoff time
- Automatic date increment for subsequent rounds

### Step 6: Quality Validation
- Ensures all teams have equal matches
- Verifies home/away balance
- Checks for scheduling conflicts

### Step 7: Database Persistence
- Creates `stages` record (container for tournament fixtures)
- Creates `groups` records (if group_knockout format)
- Creates `rounds` records (match groupings by round number)
- Creates `matches` records (actual fixtures with details)
- Links teams via `team_groups` table

---

## 📝 Database Structure

After generation, fixtures are stored in these tables:

### 1. **stages** Table
```sql
- id (uuid)
- tournament_id (uuid) → references tournaments
- name (text) e.g., "Group Stage"
- type (text) e.g., "GROUP", "KNOCKOUT"
- created_at, updated_at
```

### 2. **groups** Table (for group_knockout)
```sql
- id (uuid)
- stage_id (uuid) → references stages
- name (text) e.g., "Group A"
- created_at, updated_at
```

### 3. **team_groups** Table
```sql
- id (uuid)
- group_id (uuid) → references groups
- team_id (uuid) → references teams
- created_at
```

### 4. **rounds** Table
```sql
- id (uuid)
- stage_id (uuid) → references stages
- group_id (uuid) → references groups (nullable)
- number (integer) e.g., 1, 2, 3
- name (text) e.g., "Round 1"
- leg (integer) 1 or 2
- created_at, updated_at
```

### 5. **matches** Table
```sql
- id (uuid)
- round_id (uuid) → references rounds
- home_team_id (uuid) → references teams
- away_team_id (uuid) → references teams
- kickoff (timestamp)
- venue (text)
- status (text) "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED"
- home_score (integer, nullable)
- away_score (integer, nullable)
- created_at, updated_at
```

---

## 🎨 Frontend Integration

### Using GenerateFixturesDialog Component

```tsx
import GenerateFixturesDialog from "@/components/GenerateFixturesDialog";

// In your tournament page
<GenerateFixturesDialog 
  tournamentId={tournament.id}
  trigger={<Button>Generate Fixtures</Button>}  // Optional custom trigger
/>
```

### Using FixturesList Component

```tsx
import FixturesList from "@/components/FixturesList";

// Display generated fixtures
<FixturesList 
  tournamentId={tournament.id}
  onMatchClick={(matchId) => {
    // Navigate to match details
    navigate(`/matches/${matchId}`);
  }}
/>
```

### Fetching Fixtures with TanStack Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const { data, isLoading } = useQuery({
  queryKey: [`/api/tournaments/${tournamentId}/fixtures`],
  queryFn: () => apiRequest("GET", `/api/tournaments/${tournamentId}/fixtures`),
});

const fixtures = data?.fixtures || [];
```

---

## 🔄 Managing Generated Fixtures

### Publishing Fixtures

Once fixtures are generated and reviewed, publish them:

**API Call**:
```javascript
POST /api/fixtures/publish

Body:
{
  "tournamentId": "tournament-uuid"
}
```

**What It Does**:
- Sets `is_published` flag on tournament
- Makes fixtures visible to public
- Prevents accidental regeneration

### Updating Match Details

**API Call**:
```javascript
PATCH /api/matches/:matchId

Body:
{
  "status": "LIVE",           // Optional
  "homeScore": 2,             // Optional
  "awayScore": 1,             // Optional
  "venue": "New Venue",       // Optional
  "kickoff": "2025-12-01T15:00:00.000Z"  // Optional
}
```

**Status Transitions**:
- `SCHEDULED` → `LIVE` → `COMPLETED` ✅
- `SCHEDULED` → `POSTPONED` ✅
- `SCHEDULED` → `CANCELLED` ✅
- Invalid: `COMPLETED` → `LIVE` ❌

### Viewing Standings

After matches are completed, view league standings:

**API Call**:
```javascript
GET /api/tournaments/:tournamentId/standings
  ?stageId=stage-uuid    // Optional: filter by stage
  &groupId=group-uuid    // Optional: filter by group
```

**Response**:
```json
{
  "success": true,
  "standings": [
    {
      "position": 1,
      "teamId": "team-uuid",
      "teamName": "Team Alpha",
      "played": 6,
      "won": 4,
      "drawn": 1,
      "lost": 1,
      "goalsFor": 12,
      "goalsAgainst": 5,
      "goalDifference": 7,
      "points": 13,
      "form": ["W", "W", "D", "W", "L"]  // Last 5 matches
    }
  ],
  "totalTeams": 8,
  "matchesPlayed": 24
}
```

### Downloading Fixtures as PDF

**API Call**:
```javascript
GET /api/fixtures/download/pdf?tournamentId=tournament-uuid
```

**What You Get**:
- Professional PDF document
- Tournament header with name, dates, location
- Fixtures grouped by round
- Match details: date, time, teams, venue, scores, status
- Page numbers and branding
- Download filename: `fixtures-{tournament-name}.pdf`

---

## ⚠️ Common Issues & Solutions

### Issue 1: "At least 2 teams are required"
**Solution**: Ensure teams are registered **AND APPROVED** for the tournament

**Check 1 - Teams Registered**:
```sql
SELECT * FROM team_tournament_registrations 
WHERE tournament_id = 'your-tournament-id';
```

**Check 2 - Teams Approved** (CRITICAL):
```sql
SELECT * FROM team_tournament_registrations 
WHERE tournament_id = 'your-tournament-id' 
AND registration_status = 'APPROVED';
```

**Fix**: If teams have `registration_status = 'SUBMITTED'`:
1. Go to **Tournament Super Hub** → Select Tournament
2. Click **"Team Registrations"** tab
3. Filter by "SUBMITTED" status
4. Select pending teams
5. Click **"Approve Selected"** button
6. Confirm approval
7. Now try generating fixtures again

**See [HOW_TO_APPROVE_TEAMS.md](./HOW_TO_APPROVE_TEAMS.md) for detailed steps**

### Issue 2: "Tournament not found"
**Solution**: Verify tournament exists and ID is correct
```sql
SELECT * FROM tournaments WHERE id = 'your-tournament-id';
```

### Issue 3: No fixtures displayed after generation
**Solution**: Check if fixtures were saved to database
```sql
SELECT * FROM stages WHERE tournament_id = 'your-tournament-id';
SELECT * FROM matches WHERE round_id IN (
  SELECT id FROM rounds WHERE stage_id = 'stage-id'
);
```

### Issue 4: Incorrect venue assignments
**Solution**: Ensure teams have location data (county, sub_county, ward)
```sql
UPDATE teams 
SET county = 'Nairobi', sub_county = 'Westlands', ward = 'Parklands'
WHERE id = 'team-id';
```

### Issue 5: Fixtures not showing on weekends
**Solution**: Check `weekendsOnly` configuration
- Set to `true`: Only Saturday/Sunday
- Set to `false`: Any day of the week

---

## 📊 Example: Complete Workflow

Here's a complete example of generating fixtures for a tournament:

### 1. Create Tournament
```javascript
const tournament = await supabase
  .from('tournaments')
  .insert({
    name: 'Nairobi County League 2025',
    start_date: '2025-12-01',
    end_date: '2026-03-31',
    location: 'Nairobi County',
    format: 'LEAGUE',
    organization_id: 'org-uuid'
  })
  .select()
  .single();
```

### 2. Register Teams
```javascript
const teamIds = ['team-1-uuid', 'team-2-uuid', 'team-3-uuid', ...];

for (const teamId of teamIds) {
  await supabase
    .from('team_tournament_registrations')
    .insert({
      tournament_id: tournament.id,
      team_id: teamId,
      status: 'APPROVED'
    });
}
```

### 3. Generate Fixtures
```javascript
const response = await fetch('/api/fixtures/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tournamentId: tournament.id,
    teams: teams,  // Fetched from database
    config: {
      format: 'round_robin',
      numberOfLegs: 2,
      startDate: '2025-12-01',
      weekendsOnly: true,
      kickoffTime: '15:00',
      defaultVenue: 'Kasarani Stadium'
    }
  })
});

const { fixtures, stage, rounds } = await response.json();
console.log(`Generated ${fixtures.length} fixtures in ${rounds.length} rounds`);
```

### 4. Publish Fixtures
```javascript
await fetch('/api/fixtures/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tournamentId: tournament.id })
});
```

### 5. Update Match Result
```javascript
await fetch(`/api/matches/${matchId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'COMPLETED',
    homeScore: 3,
    awayScore: 1
  })
});
```

### 6. View Standings
```javascript
const standings = await fetch(
  `/api/tournaments/${tournament.id}/standings`
).then(r => r.json());

console.log('League Standings:', standings);
```

---

## 🎯 Best Practices

1. **Always test with small numbers first**
   - Generate fixtures for 4-6 teams initially
   - Verify the output before scaling up

2. **Use meaningful venue names**
   - Include location: "Kasarani Stadium - Nairobi"
   - Makes PDF exports more professional

3. **Set realistic start dates**
   - Allow sufficient time between tournament creation and start
   - Consider team preparation time

4. **Review before publishing**
   - Check fixture list for conflicts
   - Verify dates and venues
   - Ensure all teams have equal matches

5. **Keep location data updated**
   - Accurate county/sub-county/ward data improves geographic distribution
   - Update team locations before generating fixtures

6. **Use weekends for amateur tournaments**
   - Enable `weekendsOnly` for non-professional leagues
   - Ensures better attendance and participation

7. **Download PDF for distribution**
   - Share fixture list with teams and officials
   - Print copies for physical distribution

---

## 📚 API Reference Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/fixtures/generate` | POST | Generate tournament fixtures |
| `/api/fixtures/publish` | POST | Publish fixtures (set is_published flag) |
| `/api/tournaments/:id/fixtures` | GET | Retrieve fixtures with filters |
| `/api/matches/:id` | GET | Get single match details |
| `/api/matches/:id` | PATCH | Update match scores/status |
| `/api/tournaments/:id/standings` | GET | Calculate league standings |
| `/api/fixtures/download/pdf` | GET | Download fixtures as PDF |

---

## 🚀 Quick Start Checklist

- [ ] Tournament created with name and dates
- [ ] At least 2 teams registered to tournament
- [ ] **⭐ Teams APPROVED via Team Registrations tab** (Critical Step!)
- [ ] Teams have location data (county, sub-county, ward)
- [ ] Tournament format decided (round_robin or group_knockout)
- [ ] Start date selected
- [ ] Venue names prepared (or default venue set)
- [ ] Fixture generation dialog opened
- [ ] Configuration options set (weekends, home-and-away, etc.)
- [ ] Fixtures generated successfully
- [ ] Fixtures reviewed and verified
- [ ] Fixtures published
- [ ] PDF downloaded and distributed

---

## 📚 Related Guides

- **[HOW_TO_APPROVE_TEAMS.md](./HOW_TO_APPROVE_TEAMS.md)** - Complete guide on approving pending team registrations
- **[FIXTURE_SYSTEM_IMPLEMENTATION.md](./FIXTURE_SYSTEM_IMPLEMENTATION.md)** - Technical implementation details

---

**Need Help?** 
- Check the server logs at `http://127.0.0.1:5000` for detailed error messages
- Verify teams are APPROVED before generating fixtures
- See HOW_TO_APPROVE_TEAMS.md for team approval workflow

**Last Updated**: November 15, 2025
