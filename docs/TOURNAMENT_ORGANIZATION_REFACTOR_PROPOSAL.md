# Tournament Organization Architecture Refactor

## Problem Statement

Currently, the platform enforces organizational boundaries for ALL tournament types, which prevents teams from participating in tournaments organized by other organizations. This conflicts with real-world tournament scenarios where:

1. **Open Tournaments**: Teams should be able to participate across organizational boundaries
2. **Geographic Tournaments**: Teams should participate based on location, not organization membership  
3. **Leagues**: Teams should be restricted to their own organization's league

## Current Schema Issues

### 1. Teams Table - Forced Organization Membership
```sql
-- CURRENT: Teams must belong to an organization
orgId uuid NOT NULL REFERENCES organizations(id)

-- PROBLEM: Prevents independent teams from participating in open tournaments
```

### 2. Tournament Registration Logic
```sql
-- CURRENT: Registration enforces organizational boundaries
-- team_tournament_registrations has both teamId and orgId
-- Business logic prevents cross-organizational registration
```

## Proposed Solution

### Phase 1: Schema Changes

#### 1.1 Make Team Organization Optional
```sql
-- CHANGE: Allow teams to exist without organization (for independent participation)
ALTER TABLE teams ALTER COLUMN org_id DROP NOT NULL;

-- Add constraint: Teams in leagues must have organization
-- This will be enforced at application level based on tournament type
```

#### 1.2 Add Tournament Participation Rules
```sql
-- NEW: Add tournament participation model to clarify organizational requirements
ALTER TABLE tournaments ADD COLUMN participation_model VARCHAR(50) DEFAULT 'ORGANIZATIONAL';

-- Values:
-- 'ORGANIZATIONAL' - Only teams from organizing organization (leagues)
-- 'GEOGRAPHIC' - Teams based on geographic eligibility (admin tournaments)  
-- 'OPEN' - Any team can participate (independent tournaments)
```

#### 1.3 Update Team Tournament Registration Logic
```typescript
// BUSINESS RULES BY TOURNAMENT TYPE:

// LEAGUE tournaments (participation_model = 'ORGANIZATIONAL'):
// - team.orgId MUST equal tournament.orgId
// - team.orgId cannot be NULL

// GEOGRAPHIC tournaments (participation_model = 'GEOGRAPHIC'):  
// - team geographic location must match tournament geography
// - team.orgId can be any organization or NULL
// - Eligibility based on countyId, subCountyId, wardId

// OPEN tournaments (participation_model = 'OPEN'):
// - Any team can register regardless of organization
// - No organizational or geographic restrictions
```

### Phase 2: Data Migration Strategy

#### 2.1 Existing Data Compatibility
```sql
-- All existing teams keep their organization membership
-- All existing tournaments default to 'ORGANIZATIONAL' participation
-- No breaking changes to existing functionality
```

#### 2.2 New Tournament Types
```sql
-- New tournaments can be created with different participation models
-- Geographic tournaments use county/ward eligibility instead of organization
-- Independent tournaments allow open registration
```

### Phase 3: Application Logic Updates

#### 3.1 Registration Validation
```typescript
// Update eligibility engine to check participation model
function validateTeamRegistration(team: Team, tournament: Tournament) {
  switch (tournament.participation_model) {
    case 'ORGANIZATIONAL':
      return team.orgId === tournament.orgId;
      
    case 'GEOGRAPHIC':
      return checkGeographicEligibility(team, tournament);
      
    case 'OPEN':
      return true; // No restrictions
  }
}
```

#### 3.2 UI Updates
```typescript
// Team registration forms adapt based on tournament type
// League tournaments: Show only organization's teams
// Geographic tournaments: Show teams in geographic area  
// Open tournaments: Show all teams
```

#### 3.3 Query Updates
```typescript
// Update team fetching logic based on tournament participation model
function useEligibleTeams(tournamentId: string) {
  // Fetch teams based on tournament's participation model
  // Not just organizationally scoped teams
}
```

## Migration Path

### Step 1: Schema Migration (Non-Breaking)
1. Make `teams.org_id` nullable
2. Add `tournaments.participation_model` with default 'ORGANIZATIONAL'
3. Update indexes and constraints

### Step 2: Application Logic (Backward Compatible)  
1. Update eligibility engine with new participation models
2. Maintain existing organizational scoping as default
3. Add new tournament creation options

### Step 3: UI Enhancement
1. Update tournament creation to specify participation model
2. Update team registration to show eligible teams based on model
3. Add geographic tournament support

### Step 4: Testing & Validation
1. Test all existing tournaments work unchanged
2. Test new geographic tournaments work correctly
3. Test open tournaments allow cross-organizational participation

## Benefits

1. **Flexibility**: Supports real-world tournament scenarios
2. **Backward Compatibility**: Existing functionality unchanged
3. **Geographic Tournaments**: Proper support for county/ward competitions
4. **Independent Tournaments**: Allows truly open competitions
5. **League Integrity**: Maintains organizational boundaries where needed

## Risk Mitigation

1. **Default Behavior**: All existing tournaments remain organizationally scoped
2. **Gradual Rollout**: New participation models are opt-in
3. **Data Integrity**: Application-level validation ensures business rules
4. **Rollback Plan**: Schema changes are additive and reversible