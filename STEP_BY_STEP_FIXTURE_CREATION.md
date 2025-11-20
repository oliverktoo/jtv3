# Step-by-Step Fixture Creation Guide
## From Registration to Published Fixtures

**Platform:** Jamii Tourney v3.0  
**Time Required:** 15-20 minutes  
**Difficulty:** Beginner-Friendly  
**Last Updated:** November 15, 2025

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Admin account with tournament management permissions
- [ ] Tournament created with name, dates, and format
- [ ] At least 2 teams registered to the tournament
- [ ] Browser: Chrome, Firefox, or Edge (latest version)
- [ ] Stable internet connection

---

## 🎯 Complete Workflow Overview

```
Step 1: Login               →  Step 2: Navigate        →  Step 3: Approve Teams
Step 4: Generate Fixtures   →  Step 5: Review          →  Step 6: Publish
Step 7: Verify              →  Step 8: Export PDF      →  Step 9: Notify Teams
```

**Estimated Time:** 15-20 minutes

---

# PART 1: PREPARATION (5 minutes)

## Step 1: Login to Jamii Tourney

### 1.1 Open the Application

**Action:** Navigate to your Jamii Tourney instance

```
URL: http://localhost:5173  (Development)
URL: https://your-domain.com  (Production)
```

**Expected Screen:**
```
┌─────────────────────────────────────────────────┐
│  🏆 JAMII TOURNEY                               │
│                                                 │
│  Welcome Back!                                  │
│                                                 │
│  Email:    [________________________]          │
│  Password: [________________________]          │
│                                                 │
│           [Login Button]                       │
│                                                 │
│  Don't have an account? Sign Up                │
└─────────────────────────────────────────────────┘
```

**What to do:**
1. Enter your admin email address
2. Enter your password
3. Click "Login" button

**Verification:**
- ✅ You should see the dashboard/home page
- ✅ Your name/role appears in the top right corner
- ✅ Navigation menu is visible on the left/top

---

### 1.2 Check Your Permissions

**Action:** Verify you have tournament management access

**What to check:**
- ✅ "Tournaments" menu item visible
- ✅ "Admin" or "Tournament Admin" badge on your profile
- ✅ No "Access Denied" messages

**If you don't see Tournaments:**
- Contact your system administrator
- Request "Tournament Admin" role
- Check your organization assignment

---

## Step 2: Navigate to Tournament Super Hub

### 2.1 Open Tournaments Page

**Action:** Click "Tournaments" in the main navigation menu

```
┌──────────────────────────────────────────────────────────┐
│  [Home]  [Tournaments]  [Teams]  [Players]  [Admin]     │
             ↑ CLICK HERE
└──────────────────────────────────────────────────────────┘
```

**Expected Screen: Tournament Super Hub**
```
┌────────────────────────────────────────────────────────────┐
│  🏆 TOURNAMENT SUPER HUB                                   │
│  Comprehensive Tournament Management                       │
│                                                            │
│  [+ Create Tournament]  [Filter: All ▼]  [Search...]     │
│                                                            │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ 🏆 Nairobi League│  │ 🏆 County Cup    │              │
│  │ 24 Teams         │  │ 16 Teams         │              │
│  │ Status: Active   │  │ Status: Upcoming │              │
│  │ [View Details]   │  │ [View Details]   │              │
│  └──────────────────┘  └──────────────────┘              │
│                                                            │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ 🏆 Youth League  │  │ 🏆 Summer Cup    │              │
│  │ 12 Teams         │  │ 8 Teams          │              │
│  │ Status: Planning │  │ Status: Planning │              │
│  │ [View Details]   │  │ [View Details]   │              │
│  └──────────────────┘  └──────────────────┘              │
└────────────────────────────────────────────────────────────┘
```

**What you see:**
- List of all tournaments (cards format)
- Tournament name and icon
- Number of registered teams
- Current status (Planning, Active, Completed)
- "View Details" button on each card

---

### 2.2 Select Your Tournament

**Action:** Click on the tournament card where you want to create fixtures

**Example:** Click on "Nairobi County League 2025"

```
┌──────────────────────────────────────────┐
│ 🏆 Nairobi County League 2025           │
│ 24 Teams • Football                      │
│ Status: Planning                         │
│ Start: Jan 15, 2025                      │
│ [View Details]  ← CLICK HERE            │
└──────────────────────────────────────────┘
```

**Expected Result:**
- Page scrolls down to show tournament details
- Tournament management tabs appear below
- Overview section shows tournament information

**Screen After Click:**
```
┌────────────────────────────────────────────────────────────┐
│  🏆 Nairobi County League 2025                             │
│  Football • 24 Teams • Planning Phase                      │
│                                                            │
│  📅 Jan 15 - Mar 30, 2025  |  📍 Nairobi County           │
│  Format: Round Robin (Home & Away)                         │
│                                                            │
│  ┌───────────────────────────────────────────────────┐   │
│  │ [Overview] [Structure] [Fixtures] [Standings] ... │   │
│  └───────────────────────────────────────────────────┘   │
│                                                            │
│  Tournament Structure Management:                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [Team Registrations] [Templates] [Automation] ... │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

# PART 2: TEAM APPROVAL (3-5 minutes)

## Step 3: Approve Team Registrations

### 3.1 Open Team Registrations Tab

**Action:** Click "Team Registrations" tab under "Tournament Structure Management"

```
┌────────────────────────────────────────────────────┐
│ [Team Registrations] [Templates] [Automation]     │
   ↑ CLICK HERE
└────────────────────────────────────────────────────┘
```

**Expected Screen: Team Registration Admin Panel**
```
┌────────────────────────────────────────────────────────────┐
│  TEAM REGISTRATIONS - Nairobi County League 2025          │
│  Manage team registrations for your tournament            │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Total    │ │ Pending  │ │ Approved │ │ Approval │   │
│  │ Teams    │ │ Review   │ │ Teams    │ │ Rate     │   │
│  │   24     │ │    5     │ │   18     │ │   75%    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                            │
│  [Status: All ▼]  [Search teams...]  [🔄 Refresh]        │
│                                                            │
│  [ ] Select All                                           │
│                                                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │ [✓] Westlands FC    | Submitted | 18 players |   │   │
│  │ [✓] Eastleigh Stars | Submitted | 20 players |   │   │
│  │ [✓] Kibra United    | Submitted | 16 players |   │   │
│  │ [ ] Dagoretti Utd   | Approved  | 22 players |   │   │
│  │ [ ] Kasarani FC     | Approved  | 19 players |   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                            │
│  [Bulk Actions ▼]  [Approve Selected]  [Reject Selected] │
└────────────────────────────────────────────────────────────┘
```

**What you see:**
- **Statistics Cards** at the top showing:
  - Total Teams (24)
  - Pending Review (5)
  - Approved Teams (18)
  - Approval Rate (75%)
- **Filter and Search Tools**
- **Registrations Table** with checkboxes
- **Action Buttons** at the bottom

---

### 3.2 Filter Pending Teams

**Action:** Click the "Status" filter dropdown and select "SUBMITTED"

```
[Status: All ▼]  ← Click here
     ↓
┌─────────────┐
│ All         │
│ SUBMITTED   │ ← Select this
│ APPROVED    │
│ REJECTED    │
│ WITHDRAWN   │
└─────────────┘
```

**Result:** Table now shows only teams with "SUBMITTED" status (pending approval)

```
┌──────────────────────────────────────────────────┐
│ Showing 5 teams with status: SUBMITTED          │
│                                                  │
│ [✓] Westlands FC    | Submitted | 18 players   │
│ [✓] Eastleigh Stars | Submitted | 20 players   │
│ [✓] Kibra United    | Submitted | 16 players   │
│ [✓] Lang'ata FC     | Submitted | 21 players   │
│ [✓] Makadara Utd    | Submitted | 17 players   │
└──────────────────────────────────────────────────┘
```

---

### 3.3 Review Team Details (Optional)

**Action:** Click the 👁 (Eye) icon or "..." (More) button to view team details

```
│ [✓] Westlands FC | Submitted | 18 players | [👁] [...] │
                                               ↑    ↑
                                            View  More
```

**Team Details Dialog:**
```
┌────────────────────────────────────────────────────┐
│  TEAM REGISTRATION DETAILS                         │
│  Complete information for Westlands FC             │
│                                                     │
│  Team Information:                                 │
│  • Team Name: Westlands FC                        │
│  • Club Name: Westlands Football Club             │
│  • Organization: Nairobi County FA                │
│                                                     │
│  Contact Information:                              │
│  • Email: contact@westlandsfc.com                 │
│  • Phone: +254 712 345 678                        │
│                                                     │
│  Geographic Location:                              │
│  • County: Nairobi                                │
│  • Sub-County: Westlands                          │
│  • Ward: Parklands/Highridge                      │
│                                                     │
│  Registration Details:                             │
│  • Status: Submitted                              │
│  • Squad Size: 18 players                         │
│  • Registration Date: Nov 10, 2025                │
│                                                     │
│  Jersey Colors:                                    │
│  • Primary: Blue and White stripes                │
│                                                     │
│  [Close]                                           │
└────────────────────────────────────────────────────┘
```

**What to check:**
- ✅ Squad size meets minimum (usually 15+ players)
- ✅ Contact information is valid
- ✅ Geographic location is set
- ✅ Jersey colors defined (avoid conflicts)

**Close the dialog** when done reviewing

---

### 3.4 Select Teams for Approval

**Option A: Select All Pending Teams**

**Action:** Click the "Select All" checkbox at the top

```
[✓] Select All  ← Click here
```

**Result:** All SUBMITTED teams are checked
```
┌──────────────────────────────────────────────────┐
│ [✓] Select All                                   │
│                                                  │
│ [✓] Westlands FC    | Submitted | 18 players   │
│ [✓] Eastleigh Stars | Submitted | 20 players   │
│ [✓] Kibra United    | Submitted | 16 players   │
│ [✓] Lang'ata FC     | Submitted | 21 players   │
│ [✓] Makadara Utd    | Submitted | 17 players   │
│                                                  │
│ 5 teams selected                                │
└──────────────────────────────────────────────────┘
```

---

**Option B: Select Individual Teams**

**Action:** Click checkbox next to each team you want to approve

```
[✓] Westlands FC    | Submitted | 18 players   ← Check
[✓] Eastleigh Stars | Submitted | 20 players   ← Check
[ ] Kibra United    | Submitted | 16 players   ← Don't check
[✓] Lang'ata FC     | Submitted | 21 players   ← Check
[ ] Makadara Utd    | Submitted | 17 players   ← Don't check

3 teams selected
```

---

### 3.5 Approve Selected Teams

**Action:** Click the green "Approve Selected" button

```
[Approve Selected]  [Reject Selected]
  ↑ CLICK HERE
```

**Approval Dialog Appears:**
```
┌────────────────────────────────────────────────────┐
│  APPROVE TEAM REGISTRATIONS                        │
│                                                     │
│  You are about to approve 5 team registration(s). │
│  These teams will be able to participate in        │
│  fixtures immediately.                             │
│                                                     │
│  Approval Notes (Optional):                        │
│  ┌────────────────────────────────────────────┐  │
│  │ All requirements met. Teams approved for   │  │
│  │ participation in Nairobi County League.    │  │
│  └────────────────────────────────────────────┘  │
│                                                     │
│  [Cancel]              [Approve 5 Teams]          │
│                              ↑ CLICK HERE          │
└────────────────────────────────────────────────────┘
```

**What to do:**
1. (Optional) Add approval notes in the text box
2. Click the green "Approve 5 Teams" button

**Processing:**
```
┌────────────────────────────────────────────┐
│  Approving teams...                        │
│  ████████████░░░░░░░░  60%                │
└────────────────────────────────────────────┘
```

**Success Message:**
```
┌────────────────────────────────────────────┐
│  ✅ Success                                │
│  Successfully approved 5 team              │
│  registrations                             │
└────────────────────────────────────────────┘
```

---

### 3.6 Verify Approval

**Action:** Change status filter to "APPROVED" to see all approved teams

```
[Status: APPROVED ▼]  ← Select this
```

**Expected Result:**
```
┌──────────────────────────────────────────────────┐
│ Showing 23 teams with status: APPROVED          │
│                                                  │
│ [ ] Westlands FC    | Approved | 18 players    │ ✅
│ [ ] Eastleigh Stars | Approved | 20 players    │ ✅
│ [ ] Kibra United    | Approved | 16 players    │ ✅
│ [ ] Lang'ata FC     | Approved | 21 players    │ ✅
│ [ ] Makadara Utd    | Approved | 17 players    │ ✅
│ [ ] Dagoretti Utd   | Approved | 22 players    │
│ [ ] Kasarani FC     | Approved | 19 players    │
│ ...and 16 more teams                            │
└──────────────────────────────────────────────────┘
```

**Statistics Update:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Total    │ │ Pending  │ │ Approved │ │ Approval │
│ Teams    │ │ Review   │ │ Teams    │ │ Rate     │
│   24     │ │    0     │ │   23     │ │   96%    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Verification Checklist:**
- ✅ All desired teams show "Approved" status
- ✅ Pending Review count is 0 (or expected number)
- ✅ Approved Teams count increased
- ✅ Green checkmark badges visible

---

# PART 3: FIXTURE GENERATION (5 minutes)

## Step 4: Generate Fixtures

### 4.1 Navigate to Fixtures Tab

**Action:** Click the "Fixtures" tab in the main tournament tabs

```
┌───────────────────────────────────────────────────┐
│ [Overview] [Structure] [Fixtures] [Standings]    │
                          ↑ CLICK HERE
└───────────────────────────────────────────────────┘
```

**Expected Screen: Fixtures Management**
```
┌────────────────────────────────────────────────────────┐
│  📅 FIXTURES - Nairobi County League 2025             │
│                                                        │
│  No fixtures generated yet                            │
│                                                        │
│  ┌──────────────────────────────────────────────┐   │
│  │  🎯 Ready to create fixtures?                │   │
│  │                                               │   │
│  │  23 teams are approved and ready             │   │
│  │  Format: Round Robin (Home & Away)           │   │
│  │                                               │   │
│  │     [📅 Generate Fixtures]                   │   │
│  │            ↑ CLICK HERE                      │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

**Alternative Location:**
You can also find "Generate Fixtures" button in:
- Tournament Structure Management section
- Quick Actions menu
- Jamii Fixtures tab

---

### 4.2 Open Generate Fixtures Dialog

**Action:** Click the "Generate Fixtures" button

**Generate Fixtures Dialog Opens:**
```
┌────────────────────────────────────────────────────┐
│  GENERATE FIXTURES                                 │
│  Configure fixture generation settings             │
│                                                     │
│  Start Date *                                      │
│  ┌────────────────────────────────────────────┐  │
│  │ [📅] 2025-01-15                            │  │
│  └────────────────────────────────────────────┘  │
│                                                     │
│  Kickoff Time                                      │
│  ┌────────────────────────────────────────────┐  │
│  │ [🕐] 13:00                                 │  │
│  └────────────────────────────────────────────┘  │
│                                                     │
│  Venue (Optional)                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ e.g., City Stadium                         │  │
│  └────────────────────────────────────────────┘  │
│                                                     │
│  Weekends Only           [ON]  ⚪──●            │
│  Home & Away             [ON]  ⚪──●            │
│                                                     │
│  [Cancel]                    [Generate]            │
└────────────────────────────────────────────────────┘
```

**Dialog is Scrollable** - If options don't fit, scroll down to see more

---

### 4.3 Configure Fixture Settings

**4.3.1 Set Start Date** (Required)

**Action:** Click the date input field

```
Start Date *
┌────────────────────────────────────────────┐
│ [📅] ___________                          │ ← Click here
└────────────────────────────────────────────┘
```

**Date Picker Appears:**
```
┌─────────────────────────────────┐
│    January 2025        < >      │
│  S  M  T  W  T  F  S           │
│           1  2  3  4  5        │
│  6  7  8  9 10 11 12           │
│ 13 14 [15]16 17 18 19          │ ← Click date
│ 20 21 22 23 24 25 26           │
│ 27 28 29 30 31                 │
└─────────────────────────────────┘
```

**What to do:**
1. Navigate to desired month using < > arrows
2. Click on the start date (e.g., 15th)
3. Date is populated: `2025-01-15`

**Tips:**
- Choose a date that gives teams preparation time
- Consider 2-3 weeks from current date
- Avoid dates during holidays/other tournaments

---

**4.3.2 Set Kickoff Time** (Default: 13:00)

**Action:** Click the time input field

```
Kickoff Time
┌────────────────────────────────────────────┐
│ [🕐] 13:00                                 │ ← Click here
└────────────────────────────────────────────┘
```

**Time Picker:**
- Click to open time selector
- Choose hours: 08:00 - 20:00
- Most common: 13:00 (1 PM) or 15:00 (3 PM)

**Recommendation:**
- **13:00** (1 PM) - Standard afternoon matches
- **15:00** (3 PM) - Late afternoon matches
- **10:00** (10 AM) - Morning matches
- **17:00** (5 PM) - Evening matches

**Leave as 13:00** for this guide

---

**4.3.3 Set Venue** (Optional)

**Action:** Type venue name if you want a default venue

```
Venue (Optional)
┌────────────────────────────────────────────┐
│ City Stadium, Nairobi                      │ ← Type here
└────────────────────────────────────────────┘
```

**Examples:**
- "City Stadium"
- "County Sports Ground"
- "Various Venues" (if multiple)
- Leave blank if venues will vary

**For this guide:** Leave blank or enter "Various Venues"

---

**4.3.4 Configure Weekends Only Toggle**

**Current State:** [ON] ⚪──●

**What it means:**
- **ON (●)** - Matches scheduled only on Saturdays and Sundays
- **OFF (○)** - Matches can be on any day of the week

**Recommendation:** Keep it **ON** unless you need midweek matches

**Action:** Leave as ON (default)

```
Weekends Only           [ON]  ⚪──●
                                  ↑ Already ON
```

---

**4.3.5 Configure Home & Away Toggle**

**Current State:** [ON] ⚪──●

**What it means:**
- **ON (●)** - Double round-robin (each team plays twice: home & away)
  - Formula: n(n-1) matches
  - Example: 23 teams = 506 matches
- **OFF (○)** - Single round-robin (each team plays once)
  - Formula: n(n-1)/2 matches
  - Example: 23 teams = 253 matches

**Recommendation:** 
- **ON** for full league seasons (more fair)
- **OFF** for shorter tournaments

**For this guide:** Keep it **ON**

```
Home & Away             [ON]  ⚪──●
                                  ↑ Already ON
```

---

### 4.4 Review Configuration Summary

**Before clicking Generate, verify:**

```
┌────────────────────────────────────────────┐
│ CONFIGURATION SUMMARY                      │
│                                            │
│ ✅ Start Date: January 15, 2025          │
│ ✅ Kickoff Time: 13:00 (1 PM)            │
│ ✅ Venue: Various Venues                  │
│ ✅ Weekends Only: YES                     │
│ ✅ Home & Away: YES (Double Round)       │
│                                            │
│ 23 approved teams                         │
│ Expected: ~506 matches                    │
│ Estimated duration: ~6 months             │
└────────────────────────────────────────────┘
```

**Checklist:**
- ✅ Start date is in the future
- ✅ Kickoff time is reasonable
- ✅ Weekends setting matches your needs
- ✅ Home & Away setting is correct
- ✅ All 23 teams are approved

---

### 4.5 Generate the Fixtures

**Action:** Click the green "Generate" button

```
[Cancel]                    [Generate]
                                ↑ CLICK HERE
```

**Processing Stage 1: Validation**
```
┌────────────────────────────────────────────┐
│  Validating configuration...               │
│  ████████████████████  100%               │
│  ✅ Configuration valid                   │
└────────────────────────────────────────────┘
```

**Processing Stage 2: Team Retrieval**
```
┌────────────────────────────────────────────┐
│  Fetching approved teams...                │
│  ████████████████████  100%               │
│  ✅ 23 teams retrieved                    │
└────────────────────────────────────────────┘
```

**Processing Stage 3: Fixture Generation**
```
┌────────────────────────────────────────────┐
│  Generating fixtures...                    │
│  ████████████░░░░░░░░  60%                │
│  • Creating match pairings                 │
│  • Applying geographic optimization        │
│  • Assigning dates and times               │
│  • Detecting conflicts                     │
└────────────────────────────────────────────┘
```

**Time:** Takes 2-5 seconds for 23 teams

---

**Success Message:**
```
┌────────────────────────────────────────────┐
│  ✅ Success                                │
│  Fixtures generated successfully           │
│                                            │
│  • 506 matches created                     │
│  • 44 rounds scheduled                     │
│  • 0 critical conflicts                    │
│  • Duration: Jan 15 - Jun 28, 2025        │
└────────────────────────────────────────────┘
```

**Dialog Closes Automatically**

---

# PART 4: REVIEW & VERIFICATION (3 minutes)

## Step 5: Review Generated Fixtures

### 5.1 View Fixtures List

**Expected Screen After Generation:**
```
┌────────────────────────────────────────────────────────┐
│  📅 FIXTURES - Nairobi County League 2025             │
│                                                        │
│  [Status: All ▼]  [Round: All ▼]  [Search...]        │
│  [Download PDF]  [Publish Fixtures]  [🔄 Refresh]    │
│                                                        │
│  ═══════════════════════════════════════════════════  │
│  ROUND 1 - January 15, 2025                           │
│  ═══════════════════════════════════════════════════  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🏟️ Match 1                                     │  │
│  │ Westlands FC  vs  Eastleigh Stars              │  │
│  │ 📅 Sat, Jan 15, 2025  🕐 13:00                │  │
│  │ 📍 Various Venues                              │  │
│  │ Status: [Scheduled]                            │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ 🏟️ Match 2                                     │  │
│  │ Kibra United  vs  Lang'ata FC                  │  │
│  │ 📅 Sat, Jan 15, 2025  🕐 13:00                │  │
│  │ 📍 Various Venues                              │  │
│  │ Status: [Scheduled]                            │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ...and 504 more matches                              │
│                                                        │
│  ═══════════════════════════════════════════════════  │
│  ROUND 2 - January 22, 2025                           │
│  ═══════════════════════════════════════════════════  │
│                                                        │
│  [Show more rounds...]                                │
└────────────────────────────────────────────────────────┘
```

**What you see:**
- Fixtures grouped by round
- Each match shows:
  - Home team vs Away team
  - Date and time
  - Venue
  - Status badge (Scheduled)
- Navigation between rounds

---

### 5.2 Filter by Round (Optional)

**Action:** Use round filter to view specific rounds

```
[Round: All ▼]  ← Click here
     ↓
┌─────────────┐
│ All         │
│ Round 1     │ ← Select to view only Round 1
│ Round 2     │
│ Round 3     │
│ ...         │
│ Round 44    │
└─────────────┘
```

**Result:** Shows only matches from selected round

---

### 5.3 Check for Conflicts (Important!)

**Action:** Scroll through fixtures looking for warning icons

**No Conflicts (Good):**
```
┌────────────────────────────────────────────────┐
│ Westlands FC  vs  Eastleigh Stars              │
│ ✅ No conflicts detected                       │
└────────────────────────────────────────────────┘
```

**Conflict Detected (Needs Review):**
```
┌────────────────────────────────────────────────┐
│ Westlands FC  vs  Kibra United                 │
│ ⚠️ REST PERIOD - Team playing within 3 days  │
│    Severity: MEDIUM                            │
└────────────────────────────────────────────────┘
```

**Conflict Types:**
- ⚠️ **REST_PERIOD** - Team playing too soon after last match
- ⚠️ **DOUBLE_BOOKING** - Same team at same time
- ⚠️ **TRAVEL_BURDEN** - Long travel distance
- ⚠️ **VENUE_CLASH** - Venue booked for multiple matches

**Severity Levels:**
- 🟢 **LOW** - Minor, can proceed
- 🟡 **MEDIUM** - Should review
- 🟠 **HIGH** - Should fix
- 🔴 **CRITICAL** - Must fix before publishing

**If you see conflicts:**
- LOW/MEDIUM: Acceptable, can proceed
- HIGH/CRITICAL: Need to adjust fixtures (manual editing)

---

### 5.4 Verify Match Distribution

**Action:** Check that matches are spread evenly

**What to check:**

**Round Distribution:**
```
Round 1: 11 matches ✅
Round 2: 11 matches ✅
Round 3: 11 matches ✅
...
Round 44: 11 or 12 matches ✅
```

**Date Distribution:**
```
Jan 15 (Sat): 11 matches ✅
Jan 22 (Sat): 11 matches ✅
Jan 29 (Sat): 11 matches ✅
Feb 05 (Sat): 11 matches ✅
...
```

**Good indicators:**
- ✅ Similar number of matches per round
- ✅ Consistent weekly schedule
- ✅ All teams appear in fixtures
- ✅ No team plays multiple matches same day

---

### 5.5 Sample Match Check

**Action:** Click on a match to view details (if clickable)

**Match Details View:**
```
┌────────────────────────────────────────────────┐
│  MATCH DETAILS                                 │
│                                                │
│  🏠 Home: Westlands FC                        │
│  🛫 Away: Eastleigh Stars                     │
│                                                │
│  📅 Date: Saturday, January 15, 2025         │
│  🕐 Kickoff: 13:00 (1:00 PM)                 │
│  📍 Venue: Various Venues                     │
│  🏟️ Round: 1 of 44                           │
│  📊 Status: Scheduled                         │
│                                                │
│  [Edit Match]  [Delete Match]  [Close]        │
└────────────────────────────────────────────────┘
```

**Verification:**
- ✅ Correct teams
- ✅ Reasonable date/time
- ✅ Status is "Scheduled"

---

# PART 5: PUBLISHING (2 minutes)

## Step 6: Publish Fixtures

### 6.1 Initiate Publishing

**Action:** Click the "Publish Fixtures" button

```
[Download PDF]  [Publish Fixtures]  [🔄 Refresh]
                      ↑ CLICK HERE
```

**Publish Fixtures Dialog:**
```
┌────────────────────────────────────────────────┐
│  PUBLISH FIXTURES                              │
│  Make fixtures available to teams and public   │
│                                                │
│  Publishing Channels:                          │
│                                                │
│  [✓] Website - Public fixture listing         │
│  [✓] PDF Export - Downloadable document       │
│  [✓] SMS Notifications - Send to teams        │
│  [✓] Email Alerts - Team contact emails       │
│  [ ] Social Media - Post announcement          │
│                                                │
│  Notification Message (Optional):              │
│  ┌──────────────────────────────────────────┐ │
│  │ Nairobi County League 2025 fixtures are  │ │
│  │ now available! Check your schedule and   │ │
│  │ prepare your team. Good luck!            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [Cancel]                  [Publish Now]      │
│                                  ↑ CLICK       │
└────────────────────────────────────────────────┘
```

---

### 6.2 Configure Publishing Options

**Default Channels (All Checked):**
- ✅ **Website** - Makes fixtures visible on public website
- ✅ **PDF Export** - Generates downloadable PDF
- ✅ **SMS Notifications** - Sends SMS to team contacts (2 per match)
- ✅ **Email Alerts** - Sends email to team managers

**Optional Channels:**
- ☐ **Social Media** - Posts announcement (if configured)

**Recommendation:** Keep all default channels checked

---

### 6.3 Add Notification Message (Optional)

**Action:** Type a message in the text box

**Good Examples:**
```
"Fixtures are ready! All matches scheduled for 
Saturdays at 13:00. Check your calendar and 
prepare your squad. See you on the pitch!"
```

```
"Nairobi County League 2025 fixtures now live!
Download the PDF for your complete schedule.
Good luck to all teams!"
```

**Keep it:**
- Short and clear
- Positive and motivating
- Include key info (when, where, how to access)

---

### 6.4 Publish the Fixtures

**Action:** Click the blue "Publish Now" button

```
[Cancel]                  [Publish Now]
                               ↑ CLICK HERE
```

**Publishing Process:**
```
┌────────────────────────────────────────────┐
│  Publishing fixtures...                    │
│                                            │
│  ✅ Website - Published successfully       │
│  ✅ PDF - Generated (512 KB)              │
│  ⏳ SMS - Sending to 46 contacts...       │
│  ⏳ Email - Sending to 23 teams...        │
└────────────────────────────────────────────┘
```

**Progress:**
- Each channel shows checkmark when complete
- SMS/Email show sending progress
- Takes 10-30 seconds depending on team count

---

**Success Message:**
```
┌────────────────────────────────────────────┐
│  ✅ Success                                │
│  Fixtures published successfully           │
│                                            │
│  Publication Results:                      │
│  • Website: Live                           │
│  • PDF: Available for download             │
│  • SMS: 46 messages sent                   │
│  • Email: 23 teams notified               │
│                                            │
│  Published at: Nov 15, 2025 10:45 AM      │
│                                            │
│  [View Public Page]  [Download PDF]  [OK] │
└────────────────────────────────────────────┘
```

**Dialog Closes** after clicking OK

---

# PART 6: POST-PUBLISHING (2 minutes)

## Step 7: Verify Publication

### 7.1 Check Website Publication

**Action:** Click "View Public Page" or navigate to public fixtures page

**Public Fixtures Page:**
```
┌────────────────────────────────────────────────────┐
│  🏆 Nairobi County League 2025 - Fixtures          │
│  Public View                                       │
│                                                    │
│  📅 Season: Jan 15 - Jun 28, 2025                 │
│  🏟️ Format: Round Robin (Home & Away)             │
│  👥 Teams: 23  |  📊 Matches: 506                 │
│                                                    │
│  [Download Full Schedule PDF]                     │
│                                                    │
│  ═══════════════════════════════════════════════  │
│  UPCOMING MATCHES                                  │
│  ═══════════════════════════════════════════════  │
│                                                    │
│  Round 1 - Sat, Jan 15, 2025                      │
│  • 13:00 - Westlands FC vs Eastleigh Stars       │
│  • 13:00 - Kibra United vs Lang'ata FC            │
│  • 13:00 - Makadara Utd vs Dagoretti Utd         │
│  ...                                              │
└────────────────────────────────────────────────────┘
```

**Verification:**
- ✅ Fixtures are visible publicly
- ✅ Download PDF button works
- ✅ Match information is accurate
- ✅ Dates and times display correctly

---

### 7.2 Test Team Portal Access

**Action:** Login as a team manager (or ask a team to confirm)

**Team Dashboard View:**
```
┌────────────────────────────────────────────────────┐
│  🏠 WESTLANDS FC - DASHBOARD                       │
│                                                    │
│  📅 UPCOMING MATCHES                               │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ NEXT MATCH                                   │ │
│  │ Westlands FC vs Eastleigh Stars              │ │
│  │ 📅 Sat, Jan 15, 2025 🕐 13:00               │ │
│  │ 📍 Various Venues                            │ │
│  │ [View Details]  [Add to Calendar]           │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  FULL SCHEDULE (23 matches)                       │
│  • Jan 15 vs Eastleigh Stars (H)                  │
│  • Jan 22 vs Kibra United (A)                     │
│  • Jan 29 vs Lang'ata FC (H)                      │
│  ...                                              │
│                                                    │
│  [Download Team Schedule PDF]                     │
└────────────────────────────────────────────────────┘
```

**Verification:**
- ✅ Team sees their specific matches
- ✅ Home/Away indicators correct
- ✅ Can download their schedule
- ✅ "Add to Calendar" option available

---

## Step 8: Download and Review PDF

### 8.1 Download PDF Document

**Action:** Click "Download PDF" button on Fixtures page

```
[Download PDF]  [Publish Fixtures]  [🔄 Refresh]
  ↑ CLICK HERE
```

**Browser Download:**
```
┌────────────────────────────────────────────┐
│  ⬇️ Downloading...                         │
│  jamii-fixtures-nairobi-league-2025.pdf    │
│  512 KB                                    │
└────────────────────────────────────────────┘
```

**File saves to:** Downloads folder

---

### 8.2 Review PDF Content

**Action:** Open the downloaded PDF file

**PDF Structure:**
```
┌─────────────────────────────────────────────────┐
│  🏆 JAMII TOURNEY                               │
│  Nairobi County League 2025                     │
│  COMPLETE FIXTURE LIST                          │
│                                                 │
│  Generated: November 15, 2025                   │
│  Season: January 15 - June 28, 2025            │
│  Format: Round Robin (Home & Away)              │
│  Teams: 23  |  Matches: 506                    │
│                                                 │
│  ─────────────────────────────────────────────  │
│  ROUND 1 - January 15, 2025                     │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Match 1                                        │
│  Westlands FC vs Eastleigh Stars                │
│  Kickoff: 13:00  |  Venue: Various Venues      │
│  Status: Scheduled                              │
│                                                 │
│  Match 2                                        │
│  Kibra United vs Lang'ata FC                    │
│  Kickoff: 13:00  |  Venue: Various Venues      │
│  Status: Scheduled                              │
│                                                 │
│  ...                                            │
│                                                 │
│  [Additional rounds on subsequent pages]        │
│                                                 │
│  ─────────────────────────────────────────────  │
│  Contact Information                            │
│  For inquiries: admin@jamiitourney.com         │
│  ─────────────────────────────────────────────  │
│                                Page 1 of 26     │
└─────────────────────────────────────────────────┘
```

**PDF Features:**
- ✅ Tournament branding and header
- ✅ Fixtures organized by round
- ✅ Match details (teams, date, time, venue)
- ✅ Status indicators
- ✅ Contact information footer
- ✅ Page numbers
- ✅ Professional formatting

**What to check:**
- ✅ All matches included
- ✅ Dates and times correct
- ✅ Team names spelled correctly
- ✅ No formatting errors
- ✅ Readable font and layout

---

### 8.3 Distribute PDF

**Action:** Share the PDF with stakeholders

**Distribution Methods:**

1. **Email to Teams**
   - Already sent automatically during publishing
   - Can resend manually if needed

2. **Website Upload**
   - Upload to tournament website
   - Make available in downloads section

3. **Social Media**
   - Post to Facebook/Twitter/Instagram
   - Caption: "Fixtures are out! Download the full schedule 📅⚽"

4. **Printed Copies** (Optional)
   - Print for team managers
   - Display at venues
   - Distribute at meetings

---

## Step 9: Notify Teams

### 9.1 Verify Notifications Sent

**Action:** Check notification status

**SMS Notifications:**
```
┌────────────────────────────────────────────┐
│  SMS DELIVERY REPORT                       │
│                                            │
│  Total Sent: 46 messages                   │
│  Delivered: 44 (96%)                       │
│  Failed: 2 (4%)                            │
│                                            │
│  Failed Recipients:                        │
│  • Westlands FC (Invalid number)          │
│  • Lang'ata FC (Network error)            │
└────────────────────────────────────────────┘
```

**Email Notifications:**
```
┌────────────────────────────────────────────┐
│  EMAIL DELIVERY REPORT                     │
│                                            │
│  Total Sent: 23 emails                     │
│  Delivered: 23 (100%)                      │
│  Opened: 18 (78%)                          │
│  Failed: 0                                 │
└────────────────────────────────────────────┘
```

**Action for Failed Notifications:**
- Update team contact information
- Resend manually
- Call teams directly to confirm

---

### 9.2 Follow-up Communication

**Recommended Actions:**

1. **WhatsApp Group Message**
   ```
   "📢 FIXTURE ALERT!
   
   Nairobi County League 2025 fixtures are now 
   live! 🎉
   
   ✅ Check your team portal for your schedule
   ✅ Download the PDF for full fixtures
   ✅ First matches: January 15, 2025
   
   All matches kick off at 13:00 on Saturdays.
   
   Prepare your teams! ⚽🏆"
   ```

2. **Team Managers Meeting** (Optional)
   - Schedule within 1 week
   - Review fixture schedule
   - Clarify venue assignments
   - Discuss any concerns

3. **Social Media Announcement**
   ```
   "🏆 BIG NEWS! 🏆
   
   Nairobi County League 2025 fixtures are OUT! 
   
   📅 506 matches across 44 rounds
   ⚽ 23 teams competing
   🗓️ Season: Jan 15 - Jun 28, 2025
   
   Download now: [link]
   
   #JamiiTourney #NairobiLeague #FootballFixtures"
   ```

---

# PART 7: ONGOING MANAGEMENT

## Step 10: Match Day Operations (Future)

### 10.1 Update Match Scores

**When matches are played:**

1. Navigate to Fixtures page
2. Click on completed match
3. Enter final score
4. Update match status to "COMPLETED"
5. Standings auto-calculate

**Example:**
```
┌────────────────────────────────────────────┐
│  MATCH UPDATE                              │
│  Westlands FC vs Eastleigh Stars           │
│                                            │
│  Final Score:                              │
│  Home: [2]  -  [1] :Away                  │
│                                            │
│  Status: [Completed ▼]                    │
│  Attendance: [___] (optional)             │
│                                            │
│  [Save]  [Cancel]                         │
└────────────────────────────────────────────┘
```

---

### 10.2 View Updated Standings

**Action:** Click "Standings" tab

**Standings Table:**
```
┌──────────────────────────────────────────────────────┐
│  📊 STANDINGS - Nairobi County League 2025          │
│                                                      │
│  Pos | Team           | P | W | D | L | Pts | Form │
│  ────┼────────────────┼───┼───┼───┼───┼─────┼──────│
│  1   | Westlands FC   | 1 | 1 | 0 | 0 | 3   | W    │
│  2   | Kibra United   | 0 | 0 | 0 | 0 | 0   | -    │
│  3   | Eastleigh Stars| 1 | 0 | 0 | 1 | 0   | L    │
│  ... | ...            |   |   |   |   |     |      │
└──────────────────────────────────────────────────────┘
```

**Auto-calculated after each match:**
- ✅ Points (Win: 3, Draw: 1, Loss: 0)
- ✅ Goal difference
- ✅ Form (last 5 matches: W/D/L)
- ✅ Position changes

---

## Troubleshooting Common Issues

### Issue 1: No Teams Approved

**Problem:** "Generate Fixtures" shows 0 teams

**Solution:**
1. Go back to Team Registrations tab
2. Approve teams (see Step 3)
3. Return to Fixtures tab
4. Try generating again

---

### Issue 2: Generation Failed

**Problem:** "Fixture generation failed" error message

**Possible Causes & Solutions:**

**A. Insufficient Teams**
- Error: "At least 2 teams required"
- Solution: Approve more teams

**B. Invalid Date Range**
- Error: "Start date must be in the future"
- Solution: Choose a future date

**C. Server Error**
- Error: "Server connection failed"
- Solution: Check internet connection, refresh page

**D. Browser Issue**
- Solution: Clear cache, try different browser

---

### Issue 3: Fixtures Not Visible

**Problem:** Teams can't see fixtures after publishing

**Checklist:**
1. ✅ Verify "Website" channel was checked during publishing
2. ✅ Check if teams are logged in to correct tournament
3. ✅ Refresh page (Ctrl+F5)
4. ✅ Check team permissions/access
5. ✅ Verify fixtures have status "SCHEDULED" not "DRAFT"

---

### Issue 4: PDF Download Not Working

**Problem:** PDF button doesn't download

**Solutions:**
1. Check browser popup blocker
2. Allow downloads from the site
3. Try right-click → "Save Link As"
4. Try different browser
5. Check server logs for errors

---

### Issue 5: SMS/Email Not Received

**Problem:** Teams didn't get notifications

**Checklist:**
1. ✅ Verify team contact information is correct
2. ✅ Check spam/junk folders
3. ✅ Verify SMS credits available
4. ✅ Check delivery report (Step 9.1)
5. ✅ Resend manually to failed recipients

---

### Issue 6: Too Many Conflicts

**Problem:** Many HIGH/CRITICAL conflicts detected

**Solutions:**

**A. Adjust Rest Period**
- Increase days between matches
- Requires regeneration with new settings

**B. Add More Dates**
- Extend tournament end date
- Spreads matches over longer period

**C. Use Midweek Matches**
- Turn OFF "Weekends Only"
- Allows Mon-Fri scheduling

**D. Manual Adjustments**
- Edit individual fixtures
- Swap match dates
- Reassign venues

---

## Quick Reference Card

### Essential Shortcuts

**Navigate to Fixtures:**
```
Home → Tournaments → [Select Tournament] → Fixtures Tab
```

**Generate Fixtures:**
```
Fixtures Tab → [Generate Fixtures] → Configure → [Generate]
```

**Approve Teams:**
```
Tournaments → [Select Tournament] → Team Registrations → 
Select Teams → [Approve Selected]
```

**Publish Fixtures:**
```
Fixtures Tab → [Publish Fixtures] → Select Channels → [Publish Now]
```

**Download PDF:**
```
Fixtures Tab → [Download PDF]
```

**View Standings:**
```
Tournaments → [Select Tournament] → Standings Tab
```

---

## Success Checklist

### After Completing This Guide, You Should Have:

- ✅ **23 approved teams** ready for fixtures
- ✅ **506 matches generated** and scheduled
- ✅ **0 critical conflicts** (or acceptable number)
- ✅ **Fixtures published** to website, PDF, SMS, email
- ✅ **Teams notified** via multiple channels
- ✅ **PDF downloaded** and distributed
- ✅ **Public page live** with fixtures
- ✅ **Team portals updated** with schedules
- ✅ **Standings table** ready for updates

---

## Next Steps

### Week Before Season Start:

1. **Confirm Venues**
   - Book all stadiums/grounds
   - Ensure availability on match days
   - Update venue information if needed

2. **Assign Match Officials**
   - Appoint referees for each match
   - Confirm their availability
   - Share fixture list with officials

3. **Team Preparation**
   - Remind teams of first match dates
   - Verify contact information
   - Confirm squad registrations

4. **Equipment Check**
   - Jerseys, balls, goals ready
   - First aid kits available
   - Scorekeeping materials prepared

### Day Before Each Match:

1. **Send Reminders**
   - SMS to both teams
   - Email with match details
   - WhatsApp group message

2. **Venue Confirmation**
   - Verify venue is available
   - Check pitch condition
   - Confirm kickoff time

3. **Officials Confirmed**
   - Referee assigned and confirmed
   - Assistant referees ready
   - Match commissioner (if applicable)

---

## Support & Help

### If You Need Assistance:

**Documentation:**
- JAMII_FIXTURE_MAKER_GUIDE.md (Complete technical guide)
- FIXTURE_MANAGEMENT_CAPABILITIES.md (System capabilities)
- HOW_TO_APPROVE_TEAMS.md (Team approval workflow)

**Technical Support:**
- Email: support@jamiitourney.com
- Phone: [Your support number]
- Live Chat: Available on website

**Community:**
- Forum: community.jamiitourney.com
- Facebook Group: Jamii Tourney Users
- YouTube: Jamii Tourney Tutorials

**Training:**
- Schedule a demo: [booking link]
- Watch video tutorials: [YouTube link]
- Join webinar: [registration link]

---

## Congratulations! 🎉

You've successfully created and published fixtures for your tournament!

**What you accomplished:**
- ✅ Approved 23 teams for competition
- ✅ Generated 506 professional fixtures
- ✅ Scheduled across 44 rounds over 6 months
- ✅ Published to multiple channels
- ✅ Notified all teams via SMS and email
- ✅ Created downloadable PDF schedule
- ✅ Made fixtures publicly accessible

**Your tournament is now ready to begin!** ⚽🏆

---

**Document Version:** 1.0  
**Last Updated:** November 15, 2025  
**Total Steps:** 10 major steps, ~50 sub-steps  
**Estimated Time:** 15-20 minutes  
**Difficulty:** ★☆☆☆☆ Beginner-Friendly

**Author:** Jamii Tourney Development Team  
**Contact:** support@jamiitourney.com
