# JT3 — Team Page Blueprint (World‑Class Command Center)

**Date:** 26 Oct 2025 (EAT)  
**Version:** v1  
**Audience:** Product, UX, Engineering, Ops/Registrars  
**Policy Note:** *Residency/address is not collected or used for eligibility. No residency gating across all flows.*

---

## 1) Purpose & North Star
Create a single, mobile‑first **command center** for every team that:
- Maintains a **compliant roster** (identity, age/DOB, medical, consents, sanctions; **no residency checks**).
- Runs **day‑to‑day ops**: invites, join requests, transfers, fixtures, lineups, announcements.
- Manages **staff & roles**, branding, and approvals in one place.
- Surfaces **issues at a glance** and resolves them in one or two clicks.

**Outcomes:** Faster approvals, fewer admin loops, audit‑clean actions, happy managers.

---

## 2) Personas & RBAC
- **Team Manager (Owner):** Full control; invites; approvals; transfers; settings; payments (if enabled).
- **Coach:** Lineups, training/availability, match ops; limited roster edits.
- **Team Staff (Medic/Physio/Analyst):** Scoped write (injuries/medical uploads/notes).
- **Player:** View own profile, upload docs, accept invites, indicate availability.
- **Organizer/Registrar:** Read + decision overlay (approve / request changes); cannot alter team settings.
- **Public:** Read‑only (logo, roster list, fixtures/results); **no PII**.

> **Security:** Enforce least‑privilege with RLS; signed URLs for docs; full audit trail.

---

## 3) Non‑Functional Goals
- **Mobile‑first** UI; 3‑tap to common tasks.  
- **Accessibility:** WCAG‑conscious; large tap targets; high contrast.  
- **Offline‑aware:** queue invites/lineups; sync when online.  
- **Performance:** sub‑200ms nav, sub‑2s first contentful render on 3G.  
- **Privacy:** data minimization; medical only to Manager/Medic/Registrar; no residency fields.

---

## 4) Information Architecture (Tabs & Panels)

### 4.1 Overview (Home)
- **Roster status**: total / approved / pending / flagged (pill counters).  
- **Compliance cards**: Missing medical (x), Awaiting consent (y), Duplicate alerts (z).  
- **Next fixtures (3)** with quick actions: Set Lineup • Print Team Sheet • Share Squad List.  
- **Transfer window** status + deadlines.  
- **Activity feed** (last 10 actions; filterable).

### 4.2 Roster
- Table/grid: photo, name, position, jersey #, **Eligibility** (PASS/BLOCK + reason), status (Pending/Approved/Suspended/Loaned).  
- **Bulk actions**: invite, request docs, assign jersey numbers, export CSV/PDF.  
- **Player Drawer**: identity summary, docs previews, medical validity, consents, sanctions, recent matches.

### 4.3 Requests & Invites
- **Join Requests** (approve/decline with template reason).  
- **Outgoing Invites** (email/SMS/WhatsApp) → resend/revoke.  
- **Free‑Agent Offers** made/received; statuses.

### 4.4 Transfers & Loans
- Propose transfer/loan; track approvals (origin, destination, organizer).  
- Clearance docs; cool‑off periods; automatic roster update on completion.  
- Full **history** with timestamps.

### 4.5 Fixtures & Matchday
- Upcoming & past fixtures; **Set Lineup** (XI + bench), captain/vice, jersey clash check.  
- **Printables**: Match sheet, Substitution cards, Bench list.  
- Post‑match: result entry (if allowed), incidents/notes to organizer.

### 4.6 Availability & Training (optional)
- Availability polls per date; training calendar; attendance log; coaching notes.  
- Export to CSV.

### 4.7 Documents & Compliance
- Team‑level docs: club certificate, affiliation letters, coach/staff badges with expiry tracker.  
- **No residency** docs by policy.

### 4.8 Staff & Roles
- Add/remove staff; assign roles (Manager, Coach, Medic, Analyst).  
- Credential uploads + expiry; permissions matrix preview.

### 4.9 Comms (Inbox)
- Announcements to squad; 1‑to‑1 messages.  
- Templates: “Medical expiring”, “Consent missing”, “Fixture update”.  
- Delivery/open tracking; audit of comms.

### 4.10 Branding & Settings
- Team name, logo, colors; social links; home venue; kit designs.  
- Privacy controls; notification preferences; export; data deletion request (per audit policy).

### 4.11 Analytics
- **Compliance funnel**: invited → submitted → approved.  
- **Roster health**: medical valid %, consents complete %, sanctions count.  
- **Ops metrics**: approval time, bottlenecks by reason code.  
- **Free‑agent pipeline**: views → offers → signed.

---

## 5) Key Workflows

### A) Build a Compliant Roster Fast
1. Manager **Invites** players (paste list / CSV import).  
2. Players complete KYC (ID, selfie, medical, consents; **no residency**).  
3. Auto‑checks run → clean cases **auto‑approve**; others to **IN_REVIEW** with reasons.  
4. Manager assigns jersey # (clash detection), sets captain/vice.

### B) Join Request (Player‑Led)
1. Player requests to join; appears in **Requests**.  
2. Manager **Approve** → adds to roster (approval based on engine result).  
3. If **BLOCKED**: system shows fix path (e.g., “Medical expired — upload”).

### C) Transfer/Loan
1. Manager → **Transfers** → Propose transfer.  
2. Collect approvals (origin manager, destination, organizer).  
3. On complete: roster updates; TPID preserved for season history.

### D) Matchday
1. **Fixtures** → Set Lineup → assign XI, bench, captain.  
2. Print team sheet; after match submit result (if allowed); incidents log.

---

## 6) Eligibility & Compliance (Residency‑Free)
**Gates Enforced:** Identity (ID + selfie), Age/DOB band, Medical (valid‑through), Required consents, Sanctions/discipline, Duplicate risk.  
**Never enforced:** residency/address.  
**Artifacts on approval:** PID (global), TPID (per tournament), digital player card (QR), audit log.

---

## 7) Data Model (Conceptual, minimal)
- **Team**: id, name, logo, colors, venue, socials.  
- **Staff**: user_id, role, credentials (doc, expiry), contact.  
- **Roster**: player PID/TPID, position, jersey #, status, eligibility_result {pass|block, reasons[]}.  
- **Requests/Invites**: to/from, channel, status, timestamps.  
- **Transfers/Loans**: from_team, to_team, approvals[], documents, dates.  
- **Fixtures**: opponent, date/time, venue, status, lineup, result.  
- **Documents**: type, file_url (signed), issue/expiry, verified_by.  
- **Comms**: message_type, recipients[], delivery/open status.  
- **Analytics**: counters/timestamps; privacy‑safe aggregates.

> **Explicitly excluded:** residency/address fields in forms, models, and eligibility.

---

## 8) Permissions Matrix (summary)
| Capability | Manager | Coach | Medic | Player | Registrar | Public |
|---|---:|---:|---:|---:|---:|---:|
| View roster & eligibility badges | ✓ | ✓ | ✓ | ✓ (self) | ✓ | Partial |
| Invite / approve join | ✓ |  |  |  |  |  |
| Upload player docs (self) |  |  |  | ✓ |  |  |
| Upload medical (team) | ✓ |  | ✓ |  |  |  |
| Set lineup & print sheets | ✓ | ✓ |  |  |  |  |
| Propose transfers/loans | ✓ |  |  |  |  |  |
| Registrar decision overlay |  |  |  |  | ✓ |  |
| Edit branding/settings | ✓ |  |  |  |  |  |

---

## 9) Guardrails (Privacy, Integrity)
- **No residency** collection or checks.  
- PII minimization; medical visible only to Manager/Medic/Registrar.  
- Signed URLs; short‑lived tokens; access logged.  
- Duplicate risk badges; registrar final say on high‑risk cases.  
- Rate limits & anomaly alerts.

---

## 10) Organizer/Registrar Overlay
- Same layout with **Decision strip** on player drawer: Approve • Request Changes • Escalate.  
- **Bulk approve** for “Clean & Ready”.  
- Exports: roster sheet, eligibility report, sanctions matches, audit log.

---

## 11) Analytics & KPIs
- **Roster readiness:** ≥ 90% approved 7 days pre‑kickoff.  
- **Auto‑approve rate:** ≥ 70–75%.  
- **Approval speed:** median < 24h.  
- **Ops load:** < 5% need back‑and‑forth after one nudge.  
- **Matchday prep:** lineup set ≥ 12h before kickoff (≥ 95%).

---

## 12) Rollout Plan
**Phase 1 (MVP, 2–3 weeks):** Overview, Roster, Requests/Invites, Fixtures (list), Staff & Roles, Branding/Settings, basic Comms, eligibility badges.  
**Phase 2 (Ops+, 3–4 weeks):** Transfers/Loans, Matchday lineups & printables, Documents & Compliance with expiries, Analytics v1, Free‑Agent offers.  
**Phase 3 (Pro, ongoing):** Training/Availability, WhatsApp templates, advanced analytics, offline PWA, staff credential verification, discipline/stats integrations.

---

## 13) Acceptance Criteria
- From a blank team, a Manager can **invite 20 players**, get **≥75% auto‑approved**, assign jersey #, and **print a team sheet** in < 30 minutes.  
- Any blocked player shows **exact fix steps** and allows a **one‑click nudge**.  
- Transfers show a **traceable approval trail** and update the roster without manual edits.  
- **No residency** fields exist anywhere in the page or checks.

---

## 14) Wireframe Outlines (text)
- **Overview:** header (logo/name/actions), 4 cards (Roster Status, Compliance, Next Fixtures, Transfer Window), activity feed.  
- **Roster:** table/grid with quick filters; side drawer on row click; bulk bar appears when selecting >0 players.  
- **Requests & Invites:** two columns (incoming/outgoing) with status chips and batch actions.  
- **Transfers & Loans:** timeline of approvals; CTA to upload/preview clearance letter.  
- **Fixtures & Matchday:** list → lineup editor (drag‑and‑drop to XI/bench); print buttons fixed bottom bar.  
- **Comms:** templates on left; recipient picker center; preview/send on right with delivery log.

---

## 15) Notifications & Templates (examples)
- **Medical expiring (7 days):** “Hi {{first_name}}, your medical clearance for {{tournament_name}} expires on {{date}}. Please upload the new document: {{link}}.”  
- **Consent missing (minor):** “Guardian consent is required for {{player_name}}. Complete here: {{link}}.”  
- **Join approved:** “Welcome to {{team_name}}! Your roster spot is confirmed. Card: {{card_link}}.”

---

## 16) Glossary
- **PID:** Global Player ID across the platform.  
- **TPID:** Tournament‑specific Player ID.  
- **Eligibility Result:** PASS/BLOCK outcome + reasons from the engine.  
- **Registrar:** Organizer staff member with decision authority.

---

## 17) Change Log
- **v1 (26 Oct 2025):** Initial blueprint created; explicitly removes any residency capture/gating.  

*End of document.*

