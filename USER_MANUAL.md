# Jamii Tourney v3 - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Features](#core-features)
5. [Tournament Management](#tournament-management)
6. [Player Management](#player-management)
7. [Team Management](#team-management)
8. [Public Tournament Viewing](#public-tournament-viewing)
9. [Reports & Analytics](#reports--analytics)

---

## Introduction

Jamii Tourney v3 is a comprehensive tournament management platform designed specifically for Kenyan sports organizations. It supports multiple tournament formats and provides tools for managing players, teams, fixtures, standings, and administrative workflows.

### Key Capabilities
- Multi-model tournament support (Ward, Sub-County, County, National, Inter-County, Independent, League)
- Universal Player ID (UPID) system for player registration
- Contract and transfer management
- Disciplinary tracking system
- Public tournament viewing for fans
- Excel export functionality
- Real-time standings calculation

---

## Getting Started

### Accessing the Platform

1. **Navigate to the application URL**
2. **Click "Sign in with Replit"** on the landing page
3. **Authenticate** using Google, GitHub, or email
4. **Access granted** based on your assigned role

### First-Time Setup (Administrators)

1. Log in as a SUPER_ADMIN user
2. Create your organization (if not already created)
3. Set up sports categories
4. Add geographic entities (Wards, Sub-Counties, Counties)
5. Register players and teams
6. Create your first tournament

---

## User Roles & Permissions

### SUPER_ADMIN
- Full platform access
- Can create and manage organizations
- Assign roles to other users
- Access all data across all organizations
- Manage system-wide settings

### ORG_ADMIN
- Manage organization-specific data
- Create and manage tournaments
- Register players and teams
- Record match results
- Generate reports
- Cannot access other organizations' data

### VIEWER
- Read-only access to organization data
- View tournaments, fixtures, standings
- View player and team information
- Cannot create or modify data

### Public Users (Unauthenticated)
- View public tournament pages
- Access fixtures and standings
- View participating teams
- No login required

---

## Core Features

### Dashboard (Home Page)
The dashboard provides quick access to:
- Recent tournaments
- Upcoming fixtures
- Key statistics
- Quick action buttons

### Navigation
Use the sidebar to navigate between:
- **Tournaments** - Tournament list and management
- **Teams** - Team registration and roster management
- **Players** - Player registry with UPID system
- **Contracts** - Player contracts management
- **Transfers** - Player transfer tracking
- **Disciplinary** - Disciplinary records
- **Documents** - Player document verification
- **Eligibility** - Tournament eligibility rules
- **Fixtures** - Match scheduling and results
- **Standings** - League tables and rankings
- **Reports** - Analytics and exports
- **Users** - User role management (SUPER_ADMIN only)

---

## Tournament Management

### Creating a Tournament

1. Navigate to **Tournaments** page
2. Click **"Create Tournament"**
3. Fill in tournament details:
   - **Organization**: Select your organization
   - **Sport**: Choose the sport type
   - **Name**: Tournament name (e.g., "County Championship 2025")
   - **Slug**: URL-friendly name (e.g., "county-championship-2025")
   - **Type**: Select tournament model:
     - INTER_COUNTY - Competitions between counties
     - WARD - Ward-level competitions
     - SUB_COUNTY - Sub-county competitions
     - COUNTY - County-level competitions
     - NATIONAL - National championships
     - INDEPENDENT - Standalone tournaments
     - LEAGUE - Full league system
   - **Status**: Tournament lifecycle stage:
     - PLANNING - Initial setup
     - ACTIVE - Currently running
     - COMPLETED - Finished
     - CANCELLED - Cancelled
   - **Start Date & End Date**: Tournament duration
4. Click **"Create Tournament"**

### Registering Teams

1. Open the tournament details
2. Click **"Add Team"** or navigate to **Teams** page
3. Select teams from your organization
4. Teams are automatically enrolled in the tournament

### Generating Fixtures

1. Navigate to tournament details
2. Click **"Generate Fixtures"**
3. Configure scheduling options:
   - **Weekend Only**: Schedule matches only on Saturdays/Sundays
   - **Kickoff Times**: Set match start times
   - **Home/Away Legs**: Enable two-leg fixtures
   - **Venue Assignment**: Assign home venues
4. Click **"Generate"**
5. Fixtures are created using round-robin algorithm

### Recording Match Results

1. Navigate to **Fixtures** page
2. Find the match to update
3. Click **"Record Result"**
4. Enter scores for both teams
5. Click **"Save"**
6. Standings are automatically recalculated

### Viewing Standings

1. Navigate to **Standings** page
2. Select tournament
3. View league table showing:
   - Position
   - Team name
   - Matches played
   - Wins, Draws, Losses
   - Goals For, Goals Against
   - Goal Difference
   - Points

---

## Player Management

### Universal Player ID (UPID) System

Every player receives a unique UPID when registered. This ID follows the player across all tournaments and organizations.

### Registering a Player

1. Navigate to **Players** page
2. Click **"Add Player"**
3. Fill in player details:
   - **First Name & Last Name**
   - **Date of Birth**
   - **Nationality**
   - **ID Number** (National ID or passport)
   - **Gender**
   - **Position** (for sports with positions)
4. Click **"Register"**
5. UPID is automatically generated

### Player Documents

1. Navigate to **Documents** page
2. Upload player documents (ID, birth certificate, etc.)
3. Administrators review and verify documents
4. Verified documents enable tournament eligibility

### Tournament Player ID (TPID)

When a player is registered for a specific tournament, they receive a TPID. This tracks their participation in that tournament.

---

## Team Management

### Creating a Team

1. Navigate to **Teams** page
2. Click **"Create Team"**
3. Enter team details:
   - **Name**: Team name
   - **Organization**: Your organization
   - **Home Venue**: Home ground
   - **Geographic Entity**: Ward/Sub-County/County
4. Click **"Create"**

### Managing Team Rosters

1. Open team details
2. Click **"Manage Roster"**
3. Add players to the team
4. Assign jersey numbers
5. Set player positions
6. Save roster changes

---

## Public Tournament Viewing

### Sharing Tournament with Fans

1. Navigate to tournament details (as admin)
2. Copy the tournament slug (e.g., "county-championship-2025")
3. Share the public URL: **`/tournament/county-championship-2025`**
4. Fans can view without logging in

### What Fans Can See

Public tournament pages include:
- **Overview**: Tournament information
- **Fixtures**: Match schedule with scores and times
- **Standings**: League table
- **Teams**: Participating teams and rosters

### What Fans Cannot Do

- Create or modify data
- Access admin features
- View other organizations' data
- Record match results

---

## Reports & Analytics

### Generating Reports

1. Navigate to **Reports** page
2. Select report type:
   - **Player Statistics** - Performance metrics
   - **Tournament Summary** - Overview and results
   - **Disciplinary Report** - Cards and suspensions
   - **Team Performance** - Team-level analytics

### Exporting to Excel

1. Open the report
2. Click **"Export to Excel"**
3. File is downloaded with:
   - Fixtures sheet
   - Standings sheet
   - Players sheet
   - Formatted tables with filters

### Available Exports

- **Fixtures Export**: All matches with dates, times, venues
- **Standings Export**: League tables with full statistics
- **Players Export**: Registered players with TPIDs
- **Tournament Summary**: Complete tournament data

---

## Contract Management

### Creating Player Contracts

1. Navigate to **Contracts** page
2. Click **"Create Contract"**
3. Fill in contract details:
   - **Player** (UPID)
   - **Team**
   - **Start Date & End Date**
   - **Contract Type** (Professional, Amateur, Youth)
   - **Status** (Active, Expired, Terminated)
4. Save contract

### Contract Lifecycle

Contracts track:
- Active period
- Expiration dates
- Termination records
- Audit trail

---

## Transfer Management

### Recording Player Transfers

1. Navigate to **Transfers** page
2. Click **"Record Transfer"**
3. Enter transfer details:
   - **Player** (UPID)
   - **From Team**
   - **To Team**
   - **Transfer Date**
   - **Transfer Type** (Permanent, Loan)
   - **Fee** (if applicable)
4. Submit transfer
5. Status tracked through approval workflow

### Transfer Statuses

- **PENDING** - Awaiting approval
- **APPROVED** - Completed transfer
- **REJECTED** - Transfer denied
- **CANCELLED** - Transfer cancelled

---

## Disciplinary System

### Recording Disciplinary Actions

1. Navigate to **Disciplinary** page
2. Click **"Add Record"**
3. Enter details:
   - **Player** (UPID)
   - **Match** (if applicable)
   - **Infraction Type** (Yellow Card, Red Card, Suspension)
   - **Date**
   - **Description**
   - **Suspension Duration**
4. Save record

### Tracking Suspensions

The system automatically:
- Calculates suspension periods
- Tracks accumulated cards
- Displays eligibility status

---

## Eligibility Rules Engine

### Setting Tournament Eligibility Rules

1. Navigate to **Eligibility** page
2. Select tournament
3. Add eligibility rules:
   - **AGE_RANGE** - Min/max age requirements
   - **NATIONALITY** - Nationality restrictions
   - **GEOGRAPHIC_AFFILIATION** - Regional requirements
   - **REGISTRATION_DEADLINE** - Registration cutoff
   - **DOCUMENT_VERIFICATION** - Required verified documents
   - **DISCIPLINARY_CLEARANCE** - No active suspensions
   - **CONTRACT_STATUS** - Valid contract requirement
   - **PREVIOUS_PARTICIPATION** - Prior tournament restrictions

### Rule Validation

The system automatically:
- Validates player eligibility
- Blocks ineligible players
- Displays eligibility status
- Provides clear error messages

---

## Tips & Best Practices

### For Tournament Organizers

1. **Set up geographic entities first** before creating tournaments
2. **Register all players with documents** before tournament start
3. **Generate fixtures early** to allow teams to plan
4. **Record results promptly** to keep standings current
5. **Use public URLs** to engage fans
6. **Export reports regularly** for record-keeping

### For Player Registration

1. **Use accurate ID numbers** for player identification
2. **Upload clear document images** for quick verification
3. **Register players early** to avoid eligibility issues
4. **Keep contact information updated**

### For Data Accuracy

1. **Double-check match scores** before saving
2. **Verify team rosters** before tournaments
3. **Review standings** after each match day
4. **Audit disciplinary records** regularly

---

## Troubleshooting

### Cannot See Tournament Data
- Check you're logged into the correct organization
- Verify your user role has appropriate permissions
- Ensure tournament status is ACTIVE

### Fixtures Not Generating
- Confirm at least 2 teams are registered
- Check tournament has valid start/end dates
- Verify no duplicate fixtures exist

### Player Not Eligible
- Check document verification status
- Review eligibility rules
- Verify contract status
- Check for active suspensions

### Cannot Record Results
- Ensure you have ORG_ADMIN role
- Check match is scheduled
- Verify both teams are registered

---

## Support & Contact

For technical support or questions about the platform, contact your system administrator or organization manager.

---

**Document Version**: 1.0  
**Last Updated**: October 22, 2025  
**Platform**: Jamii Tourney v3
