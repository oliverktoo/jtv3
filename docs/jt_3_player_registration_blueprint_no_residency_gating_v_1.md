# JT3 — Player Registration Blueprint (No Residency Gating)

**Date:** 26 Oct 2025 (EAT)
**Scope:** Best‑in‑class player registration for county/national scale **without making residency a requirement**. Residency data may be captured optionally for analytics, but **never gates approval** by default.

---

## 1) North Star
- **One human = one global Player ID (PID);** each competition creates a **Tournament Player ID (TPID)**.
- **One‑click approvals** for registrars; strict identity/eligibility checks, simple UI.
- **Eligibility by design** (identity, age band, medical, consents, sanctions) — **no residency gating**.
- **Auditability & anti‑fraud**: de‑duplication, document trails, tamper‑resistant digital player cards.

---

## 2) Policy Position (Residency)
- **Residency proofs are not required** and **never block approval** by default.
- We **do not collect residential addresses** unless voluntarily provided for communications or analytics.
- Optional **affinity tags** (e.g., school, employer, academy) can be used for *non‑gating* insights or awards ("homegrown" badges), but **not for eligibility**.

> This keeps competitions open/inclusive and reduces friction, while still letting organizers understand player ecosystems.

---

## 3) Personas & Permissions (RBAC)
- **Player** (self‑register)
- **Guardian** (minors; provides consent + ID)
- **Team Manager / Coach** (registers players to team; approves join requests)
- **Registrar / Organizing Staff** (review/approve; manage queues; reports)
- **Medical Officer / Disciplinary Officer** (limited write on medical/sanctions)
- **System Admin** (policies, integrations, exports)

---

## 4) Registration Flows (unchanged, but no residency step)
1. **Player‑led:** account → profile → documents → consents → choose team or free‑agent.
2. **Manager‑led:** manager adds player → player completes KYC + consents via link/SMS.
3. **Free‑agent marketplace:** player lists; managers invite; player accepts.
4. **Bulk import/migration:** CSV + doc packs → targeted remediation.
5. **Transfers/Loans:** request → approvals (origin, destination, organizer) → eligibility windows update.

---

## 5) Lifecycle & Statuses
**DRAFT → SUBMITTED → IN_REVIEW → CHANGES_REQUESTED ↺ → APPROVED → (optional) SUSPENDED/REVOKED** with full reason codes (no residency‑related reasons).

---

## 6) Identity & Verification (Tiered)
- **Tier 0 (default):** email/phone OTP, selfie, primary ID (National ID/Passport; Birth Cert for minors).
- **Tier 1:** de‑duplication (exact + fuzzy matching on name/DOB/doc#, selfie↔ID face match).
- **Tier 2 (optional by event risk):** liveness, third‑party KYC, spot checks at venue (QR scan + photo).
- **Document versioning:** all re‑uploads retained with notes.

---

## 7) Eligibility Engine (Rules‑as‑Data, Residency‑Free)
- **Inputs:** Age band, gender/category, mandatory documents, medical clearance, required consents, sanctions/discipline.
- **Evaluator:** deterministic rule graph with expiries and date windows.
- **Outcomes:** PASS / BLOCK (human‑readable reasons) + **simulation** (what fixes it?).
- **Policy packs:** Youth (U15/U17), Open, Women, Pro/Amateur, School leagues — all **without residency criteria**.

> Example block reasons: "Missing guardian consent", "Medical clearance expired", "ID name/DOB mismatch", "Under current suspension".

---

## 8) Documents & Consents
- **Required docs (core):** Government ID/passport/BC (per age), passport‑style photo, **medical fitness**, transfer letter where applicable.
- **Consents:** player terms, data processing, media/photo; **guardian consent** for minors.
- **OCR & mismatch flags** for name/DOB/doc#, but **no residency proof requested** by default.

---

## 9) Transfers, Loans & Anti‑Poaching (non‑residency controls)
- **Transfer windows** (pre‑season; mid‑season limited).
- **Roster lock dates** (group stage lock; knockout lock).
- **Release/clearance letters** and **cool‑off periods** after approval.
- Optional: **training compensation** or **development fee** policies for youth academies (admin configurable), not tied to geography.

---

## 10) Player Profile & Digital Player Card
- Stable **PID profile** + tournament **TPID**.
- **QR code** (rotating token) with offline verification cache; **no location/residency displayed**.
- Minimal PII on card; last verified timestamp; jersey number scoped to team+event.

---

## 11) Team & Roster Management
- Roster caps by event/stage; injured list & temporary replacements.
- Captain/vice‑captain flags; staff linkage (coach, TM, medic).
- **No homegrown/local quotas** by default. Framework supports such analytics **without enforcement**.

---

## 12) Registrar Console (Ops at Scale)
- **Smart queues** by issue type (ID mismatch, missing consent, expired medical).
- **One‑click `approve_player_full`** for clean cases; blocked cases show exact (non‑residency) reasons.
- **Bulk actions:** approve in batch; templated change requests.
- **Audit views** for every action/doc/version.

---

## 13) Data Model (Residency‑Optional)
- **Players (PID), Persons (identity), Documents (versions)** — unchanged.
- **Teams, Team Memberships, Tournaments, Rosters (TPID), Consents, Medical, Sanctions** — unchanged.
- **ResidencyProofs**: **deprecated to optional** (kept only if a specific organizer opts‑in). Not referenced in eligibility.
- **Optional attributes** (purely informational): `school_id`, `employer_id`, `academy_id`, `player_affinities[]`.
- **No mandatory address fields.** If present, guarded and never used for eligibility.

---

## 14) Privacy, Compliance & Risk
- Align with **Kenya Data Protection Act**: data minimization strengthened by removing residency collection.
- Purpose‑limitation: identity, medical fitness, competition eligibility.
- Retention schedules, right‑to‑erasure (with regulatory carve‑outs for audit).
- Anti‑fraud still robust via duplicate detection and sanctions registry — **geography not required**.

---

## 15) Analytics & Insights (Non‑Gating)
- Funnel: started → submitted → approved; drop‑offs.
- Common failure reasons (to improve UX/policies).
- Player ecosystem maps via **team/academy/school** affiliations (opt‑in) — *informational only*.
- Participation demographics (age bands, categories) without addresses.

---

## 16) Rollout Plan (Phased)
**Phase 1 — Core (4–6 weeks):** PID/TPID; documents & consents (no residency); eligibility engine v1; registrar console; digital card (static QR).

**Phase 2 — Scale (4–6 weeks):** duplicate/face checks; transfers/loans; free‑agent marketplace; vouchers/waivers; analytics; sanctions registry.

**Phase 3 — Pro (ongoing):** liveness; offline verifier app; federation APIs; advanced auditing.

---

## 17) Defaults & Toggles (Summary)
| Area | Default | Toggle |
|---|---|---|
| Residency requirement | **Off** | Organizer may enable as informational only |
| Address capture | **Off** | Voluntary (hidden by default) |
| Homegrown quotas | **Off** | Analytics only; not enforced |
| Transfer windows | **On** | Configurable per event |
| Medical clearance | **Required** | Expiry (e.g., 12 months) |
| Guardian consent (U18) | **Required** | N/A |
| Face match | **On for finals/elite** | Tiered by risk |

---

## 18) Success Metrics & SLAs
- **Completion time:** ≥ 80% finish in ≤ 10 minutes on mobile.
- **Auto‑approve rate:** ≥ 75% (clean cases through one‑click).
- **Fraud catch (duplicates):** ≥ 95% flagged before roster approval.
- **Support load:** < 5% require back‑and‑forth.

---

## 19) Change Log (vs. prior blueprint)
- Removed all **residency‑based inputs** from the eligibility engine.
- Deprecated **ResidencyProofs** to optional; **address fields** no longer collected by default.
- Scrubbed residency‑related reasons and UI steps from flows and registrar console.
- Kept optional **affinity tags** for schools/employers/academies as *non‑gating* attributes.

---

*This blueprint is implementation‑ready without code. Next step (if desired): convert into a living spec with process diagrams, registrar checklists, and a milestone plan.*

