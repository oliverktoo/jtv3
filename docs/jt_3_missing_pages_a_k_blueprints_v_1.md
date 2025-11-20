# JT3 — Missing Pages (A–K) Blueprints

**Date:** 27 Oct 2025 (EAT)  
**Version:** v1  
**Scope:** Design blueprints and quick wireframes for the gap pages **A–K** identified earlier.  
**Policy Note:** No residency/address collection or gating anywhere. Minors default to masked names on public pages. Kenya DPA‑aligned.

---

## A) Public / Fans

### A1. Ticket Checkout (Cart → Payment → Receipt)
**Goal:** Fast, trustworthy purchase on low data.  
**IA:** Cart → Purchaser → Payment → Confirm → Receipt.  
**Key Flows:** add tickets, enter buyer details, select payment (STK push / card), receive receipt + QR/PKPass.  
**Data:** order, line_items, purchaser, payment_intent, tickets.  
**Wireframe (Condensed)**
```
Cart: ABC–DEF  x2  KSh 400  [Checkout]
Purchaser: Name, Email/Phone
Pay: M‑Pesa ▢  Card ▢   [Pay]
Receipt: Order #, 2x QR  [Download] [Send SMS]
```
**Acceptance:** complete purchase ≤ 60s on 3G; idempotent retries; clear failure states.

### A2. My Tickets
**Goal:** Self‑serve access to past/upcoming tickets.  
**IA:** List → Ticket detail → Actions.  
**Key Flows:** resend SMS/email, download QR/PKPass, refund rules.  
**Wireframe**
```
My Tickets
• 27 Oct 14:30 ABC–DEF  [Open]
• 31 Oct 16:00 GHI–JKL  [Open]
Ticket: QR  [Download] [Resend]
```
**Acceptance:** ticket opens in ≤ 2s; download works offline once cached.

### A3. Gate Scanning (Public Info)
**Goal:** Educate fans on entry steps.  
**Content:** “Have QR + ID ready”, prohibited items, accessibility, FAQs.  
**Acceptance:** bounce rate < 35% on matchday.

### A4. Leaderboards / Season Stats
**Goal:** Top scorers, assists, clean sheets, cards.  
**IA:** Season → Category → Stat.  
**Wireframe**
```
Top Scorers
1. A. Kiprotich (ABC) — 12
2. L. Achieng (DEF) — 10
```
**Acceptance:** updates ≤ 2 min after match lock; filters by competition/gender.

### A5. Widgets/Embeds
**Goal:** Partners can embed fixtures/standings snippet.  
**IA:** Configurator → Script snippet.  
**Acceptance:** embed loads < 1s; CSP‑safe; responsive.

### A6. Historical Archive
**Goal:** Past seasons, champions, records.  
**Acceptance:** searchable by year/team; static cached.

---

## B) Players

### B1. Sanctions & Appeals (Player View)
**Goal:** Transparent discipline and self‑service appeal.  
**Flows:** view sanction → file appeal (fee optional) → track status.  
**Wireframe**
```
Sanctions
• 2YC — Susp 1 match — Next eligible: Nov 3   [Appeal]
```
**Acceptance:** appeal intake ≤ 3 min; audit trail complete.

### B2. Payments & Receipts
**Goal:** Show registration fees, invoices, refunds.  
**Acceptance:** reconcile to ledger; download receipt PDF.

### B3. Data Request Status
**Goal:** Track GDPR‑like requests (export/delete).  
**Acceptance:** timestamps + outcomes visible; SLA timers.

---

## C) Teams / Managers

### C1. CSV Import Wizard
**Goal:** Bulk add players/invites with validation report.  
**Flows:** upload CSV → validate → fix inline → import.  
**Wireframe**
```
Upload CSV  [Choose]
Validation:  18 OK  |  2 Errors (row 4: DOB format)
[Fix inline]  [Import]
```
**Acceptance:** 1k rows validated < 10s; no residency columns expected/accepted.

### C2. Team Billing (if fees)
**Goal:** Invoices, waivers, vouchers.  
**Acceptance:** zero‑dup receipts; export CSV.

### C3. Sponsor Assets (Team)
**Goal:** Upload logos, brand kit; request approvals.  
**Acceptance:** image constraints enforced; consent flags.

### C4. Training & Availability (Full)
**Goal:** Calendars, attendance analytics.  
**Acceptance:** export CSV; mobile‑first attendance capture.

---

## D) Officials

### D1. Availability & Block‑Out Calendar
**Goal:** Officials declare free/busy; organizer respects it.  
**Wireframe**
```
My Availability (Oct)
Mon ✔ Tue ✖ Wed ✔ Thu ✔ Fri ✖  [Add Block]
```
**Acceptance:** set block in ≤ 3 taps; conflicts surface in assignments.

### D2. Assignments History & Ratings
**Goal:** Performance log and assessor notes.  
**Acceptance:** searchable; exportable.

### D3. Payout Statements
**Goal:** Per‑match amounts, paid/unpaid.  
**Acceptance:** reconcile to finance payouts.

### D4. Education / LOTG
**Goal:** Resource center, quizzes, certifications.  
**Acceptance:** quiz completion tracked; certificates stored.

---

## E) Matchday / Venue Ops

### E1. Venue Manager Dashboard
**Goal:** Checklists, incidents, facility calendar.  
**Wireframe**
```
Today @ Moi Annex
• Pitch ✓  • Nets ✓  • PA ✓   Incidents: 0  [Report]
```
**Acceptance:** pre‑match checklist < 5 min; incident response flow available.

### E2. Medical/Incident Report Form
**Goal:** Structured intake beyond referee notes.  
**Acceptance:** mandatory fields + evidence; route to discipline/ops.

### E3. Equipment & Inventory
**Goal:** Track balls, boards, kits; maintenance.  
**Acceptance:** low‑stock alerts; assignment logs.

---

## F) Discipline

### F1. Appeals Portal (Clubs/Players)
**Goal:** Submit appeal + pay fee; track status.  
**Wireframe**
```
Appeal Case #…  Offense: RC (SFP)
Upload evidence ⊕   Fee: KSh 1,000  [Pay] [Submit]
```
**Acceptance:** acknowledgment in < 1 min; SLA timers visible.

### F2. Public Sanctions Registry (Privacy‑safe)
**Goal:** Transparency without PII for minors.  
**Acceptance:** minors masked; searchable by team/competition.

### F3. Case Tracker (Club View)
**Goal:** Follow hearings/decisions.  
**Acceptance:** notifications on updates; export summary.

---

## G) Admin / Organizer

### G1. Multi‑Tenant Billing & Subscription
**Goal:** Plans/quotas per organizer; invoices.  
**Acceptance:** overage alerts; proration supported.

### G2. Staff Directory & Access Reviews
**Goal:** Who has what; periodic attestations.  
**Acceptance:** all role changes audited; review tasks.

### G3. Integration Settings Hub
**Goal:** SSO, webhooks, stats/discipline providers.  
**Acceptance:** test hooks; rotate keys; rate limits.

### G4. Automated Reports Center
**Goal:** Schedule exports/digests.  
**Acceptance:** CSV/Parquet to email/drive; success/fail logs.

---

## H) Ticketing

### H1. Box Office (Walk‑up Sales)
**Goal:** Sell quickly at venue; print/SMS ticket.  
**Acceptance:** sub‑20s sale; offline queue allowed.

### H2. Gate Verifier App (Tickets)
**Goal:** Scan + entry logs; anti‑passback.  
**Acceptance:** 1 scan/sec sustained; offline cache; fraud flags.

### H3. Promotions & Promo Codes Manager
**Goal:** Campaigns, discounts, limits.  
**Acceptance:** usage caps; UTM analytics.

---

## I) Media / Comms

### I1. Asset Library + Consent Tracker
**Goal:** Rights and releases, esp. for minors.  
**Acceptance:** consent must exist before public use; expiries tracked.

### I2. Press & Accreditation Portal
**Goal:** Badge requests, media schedules, downloads.  
**Acceptance:** approvals lane; press list export.

---

## J) Help & Trust

### J1. Help Center / FAQ
**Goal:** Task‑based articles by role (Player/Manager/Official/Organizer).  
**Acceptance:** top 20 tasks covered; search finds answers < 3 queries.

### J2. Contact Support / Submit a Ticket
**Goal:** Support intake with routing.  
**Acceptance:** acknowledgment in < 1 min; SLA timers.

### J3. System Status Page
**Goal:** Uptime and incidents.  
**Acceptance:** historical log; subscribe notifications.

---

## K) Developers

### K1. API Docs / Developer Portal
**Goal:** Keys, examples, webhooks inspector.  
**Docs:** auth, rate limits, error codes; sample queries (players/teams/fixtures).  
**Acceptance:** quickstart < 10 min; live webhook tester.

---

## Rollout Priority (Launch‑blockers → Pro)
1) A1 Ticket Checkout, A2 My Tickets, D1 Availability Calendar, C1 CSV Import Wizard, F1 Appeals Portal, J1/J2 Help & Contact.  
2) H2 Gate Verifier, B1 Sanctions View, E2 Medical/Incident, G2 Access Reviews.  
3) A4 Leaderboards, A6 Archive, G3 Integrations, K1 Developer Portal, I2 Press, H3 Promotions.

---

*End of document.*

