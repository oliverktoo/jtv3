# Jamii Tourney v3 - Tournament Management Platform

## Overview

Jamii Tourney v3 is a multi-model tournament management platform for Kenyan sports organizations. It supports various tournament formats, including administrative hierarchies (Ward → Sub-County → County → National), inter-county, independent, and full league systems. The platform enables organizers to create tournaments, register teams, generate fixtures with configurable scheduling, calculate standings, and export data to Excel. Its core value proposition is to provide a unified system that handles diverse tournament models with clear data isolation, predictable status lifecycles, and efficient fixture scheduling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite.

**UI Component Library**: Shadcn UI (New York style) built on Radix UI primitives, utilizing Tailwind CSS for styling with custom design tokens and dark/light theme support. The custom color palette is centered around a deep green primary.

**State Management**: TanStack Query (React Query) for server state management, employing custom hooks and query invalidation.

**Routing**: Wouter for lightweight client-side routing.

**Key Design Decisions**: A utility-focused design system with scannable hierarchies, inspired by sports platforms, prioritizes data clarity for efficient task completion in information-dense tournament management interfaces.

### Backend Architecture

**Runtime**: Node.js with TypeScript (ESM modules).

**Framework**: Express.js server with custom middleware for logging, JSON parsing, and error handling.

**API Design**: RESTful API pattern with resource-based and nested endpoints, using standard HTTP methods.

**Business Logic Modules**:
- `fixtureGenerator.ts`: Implements round-robin fixture generation using the "circle method" with configurable scheduling (weekend-only, kickoff times, home/away legs).
- `standingsCalculator.ts`: Calculates league standings with configurable point systems and tiebreakers.

**Key Design Decisions**: A pluggable fixture generation system with an options pattern allows a single generator to handle all tournament types through configuration, rather than separate implementations.

### Database Architecture

**Database**: PostgreSQL (via Neon serverless).

**ORM**: Drizzle ORM with TypeScript schema definitions and Zod integration for runtime validation.

**Data Model**: Features multi-tenancy by `organization` and sport-specific isolation. It includes hierarchical geographic data, tournament lifecycle management via status enum, and support for multiple tournament models and stage-based competition structures. Key features include a Universal Player ID (UPID) system, contracts management with audit trails, transfers management with status transitions, and a comprehensive disciplinary tracking system.

**Key Design Decisions**: Strict organization-scoping and sport-isolation at the database level prevent data leakage and enable safe multi-tenancy without complex row-level security.

**Schema Highlights**: Utilizes enums for various entities, UUID primary keys, timestamp tracking, JSONB fields for flexible configuration, and relational integrity via foreign keys.

### System Implementations

**Authentication & Authorization**: Replit Auth (OpenID Connect) for OAuth, PostgreSQL session store, three-tier role hierarchy (SUPER_ADMIN, ORG_ADMIN, VIEWER), and authorization middleware for protected routes and access control.

**Tournament Features**:
- **Tournament Creation & Management**: Dialogs for creating tournaments and generating fixtures with configurable scheduling.
- **Reports & Analytics**: Comprehensive reports page with player statistics, tournament summaries, disciplinary reports, and Excel export functionality.
- **Eligibility Rules Engine**: Expanded `eligibility_rule_type_enum` with 8 rule types (e.g., AGE_RANGE, NATIONALITY) and a service for validation logic.
- **Tournament Player ID (TPID) System**: Infrastructure for managing tournament players and team rosters.
- **Team Management**: CRUD operations for teams, with organization/tournament filtering and roster access.
- **Match Result Recording**: Real-time result recording via a dialog on the fixtures page, with automatic standings recalculation.
- **Document Verification**: Admin page for reviewing and verifying player documents.
- **Excel Export Functionality**: Comprehensive export for fixtures, standings, and players using the XLSX library.

## External Dependencies

**Database Service**: Neon (PostgreSQL serverless) with `@neondatabase/serverless` for connection pooling.

**UI Component Libraries**:
- Radix UI: Headless accessible components.
- Lucide React: Icon system.
- Tailwind CSS: Utility-first styling.
- shadcn/ui: Pre-built component templates.

**Utility Libraries**:
- date-fns: Date manipulation and formatting.
- zod: Runtime schema validation.
- clsx + tailwind-merge: Conditional CSS class management.
- XLSX (SheetJS): Excel export functionality.

**Development Tools**:
- TypeScript: Type safety across the stack.
- Drizzle Kit: Database migrations.
- Vite plugins for Replit integration.

**Key Design Decisions**: The combination of Neon and Drizzle ORM was chosen for a reliable serverless database with excellent TypeScript support and migration tooling.