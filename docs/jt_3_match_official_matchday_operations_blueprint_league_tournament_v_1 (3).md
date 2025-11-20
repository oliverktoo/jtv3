# JT3 — Match Official & Matchday Operations Blueprint (League/Tournament)

**Date:** 27 Oct 2025 (EAT)  
**Version:** v1  
**Audience:** Product, UX, Engineering, Competition Ops, Referees  
**Policy Note:** Player residency/address is **never** a gate. Player eligibility = identity, age/DOB, medical, consents, sanctions/discipline; verified via digital card (QR) with offline cache.

---

## 1) Purpose & North Star
Provide a single **Match Official Console** and a **Matchday Ops Desk** that let referees and organizers run fixtures cleanly, even at low-connectivity grounds. Focus: fast, auditable workflows aligned to **FIFA Laws of the Game** and local competition rules, with tamper‑resistant records.

**Outcomes:** Correct lineups, eligible participants on the pitch, accurate live events, disciplined reporting, and instant sync to standings, sanctions, and payouts.

---

## 2) Personas & Permissions
- **Referee (R):** Owns the match; accepts assignment; runs chrono & events; files reports.  
- **Assistant Referees (AR1/AR2):** Support events (confirmations), offside/goal validations; can propose events for R to confirm.  
- **Fourth Official (4O):** Manages substitutions board, technical areas, late kit checks.  
- **Match Commissioner (MC):** Pre‑match compliance (venue/kit/officials); post‑match validations; can lock match.  
- **Assessor (RA):** Grades officials; notes development items.  
- **Timekeeper/Announcer (optional):** Stadium time + PA notes.  
- **Venue Manager/Marshal:** Safety, seating, access, incident logs.  
- **Team Manager/Coach:** Submit lineup, confirm results, sign team sheet.  
- **Registrar/Organizer Staff:** Read + decision tools; discipline queue; dispute resolution.  
- **Public:** Read‑only post‑match results and sanctioned events; **no PII**.

> **Security:** Strict RBAC + RLS. All edits are **versioned**; digital signatures for R, MC, and team captains/managers.

---

## 3) Non‑Functional Goals
- **Offline‑first:** full pre‑match and live logging with queued sync; offline player‑card verification cache.  
- **Speed:** one‑tap event buttons; undo within 10 seconds; <200ms event latency locally.  
- **Reliability:** idempotent sync; conflict resolution for multi‑official edits.  
- **Auditability:** immutable event timeline; photo evidence attachments; GPS/time stamps (optional).  
- **Accessibility:** dark mode, large controls, glove‑friendly buttons for rain.  
- **Privacy:** minimum PII; medical notes not exposed beyond need‑to‑know.

---

## 4) Information Architecture

### 4.1 Match Assignments Dashboard (Officials)
- Today’s fixtures; status chips: **Awaiting Accept • Accepted • Check‑in • Live • Final • Locked**.  
- Accept/Decline with reason; replacement request.  
- Travel/venue notes; contact buttons (MC, Venue Manager).

### 4.2 Pre‑Match (MC & R)
- **Venue Inspection:** pitch, nets, corner flags, technical areas, changing rooms, emergency access; photo checklist; pass/fail with notes.  
- **Equipment:** match balls (IDs/pressure), substitution board, comms checks.  
- **Kit/Color Check:** home/away kits; clash detection; bibs.  
- **Officials’ Eligibility:** badges, expiry, last match rest days.  
- **Player Check‑in:** teams submit lineup → officials **scan QR** on digital player cards; offline cache; invalids flagged: expired medical, missing consent, suspension hit.  
- **Team Sheet Generation:** XI + bench, captain, jersey numbers; print/export.  
- **Coin Toss Record:** winner/choice; direction.  
- **Kickoff Authorization:** lock pre‑match; move to **Live**.

### 4.3 Match Control (Live)
- **Chrono:** Start/Stop; added time per half; weather/stoppage reasons.  
- **Event Logger:** Goals (normal/OG/PK), Assists (optional), Cards (YC/2YC/RC with LOTG code), Substitutions (in/out + minute), Injuries, VAR/Checks (if used), Abandonment flags.  
- **Sub Console (4O):** queue subs; board control; auto‑log minute; verify player eligibility on entry.  
- **AR Inputs:** propose offside/goal validations; R confirms/rejects.

### 4.4 Half‑Time
- Notes (conditions, incidents); time corrections; medical notes (privacy‑scoped).  
- Lineup changes reviewed; quick kit compliance re‑check.

### 4.5 Post‑Match
- **Result Entry:** FT score; penalties if applicable; scorers list reconciliation.  
- **Referee Report:** incidents summary; misconduct reports per player/official; coach/bench behavior; crowd/safety issues.  
- **Signatures:** digital signatures from R, MC, both team captains/managers (fallback: photo of signed paper sheet).  
- **Assessor Sheet:** official ratings, coaching points.  
- **Evidence:** upload photos/videos (max sizes), e.g., damaged goalpost, crowd issue.  
- **Lock & Submit:** MC can lock match; discipline engine triggers.

### 4.6 Disciplinary & Admin
- Automatic **suspension generation** from RC/2YC per competition rules (configurable).  
- **Appeals/Protests:** file within rule window; attach evidence; pay fee if required.  
- **Forfeit/Walkover:** W/O codes; 3‑0 default (configurable); reason taxonomy (no‑show, ineligible player, etc.).  
- **Abandonment/Postponement:** reason, minute, reschedule workflow; partial stats handling.

### 4.7 Communications
- Broadcast fixture changes, delays, weather alerts to teams/officials.  
- Automated alerts: assignment changes, sanctions issued, report submitted/returned.

---

## 5) Key Workflows

### A) Official Assignment
1. MC assigns R, AR1, AR2, 4O; notifications sent.  
2. Official **Accept/Decline**; MC reassigns if declined.  
3. Pre‑match checklist opens 90 minutes before kickoff (configurable).

### B) Player Eligibility Check‑In
1. Team uploads lineup via Team Page; arrives in **Pre‑Match**.  
2. Officials **scan digital cards** (QR → PID/TPID) → engine validates: identity, age band, medical, consents, sanctions.  
3. **Failures** show exact reason with fix options (manager upload, replace player).  
4. On completion, **Team Sheet** locked; copies to both teams.

### C) Live Event Logging
1. R starts Chrono; taps **Goal** → selects scorer (search quick list), minute auto‑filled.  
2. YC/RC picks reason code (LOTG taxonomy) + optional note; player selected via quick search/jersey number.  
3. 4O processes **Sub** → confirms in/out; system verifies entrant eligibility; logs event.  
4. All events recorded in timeline with official attribution; undo window (10s) then requires supervisor override.

### D) Incident & Abandonment
1. Incident button → pick type (crowd, weather, lighting, medical) → timestamp + notes + photos.  
2. If **Abandon**, record minute, score, reason; rulebook guidance shown; triggers reschedule/discipline workflow.

### E) Post‑Match Closure
1. R confirms FT score; enters report; attaches evidence.  
2. Captains/managers sign digitally; MC countersigns and **Locks** match.  
3. Standings, stats, and **discipline** update; suspensions issued automatically; notifications sent.

---

## 6) Data Model (Conceptual)
- **Match**: id, competition_id, round, venue, kickoff, status, weather.  
- **Assignments**: match_id, role (R/AR1/AR2/4O/MC/RA), user_id, accepted_at.  
- **Lineups**: match_id, team_id, XI[], bench[], captain, jersey map.  
- **EligibilityChecks**: tpid, result, reasons[], checked_at, checker_id.  
- **Events**: type (goal/og/pk/yc/2yc/rc/sub/injury/var/start/stop/ht/ft), minute, actor_tpid, assist_tpid, notes, by_official_id, evidence[].  
- **Reports**: referee_report, assessor_report, venue_report, signatures[].  
- **Incidents**: type, severity, minute, attachments, actions taken.  
- **Discipline**: offense, law_code, suspension_count, auto_applied, appeal_status.  
- **Forfeit/Abandonment**: code, minute, ruling, reschedule_ref.  
- **Audit**: who/when/what, previous_value, new_value.

> **Excluded:** residency/address anywhere in player data used here.

---

## 7) Permissions Matrix (Summary)
| Capability | R | AR | 4O | MC | RA | TM | Registrar |
|---|---:|---:|---:|---:|---:|---:|---:|
| Accept assignment | ✓ | ✓ | ✓ |  |  |  |  |
| Venue/kit inspection | ✓ |  | ✓ | ✓ |  |  |  |
| Scan players / lock team sheet | ✓ | ✓ | ✓ | ✓ |  |  |  |
| Start/stop chrono & log events | ✓ |  |  |  |  |  |  |
| Propose events |  | ✓ | ✓ |  |  |  |  |
| Manage subs |  |  | ✓ |  |  |  |  |
| Enter referee report | ✓ |  |  |  |  |  |  |
| Lock match |  |  |  | ✓ |  |  |  |
| File assessor grades |  |  |  |  | ✓ |  |  |
| Sign team sheet/result | ✓ |  |  | ✓ |  | ✓ |  |
| Discipline decisions/appeals |  |  |  |  |  |  | ✓ |

---

## 8) Printables & Assets
- **Team Sheet** (per team, with QR check marks).  
- **Fourth Official Sub Cards** (in/out, minute).  
- **Referee Report** (summary + misconduct).  
- **Misconduct Forms** (detailed offenses).  
- **Venue Inspection Checklist**.  
- **Abandonment/Postponement Report**.  
- PDF exports + A4 print‑ready styles.

---

## 9) Integrations
- **Eligibility Engine** (PID/TPID, medical, consents, sanctions).  
- **Standings & Stats** (auto‑update on lock).  
- **Discipline Registry** (auto suspensions; appeals).  
- **Scheduling** (reschedules; delays).  
- **Payments** (officials’ fees; attendance; per‑diem claim, optional).  
- **Comms** (SMS/Email/WhatsApp) for broadcasts & confirmations.

---

## 10) Analytics & KPIs
- Check‑in time per team; % eligibility failures (by reason).  
- Average delay to kickoff (venue vs. teams vs. officials).  
- Misconduct rate per 90; RC/YC distributions.  
- % matches locked within 60 minutes of FT.  
- Appeal rates and overturn %.

---

## 11) Rollout Plan
**Phase 1 (MVP, 2–3 weeks):** Assignments dashboard; Pre‑match (venue/kit, player scan, team sheet); Live chrono + goals/cards/subs; Post‑match result & referee report; Lock & sync.  
**Phase 2 (Ops+, 3–4 weeks):** Assessor sheet; incidents with evidence; abandonment/postponement; discipline auto‑suspensions; printables; offline enhancements.  
**Phase 3 (Pro, ongoing):** Appeals module; advanced stats; payments to officials; VAR/Review notes; multi‑match tournament control room.

---

## 12) Acceptance Criteria
- Officials can **scan and verify** 30 players per match in **<10 minutes** offline‑capable.  
- Live logging captures **100% of goals/cards/subs** with <=1% correction rate after lock.  
- **90% of matches** are **locked within 60 minutes** of FT; standings & suspensions updated automatically.  
- No residency/address fields exist anywhere in these flows.

---

## 13) Notification Templates (Examples)
- **Assignment:** “You’re assigned to {{match}} on {{date}} as {{role}}. Accept: {{link}}.”  
- **Eligibility Failure:** “{{player}} cannot be fielded: {{reason}}. Fix here: {{link}}.”  
- **Delay/Weather:** “{{match}} kickoff delayed {{minutes}} due to {{reason}}. New KO: {{time}}.”  
- **Sanction Issued:** “{{player}} suspended {{n}} match(es) for {{offense}}. Details: {{link}}.”

---

## 14) Wireframe Outlines (Text)
- **Official Assignment Dashboard:** list with status chips; accept/decline; today/tomorrow tabs.  
- **Pre‑Match Checklist:** progress steps; venue photos; kit color blocks; ball IDs.  
- **Check‑In Scanner:** big QR button; rolling list of verified players; red badges for fails.  
- **Live Console:** large Start/Stop; event tiles (Goal, YC, RC, Sub, Injury); timeline feed; undo snackbar.  
- **Post‑Match:** score inputs; scorers; misconduct detail fields; signature pads; lock button.  
- **Discipline Queue (Organizer):** new sanctions, appeals, decisions with filters.

---

## 15) Glossary
- **MC:** Match Commissioner.  
- **4O:** Fourth Official.  
- **LOTG:** Laws of the Game.  
- **W/O:** Walkover/Forfeit.  
- **PID/TPID:** Global/Tournament player identifiers used for eligibility.

---

## 16) Change Log
- **v1 (27 Oct 2025):** Initial blueprint created; residency explicitly excluded from any gating or checks.

---

## 17) Wireframe Sketches (ASCII)

### 17.1 Official Console — Assignments Dashboard
```
┌──────────────────────────────────────────────────────────────────────┐
│  Assignments  [Today] [Upcoming] [Past]      🔍 Search  Filter ⌄     │
├────Time────┬────────Fixture────────┬──Role──┬──Status──┬──Actions───┤
│ 14:30      │ ABC FC vs DEF FC      │  Ref   │ Awaiting │ Accept  ☐  │
│            │ League R5 – Pitch 1   │        │  Accept  │ Decline ☐  │
│ 16:45      │ GHI FC vs JKL FC      │  AR1   │ Accepted │ Check‑in ▶ │
└────────────┴───────────────────────┴────────┴──────────┴────────────┘
```

### 17.2 Pre‑Match Checklist (MC & R)
```
┌────────Steps────────┐  ┌────────────────────────Main Panel────────────────────────┐  ┌──Context──┐
│ ✓ Venue             │  │ Venue Inspection  [ ] Pass  [ ] Fail   Add photo ⊕      │  │ Contacts │
│ ✓ Equipment         │  │ • Nets ✓ • Corner Flags ✓ • Tech Areas ✓                │  │  MC ☎    │
│ ✓ Kit Check         │  │ Kit Check:  Home 🔵  Away ⚪  Clash: No                   │  │  Venue ☎ │
│ ▶ Player Check‑in   │  │ Balls: IDs #A12, #A13  Pressure: 0.8 bar ✓              │  │ Weather  │
│   Team Sheet        │  └──────────────────────────────────────────────────────────┘  └──────────┘
```

### 17.3 Player Check‑in Scanner
```
┌───────────────Scan Card (QR)───────────────┐   ┌────Verified────┐   ┌──Flagged──┐
│  ▣  ▣  ▣  Camera Viewfinder                │   │  #7  PASS ✓    │   │ #14 BLOCK │
│  Align QR within frame                     │   │  #10 PASS ✓    │   │  Reason:  │
│  • Offline cache active  • 21/30 verified  │   │  #3  PASS ✓    │   │  Medical  │
│                                            │   └───────────────┘   │  expired   │
│  [ Manual search ]  [ Replace player ]     │                        │  Upload →  │
└────────────────────────────────────────────┘                        └───────────┘
```

### 17.4 Live Match Console
```
┌───────────── ABC FC 0–0 DEF FC ─────────────┐
│  ⏱ 12:34  1st Half      +00:00 added         │
├─────────────────────Controls─────────────────┤
│ [ Goal ] [ YC ] [ RC ] [ Sub ] [ Injury ]    │  [ Start/Stop ]  [ Add Time ]
├─────────────────────Timeline─────────────────┤
│ 09'  YC  #6 DEF  (Reckless)  — R             │
│ 05'  Kickoff                                 │
└─────────────────────Sub Queue (4O)───────────┘
   In  #11  Out #7   Team: ABC   Ready ▶   Verified ✓
```

### 17.5 Post‑Match Closure
```
┌──────────────Result & Reports───────────────┐
│ FT Score:  ABC 1 — 0 DEF   (Pens: ☐)        │
│ Scorers:  67' #9 ABC                          │
│ Misconduct:  YC x3, RC x0                    │
│ Referee Report  [ Open editor ]              │
│ Signatures:  R  ☐   MC  ☐   ABC  ☐   DEF  ☐  │
│ [ Lock & Submit ]                            │
└──────────────────────────────────────────────┘
```

### 17.6 Matchday Ops Desk (Organizer Control Room)
```
┌───────────── Control Room ─────────────┐    ┌──── Broadcast ────┐
│ Fixtures (Today)  🔁 Refresh           │    │ Message: …        │
│ • 14:30  ABC–DEF   Status: Live        │    │ To: Teams+Officials│
│ • 16:45  GHI–JKL   Status: Check‑in    │    │ [Send]             │
├──────── Discipline Queue ──────────────┤    └────────────────────┘
│ • RC — #4 GHI — Pending Review         │
│ • 2YC — #12 ABC — Auto‑susp 1 match    │
└────────────────────────────────────────┘
```

---

## 18) Printable Assets (One‑click)
- Team Sheet (per team, A4)
- Fourth Official Sub Cards
- Referee Report & Misconduct Forms
- Venue Inspection Checklist
- Abandonment/Postponement Report

---

---

## 18) Wireframe Sketches (ASCII)

### 18.1 Overview (Home)
```
┌────────────────── Team: ABC United ──────────────────┐   ┌─ Quick Actions ─┐
│ Roster  24  | Approved 18 | Pending 4 | Flagged 2     │   │ Invite Players │
│ Compliance:  Missing Medical 2  •  Consent 1          │   │ Print TeamSheet│
│ Next Fixtures:  Sat 14:30 vs DEF  •  Wed 16:00 vs GHI │   │ Share Squad    │
│ Transfer Window:  Closes in 12 days                   │   └────────────────┘
│ Activity:  K. Otieno approved • Invite sent (J. Kibe) │
└───────────────────────────────────────────────────────┘
```

### 18.2 Roster (Grid + Drawer)
```
┌───────────── Filters: [All] [Approved] [Pending] [Flagged] ─────────────┐
│ #  Photo  Name            Pos  #  Status     Eligibility   Actions      │
│ 9  [◉]    Kiprotich, J.  FW   9  Approved   PASS ✓        ⋯            │
│ 4  [◉]    Achieng, L.    DF   4  Pending    BLOCK ✖ Med    Nudge ▸      │
│ 1  [◉]    Chebet, S.     GK   1  Approved   PASS ✓        ⋯            │
└──────────────────────────────────────────────────────────────────────────┘
   ▶ Click row → Drawer
   ┌──── Player Drawer: L. Achieng ────┐  Eligibility: BLOCK (Medical expired)
   │ Photo • PID • TPID • Docs (preview) │  Fix: Upload new medical (> 2025‑12‑01)
   │ Consents ✓ • Sanctions 0 • History  │  Actions: Request Doc • Remove • Replace
   └─────────────────────────────────────┘
```

### 18.3 Requests & Invites
```
┌────────── Incoming Join Requests ──────────┐   ┌───────── Outgoing Invites ─────────┐
│ J. Mwangi  (DF, 19)   Accept ▸  Decline ▸  │   │ O. Wekesa   Sent  Today   Resend ▸ │
│ P. Cherono (MF, 22)   View Profile ▸       │   │ T. Otieno   Sent  2d     Revoke ▸ │
└─────────────────────────────────────────────┘   └───────────────────────────────────┘
```

### 18.4 Transfers & Loans
```
┌──────────── Transfer Center ────────────┐
│ Propose Transfer  ▸  Create Loan  ▸     │
├──────────── Timeline ────────────┬──────┤
│ 2025‑10‑20  Proposal to DEF FC   │ PEND │
│ 2025‑10‑21  Origin Approved      │ ✓    │
│ 2025‑10‑22  Organizer Approved   │ ✓    │
│ 2025‑10‑22  Completed → Roster Upd.      │
└──────────────────────────────────────────┘
```

### 18.5 Fixtures & Matchday (Lineup Editor)
```
┌──────────── Fixtures ────────────┐   ┌──── Lineup (XI) ────┐   ┌── Bench ──┐
│ 27 Oct 14:30  vs DEF  Set Lineup │   │ GK  #1  Chebet     │   │ #12        │
│ 31 Oct 16:00  @ GHI              │   │ RB  #2  Kipkemei   │   │ #13        │
└──────────────────────────────────┘   │ CB  #4  Achieng ✖  │   │ #14        │
                                      │ …                   │   └───────────┘
                                      │ Captain: #8  Vice: #5          
                                      │ Jersey Clash: None              
                                      └ Print Team Sheet  ▸
```

### 18.6 Documents & Compliance
```
┌────────── Team Documents ──────────┐
│ Club Certificate   Valid ✓  (exp 2026‑03‑01)  View ▸   │
│ Coach Badge (CAF C) Expiring 30d   Upload ▸           │
│ Medic License       Missing ✖      Request ▸          │
└────────────────────────────────────┘
```

### 18.7 Staff & Roles
```
┌──────── Staff ────────┐
│ Manager:   J. Toro    │  Add Staff ▸
│ Coach:     P. Njoroge │  Assign Roles ▸
│ Medic:     S. Rono    │  Upload Credential ▸
└───────────────────────┘
```

### 18.8 Comms (Inbox)
```
┌──────── Templates ────────┐  ┌──────── Compose ─────────────┐  ┌── Delivery Log ─┐
│ Medical Expiring          │  │ To: All Pending (3)          │  │ Sent 14:03  ✓   │
│ Consent Missing           │  │ Msg: Please upload medical…  │  │ Opened 14:05 ✓ │
│ Fixture Update            │  │ [ Send ]    [ Schedule ]     │  │ Bounced 0      │
└───────────────────────────┘  └──────────────────────────────┘  └────────────────┘
```

### 18.9 Branding & Settings
```
┌──────── Branding ────────┐   ┌──── Settings ─────┐
│ Logo  ⊕  Colors ◼ ◻     │   │ Privacy: Public ⌄ │
│ Home Venue: Moi Annex    │   │ Notifs: SMS/Email │
│ Kits: Home 🔵  Away ⚪    │   │ Export Data  ▸    │
└──────────────────────────┘   └───────────────────┘
```

### 18.10 Analytics
```
┌──────── Compliance Funnel ───────┐  ┌──── Roster Health ────┐  ┌── Ops ────┐
│ Invited → Submitted → Approved    │  │ Medical Valid  86%   │  │ SLA <24h  │
│  20         18          16        │  │ Consents      94%    │  │ Bottleneck│
└───────────────────────────────────┘  └──────────────────────┘  └───────────┘
```

---

---

## 18) Wireframe Sketches (ASCII)

### 18.1 Overview (Home)
```
┌────────────────── Team: ABC United ──────────────────┐   ┌─ Quick Actions ─┐
│ Roster  24  | Approved 18 | Pending 4 | Flagged 2     │   │ Invite Players │
│ Compliance:  Missing Medical 2  •  Consent 1          │   │ Print TeamSheet│
│ Next Fixtures:  Sat 14:30 vs DEF  •  Wed 16:00 vs GHI │   │ Share Squad    │
│ Transfer Window:  Closes in 12 days                   │   └────────────────┘
│ Activity:  K. Otieno approved • Invite sent (J. Kibe) │
└───────────────────────────────────────────────────────┘
```

### 18.2 Roster (Grid + Drawer)
```
┌───────────── Filters: [All] [Approved] [Pending] [Flagged] ─────────────┐
│ #  Photo  Name            Pos  #  Status     Eligibility   Actions      │
│ 9  [◉]    Kiprotich, J.  FW   9  Approved   PASS ✓        ⋯            │
│ 4  [◉]    Achieng, L.    DF   4  Pending    BLOCK ✖ Med    Nudge ▸      │
│ 1  [◉]    Chebet, S.     GK   1  Approved   PASS ✓        ⋯            │
└──────────────────────────────────────────────────────────────────────────┘
   ▶ Click row → Drawer
   ┌──── Player Drawer: L. Achieng ────┐  Eligibility: BLOCK (Medical expired)
   │ Photo • PID • TPID • Docs (preview) │  Fix: Upload new medical (> 2025‑12‑01)
   │ Consents ✓ • Sanctions 0 • History  │  Actions: Request Doc • Remove • Replace
   └─────────────────────────────────────┘
```

### 18.3 Requests & Invites
```
┌────────── Incoming Join Requests ──────────┐   ┌───────── Outgoing Invites ─────────┐
│ J. Mwangi  (DF, 19)   Accept ▸  Decline ▸  │   │ O. Wekesa   Sent  Today   Resend ▸ │
│ P. Cherono (MF, 22)   View Profile ▸       │   │ T. Otieno   Sent  2d     Revoke ▸ │
└─────────────────────────────────────────────┘   └───────────────────────────────────┘
```

### 18.4 Transfers & Loans
```
┌──────────── Transfer Center ────────────┐
│ Propose Transfer  ▸  Create Loan  ▸     │
├──────────── Timeline ────────────┬──────┤
│ 2025‑10‑20  Proposal to DEF FC   │ PEND │
│ 2025‑10‑21  Origin Approved      │ ✓    │
│ 2025‑10‑22  Organizer Approved   │ ✓    │
│ 2025‑10‑22  Completed → Roster Upd.      │
└──────────────────────────────────────────┘
```

### 18.5 Fixtures & Matchday (Lineup Editor)
```
┌──────────── Fixtures ────────────┐   ┌──── Lineup (XI) ────┐   ┌── Bench ──┐
│ 27 Oct 14:30  vs DEF  Set Lineup │   │ GK  #1  Chebet     │   │ #12        │
│ 31 Oct 16:00  @ GHI              │   │ RB  #2  Kipkemei   │   │ #13        │
└──────────────────────────────────┘   │ CB  #4  Achieng ✖  │   │ #14        │
                                      │ …                   │   └───────────┘
                                      │ Captain: #8  Vice: #5          
                                      │ Jersey Clash: None              
                                      └ Print Team Sheet  ▸
```

### 18.6 Documents & Compliance
```
┌────────── Team Documents ──────────┐
│ Club Certificate   Valid ✓  (exp 2026‑03‑01)  View ▸   │
│ Coach Badge (CAF C) Expiring 30d   Upload ▸           │
│ Medic License       Missing ✖      Request ▸          │
└────────────────────────────────────┘
```

### 18.7 Staff & Roles
```
┌──────── Staff ────────┐
│ Manager:   J. Toro    │  Add Staff ▸
│ Coach:     P. Njoroge │  Assign Roles ▸
│ Medic:     S. Rono    │  Upload Credential ▸
└───────────────────────┘
```

### 18.8 Comms (Inbox)
```
┌──────── Templates ────────┐  ┌──────── Compose ─────────────┐  ┌── Delivery Log ─┐
│ Medical Expiring          │  │ To: All Pending (3)          │  │ Sent 14:03  ✓   │
│ Consent Missing           │  │ Msg: Please upload medical…  │  │ Opened 14:05 ✓ │
│ Fixture Update            │  │ [ Send ]    [ Schedule ]     │  │ Bounced 0      │
└───────────────────────────┘  └──────────────────────────────┘  └────────────────┘
```

### 18.9 Branding & Settings
```
┌──────── Branding ────────┐   ┌──── Settings ─────┐
│ Logo  ⊕  Colors ◼ ◻     │   │ Privacy: Public ⌄ │
│ Home Venue: Moi Annex    │   │ Notifs: SMS/Email │
│ Kits: Home 🔵  Away ⚪    │   │ Export Data  ▸    │
└──────────────────────────┘   └───────────────────┘
```

### 18.10 Analytics
```
┌──────── Compliance Funnel ───────┐  ┌──── Roster Health ────┐  ┌── Ops ────┐
│ Invited → Submitted → Approved    │  │ Medical Valid  86%   │  │ SLA <24h  │
│  20         18          16        │  │ Consents      94%    │  │ Bottleneck│
└───────────────────────────────────┘  └──────────────────────┘  └───────────┘
```

---

*End of document.*

