# Venue Management for Groups - Implementation Complete

## Overview
Added venue management capability to tournament groups, allowing organizers to assign specific venues/locations to groups during creation and edit them later.

## Changes Made

### 1. Database Schema
- **File**: `shared/schema.ts`
- **Change**: Added `venue: text("venue")` field to groups table
- **Migration**: Created `migrations/0003_add_venue_to_groups.sql`

### 2. Backend API (server/working-server.mjs)
- **POST /api/tournaments/:tournamentId/groups**: Now accepts optional `venue` parameter
- **PUT /api/groups/:groupId**: Now accepts optional `venue` parameter for updates
- **GET /api/tournaments/:tournamentId/groups**: Now includes `venue` in response

### 3. Frontend Components

#### TeamGroupManager.tsx
- Added venue state management (`newGroupVenue`, `editGroupVenue`)
- Fetches venues from `/api/fixtures/venues` endpoint
- Venue dropdown in Create Group dialog
- Venue dropdown in Edit Group dialog
- Displays venue on group cards with 🏟️ icon

#### useGroups.ts Hook
- Updated `Group` interface to include `venue?: string`
- Updated data transformation to include venue field
- Updated Supabase query to select venue
- Updated mutations (create/update) to handle venue parameter

## How to Use

### For Developers
1. **Run the migration**:
   ```sql
   -- In Supabase SQL Editor
   ALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;
   ```

2. **Restart backend server** (if running):
   ```powershell
   # The server should automatically pick up the schema changes
   ```

### For Users
1. **Create Group with Venue**:
   - Click "Create Group" in Team & Groups tab
   - Enter group name
   - Select a venue from dropdown (optional)
   - Click "Create Group"

2. **Edit Group Venue**:
   - Click Edit icon on any group card
   - Change venue selection
   - Click "Update Group"

3. **View Group Venue**:
   - Venue displayed on group card below team count
   - Format: "🏟️ Venue Name"

## Venues Available
Currently using mock data from `/api/fixtures/venues`:
- Nairobi City Stadium (Nairobi CBD)
- Kiambu Sports Complex (Kiambu Town)
- Thika Municipal Stadium (Thika)
- Machakos Stadium (Machakos)

## Next Steps (Optional Enhancements)
1. Create dedicated venues management page
2. Allow admins to add/edit/remove venues
3. Store venues in database instead of mock data
4. Add venue capacity and facilities info
5. Validate venue availability when scheduling matches
6. Add venue to fixture generation preferences

## Testing Checklist
- [ ] Create group without venue (should work)
- [ ] Create group with venue (should persist)
- [ ] Edit group to add venue
- [ ] Edit group to change venue
- [ ] Edit group to remove venue (set to empty)
- [ ] Verify venue displays on group card
- [ ] Verify venue persists after page refresh
- [ ] Verify venue appears in database (Supabase)

## Files Modified
1. `shared/schema.ts` - Added venue field to groups table
2. `server/working-server.mjs` - Updated groups endpoints
3. `client/src/hooks/useGroups.ts` - Updated interface and mutations
4. `client/src/components/tournaments/TeamGroupManager.tsx` - Added UI
5. `migrations/0003_add_venue_to_groups.sql` - New migration file

## Database Migration Required
⚠️ **Important**: Run the SQL migration before using this feature:
```sql
ALTER TABLE groups ADD COLUMN IF NOT EXISTS venue TEXT;
COMMENT ON COLUMN groups.venue IS 'Optional venue/location where group matches will be played';
```

Access Supabase SQL Editor:
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Paste the migration SQL
4. Click "Run"
