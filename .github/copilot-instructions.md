# Jamii Tourney v3 - AI Coding Instructions

## Architecture Overview

Jamii Tourney is a **multi-tenant Kenyan sports tournament management platform** with three distinct participation models:

- **ORGANIZATIONAL**: Teams must belong to organizing organization (leagues)
- **GEOGRAPHIC**: Teams eligible by location - county/ward (administrative tournaments)  
- **OPEN**: Any team can participate (independent tournaments)

**Tech Stack**: React 18 + Vite + TypeScript frontend, Node.js + Express backend, Supabase (PostgreSQL) database, deployed on Netlify.

## Key Architectural Patterns

### 1. Supabase Database Architecture
- **Database**: Supabase PostgreSQL with schema already deployed
- **Client access**: Uses `@supabase/supabase-js` for database operations
- **Configuration**: Environment variables in `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **Schema reference**: `shared/schema.ts` (1295 lines) - TypeScript types matching Supabase schema
- **Live server**: `server/working-server.mjs` (2715 lines) - production-ready Express server with Supabase client
- **Schema patterns**: Uses Drizzle ORM types with `pgEnum`, `pgTable`, and Zod validation schemas

### 2. RBAC System (Role-Based Access Control)
- **Mock auth**: `client/src/hooks/useAuth.ts` returns hardcoded super admin (auth removed for development)
- **Mock org**: Default org ID `550e8400-e29b-41d4-a716-446655440001` in all requests
- **Role guards**: Use `<PermissionGuard>` from `client/src/components/rbac/` (not `<RouteGuard>`)
- **Organization context**: Multi-tenant by organization ID, switched via `OrganizationContextSwitcher`
- **Three roles**: `SUPER_ADMIN`, `ORG_ADMIN`, `VIEWER` (defined in `shared/schema.ts`)
- **Router**: `RoleBasedRouter.tsx` handles route-level permissions with Wouter

### 3. Route Structure
- **Wouter router**: Lightweight routing (not React Router) in `RoleBasedRouter.tsx`
- **Hub pages**: Major features use "SuperHub" pattern - massive single-file components (2000+ lines):
  - `TournamentSuperHub.tsx` - Tournament management, fixtures, teams, groups
  - `AdminSuperHub.tsx` - Admin dashboard and settings
  - Pattern: Tabs-based UI with all logic in one component (not split into routes)
- **Path aliases**: `@/` = client/src, `@shared/` = shared/, `@assets/` = attached_assets/

### 4. Database Patterns  
- **Multi-tenancy**: All tables scope by `orgId` except geographic data (counties, wards)
- **Tournament models**: Seven types via `tournament_model_enum` (ADMINISTRATIVE_WARD, ADMINISTRATIVE_COUNTY, LEAGUE, etc.)
- **Flexible team membership**: Teams can be independent (`orgId` is nullable) for cross-org tournaments
- **Fixture engine**: Advanced fixture generation in `server/fixture-engine.mjs` with optimizer and standings engine
- **WebSocket**: Real-time updates via `EnterpriseWebSocketServer.js` for live match data

## Development Workflow

### Essential Commands
```powershell
# Development (PowerShell environment)
npm run dev                    # Frontend only on port 5173-5177 (auto-increments if ports busy)
npm run dev:server:working     # Backend server on :5000 (Supabase-connected) - USE THIS
npm run dev:server             # Alternative server (TypeScript, may be outdated)
.\start-dev.ps1               # Start both frontend + backend in separate windows

# Process cleanup (PowerShell)
Get-Process -Name node | Stop-Process -Force   # Kill all Node processes if ports stuck

# Database verification (schema already deployed)
node check-venue-column.mjs   # Verify database structure
node test-db.js              # Test Supabase connection
node quick-db-check.mjs      # Quick DB health check

# Build & deploy
npm run build                # Vite build to /dist (client code only)
netlify deploy --prod        # Deploy to Netlify (functions in netlify/functions/)
```

### Testing Approach
- **Integration tests**: 80+ root-level `test-*.js/.mjs` files test API endpoints and database operations
- **Key tests**: 
  - `test-api-endpoints.mjs` - All API endpoints validation
  - `test-db.js` - Database connection and basic queries
  - `test-enterprise-fixtures.mjs` - Advanced fixture generation
  - `test-all-fixture-formats.mjs` - All tournament formats
  - `test-fixture-automation.js` - Automated fixture workflows
- **Test pattern**: 
  - Direct API calls to `http://localhost:5000/api/*` 
  - **MUST run `npm run dev:server:working` first** before running tests
  - Most tests use `fetch()` with hardcoded test data
- **No unit tests**: Project focuses exclusively on integration and E2E testing
- **Test execution**: Run individual test files with `node test-*.js` or `node test-*.mjs`

## Critical File Locations

### Schema & Database
- `shared/schema.ts` - TypeScript definitions matching Supabase schema (1295 lines, single source of truth)
  - Drizzle ORM table definitions with `pgTable`, `pgEnum`
  - Zod validation schemas via `createInsertSchema`
  - All enums: `userRoleEnum`, `tournamentModelEnum`, `matchStatusEnum`, etc.
- `server/working-server.mjs` - **PRIMARY** Express server (2715 lines) with Supabase client
  - All API endpoints implemented here
  - CORS for localhost:5173-5177
  - WebSocket integration
  - Fixture generation, teams, tournaments, matches endpoints
- `server/supabase-client.ts` - Supabase client configuration (if exists, check working-server.mjs for actual usage)
- `.env` - Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, DATABASE_URL)

### RBAC & Routing  
- `client/src/components/rbac/` - All role-based access control components
  - `PermissionGuard.tsx` - Component-level access control (USE THIS, not RouteGuard)
  - `RoleBasedRouter.tsx` - Main route definitions with Wouter
  - `OrganizationContextSwitcher.tsx` - Switch between orgs
  - `OptimizedRoleBasedRouter.tsx` - Performance-optimized version
- `client/src/hooks/useAuth.ts` - Authentication hook (currently mocked, returns super admin)

### Server Architecture
- `server/working-server.mjs` - **USE THIS** for all server development (active, production-ready)
- `server/index.ts` - May exist but likely outdated, check working-server.mjs first
- `server/routes.ts` - May contain route definitions, but working-server.mjs is self-contained
- `server/eligibilityEngine*.ts` - Player eligibility business logic (V1, V2, V3 versions exist)
- `server/fixture-engine.mjs` - Advanced fixture generation with `AdvancedFixtureGenerator`, `FixtureOptimizer`, `AdvancedStandingsEngine`
- `server/EnterpriseWebSocketServer.js` - Real-time WebSocket server for live match updates

### Frontend Structure
- `client/src/pages/` - Page components
  - `TournamentSuperHub.tsx` (2644 lines) - Main tournament management UI (fixtures, teams, groups)
  - `AdminSuperHub.tsx` - Admin dashboard
  - `PlayerHubEnhanced.tsx` - Player management
  - `RegistrarConsoleEnhanced.tsx` - Team registration
  - Pattern: Large tab-based components, not split into sub-routes
- `client/src/components/` - Reusable UI components
  - `ui/` - Shadcn UI primitives (Button, Card, Dialog, Form, etc.)
  - `rbac/` - Access control components
  - `tournaments/` - Tournament-specific features
    - `EnterpriseFixtureManager.tsx` - Advanced fixture UI
    - `VenueManager.tsx` - Venue management
    - `TeamGroupManager.tsx` - Group assignments

## Common Patterns

### Working with Database
1. **Schema is already deployed** in Supabase - use Supabase dashboard for schema changes
2. Update `shared/schema.ts` types to match Supabase schema when needed
3. Use Supabase client in server: `import { createClient } from '@supabase/supabase-js'`
   - See `server/working-server.mjs` lines 1-50 for initialization pattern
4. Import types in components: `import type { TableName } from "@shared/schema"`
5. **Multi-tenancy**: Always filter by `orgId` except for geographic data (counties, wards)

### RBAC-Protected Routes
```tsx
import { PermissionGuard } from "@/components/rbac/PermissionGuard";
import { UserRole } from "@shared/schema";

<PermissionGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]}>
  <YourComponent />
</PermissionGuard>
```
**NOTE**: Use `PermissionGuard`, NOT `RouteGuard` which may exist but is deprecated.

### API Development
- **Main server**: `server/working-server.mjs` (2700+ lines) - USE THIS for development
- **CORS setup**: Includes localhost:5173-5177 (auto-increment port support)
  ```javascript
  const allowedOrigins = [
    'http://localhost:5173', 'http://localhost:5174', 
    'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'
  ];
  ```
- **Organization scoping**: Default org ID `550e8400-e29b-41d4-a716-446655440001` in mock auth
- **Response pattern**: Return proper HTTP status codes with structured JSON
  ```javascript
  res.json({ data: results, success: true });
  res.status(500).json({ error: message, success: false });
  ```
- **Supabase queries**: Use `.select()`, `.insert()`, `.update()`, `.delete()` with error handling
  ```javascript
  const { data, error } = await supabase.from('table').select('*');
  if (error) throw error;
  ```

### Component Structure
- **UI Components**: Use Shadcn UI from `client/src/components/ui/`
  - Import pattern: `import { Button } from "@/components/ui/button"`
  - Components: Button, Card, Dialog, Form, Input, Select, Table, Tabs, Toast, etc.
- **Icons**: `lucide-react` for all icons
  - Example: `import { Trophy, Calendar, Users } from "lucide-react"`
- **Forms**: `react-hook-form` + `zod` validation + Shadcn Form components
  ```tsx
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
  
  const schema = z.object({ name: z.string().min(1) });
  const form = useForm({ resolver: zodResolver(schema) });
  ```
- **Data fetching**: `@tanstack/react-query` for server state
  ```tsx
  import { useQuery } from "@tanstack/react-query";
  const { data, isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => fetch('/api/tournaments').then(r => r.json())
  });
  ```
- **Navigation**: Wouter's `useLocation` and `useParams` hooks
  ```tsx
  import { useLocation, useParams } from "wouter";
  const [location, setLocation] = useLocation();
  const params = useParams();
  ```

### SuperHub Pattern (Large Feature Pages)
- **Tabs-based UI**: All functionality in one 2000+ line component
- **Example structure** (see `TournamentSuperHub.tsx`):
  ```tsx
  <Tabs defaultValue="overview">
    <TabsList>
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
      <TabsTrigger value="teams">Teams</TabsTrigger>
    </TabsList>
    <TabsContent value="overview">{/* Overview content */}</TabsContent>
    <TabsContent value="fixtures">{/* Fixtures content */}</TabsContent>
  </Tabs>
  ```
- **State management**: useState for local state, useQuery for server data
- **Dialogs**: Multiple dialog states managed in one component
- **Don't split into sub-routes**: Keep related functionality together in tabs

## Current Development State

### Authentication
- **Auth disabled**: `useAuth()` returns hardcoded super admin for all users
- **Mock org**: Default org ID `550e8400-e29b-41d4-a716-446655440001`
- **Dev focus**: Functionality over authentication during development

### Key Enterprise Features
- **Fixture generation**: Advanced engine in `server/fixture-engine.mjs`
- **WebSocket**: Real-time updates via `EnterpriseWebSocketServer.js`
- **Tournament types**: Support for complex multi-stage tournaments
- **Document management**: Player documentation and consent systems

## Business Logic Notes

- **Geography**: Kenya counties/wards pre-seeded, used for player eligibility
- **Tournaments**: Support both organization-bound leagues and cross-org geographic tournaments  
- **Player eligibility**: Complex rules based on residence, birth place, and registration history
- **Teams**: Can be independent (no org) or organization-affiliated

## Debugging Tips
- **Server health**: Check `server/status.html` or `GET /api/health` endpoint
- **Database issues**: Run `node test-db.js` to verify Supabase connection  
- **API testing**: Use `node test-api-endpoints.mjs` to verify all endpoints (requires server running)
- **RBAC issues**: Check `useAuth()` return values and `PermissionGuard` allowed roles
- **Build issues**: Verify path aliases in `vite.config.ts` (`@/`, `@shared/`, `@assets/`)
- **Port conflicts**: 
  - Frontend auto-increments: 5173 → 5174 → 5175 → 5176 → 5177
  - Backend fixed: 5000 (must restart if port busy)
  - Kill processes: `Get-Process -Name node | Stop-Process -Force` (PowerShell)
- **CORS errors**: Check server allows your frontend port in `allowedOrigins` array
- **Test failures**: Ensure `npm run dev:server:working` is running before executing tests
- **Schema mismatches**: Compare `shared/schema.ts` with Supabase dashboard schema

## PowerShell Development Notes
- **Windows environment**: Project uses PowerShell scripts (`.ps1` files)
- **Port management**: Auto-increment ports 5173-5177 for frontend (Vite default behavior)
- **Process cleanup**: Use `Get-Process -Name node | Stop-Process -Force` to kill stuck processes
- **Start script**: `.\start-dev.ps1` opens backend in new window, frontend in current terminal
- **Testing**: Many test commands designed for PowerShell environment
- **File paths**: Use absolute paths or PowerShell-compatible relative paths in scripts