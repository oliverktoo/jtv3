# Jamii Tourney v3 - Tournament Management Platform

## Overview

Jamii Tourney v3 is a multi-model tournament management platform designed for Kenyan sports organizations. The application supports multiple tournament formats including administrative hierarchies (Ward → Sub-County → County → National), inter-county competitions, independent tournaments, and full league systems. The platform enables tournament organizers to create tournaments, register teams, generate fixtures with configurable scheduling rules (weekend defaults, kickoff times), calculate standings, and export data to Excel.

**Core Value Proposition**: A unified system that handles diverse tournament models with clear data isolation by organization and sport, predictable status lifecycles, and efficient fixture scheduling.

## Recent Changes

**Phase 4.4: Excel Export Functionality** (October 22, 2025)
- Implemented comprehensive Excel export across three main pages using XLSX library
- Fixtures export: Includes tournament name, teams, scores, venue, date/time, status
- Standings export: Includes team rankings with points, wins, draws, losses, goals for/against, goal difference
- Players export: Includes UPID, names, date of birth, sex, nationality, status, registration date
- Export features: Descriptive filenames with organization name and timestamp (yyyy-MM-dd_HHmm format), proper column widths for readability, disabled state when no data available, success toast notifications
- Pattern consistency: All three exports follow the same implementation pattern for maintainability

**Phase 4.3: Document Verification** (October 22, 2025)
- Built admin document verification page at `/documents`
- Storage method: `getDocumentsByOrg(orgId, verified?)` with JOIN to player_registry
- API endpoint: GET `/api/organizations/:orgId/documents?verified=true|false`
- UI features: Organization selector, status filter (All/Pending/Verified), verify/reject/revoke buttons
- Verification workflow: Admin reviews documents, marks as verified (sets `verified=true`, `verifiedAt=timestamp`)
- Cache invalidation: Mutations properly invalidate document queries
- **Note**: Player creation form already includes document input fields (docType, docNumber)

**Phase 4.2: Real Data Integration** (October 22, 2025)
- Replaced all mock data with live database queries across Fixtures, Standings, and Dashboard
- Stats API endpoint: GET `/api/organizations/:orgId/stats` with optimized WHERE clauses
- Dashboard stats: Real-time counts for teams and completed matches
- Standings page: Live standings calculation from match results
- Fixtures page: Real match data with tournament/round/status filtering
- **Optimization**: All endpoints use WHERE clauses instead of in-memory filtering for performance

**Phase 4.1: Match Result Recording** (October 22, 2025)
- Fixtures page with real-time result recording dialog
- Pre-fills existing scores and status in edit mode
- Result updates via useUpdateMatch hook
- Auto-refresh: Standings recalculate automatically via cache invalidation
- Integration: Match results → standings calculations working end-to-end

**Phase 3.3: Disciplinary Tracking** (October 22, 2025)
- Implemented complete disciplinary records management system
- Database schema: `disciplinary_records` table with incident types, sanctions, status lifecycle
- Storage layer: 7 CRUD methods (create, get, update, delete, filter by player/org/tournament)
- API endpoints: RESTful pattern at `/api/organizations/:orgId/disciplinary-records`, `/api/players/:upid/disciplinary-records`, `/api/tournaments/:tournamentId/disciplinary-records`
- Frontend UI: Disciplinary page with list view, create/update dialogs, filtering by status, player name display
- Player integration: Collapsible disciplinary history in Player detail cards
- Cache invalidation: Proper query invalidation on mutations by organization and player
- **Key Fix**: Resolved duplicate hook issue by importing `usePlayers` from `@/hooks/usePlayers`

**Phase 3.2: Transfers Management** (Completed)
- Transfer status lifecycle: PENDING → APPROVED → COMPLETED/REJECTED/CANCELLED
- Transfer types: PERMANENT, LOAN, LOAN_RETURN
- Flexible JSONB terms field for custom transfer conditions
- UI with status badges, filtering, and proper cache management

**Phase 3.1: Contracts Management** (Completed)
- Contract status lifecycle: PENDING → ACTIVE → EXPIRED/TERMINATED
- Contract types: PERMANENT, LOAN, TRIAL, SHORT_TERM
- Tamper-evident audit trails with timestamps
- UI with collapsible player history components

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite as the build tool

**UI Component Library**: Shadcn UI (New York style) built on Radix UI primitives
- Component-based architecture with reusable UI elements
- Tailwind CSS for styling with custom design tokens
- Dark/light theme support with CSS variables
- Custom color palette centered around sports/competition theme (deep green primary: HSL 25 85% 45%)

**State Management**:
- TanStack Query (React Query) for server state management
- Custom hooks pattern for data fetching and mutations
- Query invalidation strategy for cache management

**Routing**: Wouter for lightweight client-side routing

**Key Design Decisions**:
- **Problem**: Information-dense tournament management interfaces require clarity
- **Solution**: Utility-focused design system with scannable hierarchies, inspired by sports platforms
- **Rationale**: Prioritizes data clarity over decoration for efficient task completion

### Backend Architecture

**Runtime**: Node.js with TypeScript (ESM modules)

**Framework**: Express.js server with custom middleware
- Request logging with duration tracking
- JSON body parsing
- Error handling middleware

**API Design**: RESTful API pattern
- Resource-based endpoints (`/api/tournaments`, `/api/teams`, `/api/matches`)
- Nested routes for related resources (e.g., `/api/tournaments/:id/teams`)
- Standard HTTP methods (GET, POST, PATCH, DELETE)

**Business Logic Modules**:
- `fixtureGenerator.ts`: Implements round-robin fixture generation using the "circle method" with configurable scheduling (weekend-only, kickoff times, home/away legs)
- `standingsCalculator.ts`: Calculates league standings with configurable point systems and tiebreakers (points, goal difference, head-to-head)

**Key Design Decisions**:
- **Problem**: Multiple tournament models with different fixture requirements
- **Solution**: Pluggable fixture generation with options pattern
- **Rationale**: Single generator handles all tournament types through configuration rather than separate implementations

### Database Architecture

**Database**: PostgreSQL (via Neon serverless)

**ORM**: Drizzle ORM with TypeScript schema definitions
- Type-safe database operations
- Schema-first approach with `shared/schema.ts`
- Zod integration for runtime validation

**Data Model**:
- Multi-tenancy by `organization` (org-scoped isolation)
- Sport-specific isolation for tournaments
- Hierarchical geographic data (Counties → Sub-Counties → Wards)
- Tournament lifecycle management via status enum (DRAFT → REGISTRATION → ACTIVE → COMPLETED → ARCHIVED)
- Support for multiple tournament models via enum
- Stage-based competition structure (LEAGUE, GROUP, KNOCKOUT)
- Match scheduling with status tracking
- **Player Identity System**: Universal Player ID (UPID) with secure document verification (Phase 3 North Star)
- **Contracts Management**: Player-team contracts with status lifecycle (PENDING → ACTIVE → EXPIRED/TERMINATED), contract types (PERMANENT, LOAN, TRIAL, SHORT_TERM), and tamper-evident audit trails
- **Transfers Management**: Player transfers between teams with status transitions (PENDING → APPROVED → COMPLETED/REJECTED/CANCELLED), transfer types (PERMANENT, LOAN, LOAN_RETURN), flexible JSONB terms field
- **Disciplinary Tracking**: Incident records (YELLOW_CARD, RED_CARD, SUSPENSION, FINE, WARNING, MISCONDUCT) with status lifecycle (ACTIVE → SERVED/APPEALED/OVERTURNED/CANCELLED), sanctions tracking (matches suspended, fine amounts), and serving period management

**Key Design Decisions**:
- **Problem**: Platform must safely support multiple organizations and sports
- **Solution**: Strict org-scoping and sport-isolation at the database level
- **Rationale**: Prevents data leakage and enables safe multi-tenancy without complex row-level security

**Schema Highlights**:
- Enums for tournament models, statuses, federation types, stage types, match statuses
- UUID primary keys for all entities
- Timestamp tracking (createdAt, updatedAt)
- JSONB fields for flexible configuration storage
- Relational integrity through foreign keys

### External Dependencies

**Database Service**: Neon (PostgreSQL serverless)
- Connection pooling via `@neondatabase/serverless`
- WebSocket support for serverless environments
- Configured via `DATABASE_URL` environment variable

**UI Component Libraries**:
- Radix UI: Headless accessible components
- Lucide React: Icon system
- Tailwind CSS: Utility-first styling
- shadcn/ui: Pre-built component templates

**Utility Libraries**:
- date-fns: Date manipulation and formatting
- zod: Runtime schema validation
- clsx + tailwind-merge: Conditional CSS class management
- XLSX (SheetJS): Excel export functionality

**Development Tools**:
- TypeScript: Type safety across stack
- Drizzle Kit: Database migrations
- Vite plugins for Replit integration (dev banner, cartographer, runtime error modal)

**Key Design Decisions**:
- **Problem**: Need reliable serverless database with good TypeScript support
- **Solution**: Neon + Drizzle ORM combination
- **Rationale**: Neon provides serverless PostgreSQL with WebSocket support; Drizzle offers excellent TypeScript integration and migration tooling

**Deployment Strategy**:
- Build process: `vite build` for client, `esbuild` for server
- Production server runs compiled ESM bundle
- Static assets served from `dist/public`
- Development mode uses Vite middleware with HMR