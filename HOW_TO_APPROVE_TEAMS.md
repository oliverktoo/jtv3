# How to Approve Pending Teams for a Tournament

> **Note**: This guide reflects the unified Tournament Super Hub interface. The old separate "Tournament Detail" page has been removed to eliminate confusion.

## 📍 Where to Find Team Approval

Team approval is accessible in the **Tournament Super Hub**:

**Path**: Tournaments → Tournament Super Hub → Select Tournament → Team Registrations Tab

---

## 🎯 Step-by-Step Guide

### Step 1: Navigate to Tournament Super Hub
1. Open your Jamii Tourney application
2. Go to **Tournaments** page
3. This opens the **Tournament Super Hub** with a list of all tournaments

### Step 2: Select Your Tournament
1. In the Tournament Super Hub, you'll see all tournaments displayed as cards
2. Click on the tournament you want to manage
3. The tournament details and management tabs will appear below

### Step 3: Access Team Registrations Tab
1. Scroll down to the **"Tournament Structure Management"** section
2. You'll see multiple tabs: **Team Registrations**, Templates, Automation, Jamii Fixtures, etc.
3. Click on the **"Team Registrations"** tab (first tab)
4. This opens the Team Registration Admin panel

### Step 4: View the Registration Dashboard

The admin panel shows:

#### Statistics Overview (Top Cards)
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Teams  │ Pending      │ Approved     │ Approval Rate│
│     24       │     5        │     18       │    75%       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### Filter and Search Tools
- **Status Filter** dropdown (ALL, SUBMITTED, APPROVED, REJECTED, WITHDRAWN)
- **Search box** (search by team name, code, or organization)
- **Refresh button** 🔄 (auto-refreshes every 30 seconds)

#### Registrations Table
- Checkbox column for bulk selection
- Team details columns
- Status badges
- Action buttons

### Step 5: Approve Teams (Bulk or Individual)

#### Option A: Approve Individual Team
1. Find the team in the table with "SUBMITTED" status
2. Click the **checkbox** next to the team
3. Click the **"Approve Selected"** button (green with checkmark)
4. Confirmation dialog appears
5. Optionally add approval notes
6. Click **"Confirm Approval"**
7. ✅ Success toast: "Teams Approved!"

#### Option B: Approve Multiple Teams (Bulk)
1. **Method 1**: Click the checkbox in the table header to select all SUBMITTED teams
2. **Method 2**: Manually click checkboxes for specific teams
3. Selected count shows at top: "Selected: X teams"
4. Click **"Approve Selected"** button
5. Review the list in the confirmation dialog
6. Add approval notes (optional)
7. Click **"Confirm Approval"**
8. Success message: "X team registrations have been approved and can now participate in fixtures"

**Note**: Only teams with "SUBMITTED" status will have selectable checkboxes. APPROVED, REJECTED, and WITHDRAWN teams cannot be selected.

---

## 🔄 What Happens After Approval?

Once teams are approved:

1. **Status Changes**:
   - `registration_status` changes from `SUBMITTED` to `APPROVED`
   - `approval_date` is set to current date/time
   - `approved_by` records who approved (currently set to 'admin')

2. **Teams Become Available For**:
   - ✅ Fixture generation
   - ✅ Tournament participation
   - ✅ Match assignments
   - ✅ Standings calculation

3. **Database Updates**:
   - `team_tournament_registrations` table is updated
   - Teams now appear in the "Approved Teams" list
   - Teams are included when fetching tournament teams for Jamii Fixtures

4. **Notifications** (future feature):
   - Teams receive approval notification
   - Email/SMS confirmation sent to team contacts

---

## 📊 Understanding Registration Statuses

| Status | Badge Color | Meaning | Can Be Selected? |
|--------|-------------|---------|------------------|
| **SUBMITTED** | Yellow | Team has registered and is awaiting review | ✅ Yes |
| **APPROVED** | Green | Team has been approved for tournament | ❌ No (already approved) |
| **REJECTED** | Red | Team registration was rejected | ❌ No |
| **WITHDRAWN** | Gray | Team withdrew their registration | ❌ No |

---

## 🛠️ Using the Admin Interface

### Top Action Bar

```
┌─────────────────────────────────────────────────────────┐
│  [Search Teams...]  [Status Filter ▼]  [Refresh 🔄]    │
│                                                           │
│  Selected: 3 teams                                        │
│  [✓ Approve Selected] [✗ Reject Selected] [↓ Export]    │
└─────────────────────────────────────────────────────────┘
```

### Statistics Dashboard

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Teams  │ Pending      │ Approved     │ Approval Rate│
│     24       │     5        │     18       │    75%       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Registrations Table

```
┌───┬─────────────┬──────────────┬───────────────┬─────────────┬─────────┐
│ ☐ │ Team Name   │ Organization │ Status        │ Reg. Date   │ Actions │
├───┼─────────────┼──────────────┼───────────────┼─────────────┼─────────┤
│ ☑ │ Eagles FC   │ Nairobi FA   │ 🟡 Pending    │ 3 days ago  │  👁 ...  │
│ ☑ │ Lions SC    │ Kiambu FC    │ 🟡 Pending    │ 2 days ago  │  👁 ...  │
│ ☐ │ Tigers FC   │ Mombasa SA   │ 🟢 Approved   │ 5 days ago  │  👁 ...  │
└───┴─────────────┴──────────────┴───────────────┴─────────────┴─────────┘
```

---

## ⚡ Quick Actions Guide

### 1. Approve All Pending Teams
```
1. Click "Status Filter" → Select "SUBMITTED"
2. Click checkbox in table header (selects all)
3. Click "Approve Selected"
4. Confirm in dialog
```

### 2. Approve Specific Teams
```
1. Use search box to find teams
2. Click checkboxes next to desired teams
3. Click "Approve Selected"
4. Add optional notes
5. Confirm
```

### 3. Review Team Details Before Approval
```
1. Click the "👁 View" or "..." (More) icon on a team row
2. Review team information:
   - Squad size
   - Contact details
   - Registration date
   - Jersey colors
   - Notes
3. Go back and approve/reject
```

### 4. Reject Teams
```
1. Select teams you want to reject
2. Click "Reject Selected" button (red)
3. In dialog, provide rejection reason (REQUIRED)
   Example reasons:
   - "Incomplete squad information"
   - "Missing registration documents"
   - "Team does not meet tournament requirements"
4. Confirm rejection
```

---

## 🔍 Troubleshooting

### Issue 1: "Approve Selected" button is disabled
**Cause**: No teams selected or only non-pending teams selected

**Solution**:
- Make sure you've checked at least one team with "SUBMITTED" status
- Only pending teams can be approved

### Issue 2: Teams not showing up
**Cause**: Wrong status filter or search query

**Solution**:
- Set Status Filter to "ALL" to see all teams
- Clear the search box
- Click the refresh button 🔄

### Issue 3: Approval succeeds but teams don't appear in fixtures
**Cause**: Need to refresh tournament teams list

**Solution**:
- The system automatically invalidates queries after approval
- Wait a few seconds and refresh the page
- Teams should now be available for fixture generation

### Issue 4: Cannot find Team Registration panel
**Cause**: Not in the correct location

**Solution**:
- Make sure you're in **Tournament Super Hub** (the unified tournament management page)
- Select a tournament from the list first
- Look for **"Team Registrations"** tab in the Structure Management section
- If not visible, check if you have admin permissions

---

## 📝 Complete Example

Let's approve 3 teams for "Nairobi County League 2025":

### Step 1: Navigate
```
Home → Tournaments → Tournament Super Hub → Click "Nairobi County League 2025" card
```

### Step 2: Open Team Registrations
```
Scroll down → Click "Team Registrations" tab
```

### Step 3: Filter Pending
```
Status Filter dropdown → Select "SUBMITTED"
Result: Shows 3 pending teams
```

### Step 4: Select Teams
```
Click checkbox in header OR individually select:
☑ Eagles FC - Pending Review
☑ Lions SC - Pending Review  
☑ Tigers United - Pending Review
```

### Step 5: Approve
```
Click green "Approve Selected" button (top right)

Approval Dialog appears:
┌─────────────────────────────────────────┐
│ Approve Team Registrations              │
├─────────────────────────────────────────┤
│ You are about to approve 3 teams:       │
│ • Eagles FC                              │
│ • Lions SC                               │
│ • Tigers United                          │
│                                          │
│ Approval Notes (optional):               │
│ ┌─────────────────────────────────────┐ │
│ │ All documents verified and complete │ │
│ └─────────────────────────────────────┘ │
│                                          │
│         [Cancel]  [Confirm Approval]    │
└─────────────────────────────────────────┘

Click "Confirm Approval"
```

### Step 6: Confirmation
```
✅ Success Toast appears:
"Teams Approved! ✅
3 team registrations have been approved and can now participate in fixtures."

Table updates:
☐ Eagles FC - ✅ Approved
☐ Lions SC - ✅ Approved
☐ Tigers United - ✅ Approved
```

### Step 7: Generate Fixtures
```
Now you can go to the Jamii Fixtures tab and click "Generate Fixtures"
The 3 approved teams will be included in the fixture generation!
```

---

## 🚀 Best Practices

### 1. Review Before Approving
- Check team details (squad size, contact info)
- Verify organization affiliation
- Ensure team meets tournament requirements

### 2. Use Bulk Approval Wisely
- Review all selected teams before bulk approval
- Add notes to document your approval decision
- Keep a record of approval criteria

### 3. Provide Clear Rejection Reasons
- Be specific about why a team was rejected
- Helps teams understand what to fix
- Maintains transparency

### 4. Regular Monitoring
- Check pending registrations daily during registration period
- Set up auto-refresh (already enabled - refreshes every 30 seconds)
- Respond promptly to avoid delays

### 5. Communication
- Add notes when approving (helps with record-keeping)
- Follow up with teams after rejection
- Notify teams of approval deadlines

---

## 🔐 API Reference (For Developers)

If you need to approve teams programmatically:

### Approve Teams Endpoint

```http
POST /api/tournaments/:tournamentId/registrations/approve
Content-Type: application/json

{
  "registration_ids": ["reg-uuid-1", "reg-uuid-2", "reg-uuid-3"],
  "notes": "All documents verified",
  "approved_by": "admin"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully approved 3 team registrations",
  "approved_count": 3,
  "approved_teams": [
    {
      "registration_id": "reg-uuid-1",
      "team_id": "team-uuid-1",
      "team_name": "Eagles FC",
      "status": "APPROVED"
    }
  ],
  "tournament_id": "tournament-uuid"
}
```

### Reject Teams Endpoint

```http
POST /api/tournaments/:tournamentId/registrations/reject
Content-Type: application/json

{
  "registration_ids": ["reg-uuid-1"],
  "reason": "Incomplete squad information",
  "rejected_by": "admin"
}
```

---

## 📋 Pre-Approval Checklist

Before approving teams, verify:

- [ ] Team has complete registration information
- [ ] Squad size meets tournament minimum requirements
- [ ] Contact information is valid (email, phone)
- [ ] Organization affiliation is correct
- [ ] Jersey colors are specified (if required)
- [ ] Team meets geographic/eligibility criteria
- [ ] No duplicate registrations from same team
- [ ] Registration fee paid (if applicable)

---

## ✅ Post-Approval Checklist

After approving teams:

- [ ] Verify team appears in "Approved" status
- [ ] Confirm team count updated in stats dashboard
- [ ] Check team is available in fixture generation
- [ ] Send confirmation notification (manual or automated)
- [ ] Update tournament registration status if needed
- [ ] Document any special conditions or notes

---

## 🎯 Summary

**Where to Approve Teams:**
- **Tournament Super Hub** → Select Tournament → **Team Registrations Tab**

**How to Approve:**
1. Filter by "SUBMITTED" status
2. Select teams (checkbox)
3. Click "Approve Selected" button
4. Add notes (optional)
5. Confirm approval
6. Teams are now ready for fixtures! ✅

**Key Points:**
- Only "SUBMITTED" status teams can be approved
- Bulk approval available for multiple teams
- Approval notes are optional but recommended
- System auto-refreshes every 30 seconds
- Approved teams immediately available for fixture generation

---

**Need Help?** Check the registration stats dashboard for an overview, or use the search/filter tools to find specific teams.

**Last Updated**: November 15, 2025
