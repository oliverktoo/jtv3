# Jamii Tourney v3 - Design Guidelines

## Design Approach

**Selected Approach:** Design System with Sports Platform References

**Justification:** As a utility-focused tournament management platform with information-dense interfaces, Jamii Tourney requires clarity, efficiency, and predictable patterns. Drawing inspiration from professional sports platforms (ESPN, Premier League, Linear) while applying Material Design principles for data-heavy components ensures optimal usability for tournament organizers and participants.

**Key Design Principles:**
- Data clarity over decoration
- Scannable information hierarchies
- Predictable interaction patterns
- Professional, authoritative tone
- Efficient task completion flows

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary Brand: 25 85% 45% (Deep green - sports/competition)
- Primary Variant: 25 75% 35% (Darker green for hover states)
- Surface Background: 0 0% 98%
- Card/Panel Background: 0 0% 100%
- Border/Divider: 0 0% 90%
- Text Primary: 0 0% 15%
- Text Secondary: 0 0% 45%

**Dark Mode:**
- Primary Brand: 25 80% 55% (Lighter green for contrast)
- Primary Variant: 25 85% 65%
- Surface Background: 0 0% 8%
- Card/Panel Background: 0 0% 12%
- Border/Divider: 0 0% 20%
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 65%

**Semantic Colors (Both Modes):**
- Success: 142 76% 36% (Match wins, completed status)
- Warning: 38 92% 50% (Pending actions, draws)
- Error: 0 84% 60% (Losses, conflicts, errors)
- Info: 217 91% 60% (Neutral information)

**Status Indicators:**
- Draft: 0 0% 60% (Gray)
- Registration: 38 92% 50% (Amber)
- Active: 142 76% 36% (Green)
- Completed: 217 91% 60% (Blue)
- Archived: 0 0% 40% (Dark gray)

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - UI text, forms, data tables
- Headings: 'Inter' with adjusted weights
- Monospace: 'JetBrains Mono' - Match times, scores, fixture codes

**Type Scale:**
- Hero/Display: text-5xl font-bold (48px, headlines)
- Page Title: text-3xl font-semibold (30px)
- Section Header: text-2xl font-semibold (24px)
- Card Title: text-xl font-semibold (20px)
- Body Large: text-lg (18px, key information)
- Body: text-base (16px, standard content)
- Body Small: text-sm (14px, secondary info)
- Caption: text-xs (12px, metadata, timestamps)

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (subtle emphasis)
- Semibold: 600 (headings, labels)
- Bold: 700 (key metrics, scores)

### C. Layout System

**Spacing Units:** Use Tailwind units of 1, 2, 4, 6, 8, 12, 16, 24 for consistent rhythm.

**Common Patterns:**
- Card padding: p-6
- Section spacing: space-y-8
- Form field gaps: gap-4
- Button padding: px-6 py-3
- Table cell padding: p-4
- Page margins: px-4 md:px-8 lg:px-12

**Container Widths:**
- Maximum content: max-w-7xl mx-auto
- Forms: max-w-2xl
- Data tables: w-full (responsive horizontal scroll)
- Cards in grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Responsive Breakpoints:**
- Mobile: base (< 640px)
- Tablet: md (640px+)
- Desktop: lg (1024px+)
- Wide: xl (1280px+)

### D. Component Library

**Navigation:**
- Top navbar: Sticky header with logo, main nav, user menu
- Sidebar (desktop): Collapsible navigation for tournament management sections
- Breadcrumbs: Always show current location in hierarchy (Ward > Sub-County > County)
- Tabs: For switching between Fixtures, Standings, Teams within tournaments

**Forms:**
- Input fields: Rounded borders (rounded-lg), clear labels above, helper text below
- Dropdowns: Custom styled selects matching Material Design
- Multi-step wizard: For tournament creation with progress indicator
- Model-specific sections: Conditionally rendered based on tournament type
- Geography selectors: Nested dropdowns for County > Sub-County > Ward
- Validation: Inline error messages in red with icons

**Data Display:**
- Tables: Alternating row backgrounds, sortable headers, sticky header on scroll
- Standings table: Position numbers, team badges, bold points column
- Fixtures calendar: Weekly view with date headers, match cards showing teams, time, venue
- Match cards: Home team (left), score/time (center), away team (right)
- Status badges: Rounded pills with appropriate semantic colors
- Stats panels: Key metrics in grid (total teams, matches played, upcoming fixtures)

**Cards:**
- Tournament cards: Image/icon, title, model badge, date range, quick actions
- Team cards: Logo placeholder, name, division/group, record
- Elevation: shadow-sm for cards, shadow-md for modals, shadow-lg for dropdowns

**Buttons:**
- Primary: Filled with brand color, white text, rounded-lg
- Secondary: Outline with border, brand color text
- Ghost: No border, subtle hover background
- Icon buttons: Square, padding, clear hover state
- Button groups: Connected buttons with appropriate borders

**Modals & Overlays:**
- Modal dialogs: Centered, max-w-2xl, backdrop blur
- Slide-overs: For quick edits, slide from right
- Toast notifications: Top-right corner, auto-dismiss, appropriate semantic colors
- Confirmation dialogs: Clear action buttons (destructive actions in red)

**Empty States:**
- Illustrative icons or simple graphics
- Clear messaging ("No tournaments yet")
- Primary CTA to create first item
- Helpful onboarding hints

### E. Visual Elements

**Icons:** Heroicons (via CDN) - Outline style for navigation, Solid style for buttons/status

**Borders & Dividers:**
- Card borders: border border-gray-200 dark:border-gray-700
- Section dividers: border-b
- Focus rings: ring-2 ring-brand ring-offset-2

**Shadows:**
- Cards at rest: shadow-sm
- Hover state: shadow-md
- Active/focused: shadow-lg
- Dropdowns: shadow-xl

**Animations:** Minimal and purposeful
- Page transitions: Subtle fade (150ms)
- Dropdown menus: Slide and fade (200ms)
- Toast notifications: Slide in from top (300ms)
- Loading states: Pulse animation on skeletons
- No decorative animations

---

## Page-Specific Guidelines

**Dashboard/Home:**
- Stats overview grid (4 columns on desktop)
- Recent tournaments list with quick actions
- Upcoming fixtures preview
- Call-to-action card for creating new tournament

**Tournament Creation Wizard:**
- Multi-step form with clear progress indicator
- Model selection cards with icons and descriptions
- Geography selector appears conditionally
- League customizer shows division configuration
- Preview step before final creation

**Tournament Management:**
- Tabbed interface: Overview, Teams, Fixtures, Standings, Settings
- Action buttons in header (Publish, Export, Generate Fixtures)
- Team list with search, filter, bulk import option
- Fixtures in calendar view or list view toggle
- Standings table with real-time updates

**Fixtures Page:**
- Filter by round, date, venue, team
- Group by week/round with date headers
- Match cards in chronological order
- Quick score entry for authorized users
- Export to Excel button prominent

**Standings Page:**
- Clean table with position, team, matches, wins/draws/losses, goals, points
- Tiebreaker indicators (footnotes)
- Division/group tabs if applicable
- Promotion/relegation zones highlighted with subtle background colors
- Export button

**Public View:**
- Read-only tournament information
- No edit controls
- Simplified navigation
- Large, scannable fixtures and standings
- Mobile-optimized

---

## Images

**Hero Image:** No large hero image - this is a utility application, not marketing site.

**Supporting Images:**
- Tournament cards: Optional sport-specific placeholder images (football field, basketball court) - 400x300px aspect ratio
- Team logos: Circular avatars, 48x48px, fallback to initials
- Empty state illustrations: Simple line art icons (400x300px max)
- User avatars: 32x32px circular

All images should be optimized, with appropriate alt text for accessibility.