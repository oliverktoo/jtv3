# JT3 — Public Page Blueprint (Fans & Media)

**Date:** 27 Oct 2025 (EAT)  
**Version:** v1  
**Audience:** Product, UX, Engineering, Comms/Media, Sponsors  
**Policy Note:** Player residency/address is never collected or displayed. Public pages honor player privacy: **opt‑in visibility**, minimal PII, and special handling for minors.

---

## 1) Purpose & North Star
Create a fast, beautiful, and trustworthy **public experience** that showcases competitions, fixtures, results, standings, teams, and (opt‑in) players — real‑time when live, delightful on low data, and easy to share.

**Outcomes:** More fans engaged, sponsors proud, media self‑served, and zero admin bottlenecks.

---

## 2) Audiences & Access
- **Fans & Community:** fixtures, live scores, tables, news, photos, tickets.  
- **Media/Press:** match facts, official reports, downloadable assets (logos, kits).  
- **Scouts/Clubs:** schedules and (opt‑in) player profiles with basic stats.  
- **Sponsors/Partners:** brand placement, campaign links, impressions.  
- **Organizers:** publish once, everywhere; no duplicate work.

> **Privacy defaults:** Minors show **first name + initial** (e.g., “Mercy A.”) unless guardian opted‑in to full name. Never show DOB, ID, contact, or address.

---

## 3) Global Information Architecture
- **Top Nav:** Home • Competitions • Fixtures • Results • Standings • Teams • Venues • Tickets • News  
- **Utility:** Search, Language (EN/Sw), Theme, Socials  
- **Footer:** About, Regulations, Media Kit, Contact, Privacy, Terms, Sponsorship

---

## 4) Key Pages & Content

### 4.1 Home (Landing)
- **Hero:** current flagship competition with CTA (View Fixtures / Buy Tickets)
- **Today’s Matches:** times, venues, quick status (Live/FT/Upcoming)
- **Table Snapshots:** top 5 standings for active leagues
- **Spotlight:** news articles, photo gallery, sponsor carousel
- **Discover:** browse by team/competition/venue; “Find my ward/county” (uses public admin hierarchy only)

### 4.2 Competitions Index
- Cards per competition: badge, dates, format (League/Knockout/Hybrid), status
- Filters: active, upcoming, completed; county/zone; gender/category

### 4.3 Competition Hub
- **Tabs:** Overview • Fixtures • Results • Standings • Bracket (if KO) • Stats • News • Downloads  
- **Overview:** summary, rules PDF, registered teams, venues map, sponsors
- **Fixtures/Results:** list by round/date with filters; share buttons; ticket links
- **Standings:** table with P, W, D, L, GF, GA, GD, Pts; tie‑break rules hover
- **Bracket:** round of 16 → final with dates; hover match cards

### 4.4 Match Page (Public)
- **Header:** Team A vs Team B, competition, round, venue, kickoff  
- **Scoreboard:** live clock (if live), FT status, penalties, aggregate when 2‑legged
- **Timeline:** goals, cards, subs (minute, player display name, team)
- **Lineups:** XI + bench (jersey #, display name, position); officials list
- **Player of the Match:** badge (if assigned)  
- **Files:** referee report summary (public version), photos gallery
- **Sharing:** deep link + OpenGraph/Twitter cards ready

### 4.5 Team Page (Public)
- **Header:** logo, colors, home venue, socials  
- **Overview:** competition participation, current form, next fixtures  
- **Roster:** (opt‑in player visibility) — name, jersey #, position only  
- **Results & Table:** last 5 results and current standing  
- **Kits:** home/away images  
- **Staff:** Manager, Coach names (no contacts)

### 4.6 Player Page (Public, Opt‑in)
- **Header:** name, photo, position, team(s); **no DOB or contact**  
- **Stats:** appearances, minutes, goals/assists/cards (season filtered)  
- **Bio:** short text (optional, reviewed)  
- **Privacy note:** how to opt‑out/change visibility

### 4.7 Venues
- Venue cards: name, capacity (optional), map (static), accessibility notes, fixtures at venue

### 4.8 Tickets (optional integration)
- Event list with price ranges and Buy buttons; secure checkout deeplink  
- “How it works” and accept‑on‑entry QR guidance

### 4.9 News & Media
- Articles with categories (match reports, features, announcements)  
- Photo/video galleries (credit + consent), press releases, downloadable media kit

---

## 5) Live Center (Real‑Time)
- **Low‑data mode:** polling/SSE with compact payloads; emojis for events (⚽, 🟥, 🟨)  
- **Latency target:** < 2s perceived  
- **Fallback:** offline banner + auto‑resume  
- “Follow match” sticky action; push/web notifications (opt‑in)

---

## 6) SEO, Sharing & Discoverability
- Server‑side render (SSR/ISR) for all public pages; prefetch routes  
- **Schema.org:** `SportsOrganization`, `SportsTeam`, `SportsEvent`, `Person` (limited), `BreadcrumbList`  
- **Open Graph/Twitter Cards:** per page with branded images  
- Sitemaps: competitions, matches, teams, players (opt‑in), venues, news  
- Canonicals and hreflang (EN/Sw)

---

## 7) Accessibility & Inclusivity
- WCAG 2.1 AA color contrast and focus states  
- Keyboard‑navigable fixtures tables and standings  
- Clear icon + text labels for events  
- Minors: masked names by default; no photos unless guardian consented

---

## 8) Performance & Delivery
- **Budget:** TTI < 3s on 3G; LCP < 2.5s; CLS < 0.1  
- Edge cache (CDN) for fixtures/standings; **stale‑while‑revalidate**  
- Image CDNs with responsive sizes; WebP/AVIF  
- Static export for completed competitions; ISR for live ones  
- PWA with offline shell for fixtures/standings

---

## 9) Privacy, Moderation & Safety
- No residency/address shown; no DOB/ID  
- Visibility tiers: **Private (default)** / **Public (opt‑in)**; minors = masked  
- Content moderation for bios/comments/galleries; profanity and image‑nudity filters  
- Report abuse/evidence pipeline to organizers

---

## 10) Sponsorship & Monetization
- Sponsor placements: header ribbon, mid‑page blocks, match billboard  
- Rules: never block score/info; frequency caps; label as “Sponsored”  
- UTM tagging for partner clicks; impression counts in analytics  
- Optional shop links (kits/merch)

---

## 11) Analytics & Metrics
- Pageviews, unique visitors, dwell time, bounce by page type  
- Live match concurrent viewers; peak by minute  
- Ticket click‑through; sponsor CTR  
- Search queries (what fans look for)

---

## 12) Release Plan
**Phase 1 (MVP, 2–3 weeks):** Home, Competitions, Fixtures/Results, Standings, Match Page (basic), Team public page (basic), News.  
**Phase 2 (Live+, 3–4 weeks):** Live Center (SSE/poll), Player opt‑in pages, Venues, Tickets, Galleries, Sponsor blocks.  
**Phase 3 (Pro, ongoing):** Stats dashboards, multilingual content, PWA offline mode, advanced SEO/OG automations.

---

## 13) Acceptance Criteria
- A fan can **find today’s fixtures** and a **match page** in ≤ 3 clicks, and see **live events** within ≤ 2 seconds of logging.  
- Standings update within **2 minutes** of a match lock.  
- Player pages only appear when the player (or guardian) **opted‑in**; minors are masked by default.  
- LCP ≤ 2.5s on 3G for the Home and Competition pages.

---

## 14) Data & Integration Notes
- Read‑only from internal APIs: `fixtures`, `matches`, `events`, `standings`, `teams`, `players (public)`, `news`, `venues`  
- All personal fields (DOB, ID, addresses) excluded at the API boundary  
- Cache keys include competition ID and round; bust on match lock

---

## 15) Wireframe Sketches (ASCII)

### 15.1 Home
```
┌────────────── Jamii Sports ──────────────┐  Buy Tickets ▸
│  ▶ Governor’s Cup (Now Live)             │
│  Today’s Matches                         │
│  • 14:30 ABC vs DEF  (Moi Annex)  Live ● │
│  • 16:45 GHI vs JKL  (Eldoret)    Soon ○ │
│  Tables Snapshot  |  News  |  Gallery     │
└───────────────────────────────────────────┘
```

### 15.2 Competitions Index
```
┌──────── Active Competitions ────────┐  Filter: [Active] [Upcoming] [Completed]
│ [Badge] Governor’s Cup 2025        │  Format: League+KO  Dates: Sep–Dec
│ [Badge] Women’s Open                │  Format: League     Dates: Oct–Nov
└─────────────────────────────────────┘
```

### 15.3 Competition Hub — Fixtures
```
┌──── Governor’s Cup 2025 ────┐  Tabs: Overview | Fixtures | Standings | Bracket
│ Round 5 — Sat 27 Oct        │  Filter: [All] [By date] [By team]
│ 14:30  ABC vs DEF   ▸ Match │  Ticket ▸
│ 16:45  GHI vs JKL   ▸ Match │
└─────────────────────────────┘
```

### 15.4 Match Page (Public)
```
┌──────── ABC 1–0 DEF ────────┐  Round 5  •  Moi Annex
│  ⏱ 67'                      │
│  ⚽ 67'  #9 ABC              │
│  🟨 34'  #6 DEF  (Reckless)  │
├── Lineups ──────────────────┤
│ ABC: 1 Chebet (GK), 2 Kipkemei, 4 Achieng, …
│ DEF: 1 Kibet (GK), 3 Muli, 5 Wanjiru, …
└─────────────────────────────┘  Share ▸
```

### 15.5 Team Page (Public)
```
┌──── ABC United ────┐  @abcunited
│ Next: Sat 14:30 vs DEF  (Moi Annex)
│ Table: 2nd  P:10  GD:+8  Pts:21
│ Roster (opt‑in):  1 Chebet (GK), 2 Kipkemei (DF), …
│ Kits: Home 🔵  Away ⚪
└────────────────────┘
```

### 15.6 Player Page (Opt‑in)
```
┌──── Mercy A. (DF) ────┐  ABC United
│ Apps 12  •  Min 980  •  YC 3  •  RC 0
│ Bio: —
└───────────────────────┘
```

### 15.7 Standings
```
┌── Standings ──┬──P──W──D──L──GF──GA──GD──Pts─┐
│ 1 ABC United  │ 10  6  3  1  18  10  +8  21  │
│ 2 GHI Stars   │ 10  6  2  2  16   9  +7  20  │
│ …                                         …  │
└───────────────────────────────────────────────┘
```

### 15.8 Tickets
```
┌── Buy Tickets ───────────────────────────┐
│ 27 Oct 14:30  ABC vs DEF    From KSh 200 │  Buy ▸
│ 31 Oct 16:00  GHI vs JKL    From KSh 200 │  Buy ▸
└──────────────────────────────────────────┘
```

---

## 16) Branding & Theming
- Tournament color palettes per competition  
- Sponsor lockups and watermarks on OG images  
- Accessible dark mode with preserved contrast

---

## 17) Change Log
- **v1 (27 Oct 2025):** Initial public site blueprint + wireframes; privacy‑first and residency‑free.

*End of document.*

