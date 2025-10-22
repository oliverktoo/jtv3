# Jamii Tourney v3 - Technical Building Notes

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Documentation](#api-documentation)
6. [Business Logic](#business-logic)
7. [Frontend Architecture](#frontend-architecture)
8. [Deployment & Configuration](#deployment--configuration)
9. [Development Workflow](#development-workflow)

---

## System Architecture

### Overview

Jamii Tourney v3 is a full-stack TypeScript application built with:
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth (OpenID Connect)
- **ORM**: Drizzle ORM

### Architectural Principles

1. **Multi-tenancy by Organization**: Strict organization-scoping prevents data leakage
2. **Sport Isolation**: Data isolated by sport type
3. **Type Safety**: Full TypeScript coverage across frontend and backend
4. **RESTful API**: Resource-based endpoints with standard HTTP methods
5. **Server State Management**: TanStack Query (React Query) for data fetching
6. **Design System**: Shadcn UI + Radix UI primitives + Tailwind CSS

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| TypeScript | 5.x | Type safety |
| Wouter | 3.x | Lightweight routing |
| TanStack Query | 5.x | Server state management |
| Shadcn UI | Latest | Component library |
| Radix UI | Latest | Accessible primitives |
| Tailwind CSS | 3.x | Utility-first CSS |
| Lucide React | Latest | Icon library |
| date-fns | Latest | Date manipulation |
| Zod | 3.x | Runtime validation |
| XLSX (SheetJS) | Latest | Excel export |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Drizzle ORM | Latest | Database ORM |
| Drizzle Kit | Latest | Migration tooling |
| Zod | 3.x | Schema validation |
| Replit Auth | Latest | Authentication provider |
| connect-pg-simple | Latest | Session storage |
| ws | Latest | WebSocket support |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 15+ | Primary database |
| Neon Serverless | Database hosting |
| @neondatabase/serverless | Connection pooling |

---

## Database Schema

### Core Tables

#### Organizations
```sql
CREATE TABLE organizations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Sports
```sql
CREATE TABLE sports (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  team_size INTEGER
);
```

#### Geographic Entities
```sql
CREATE TABLE geographic_entities (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type geographic_entity_type_enum NOT NULL,
  parent_id VARCHAR REFERENCES geographic_entities(id),
  organization VARCHAR NOT NULL
);

-- Types: WARD, SUB_COUNTY, COUNTY, REGION, NATION
```

#### Players
```sql
CREATE TABLE players (
  upid VARCHAR PRIMARY KEY,
  organization VARCHAR NOT NULL,
  sport VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality VARCHAR,
  id_number VARCHAR,
  gender gender_enum,
  position VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tournaments
```sql
CREATE TABLE tournaments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  organization VARCHAR NOT NULL,
  sport VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  type tournament_type_enum NOT NULL,
  status tournament_status_enum NOT NULL,
  start_date DATE,
  end_date DATE,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Types: INTER_COUNTY, WARD, SUB_COUNTY, COUNTY, NATIONAL, INDEPENDENT, LEAGUE
-- Status: PLANNING, ACTIVE, COMPLETED, CANCELLED
```

#### Teams
```sql
CREATE TABLE teams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  organization VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  home_venue VARCHAR,
  geographic_entity VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Matches
```sql
CREATE TABLE matches (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id VARCHAR REFERENCES tournaments(id),
  round_id VARCHAR REFERENCES rounds(id),
  home_team_id VARCHAR REFERENCES teams(id),
  away_team_id VARCHAR REFERENCES teams(id),
  match_date TIMESTAMP,
  venue VARCHAR,
  status match_status_enum,
  home_score INTEGER,
  away_score INTEGER
);

-- Status: SCHEDULED, IN_PROGRESS, COMPLETED, POSTPONED, CANCELLED
```

#### Contracts
```sql
CREATE TABLE contracts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  player_upid VARCHAR REFERENCES players(upid),
  team_id VARCHAR REFERENCES teams(id),
  organization VARCHAR NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_type contract_type_enum,
  status contract_status_enum,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Transfers
```sql
CREATE TABLE transfers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  player_upid VARCHAR REFERENCES players(upid),
  from_team_id VARCHAR REFERENCES teams(id),
  to_team_id VARCHAR REFERENCES teams(id),
  organization VARCHAR NOT NULL,
  transfer_date DATE NOT NULL,
  transfer_type transfer_type_enum,
  fee NUMERIC,
  status transfer_status_enum,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Status: PENDING, APPROVED, REJECTED, CANCELLED
```

#### Disciplinary Records
```sql
CREATE TABLE disciplinary_records (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  player_upid VARCHAR REFERENCES players(upid),
  match_id VARCHAR REFERENCES matches(id),
  organization VARCHAR NOT NULL,
  infraction_type infraction_type_enum NOT NULL,
  infraction_date DATE NOT NULL,
  description TEXT,
  suspension_start DATE,
  suspension_end DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Types: YELLOW_CARD, RED_CARD, SUSPENSION, WARNING
```

### Enums

```typescript
// Tournament Types
INTER_COUNTY | WARD | SUB_COUNTY | COUNTY | NATIONAL | INDEPENDENT | LEAGUE

// Tournament Status
PLANNING | ACTIVE | COMPLETED | CANCELLED

// Match Status
SCHEDULED | IN_PROGRESS | COMPLETED | POSTPONED | CANCELLED

// Eligibility Rule Types
AGE_RANGE | NATIONALITY | GEOGRAPHIC_AFFILIATION | REGISTRATION_DEADLINE | 
DOCUMENT_VERIFICATION | DISCIPLINARY_CLEARANCE | CONTRACT_STATUS | PREVIOUS_PARTICIPATION

// User Roles
SUPER_ADMIN | ORG_ADMIN | VIEWER

// Gender
MALE | FEMALE | OTHER
```

---

## Authentication & Authorization

### Replit Auth Integration

**Provider**: OpenID Connect (OAuth 2.0)

**Supported Methods**:
- Google OAuth
- GitHub OAuth
- Email/Password

**Session Management**:
- PostgreSQL session store (connect-pg-simple)
- Cookie-based sessions
- 30-day session lifetime

### Authorization Architecture

**Three-Layer Security Model**:

#### Layer 1: Authentication
```typescript
// Middleware: isAuthenticated
// Applied to: 55 mutation routes
// Effect: Returns 401 if no valid session
app.post('/api/tournaments', isAuthenticated, async (req, res) => {
  // Handler code
});
```

#### Layer 2: Organization Access
```typescript
// Middleware: requireOrgAccess
// Applied to: 14 organization-scoped routes
// Effect: Returns 403 if user not member of organization
app.get('/api/organizations/:orgId/tournaments', 
  isAuthenticated, 
  requireOrgAccess, 
  async (req, res) => {
    // Handler code
  }
);
```

#### Layer 3: Entity-Level Authorization
```typescript
// Inline authorization: checkUserOrgAccess
// Applied to: 25 critical ID-based routes
// Effect: Returns 403 if user doesn't own entity
app.get('/api/players/:upid', isAuthenticated, async (req, res) => {
  const player = await storage.getPlayerByUpid(req.params.upid);
  if (!checkUserOrgAccess(req.user, player.organization)) {
    return res.status(403).json({ error: "Access denied" });
  }
  // Handler code
});
```

### Public Routes (No Authentication Required)

**8 Read-Only Routes**:
```typescript
// Sports
GET /api/sports

// Tournaments
GET /api/tournaments/:id
GET /api/tournaments/slug/:slug

// Tournament Data
GET /api/tournaments/:tournamentId/teams
GET /api/tournaments/:tournamentId/matches
GET /api/tournaments/:tournamentId/standings
GET /api/tournaments/:tournamentId/players

// Rounds
GET /api/rounds/:roundId/matches
```

### Role-Based Access Control

```typescript
interface UserOrganizationRole {
  userId: string;
  organizationId: string | null; // null = platform-wide role
  role: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'VIEWER';
}
```

**Permission Matrix**:

| Action | SUPER_ADMIN | ORG_ADMIN | VIEWER | Public |
|--------|-------------|-----------|--------|--------|
| View tournaments | ✅ All | ✅ Own org | ✅ Own org | ✅ Public only |
| Create tournament | ✅ | ✅ | ❌ | ❌ |
| Edit tournament | ✅ | ✅ Own org | ❌ | ❌ |
| Delete tournament | ✅ | ✅ Own org | ❌ | ❌ |
| Record results | ✅ | ✅ Own org | ❌ | ❌ |
| Register players | ✅ | ✅ Own org | ❌ | ❌ |
| Assign user roles | ✅ | ❌ | ❌ | ❌ |
| Manage organizations | ✅ | ❌ | ❌ | ❌ |

---

## API Documentation

### Base URL
```
Production: https://your-repl-name.repl.co
Development: http://localhost:5000
```

### Authentication Header
```http
Cookie: connect.sid=<session-id>
```

### Response Format
```typescript
// Success
{
  "data": { ... },
  "message": "Success"
}

// Error
{
  "error": "Error message",
  "details": { ... }
}
```

### Endpoints

#### Organizations

**List Organizations**
```http
GET /api/organizations
Authorization: Required
```

**Create Organization**
```http
POST /api/organizations
Authorization: Required (SUPER_ADMIN)
Body: {
  "name": "County Football Association",
  "code": "CFA"
}
```

#### Tournaments

**List Tournaments**
```http
GET /api/tournaments?organization=<org>&sport=<sport>
Authorization: Required
```

**Get Tournament by ID**
```http
GET /api/tournaments/:id
Authorization: Public
```

**Get Tournament by Slug**
```http
GET /api/tournaments/slug/:slug
Authorization: Public
```

**Create Tournament**
```http
POST /api/tournaments
Authorization: Required (ORG_ADMIN)
Body: {
  "organization": "org-id",
  "sport": "football",
  "name": "County Championship 2025",
  "slug": "county-championship-2025",
  "type": "INTER_COUNTY",
  "status": "PLANNING",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

#### Fixtures

**Generate Fixtures**
```http
POST /api/tournaments/:tournamentId/generate-fixtures
Authorization: Required (ORG_ADMIN)
Body: {
  "roundName": "Round 1",
  "weekendOnly": true,
  "kickoffTimes": ["15:00", "17:00"],
  "homeAway": true
}
```

**Get Tournament Matches**
```http
GET /api/tournaments/:tournamentId/matches
Authorization: Public
```

**Update Match Result**
```http
PATCH /api/matches/:matchId
Authorization: Required (ORG_ADMIN)
Body: {
  "homeScore": 2,
  "awayScore": 1,
  "status": "COMPLETED"
}
```

#### Standings

**Get Tournament Standings**
```http
GET /api/tournaments/:tournamentId/standings
Authorization: Public
Response: [
  {
    "position": 1,
    "team": "Team A",
    "played": 10,
    "won": 7,
    "drawn": 2,
    "lost": 1,
    "goalsFor": 20,
    "goalsAgainst": 8,
    "goalDifference": 12,
    "points": 23
  }
]
```

#### Players

**Register Player**
```http
POST /api/players
Authorization: Required (ORG_ADMIN)
Body: {
  "organization": "org-id",
  "sport": "football",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2000-01-01",
  "nationality": "KE",
  "idNumber": "12345678",
  "gender": "MALE",
  "position": "Midfielder"
}
Response: {
  "upid": "UPID-12345678",
  ...
}
```

**Get Player by UPID**
```http
GET /api/players/:upid
Authorization: Required
```

#### Export

**Export Tournament Data**
```http
GET /api/tournaments/:tournamentId/export
Authorization: Required
Response: Excel file (.xlsx)
Sheets:
  - Fixtures
  - Standings
  - Players
```

---

## Business Logic

### Fixture Generation Algorithm

**Method**: Circle Method (Round-Robin)

**Implementation**: `server/lib/fixtureGenerator.ts`

**Process**:
1. Arrange teams in two rows
2. Rotate teams clockwise (except first team)
3. Generate matches for each round
4. Apply scheduling constraints:
   - Weekend-only filtering
   - Kickoff time assignment
   - Home/away leg generation
   - Venue assignment

**Example** (4 teams):
```
Round 1: A-B, C-D
Round 2: A-C, D-B
Round 3: A-D, B-C
```

### Standings Calculation

**Implementation**: `server/lib/standingsCalculator.ts`

**Calculation**:
```typescript
Points = (Wins × 3) + (Draws × 1)
Goal Difference = Goals For - Goals Against
```

**Sorting**:
1. Points (descending)
2. Goal Difference (descending)
3. Goals For (descending)
4. Head-to-head (if implemented)
5. Alphabetical by team name

**Real-time Updates**:
- Triggered on match result update
- Recalculates entire standings table
- Updates all affected positions

### UPID Generation

**Format**: `UPID-{ID_NUMBER}`

**Implementation**:
```typescript
function generateUpid(idNumber: string): string {
  return `UPID-${idNumber}`;
}
```

**Uniqueness**: Enforced by database constraint on UPID column

---

## Frontend Architecture

### Routing Structure

**Library**: Wouter

**Route Organization**:
```typescript
// Public Routes (no auth)
/                          → Landing
/tournament/:slug          → PublicTournament

// Protected Routes (auth required)
/                          → Home (dashboard)
/tournaments               → Tournaments (list)
/tournaments/:id           → TournamentDetail
/teams                     → Teams
/players                   → Players
/contracts                 → Contracts
/transfers                 → Transfers
/disciplinary              → Disciplinary
/documents                 → Documents
/eligibility               → Eligibility
/fixtures                  → Fixtures
/standings                 → Standings
/reports                   → Reports
/users                     → UserManagement (SUPER_ADMIN)
```

### State Management

**Server State**: TanStack Query
```typescript
// Example query
const { data, isLoading } = useQuery({
  queryKey: ['/api/tournaments', tournamentId],
  enabled: !!tournamentId
});

// Example mutation
const mutation = useMutation({
  mutationFn: async (data) => 
    apiRequest('/api/tournaments', 'POST', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
  }
});
```

**Local State**: React hooks (useState, useReducer)

**Auth State**: Custom `useAuth` hook
```typescript
const { user, isAuthenticated, isLoading, hasRole } = useAuth();
```

### Component Structure

**Design System**: Shadcn UI + Radix UI

**Key Components**:
- `AppSidebar`: Navigation sidebar with collapsible menu
- `ThemeToggle`: Dark/light mode switcher
- `DataTable`: Reusable table with sorting/filtering
- Form components: Built on react-hook-form + Zod

**Component Pattern**:
```typescript
// Page Component
export default function Tournaments() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['/api/tournaments'] 
  });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <TournamentList tournaments={data} />
    </div>
  );
}
```

### Styling System

**Framework**: Tailwind CSS

**Theme Configuration**: `client/src/index.css`
```css
:root {
  --primary: 142 76% 36%;        /* Deep green */
  --background: 0 0% 100%;       /* White */
  --foreground: 222.2 84% 4.9%;  /* Near black */
  /* ... more tokens */
}

.dark {
  --primary: 142 70% 45%;        /* Lighter green */
  --background: 222.2 84% 4.9%;  /* Dark background */
  --foreground: 210 40% 98%;     /* Light text */
  /* ... more tokens */
}
```

**Custom Classes**:
- `hover-elevate`: Subtle hover background elevation
- `active-elevate-2`: Pressed state elevation

---

## Deployment & Configuration

### Environment Variables

**Required**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db
PGHOST=host
PGPORT=5432
PGUSER=user
PGPASSWORD=password
PGDATABASE=database

# Session
SESSION_SECRET=random-secret-string

# Replit Auth (auto-configured)
REPLIT_DOMAINS=your-repl.repl.co
```

**Frontend** (prefix with `VITE_`):
```bash
VITE_API_URL=http://localhost:5000  # Development only
```

### Build Process

**Development**:
```bash
npm run dev
# Starts Express + Vite dev server on port 5000
```

**Production Build**:
```bash
npm run build
# Compiles TypeScript and bundles React app
```

**Database Migrations**:
```bash
# Push schema changes
npm run db:push

# Force push (when safe)
npm run db:push --force

# Generate migrations (if needed)
npm run db:generate
```

### Deployment on Replit

**Auto-deployment**:
1. Connected to GitHub repository
2. Pushes to main branch trigger deploys
3. Environment secrets configured in Replit
4. Database provisioned via Replit PostgreSQL

**Workflow Configuration**:
```yaml
# .replit
run = "npm run dev"
entrypoint = "server/index.ts"

[deployment]
run = ["npm", "run", "build"]
```

---

## Development Workflow

### Project Structure

```
jamii-tourney-v3/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── App.tsx         # Root component
│   │   └── index.css       # Global styles
│   └── index.html
├── server/
│   ├── lib/                # Business logic
│   │   ├── fixtureGenerator.ts
│   │   └── standingsCalculator.ts
│   ├── replitAuth.ts       # Auth configuration
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database interface
│   └── index.ts            # Server entry
├── shared/
│   └── schema.ts           # Shared types & Drizzle schema
├── attached_assets/        # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

### Adding a New Feature

**Example**: Add player statistics

1. **Update Schema** (`shared/schema.ts`):
```typescript
export const playerStats = pgTable('player_stats', {
  id: varchar('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerUpid: varchar('player_upid').references(() => players.upid),
  tournamentId: varchar('tournament_id').references(() => tournaments.id),
  goals: integer('goals').default(0),
  assists: integer('assists').default(0),
  yellowCards: integer('yellow_cards').default(0),
  redCards: integer('red_cards').default(0),
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats);
export type PlayerStats = typeof playerStats.$inferSelect;
```

2. **Add Storage Methods** (`server/storage.ts`):
```typescript
interface IStorage {
  // ... existing methods
  getPlayerStats(upid: string, tournamentId: string): Promise<PlayerStats | undefined>;
  updatePlayerStats(data: PlayerStats): Promise<PlayerStats>;
}
```

3. **Add API Routes** (`server/routes.ts`):
```typescript
app.get('/api/players/:upid/stats/:tournamentId', 
  isAuthenticated,
  async (req, res) => {
    const stats = await storage.getPlayerStats(
      req.params.upid,
      req.params.tournamentId
    );
    res.json(stats);
  }
);
```

4. **Create Frontend Components** (`client/src/pages/PlayerStats.tsx`):
```typescript
export default function PlayerStats() {
  const { upid, tournamentId } = useParams();
  const { data } = useQuery({
    queryKey: ['/api/players', upid, 'stats', tournamentId]
  });
  
  return <StatsDisplay stats={data} />;
}
```

5. **Add Route** (`client/src/App.tsx`):
```typescript
<Route path="/players/:upid/stats/:tournamentId" component={PlayerStats} />
```

### Testing Strategy

**Manual Testing**:
- Use Replit Auth test accounts
- Create sample organizations/tournaments
- Test all user roles (SUPER_ADMIN, ORG_ADMIN, VIEWER)

**End-to-End Testing**:
- Playwright tests for critical paths
- Public tournament viewing
- Match result recording
- Fixture generation

**Database Testing**:
- Test migrations with `npm run db:push`
- Verify foreign key constraints
- Check cascade deletes

### Debugging

**Backend Logs**:
```bash
# Express server logs to console
# Check workflow logs in Replit
```

**Frontend Logs**:
```bash
# Browser console (F12)
# React Query DevTools (install separately)
```

**Database Queries**:
```typescript
// Enable Drizzle query logging
import { drizzle } from 'drizzle-orm/neon-http';
const db = drizzle(client, { logger: true });
```

---

## Performance Optimization

### Database

**Indexes**:
```sql
-- Compound index for frequent queries
CREATE INDEX idx_tournaments_org_sport 
ON tournaments(organization, sport);

-- Index for slug lookups
CREATE INDEX idx_tournaments_slug 
ON tournaments(slug);

-- Index for player queries
CREATE INDEX idx_players_org_sport 
ON players(organization, sport);
```

**Query Optimization**:
- Use selective queries (only fetch needed columns)
- Implement pagination for large lists
- Cache frequently accessed data

### Frontend

**Code Splitting**:
```typescript
// Lazy load pages
const Reports = lazy(() => import('@/pages/Reports'));
```

**Query Caching**:
```typescript
// TanStack Query caches by default
// Configure stale time for long-lived data
queryClient.setDefaultOptions({
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
  },
});
```

**Image Optimization**:
- Use appropriate formats (WebP)
- Implement lazy loading
- Optimize asset sizes

---

## Security Considerations

### Best Practices

1. **Never expose sensitive data in public routes**
2. **Always validate input with Zod schemas**
3. **Use parameterized queries** (Drizzle ORM handles this)
4. **Implement rate limiting** for public endpoints
5. **Use HTTPS in production** (Replit handles this)
6. **Sanitize user input** before rendering
7. **Keep dependencies updated**

### OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|------------|
| Injection | Parameterized queries (Drizzle ORM) |
| Broken Auth | Replit Auth + secure sessions |
| Sensitive Data Exposure | Environment variables for secrets |
| XXE | No XML parsing |
| Broken Access Control | 3-layer authorization system |
| Security Misconfiguration | Minimal dependencies, regular updates |
| XSS | React automatic escaping |
| Insecure Deserialization | JSON only, Zod validation |
| Known Vulnerabilities | Dependabot alerts, regular updates |
| Insufficient Logging | Express logging middleware |

---

## Troubleshooting Guide

### Common Issues

**Database Connection Errors**:
```bash
Error: connect ECONNREFUSED
Solution: Check DATABASE_URL environment variable
```

**Migration Failures**:
```bash
Error: Cannot alter column type
Solution: Use `npm run db:push --force` (data loss warning)
```

**Authentication Issues**:
```bash
Error: 401 Unauthorized
Solution: Check session cookie, re-login if expired
```

**Build Errors**:
```bash
Error: Cannot find module
Solution: Run `npm install`, check import paths
```

### Debug Checklist

- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] User has appropriate role/permissions
- [ ] API route exists and is registered
- [ ] Request body matches schema
- [ ] Frontend query key matches endpoint
- [ ] Cache invalidation triggered after mutations

---

## Future Enhancements

### Planned Features

1. **Automated Testing Suite**
   - Playwright E2E tests
   - Unit tests for business logic
   - API integration tests

2. **Advanced Analytics**
   - Player performance trends
   - Team comparison tools
   - Predictive modeling

3. **Mobile Application**
   - React Native companion app
   - Push notifications for match updates
   - Offline mode support

4. **Real-time Features**
   - WebSocket live match updates
   - Live standings refresh
   - Chat/messaging system

5. **Additional Authorization**
   - Complete inline authorization for remaining ~15 routes
   - Granular permissions system
   - Audit logging

6. **Internationalization**
   - Multi-language support
   - Locale-specific date formats
   - Currency handling for transfers

---

## Contributing Guidelines

### Code Standards

**TypeScript**:
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for functions
- Use const over let where possible

**React**:
- Functional components only
- Use hooks (no class components)
- Props destructuring
- Meaningful component names

**CSS**:
- Tailwind utility classes preferred
- Use semantic color tokens (not literal colors)
- Responsive design (mobile-first)
- Dark mode support required

### Git Workflow

```bash
# Feature branch
git checkout -b feature/player-statistics

# Commit with descriptive messages
git commit -m "Add player statistics tracking and display"

# Push and create PR
git push origin feature/player-statistics
```

### Code Review Checklist

- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Authorization checks in place
- [ ] UI responsive and accessible
- [ ] Dark mode works correctly
- [ ] No console errors
- [ ] Documentation updated

---

## License & Credits

**Platform**: Jamii Tourney v3  
**Version**: 1.0  
**Last Updated**: October 22, 2025  
**Built with**: Replit, React, Express, PostgreSQL  

**Open Source Libraries**:
- React, Express, Drizzle ORM
- Shadcn UI, Radix UI, Tailwind CSS
- TanStack Query, Wouter, Zod
- See package.json for complete list

---

**For additional support or questions, refer to the USER_MANUAL.md or contact the development team.**
