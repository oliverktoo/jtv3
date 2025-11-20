# JT3 — Player Page Blueprint (World‑Class Player Hub)

**Date:** 27 Oct 2025 (EAT)  
**Version:** v1  
**Audience:** Product, UX, Engineering, Ops/Registrars  
**Policy Note:** *Residency/address is not collected and never gates eligibility. Optional affinity tags (school/employer/academy) are non‑gating.*

---

## 1) Purpose & North Star
Give every player a single, mobile‑first **hub** to:
- Complete and maintain a **compliant profile** (identity, medical, consents, sanctions — **no residency checks**).  
- Manage **team relationships** (join requests, invites, transfers/loans).  
- Access their **digital player card (QR)** and match participation.  
- Control **privacy, consents, and data** (download/delete requests) with full transparency.

**Outcomes:** Faster approvals, fewer back‑and‑forths, clear next steps, and trustworthy identity across tournaments.

---

## 2) Personas & Access
- **Player (Owner):** Full control of own profile, docs, consents, free‑agent toggle.  
- **Guardian (for minors):** Grants consent, uploads guardian ID; limited view of child’s data.  
- **Team Manager/Coach:** Read‑only of eligibility badges; can send invites/requests; cannot edit PII.  
- **Medic/Team Staff:** Read medical validity, add injury notes (if player allows, or via team context).  
- **Registrar/Organizer:** Decision overlay (approve / request changes), audit; cannot alter player’s private settings.  
- **Public/Scouts (optional):** Very limited profile card (name, photo, position) if player chooses **Public** mode.

> **Security:** RLS on PID; signed URLs for docs; consent‑scoped visibility for minors’ data.

---

## 3) Non‑Functional Goals
- **Mobile‑first:** 3–5 minute completion time for a clean case.  
- **Accessibility:** WCAG‑aware; large tap targets; high contrast; screen‑reader labels.  
- **Performance:** <2s FCP on 3G; resilient image uploads with compression.  
- **Offline‑aware:** Save/resume drafts; pending uploads queue.  
- **Privacy by design:** data minimization, purpose limitation, audit logs.

---

## 4) Information Architecture (Tabs & Panels)

### 4.1 Overview (Home)
- **Approval status** pill (PASS/BLOCK/PENDING) + exact next step (e.g., “Upload medical”).  
- **Checklist** with progress: Identity ✔︎ • Medical • Consents • Selfie • Team • (Fees if enabled).  
- **Digital player card** preview with QR + “Share / Add to Wallet / Print”.  
- **Team status:** current team(s), join/transfer requests, free‑agent toggle.  
- **Upcoming fixtures** (if rostered) and last 5 results.  
- **Notifications** (actions required, expiring docs) with one‑tap resolve.

### 4.2 Profile
- Legal names (as on ID), DOB, sex/category, contacts (phone/email).  
- Optional: preferred positions, dominant foot/hand, height (non‑gating).  
- For minors: guardian details visible; edit restricted to guardian.  
- **No address/residency fields**.

### 4.3 Identity & Documents
- **Selfie** capture (auto‑crop, quality checks).  
- **Primary ID** upload (Nat. ID/Passport; Birth Cert for minors) with OCR results and mismatch flags.  
- **Document history** (versioned, who verified, when).  
- **Medical clearance** upload with valid‑through date and issuing party.  
- Transfer letter (if applicable).  
- Status badges: Valid • Expired • Needs Review.

### 4.4 Eligibility
- Engine output: **PASS/BLOCK** with human‑readable reasons; simulation tips (“To pass: upload medical valid > {{date}}”).  
- Sanctions check result (read‑only).  
- Timestamp of last evaluation; re‑check button (rate‑limited).

### 4.5 Teams & Rosters
- Current team(s), role, jersey number(s), TPID per tournament.  
- **Join Requests** (sent/received) with statuses; accept/withdraw.  
- **Invites** from managers (accept/decline).  
- **Transfers/Loans** history with documents and timestamps.

### 4.6 Player Card (QR)
- Live QR with rotating token; offline cache status; last verified timestamp.  
- **Download / Print** card; **revocation** if suspended; display minimum PII only.  
- Tournament‑specific skins (branding) shown contextually.

### 4.7 Medical & Injuries
- Medical clearance validity (days left); upload/renew.  
- Team medic can add injury notes (if enabled); player can share/withhold notes with other teams.  
- Alerts for soon‑to‑expire docs (30/7/1 days).

### 4.8 Availability & Training (optional)
- Toggle availability for upcoming dates; view team training sessions; attendance history.

### 4.9 Consents & Privacy
- Consents dashboard: Player Terms, Data Processing, Media — grant/revoke where allowed.  
- **Guardian consent** track for minors with ID + OTP proof.  
- Privacy modes: **Private** (default) / **Team‑discoverable** / **Public** (minimal card).  
- Data requests: **Download my data**; **Request deletion** (with tournament audit constraints shown).

### 4.10 Notifications & Comms
- System messages (expiries, actions) and team communications (invites, offers).  
- Channel preferences: SMS/Email/WhatsApp; quiet hours.

### 4.11 Career & Achievements (non‑gating)
- Fixtures played, minutes, goals/assists (if stats integrated).  
- Badges: “Tournament Winner”, “U17 Finalist”, etc.  
- Export basic CV as PDF.

### 4.12 Marketplace (Free‑Agent)
- Toggle **Free‑Agent**; set position(s), preferred location (broad region names only, optional), availability window.  
- View offers; accept/decline; chat via templated messages (privacy‑safe).

---

## 5) Key Workflows

### A) Fast Onboarding (clean case)
1. OTP login → Overview → **Start checklist**.  
2. Upload selfie + ID → OCR + mismatch hints.  
3. Upload medical → enter valid‑through.  
4. Accept consents → (guardian flow if minor).  
5. Choose **Join Team** (code/invite) or toggle **Free‑Agent**.  
6. Submit → pre‑checks → **Auto‑approve** if all green; else goes to registrar.

### B) Fix & Resubmit (blocked)
1. Overview shows **BLOCK** reason (e.g., medical expired).  
2. One‑tap **Resolve** → takes user to exact step; upload/confirm.  
3. Re‑evaluate → APPROVED or remains IN_REVIEW with clear next steps.

### C) Accept Team Invite
1. Notification → **View Invite** → see team info.  
2. Accept → eligibility recalculated → if PASS, added to roster (TPID minted).  
3. If BLOCK, show fix path; keep invite pending until resolved or expires.

### D) Transfer/Loan Request
1. Player requests transfer (if policy allows) or accepts manager‑initiated transfer.  
2. Approval chain progresses (origin manager → destination → organizer).  
3. On complete: Team/Roster updated; history logged; card context switches as needed.

### E) Duplicate Account Merge
1. System flags potential duplicate (name+DOB+doc#, face match).  
2. Player verifies via OTP + selfie challenge to confirm merge.  
3. Registrar approves merge; single PID retained; audit trail preserved.

### F) Lost Device / Card Regeneration
1. Player taps **Regenerate QR**; previous token invalidated.  
2. Optional selfie check before reissue; audit logged.

---

## 6) Eligibility & Compliance (Residency‑Free)
**Inputs:** identity (ID + selfie), DOB/age band, medical validity, consents (incl. guardian), sanctions, duplicate risk.  
**Outputs:** PASS / BLOCK + reasons; timestamp.  
**Artifacts on approval:** PID, TPID (per tournament), digital card, roster slot (if team chosen).  
**Never used:** residency or address.

---

## 7) Data Model (Conceptual)
- **Players (PID)**: names, DOB, contacts, selfie_url.  
- **Documents**: type {ID, BirthCert, Medical, Transfer}, file_url (signed), issue/expiry, status, versions[].  
- **Consents**: type, granted_by, timestamp, evidence (guardian ID if minor).  
- **EligibilityResults**: status, reasons[], evaluated_at, evaluator_version.  
- **Teams**: relationships (member_of[], invites[], requests[]), jersey numbers.  
- **TPIDs**: per tournament linkage.  
- **Sanctions**: type, scope, dates.  
- **Notifications**: type, channel, status.  
- **PrivacySettings**: visibility level, comms preferences.  
- **FreeAgentProfile**: positions[], short bio, availability window (optional).

> **Excluded:** address/residency fields; residency proofs.

---

## 8) Permissions Matrix (summary)
| Capability | Player | Guardian | Manager | Medic | Registrar | Public |
|---|---:|---:|---:|---:|---:|---:|
| View player profile | ✓ | ✓ (minor) | ✓ (limited) | ✓ (medical validity) | ✓ | Minimal (opt‑in) |
| Edit identity & contacts | ✓ |  |  |  |  |  |
| Upload ID / Medical | ✓ | ✓ (minor medical optional) |  | ✓ (via team context) |  |  |
| Accept/decline team invites | ✓ |  |  |  |  |  |
| Toggle Free‑Agent | ✓ |  |  |  |  |  |
| Approve/deny eligibility |  |  |  |  | ✓ |  |
| Manage consents | ✓ | ✓ (guardian) |  |  |  |  |

---

## 9) Guardrails & Compliance
- **No residency** collection or gating.  
- Minors: guardian consent required; guardian ID stored and access‑scoped.  
- Medical docs visibility restricted; access logged.  
- Rate limits on sensitive actions (QR regen, ID re‑upload).  
- Full audit trail of decisions and document versions.

---

## 10) Organizer/Registrar Overlay
- Reads the same player hub with **Decision bar**: Approve • Request Changes • Escalate.  
- Shows duplicate risk score and reason breakdown.  
- Bulk actions available only from registrar console; single‑player actions from here.

---

## 11) Analytics & KPIs (Player Experience)
- **Completion time:** median ≤ 10 minutes (clean cases).  
- **Auto‑approve rate:** ≥ 75% where fees = off.  
- **Nudges to resolve:** ≤ 1.2 per blocked case.  
- **Document error rate:** < 3% after OCR hints.  
- **Guardian completion rate (minors):** ≥ 90% within 48h.

---

## 12) Rollout Plan
**Phase 1 (MVP, 2–3 weeks):** Overview, Profile, Identity & Docs, Eligibility, Teams & Rosters, Player Card (QR), Consents & Privacy, Notifications.  
**Phase 2 (Ops+, 3–4 weeks):** Transfers/Loans history, Medical & Injuries, Marketplace (Free‑Agent), Duplicate merge flow.  
**Phase 3 (Pro, ongoing):** Availability & Training, Career & Achievements, advanced privacy tooling, wallet passes, offline verifier improvements.

---

## 13) Acceptance Criteria
- Clean player can go **OTP → Approved → Card in Wallet** in ≤ 5 minutes.  
- Blocked player sees one **specific fix** and can resubmit without support.  
- Invite flow: player can **accept an invite** and appear on roster with TPID minted in ≤ 60 seconds post‑accept.  
- No page asks for residency or address.

---

## 14) Wireframe Outlines (text)
- **Overview:** status pill, checklist, card preview, team block, notifications list.  
- **Identity & Docs:** two‑column (Selfie/ID) with live OCR hints; version history drawer.  
- **Eligibility:** result card + reasons; “What fixes this?” helper.  
- **Teams & Rosters:** current teams at top; requests/invites below with action chips.  
- **Player Card:** large QR; buttons: Share • Add to Wallet • Print • Regenerate.  
- **Consents & Privacy:** toggles and timestamps; guardian panel if minor.  
- **Marketplace:** profile card, visibility toggle, offers list.

---

## 15) Notification Templates (examples)
- **Action required:** “Hi {{first_name}}, your medical clearance for {{tournament_name}} expired on {{date}}. Upload the new document here: {{link}}.”  
- **Invite received:** “{{team_name}} invited you to join. Review and accept here: {{link}}.”  
- **Approval:** “You’re approved! Your digital card is ready: {{card_link}}.”

---

## 16) Change Log
- **v1 (27 Oct 2025):** Initial player hub blueprint (residency‑free); aligned with JT3 registration standards.

*End of document.*

