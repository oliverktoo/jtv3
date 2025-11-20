# Testing Standings Update Workflow

## Changes Made

### 1. Fixed `useStandings` Hook
- ✅ Now filters matches by tournamentId (was fetching ALL matches)
- ✅ Returns proper data format with `position` field
- ✅ Transforms team object to team name string
- ✅ Sorts by points → goal difference → goals for

### 2. Fixed MatchScoreEditor Component  
- ✅ Now uses `useUpdateMatch` hook instead of non-existent API endpoint
- ✅ Updates database with `home_score`, `away_score`, `status`
- ✅ Automatically invalidates standings query on update
- ✅ Shows toast notifications for success/failure

### 3. Enhanced Update Fixture Mutation
- ✅ Invalidates both matches and standings queries
- ✅ Ensures standings refresh when fixtures are edited

## How It Works Now

1. **Generate Fixtures**
   - Fixtures are created in database (stages → groups → rounds → matches)
   - Initial scores are NULL

2. **Update Match Scores**
   - Use MatchScoreEditor or Edit Fixture dialog
   - Enter home_score and away_score
   - Set status to COMPLETED
   - Click Save

3. **Automatic Standings Update**
   - Match update triggers `invalidateQueries` for standings
   - `useStandings` hook refetches data
   - Calculates: played, won, drawn, lost, goals, points
   - Sorts teams by points, goal difference, goals scored
   - StandingsTable component automatically re-renders

## Testing Steps

1. Start both servers:
   ```powershell
   npm run dev:server:working  # Terminal 1 (port 5000)
   npm run dev                  # Terminal 2 (port 5173)
   ```

2. Navigate to tournament with generated fixtures

3. Go to "Jamii Fixture" tab → "Standings & Scores" subtab

4. Edit match scores using the score editor:
   - Click Edit icon on a match
   - Enter home and away scores
   - Change status to "COMPLETED"
   - Click Save

5. Check Standings Tab:
   - Should show updated table with correct points
   - Teams sorted by points, then goal difference
   - Should recalculate immediately after score update

## Expected Behavior

✅ Standings only show teams from selected tournament
✅ Only matches with non-null scores are counted
✅ Standings update automatically when scores change
✅ Points calculated correctly (3 for win, 1 for draw, 0 for loss)
✅ Goal difference and goals for/against calculated correctly
✅ Teams sorted properly by points → GD → GF
