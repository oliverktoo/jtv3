# JT3 — Admin Pages Blueprint (Organizer Console & System Admin)

**Date:** 27 Oct 2025 (EAT)  
**Version:** v1  
**Audience:** Competition Directors, Registrars, Discipline Committee, Finance, Media/Comms, Sponsors, System Admins  
**Policy Note:** Player **residency/address is never collected or used for eligibility**. Optional affinity tags (school/employer/academy) are non‑gating. All admin tooling must reflect this.

---

## 1) North Star & Scope
Provide a single, role‑aware **Admin Console** to create & run competitions, approve registrations (one‑click), schedule fixtures, assign officials, manage discipline & appeals, reconcile finances, publish news, and export analytics — **with strict auditability, privacy, and low‑ops overhead**.

**Outcomes:** Faster launches, clean eligibility, predictable matchdays, transparent discipline, accurate standings, and happy stakeholders.

---

## 2) Personas & Scopes (RBAC)
- **Competition Director (Organizer Admin):** Full control within an organizer/competition.  
- **Registrar:** Reviews/approves players; runs `approve_player_full`; manages queues.  
- **Discipline Committee:** Reviews incidents; issues/overturns sanctions.  
- **Match Ops Lead / Assignments Coordinator:** Fixtures, venues, referees.  
- **Finance Officer:** Fees, waivers, payouts to officials, reconciliation.  
- **Media/Comms Editor:** News, galleries, broadcasts to teams/officials.  
- **Sponsor Manager:** Placements, campaigns, reporting.  
- **Data Analyst:** Read/Export to BI; no PII beyond policy.  
- **System Admin (Platform):** Tenants, RBAC roles, SSO, webhooks, data retention.

> **Security:** Least‑privilege scopes; RLS for all data slices; every action is **versioned** and **audited**.

---

## 3) Non‑Functional Goals
- **Speed:** <2s page loads; bulk ops complete in batches with progress.  
- **Reliability:** Idempotent webhooks; resumable jobs; conflict‑safe merges.  
- **Offline‑aware:** Matchday critical flows degrade gracefully (cached rosters/cards).  
- **Privacy:** Kenya DPA aligned; data minimization; minors protected.  
- **Observability:** audit logs, metrics, alerts; exportable.

---

## 4) Global IA & Navigation
- **Left Nav:** Dashboard • Competitions • Registrations • Teams • Players • Fixtures • Venues • Officials • Discipline • Transfers • Comms • Finance • Tickets • Media • Sponsors • Analytics • Audit • Settings  
- **Top Bar:** Scope switcher (Organizer ⌄ / Competition ⌄ / Season ⌄), Global search (Players/Teams/Matches), Command palette (⌘K), Notifications.  
- **Context Drawer:** inline details & actions; never bounce unnecessarily.

---

## 5) Core Modules

### 5.1 Ops Dashboard
Cards: **Registration Health** (submitted/approved/blocked), **Top Failure Reasons** (fix tips), **Today’s Matches** (status), **Discipline Queue**, **Officials Coverage**, **Finance at a glance**, **Comms status**.

### 5.2 Competitions & Seasons
- Create/edit competition: name, dates, format (League/KO/Hybrid), stages, tie‑break rules, roster caps, lock dates, transfer windows.  
- Attach **Policy Pack** (eligibility rules) by category (U15/U17/Women/Open).  
- Clone past season; simulation (fixtures density, stadium capacity).

### 5.3 Eligibility Policy Packs (Residency‑free)
- Rule graph editor (AND/OR groups): **Identity, DOB band, Medical validity, Consents, Sanctions**.  
- Versioned policies with **effective dates**; backtest & **simulate** on sample roster.  
- Reason code catalog (human‑readable copy for players/managers).  
- **Residency rules absent** by default and not available to select.

### 5.4 Registrations & Approvals
- Smart queues: **Clean & Ready**, **Needs Fix**, **Duplicate Risk**, **Minor – Awaiting Guardian**.  
- **One‑click approvals**: `approve_player_full` in batch (auto validates all gates).  
- Templated **Request Changes**; SLA timers; escalation.  
- Audit pane: document versions, actions, who/when/why.

### 5.5 Teams & Clubs
- Directory with status (docs, staff credentials).  
- Bulk tools: invite codes, CSV import, manager changes.  
- Sanctions overview per team; historical participation.

### 5.6 Players Directory & Merge Center
- Search players (PID/TPID); eligibility status; sanctions.  
- **Duplicate triage**: similarity clusters (name+DOB+doc+face); **guided merge** with selfie challenge; irreversible log.

### 5.7 Fixtures Planner & Calendar
- League generator (round‑robin, double, custom); KO bracket builder; hybrid linking.  
- Constraints: venue availability, daylight, travel spacing, broadcast windows.  
- Bulk reschedule with ripple warnings; notifications to teams/officials.

### 5.8 Venues & Resources
- Venue profiles: pitch, capacity, amenities, accessibility, contacts.  
- Booking calendar; clash detection; pitch maintenance blocks; asset checklists.

### 5.9 Officials & Assignments
- Referee/AR/4O pools with credentials & rest‑day tracking.  
- Auto‑assignment (rule‑based) + manual override; accept/decline flow.  
- Attendance & rating logs; payout eligibility.

### 5.10 Matchday Control Room (Organizer)
- Live list of fixtures with status (Check‑in/Live/FT/Locked).  
- Incident feed; weather/delay broadcasts; lock oversight.  
- Quick links to **Referee Console** and **Discipline intake**.

### 5.11 Discipline & Appeals
- Intake from match reports; LOTG taxonomy; evidence upload.  
- Auto‑suspensions: RC/2YC → rules table; team notification.  
- Committee workflow: hearing, decision, sanction schedule; **appeals** with fees & documents.  
- Public summary (privacy‑safe) for transparency.

### 5.12 Transfers & Loans
- Requests & approvals (origin, destination, organizer).  
- Clearance letters; cool‑off periods; historical ledger per player/team.

### 5.13 Communications (Broadcast)
- Targeting: teams, officials, venues, competition/stage.  
- Channels: Email, SMS, WhatsApp (templated).  
- Schedule & throttle; delivery/open stats; audit.

### 5.14 Finance
- Registration fees (optional), waivers, voucher codes; **idempotent** receipts.  
- Reconciliation dashboard: paid/unpaid, refunds; export to CSV.  
- Officials’ payouts (per match/grade/role), attendance confirmation, payout file export.

### 5.15 Tickets (if enabled)
- Events, price tiers, capacities, seller links; gate QR instructions; sales summary.

### 5.16 Media/News CMS
- Articles, galleries, press releases; competition tagging; preview → publish flow.  
- Asset library with consent flags.

### 5.17 Sponsors & Placements
- Placement inventory (header, sidebar, match billboard); flight dates; frequency caps; UTM tracking.  
- Export sponsor reports.

### 5.18 Analytics & Reports
- Ops: approval SLAs, drop‑offs, duplicate rates, eligibility failures.  
- Competition: attendance, goals/cards per 90, match delays, officials coverage.  
- Finance: collection rates, payout status.  
- Exports: CSV/Parquet; webhook streams for BI.

### 5.19 Audit & Security
- Full audit log (actor, action, before/after).  
- Access reviews; role change history; data access traces (docs viewed).  
- Data retention & deletion workflows; legal hold.

### 5.20 Settings (Organizer & System)
- **Organizer:** roles, teams of staff, competition themes, locales (EN/Sw), notification templates.  
- **System:** tenants, SSO, API keys, webhooks, rate limits, backup/restore, data retention, PII redaction policies.

---

## 6) Key Flows (Step‑by‑Step)

### A) Create Competition (Wizard)
1. Basic info → 2. Format & stages → 3. Tie‑break & roster caps → 4. Transfer windows → 5. Attach **Policy Pack** → 6. Review & publish.

### B) Publish Policy Pack
1. New policy → choose category (e.g., U17 Women).  
2. Add rules: Identity ✓, DOB band (2008–2009), Medical valid ≥ 12 months, Consents ✓, Sanctions check ✓.  
3. Save as **v1** with start date; run **simulate** on sample roster; publish.

### C) One‑Click Approvals
1. Open **Clean & Ready** queue → Select all → **Approve** → TPIDs minted, cards activated.  
2. For **Needs Fix**, apply template (“Medical expired — upload by {{date}}”).

### D) Duplicate Merge
1. Open **Duplicates** → cluster view → pick a candidate → challenge selfie (OTP).  
2. Merge → keep PID A; attach B’s docs; log decision.

### E) Fixtures Generation
1. Select teams & dates → constraints (venues/daylight/broadcast) → **Generate**.  
2. Review conflicts; **Publish** → notify teams/officials.

### F) Officials Assignment
1. Filter pool (grade, rest days) → Auto‑assign → review → send assignments.  
2. Track accepts/declines → backfill if needed.

### G) Discipline Case
1. Intake from match report → offense type → evidence → provisional sanction.  
2. Hearing → decision → schedule suspension → notify teams → publish summary.

### H) Finance Reconciliation
1. View invoices/receipts → resolve discrepancies; issue refunds if needed.  
2. Export payout file for officials → mark paid.

---

## 7) Data Model (Conceptual, Admin)
- **Competitions, Seasons, Stages**  
- **PolicyPacks (versions), EligibilityResults**  
- **Approvals, Queues, ReasonCodes**  
- **DuplicateClusters, MergeDecisions**  
- **Fixtures, Venues, Assignments**  
- **Incidents, Reports, Sanctions, Appeals**  
- **Fees, Invoices, Receipts, Payouts**  
- **Articles, Assets, SponsorPlacements**  
- **AuditEvents, WebhookDeliveries**

> **Explicitly absent:** residency/address fields anywhere in policies or forms.

---

## 8) Guardrails & Compliance
- No residency gating; address fields not collected.  
- Minors: guardian flows, masked names on public by default.  
- Access to medical docs limited (Manager/Medic/Registrar/Discipline if needed).  
- Right‑to‑erasure honored with audit carve‑outs; retention schedules per competition.

---

## 9) Performance & Reliability
- Heavy ops (OCR, face match, reports) run async; progress UI.  
- **Idempotent** endpoints; exponential retries; dead‑letter queues.  
- Blue/green deploys; feature flags per competition.

---

## 10) Rollout Plan
**Phase 1 (MVP, 2–3 weeks):** Competitions, Policy Packs, Registrations (one‑click), Teams/Players directories, Fixtures basic, Officials assignments, Discipline basic, Audit log.  
**Phase 2 (Ops+, 3–4 weeks):** Merge Center, Finance (fees/payouts), Comms, Tickets, CMS, Sponsors, Analytics v1.  
**Phase 3 (Pro, ongoing):** Advanced planner constraints, appeals portal, BI streaming, SSO & webhook management, automated reports.

---

## 11) Acceptance Criteria
- Launch a new competition (with policies & fixtures) in **<60 minutes**.  
- Approve **≥75%** of clean registrations via one‑click with zero manual edits.  
- Generate and publish a full round of fixtures with **no venue clashes**.  
- **90%** of match reports locked within **60 minutes** of FT.  
- All sensitive actions appear in **audit** with who/when/what.

---

## 12) Wireframe Sketches (ASCII)

### 12.1 Admin Nav & Scope Switcher
```
┌ JT3 Admin ────────────────────────────────────────────────┐  Org: Uasin Gishu ⌄  Comp: Governor’s Cup 2025 ⌄
│ Dashboard │ Competitions │ Registrations │ Fixtures │ ... │  🔍 Search   ⌘K  Notifications ⦿           │
└───────────────────────────────────────────────────────────┘
```

### 12.2 Ops Dashboard
```
┌ Registration Health ────────────┐  ┌ Today’s Matches ───────────┐  ┌ Discipline ─────┐
│ Submitted 420  Approved 310     │  │ 14:30 ABC–DEF  Live ●      │  │ New: 3          │
│ Blocked 62  (Top: Medical, U18) │  │ 16:45 GHI–JKL  Check‑in ○  │  │ Appeals: 1      │
└─────────────────────────────────┘  └────────────────────────────┘  └──────────────────┘
```

### 12.3 Competition Editor
```
┌ New Competition Wizard ───────────────────────────────────────────────┐
│ Step 1: Basics  →  Step 2: Format  →  Step 3: Rules  →  Step 4: Dates │
│ Name: Governor’s Cup 2025   Format: League + Knockout                 │
│ Roster Cap: 25  Lock: Group KO‑1      Transfer Windows: Pre/Mid        │
│ Policy Pack: U17 Women v1   (Simulate ▸)                                │
└───────────────────────────────────────────────────────────────────────┘
```

### 12.4 Policy Pack Editor (Residency‑Free)
```
┌ Policy: U17 Women v1 ─────────────────────────────────────────┐
│ Rules: [ Identity ✓ ] [ DOB 2008–2009 ✓ ] [ Medical ≥12m ✓ ] │
│        [ Consents ✓ ] [ Sanctions ✓ ]                         │
│ Simulate ▸  Publish ▸  Version: v1 (starts 15 Sep 2025)       │
└────────────────────────────────────────────────────────────────┘
```

### 12.5 Registrar Queue
```
┌ Clean & Ready (189)  │ Needs Fix (42) │ Duplicates (8) ─────────────┐
│ # Photo  Name        DoB    Team     Reason / Next Step             │
│ 1 [◉]   Achieng, L  2006   ABC      — Clean                        │
│ 2 [◉]   Owino, J    2008   DEF      Medical expired → Request Doc  │
│ 3 [◉]   Cherono, P  2009   GHI      Duplicate risk → Review        │
│ [ Approve Selected ]  [ Request Changes ]  [ Open Drawer ]         │
└─────────────────────────────────────────────────────────────────────┘
```

### 12.6 Duplicate Merge Center
```
┌ Similarity Cluster #24 ──────────────────────────────────────┐
│ A: "L. Achieng" DoB 2006  Doc# X…  Selfie ✓                  │
│ B: "Linet A."  DoB 2006  Doc# X…  Selfie ✓                  │
│ Face match 0.93  Name 0.87  Doc# 1.0                         │
│ [ Challenge Selfie ]  [ Merge B → A ]  [ Dismiss ]           │
└──────────────────────────────────────────────────────────────┘
```

### 12.7 Fixtures Planner
```
┌ Planner ─ Week of 27 Oct ──────────────────────────────┐
│ Drag teams to slots; conflicts show in red             │
│ Sat 14:30  Pitch 1  ABC–DEF  ✓ Venue ✓ Officials       │
│ Wed 16:00  Pitch 2  GHI–JKL  ⚠ Referee gap            │
│ [ Auto‑Assign Officials ]  [ Publish ]                 │
└────────────────────────────────────────────────────────┘
```

### 12.8 Discipline Queue
```
┌ Discipline ─ Intake (New 3) ───────────────────────────┐
│ RC: #4 GHI (SFP)  Evidence: Photo/Video                │
│ Appeal: #8 DEF (2YC)  Fee paid ✓                       │
│ [ Open Case ]  [ Schedule Hearing ]  [ Issue Sanction ]│
└────────────────────────────────────────────────────────┘
```

### 12.9 Finance Reconciliation
```
┌ Registration Fees ────────────────┐  ┌ Officials Payouts ───────────┐
│ Paid 382  Unpaid 38  Refunds 6    │  │ Matches 32  Pending 28       │
│ [ Export CSV ]  [ Issue Refund ]  │  │ [ Generate Payout File ]     │
└───────────────────────────────────┘  └───────────────────────────────┘
```

### 12.10 CMS — Article Editor
```
┌ New Article ──────────────────────────┐
│ Title: …                               │  Competition: Governor’s Cup ⌄
│ Body (Markdown/Blocks)                 │  Gallery: ⊕
│ [ Preview ]   [ Publish ]              │  Author: Media Editor        
└────────────────────────────────────────┘
```

### 12.11 Settings (RBAC)
```
┌ Roles & Permissions ─────────────────────────────────────────┐
│ Registrar  ✓Approve ✓RequestChanges  ✗Finance  ✗Settings     │
│ Discipline ✓Cases ✓Sanctions  ✗Approvals                     │
│ Finance    ✓Reconcile ✓Payouts  ✗PolicyPacks                 │
│ System     ✓Tenants ✓SSO ✓Webhooks ✓Backups                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 13) Defaults & Toggles
| Area | Default | Toggle |
|---|---|---|
| Residency gating | **Off** | Not available in policy editor |
| Medical validity | Required (12m) | Per competition |
| Under‑18 guardian | Required | N/A |
| One‑click approval | On | Per queue threshold |
| Auto‑suspensions | On | Per rules table |
| Public player pages | Off (opt‑in) | Per player/guardian |
| Tickets module | Off | Organizer‑level |
| Sponsor placements | On | Placement inventory per competition |

---

## 14) Change Log
- **v1 (27 Oct 2025):** Initial admin console blueprint with wireframes; residency explicitly excluded from all policies and forms.

*End of document.*

