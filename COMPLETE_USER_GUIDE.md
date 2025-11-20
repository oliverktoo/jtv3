# Jamii Tourney v3 - Complete User Guide

## 🏆 Welcome to Jamii Tourney v3

Jamii Tourney v3 is Kenya's premier tournament management platform, designed to handle multi-model tournaments across counties, regions, and national levels. This guide explains how to use all the advanced features we've implemented.

---

## 📋 **1. Registration Review Queue Enhanced**

### **For Registrars and Tournament Administrators**

The Registration Review Queue is your central hub for managing player registrations efficiently.

#### **How to Access:**
1. Navigate to **Registrar Console** from the main menu
2. Click on the **"Review Queue"** tab

#### **Key Features & Usage:**

##### **📊 Dashboard Overview**
- **Quick Stats Cards:** See pending reviews, approvals today, issues, and total registered players at a glance
- **Priority Indicators:** Color-coded badges show registration urgency (Critical, High, Medium, Low)

##### **🔍 Smart Filtering & Search**
- **Search Bar:** Type player names, team names, or registration IDs for instant results
- **Status Filters:** Filter by Draft, Submitted, In Review, Approved, Rejected, Suspended
- **Priority Filters:** Show only Critical or High priority registrations
- **Document Filters:** Filter by document completion status
- **Date Range:** Filter registrations by submission date

##### **📋 Bulk Operations**
- **Select Multiple:** Use checkboxes to select multiple registrations
- **Bulk Approve:** Select registrations → Click "Bulk Approve" → Add optional notes → Confirm
- **Bulk Reject:** Select registrations → Click "Bulk Reject" → Enter rejection reason → Confirm  
- **Request Changes:** Select registrations → Click "Request Changes" → Specify required changes → Send

##### **📄 Individual Registration Review**
- **Detailed View:** Click on any registration to see full player details, documents, and history
- **Document Verification:** Check uploaded documents (ID, birth certificate, photo)
- **Notes System:** Add internal notes for tracking decisions
- **Status Updates:** Change status from dropdown and add reasons

##### **📊 Export & Reporting**
- **Excel Export:** Click "Export to Excel" to download registration data
- **Custom Filters:** Apply filters before export to get specific data subsets
- **Progress Tracking:** Monitor processing with real-time progress indicators

#### **Typical Workflow:**
1. **Morning Review:** Check dashboard for overnight registrations
2. **Priority First:** Filter by "Critical" and "High" priority items
3. **Document Check:** Verify all required documents are uploaded and valid
4. **Bulk Processing:** Select similar registrations for bulk approval
5. **Issue Resolution:** Handle rejected/incomplete registrations individually
6. **Daily Export:** Export approved registrations for tournament organizers

---

## 🔢 **2. Squad Number Management System**

### **For Team Managers and Tournament Organizers**

Efficiently manage jersey numbers across teams to avoid conflicts and ensure proper player identification.

#### **How to Access:**
1. Go to **Teams** page from main navigation
2. Select your **Organization** and **Tournament**
3. Click on **"Squad Numbers"** tab

#### **Key Features & Usage:**

##### **👕 Visual Number Grid**
- **Available Numbers:** Green squares show available jersey numbers
- **Assigned Numbers:** Blue squares show assigned numbers with player names
- **Reserved Numbers:** Yellow squares show reserved numbers (e.g., #1 for goalkeepers)
- **Conflict Indicators:** Red squares highlight number conflicts

##### **🎯 Auto-Assignment**
- **Smart Assignment:** Click "Auto-Assign All" to automatically assign numbers 1-25
- **Rule-Based:** Respects goalkeeper rules (#1 reserved) and player preferences
- **Conflict Resolution:** Automatically resolves conflicts by finding next available number

##### **✋ Manual Assignment**
- **Click-to-Assign:** Click any green number to assign it to selected player
- **Player Selection:** Use dropdown to select player, then click desired number
- **Instant Feedback:** See immediate confirmation when number is assigned

##### **⚠️ Conflict Detection**
- **Real-Time Validation:** System prevents duplicate number assignments
- **Visual Alerts:** Red highlighting shows conflicts immediately
- **Resolution Suggestions:** System suggests alternative numbers when conflicts occur

##### **📊 Team Overview**
- **Roster View:** See complete team roster with assigned numbers
- **Missing Numbers:** Quickly identify players without assigned numbers
- **Number History:** Track number changes and reassignments

##### **🏗️ Bulk Operations**
- **Team Assignment:** Assign numbers to entire teams at once
- **Number Swapping:** Swap numbers between players easily
- **Mass Updates:** Update multiple assignments simultaneously

#### **Typical Usage Scenarios:**

**New Tournament Setup:**
1. Select tournament and team
2. Click "Auto-Assign All" for quick setup
3. Review assignments and manually adjust preferred numbers
4. Resolve any conflicts using suggested alternatives

**Mid-Tournament Changes:**
1. View current assignments in number grid
2. Select player needing new number
3. Click available number to reassign
4. Confirm change and update team records

**Conflict Resolution:**
1. System highlights conflicts in red
2. Click on conflicted number to see details
3. Choose suggested alternative or manually select new number
4. Confirm resolution to clear conflict

---

## 🛡️ **3. Enhanced Eligibility Engine**

### **For Registrars and Compliance Officers**

Ensure all players meet tournament requirements through automated validation and manual overrides.

#### **How to Access:**
1. Navigate to **Registrar Console**
2. Click on **"Eligibility"** tab

#### **Key Features & Usage:**

##### **🤖 Automated Rule Engine**
The system checks 6 types of eligibility rules automatically:

**AGE Rules:**
- Minimum/maximum age requirements
- Birth date validation against tournament categories
- Age calculation on tournament start date

**GEOGRAPHY Rules:**
- Ward/constituency residency requirements
- County eligibility for inter-county tournaments
- Address verification against tournament boundaries

**DOCUMENT Rules:**
- Required document uploads (ID, birth certificate, passport photo)
- Document quality and validity checks
- Expiration date monitoring

**TOURNAMENT_SPECIFIC Rules:**
- Previous tournament participation history
- Suspension or ban status
- Registration deadline compliance

**CUSTOM Rules:**
- Organization-specific requirements
- Special tournament conditions
- Medical clearances or certifications

**LEAGUE Rules:**
- Team transfer windows
- Player loan agreements
- League-specific eligibility criteria

##### **📊 Eligibility Dashboard**
- **Overview Cards:** Total players, eligible count, violations, pending reviews
- **Status Breakdown:** Visual charts showing eligibility distribution
- **Priority Queue:** Players requiring immediate attention

##### **🔍 Player Validation View**
- **Search & Filter:** Find players by name, team, or eligibility status
- **Detailed Checks:** See all rule validations for each player
- **Violation Details:** Specific reasons for eligibility failures
- **Historical Tracking:** Previous eligibility decisions and changes

##### **✅ Override System**
- **Manual Overrides:** Registrars can override automatic decisions with proper justification
- **Approval Chain:** Multi-level approvals for sensitive overrides
- **Audit Trail:** Complete log of all override decisions and reasons
- **Temporary Eligibility:** Grant conditional eligibility pending document submission

##### **📋 Bulk Processing**
- **Mass Validation:** Run eligibility checks for entire teams or tournaments
- **Bulk Approvals:** Approve multiple eligible players simultaneously
- **Exception Handling:** Process multiple override requests together
- **Progress Tracking:** Monitor validation progress for large player sets

#### **Daily Workflow:**

**Morning Eligibility Review:**
1. Check overnight registrations for automatic violations
2. Review high-priority cases requiring immediate attention
3. Process override requests from previous day
4. Validate new document submissions

**Player Registration Process:**
1. Player submits registration → System runs automatic checks
2. If violations found → Player notified of requirements
3. Registrar reviews complex cases → Apply overrides if justified
4. Final approval → Player eligible for tournament participation

**Exception Handling:**
1. Player requests eligibility review → Case appears in override queue
2. Registrar reviews supporting documentation
3. Consult with tournament officials if needed
4. Grant override with detailed justification
5. Player receives eligibility confirmation

---

## 📊 **4. CSV Team Import System**

### **For Tournament Organizers and Data Managers**

Efficiently register multiple teams simultaneously using spreadsheet uploads.

#### **How to Access:**
1. Go to **Teams** page
2. Select your **Organization**
3. Click on **"CSV Import"** tab

#### **Key Features & Usage:**

##### **📥 Template System**
- **Download Template:** Click "Download Template" to get properly formatted CSV
- **Sample Data:** Template includes example teams with correct formatting
- **Required Columns:** Team name, coach details, contact info, venue, region
- **Optional Columns:** Division, founded year, description, additional contacts

##### **📋 File Upload Process**

**Step 1: Upload**
- Click "Select File" or drag-and-drop CSV file
- System validates file format and size
- Immediate feedback on file acceptance

**Step 2: Preview**
- See data preview with all teams to be imported
- Review team information for accuracy
- Navigate through large datasets easily

**Step 3: Validation**
- Automatic validation of all team data
- Error highlighting for missing required fields
- Duplicate detection across team names and emails
- Format validation for emails and phone numbers

**Step 4: Import**
- Review validation results and error summary
- Fix critical errors before proceeding
- Execute import with progress tracking
- Real-time status updates during processing

##### **⚠️ Error Handling**
- **Critical Errors:** Missing required fields, invalid formats, duplicates
- **Warnings:** Optional field issues, formatting recommendations
- **Error Details:** Specific row and column information for each issue
- **Bulk Fixes:** Suggestions for resolving common errors

##### **📊 Import Results**
- **Success Summary:** Count of successfully imported teams
- **Failure Report:** Detailed list of teams that couldn't be imported
- **Warning Log:** Non-critical issues that were resolved automatically
- **Next Steps:** Guidance on completing the import process

#### **Best Practices:**

**Preparing Your CSV:**
1. Download the template file first
2. Fill in team data following the example format
3. Ensure all required fields are completed
4. Use consistent formatting for phone numbers (+254XXXXXXXXX)
5. Double-check email addresses for validity

**Large Imports:**
1. Test with small batch first (5-10 teams)
2. Split large datasets into manageable chunks (50-100 teams)
3. Import during off-peak hours for better performance
4. Keep backup of original data before import

**Error Resolution:**
1. Fix critical errors before attempting import
2. Address warnings for data quality
3. Re-upload corrected file if needed
4. Contact support for persistent validation issues

---

## 👥 **5. Enhanced Team Profiles**

### **For Team Managers and Public Relations**

Create comprehensive, professional team profiles with rich media and detailed information.

#### **How to Access:**
1. Navigate to **Teams** page
2. Select organization and tournament
3. Click on **"Team Profiles"** tab
4. Choose team to manage

#### **Key Features & Usage:**

##### **🖼️ Visual Identity Management**
- **Logo Upload:** Click camera icon on team avatar to upload logo
- **Cover Photos:** Add hero images for team profile
- **Team Colors:** Set primary, secondary colors and kit combinations
- **Gallery Management:** Upload and organize team photos by category

##### **📝 Basic Information**
- **Team Names:** Full name and short name/nickname
- **Founded Year:** Establishment date for historical context
- **Description:** Rich text description of team history and mission
- **Location Details:** Home venue, address, capacity information

##### **📞 Contact Management**
- **Primary Contact:** Official email and phone numbers
- **Website:** Team or club website URL
- **Social Media:** Facebook, Twitter, Instagram, YouTube links
- **Postal Address:** Official mailing address

##### **👨‍💼 Management Structure**
- **Head Coach:** Name, contact details, certifications
- **Team Captain:** Current captain with player ID
- **Team Manager:** Administrative contact person
- **Certification Tracking:** Coach licenses and qualifications

##### **🏆 Achievement Tracking**
- **Tournament Wins:** Local, regional, national, international achievements
- **Historical Records:** Year-by-year accomplishment tracking
- **Award Levels:** Categorized by competition scope
- **Achievement Details:** Descriptions and significance

##### **📸 Media Gallery**
- **Photo Categories:** Match photos, training sessions, events, facilities
- **Upload Management:** Bulk photo uploads with descriptions
- **Organization:** Sort by event type and date
- **Public Display:** Control which photos appear publicly

#### **Profile Management Workflow:**

**Initial Setup:**
1. Click "Edit Profile" to enter edit mode
2. Upload team logo and set basic information
3. Add contact details and social media links
4. Configure team colors and kit information
5. Save changes to create basic profile

**Content Enhancement:**
1. Write compelling team description highlighting history and achievements
2. Upload gallery photos from recent matches and events
3. Add management team details with current roles
4. Input venue information with capacity and location
5. Document team achievements and awards

**Ongoing Maintenance:**
1. Regular updates to contact information
2. Add new achievements as they occur
3. Update management team changes (new coach, captain)
4. Refresh gallery with recent photos
5. Keep social media links current

**Public Presentation:**
1. Switch to view mode to see public-facing profile
2. Share profile link with fans and media
3. Use for tournament registration materials
4. Include in promotional materials and websites

---

## 🌐 **6. Public Tournament Portal Enhancement**

### **For Fans, Media, and General Public**

Experience tournaments like never before with live updates, comprehensive information, and engaging features.

#### **How to Access:**
- **Desktop:** Visit tournament website public pages
- **Mobile:** Use mobile-optimized tournament app interface
- **Direct Links:** Share tournament URLs on social media

#### **Key Features & Usage:**

##### **🏠 Tournament Discovery**
- **Hero Section:** Featured tournament with stunning visuals
- **Search & Filters:** Find tournaments by name, type, status, location
- **Tournament Cards:** Beautiful preview cards with key information
- **Status Indicators:** Live, upcoming, completed tournaments clearly marked

##### **📱 Mobile-First Experience**
- **Touch Navigation:** Swipe between live matches and tournaments
- **Live Streaming:** Watch matches directly in mobile browser
- **Push Notifications:** Opt-in for goal alerts and match updates
- **Offline Reading:** Cache tournament information for offline viewing

##### **⚡ Live Match Experience**

**Live Streaming:**
- Click "Watch Live" on featured matches
- Full-screen video with professional commentary
- Live viewer count and engagement metrics
- Multiple camera angles where available

**Real-Time Updates:**
- Live scores updated every few seconds
- Goal notifications with scorer information
- Match events timeline (goals, cards, substitutions)
- Live commentary feed

**Interactive Features:**
- Like and comment on matches
- Share exciting moments on social media
- Vote in fan polls during matches
- Join live chat with other supporters

##### **📊 Comprehensive Information**

**Tournament Overview:**
- Complete tournament information and format
- Prize pool breakdown and awards
- Participation statistics
- Tournament highlights and features

**Match Schedules:**
- Complete fixture list with dates and venues
- Filter by team, date, or competition stage
- Set personal match reminders
- Download schedule to calendar apps

**League Standings:**
- Real-time league table updates
- Team statistics and performance metrics
- Head-to-head records
- Qualification positions highlighted

**Player & Team Stats:**
- Top scorers and assist leaders
- Team performance analytics
- Historical statistics and records
- Player profiles with career information

##### **💬 Fan Engagement**

**Social Features:**
- Follow favorite teams and tournaments
- Like, share, and comment on updates
- Create and share highlight reels
- Join fan communities and discussions

**Notifications:**
- Subscribe to tournament updates
- Goal alerts for favorite teams
- Match start reminders
- Breaking news notifications

**Content Sharing:**
- Share tournament links with friends
- Create and share match highlights
- Post to social media platforms
- Download tournament materials

#### **Fan Experience Journey:**

**Discovering Tournaments:**
1. Browse featured tournaments on homepage
2. Use search to find local or favorite team tournaments
3. Filter by sport, location, or tournament type
4. Click tournament card to explore details

**Following Live Action:**
1. Subscribe to tournament for updates
2. Check live matches currently streaming
3. Watch live video or follow text updates
4. Engage through likes, comments, and shares

**Staying Informed:**
1. Check match schedules for upcoming games
2. Review league standings and team positions
3. Follow player statistics and achievements
4. Download match schedules to personal calendar

**Mobile Experience:**
1. Access mobile-optimized tournament pages
2. Enable push notifications for live updates
3. Use swipe navigation between match views
4. Share exciting moments instantly on social media

**Community Engagement:**
1. Join fan discussions and comments
2. Vote in match polls and predictions
3. Share favorite moments with friends
4. Follow tournament social media for extras

---

## 🎯 **Integration & Workflow**

### **How All Components Work Together**

The Jamii Tourney v3 system is designed with integrated workflows that connect all components seamlessly:

#### **Tournament Lifecycle:**
1. **Setup:** Use CSV Import to register teams quickly
2. **Management:** Enhanced Team Profiles create professional presence
3. **Operations:** Squad Numbers ensure proper player identification  
4. **Compliance:** Eligibility Engine validates all participants
5. **Registration:** Review Queue processes player applications efficiently
6. **Public Engagement:** Tournament Portal provides fan experience

#### **User Roles & Permissions:**
- **Tournament Organizers:** Access all administrative features
- **Registrars:** Focus on registration and eligibility management
- **Team Managers:** Manage profiles and squad numbers
- **Public Users:** Enjoy comprehensive tournament information and live updates

#### **Data Flow:**
- Teams imported via CSV → Enhanced with detailed profiles → Players registered and reviewed → Eligibility validated → Squad numbers assigned → Tournament goes live → Public portal provides engagement

This comprehensive system ensures that Jamii Tourney v3 supports the complete tournament management lifecycle while providing world-class experiences for all users, from administrators to passionate fans.

---

## 🏆 **Getting Started**

1. **For Tournament Organizers:** Start with CSV Team Import for bulk team registration
2. **For Registrars:** Begin with Registration Review Queue to process applications  
3. **For Team Managers:** Use Enhanced Team Profiles to build professional presence
4. **For Fans:** Explore Public Tournament Portal for live action and information

Each component includes helpful tooltips, progress indicators, and user guidance to ensure smooth operation for users of all technical levels.