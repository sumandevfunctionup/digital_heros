# digital.HEROES — Complete UI Architecture & Screen Tree Specification
**Document Version:** 1.0 (March 2026 Edition)  
**Classification:** Frontend Component Hierarchy & User Experience Architecture  
**Design System Core:** "Feel, not Fairway" — Emotion-driven, Dark Glassmorphism, Micro-interactions  

---

## 1. Global Design System & Token Standard

### 1.1 Brand Color Palette & Atmosphere
To completely avoid golf clichés (no emerald turf greens, argyle plaids, or fairway photos), digital.HEROES adopts an ultra-modern cyber-philanthropy aesthetic:
- **Background Base**: Deep obsidian `#08090C` with subtle radial gradient mesh accents.
- **Card / Surface**: Glassmorphism surface `rgba(18, 21, 28, 0.75)` with `1px border border-white/10` and `backdrop-blur-md`.
- **Primary Accent (Charity Impact)**: Vibrant Neon Amber / Gold `#F59E0B` to `#FBBF24` (symbolizing hope, contribution, and jackpot prestige).
- **Secondary Accent (Performance)**: Cyan / Electric Teal `#06B6D4` to `#3B82F6` (representing precision, statistics, and scores).
- **Status Accents**:
  - Success / Active: `#10B981` (Emerald Glow)
  - Pending Verification: `#F59E0B` (Amber Pulse)
  - Rejected / Critical: `#EF4444` (Ruby Alert)
- **Typography**:
  - Headings: Bold, modern grotesque sans (`Outfit` or `Geist Sans`, 700-900 weight) with letter-spacing tracking `-0.02em`.
  - Numbers & Metrics: Monospace tabular numerals (`Geist Mono` or `JetBrains Mono`) for scores, jackpot counters, and draw timers.

---

## 2. Complete Next.js App Router Tree

```
src/app/
│
├── layout.jsx                         // Root layout: Navigation bar, Footer, Auth Provider, Toaster
├── page.jsx                           // Landing page: Hero, Impact stats, How it works, Jackpot counter
├── error.jsx                          // Global error boundary with recovery action
├── not-found.jsx                      // Custom 404 page with quick navigation links
│
├── (auth)/                            // Authentication Route Group
│   ├── layout.jsx                     // Centered card layout with glowing brand motif
│   ├── login/page.jsx                 // Email/Password login + Demo credentials autofill
│   ├── register/page.jsx              // Step 1: Account info -> Step 2: Charity selection
│   └── forgot-password/page.jsx       // Password reset email trigger
│
├── (public)/                          // Publicly Accessible Routes
│   ├── charities/
│   │   ├── page.jsx                   // Charity Directory (Search, Filter by Category, Cards Grid)
│   │   └── [slug]/page.jsx            // Charity Profile (Impact story, Events schedule, Direct Donate)
│   ├── draws/
│   │   └── page.jsx                   // Draw Mechanics, Past Draws Archive, Rollover Jackpot Rules
│   ├── how-it-works/page.jsx          // Interactive visual guide: Subscribe -> Score -> Support -> Win
│   └── subscribe/
│       └── page.jsx                   // Pricing Table (Monthly vs. Yearly) + Stripe Checkout trigger
│
├── dashboard/                         // Subscriber Protected Area (Middleware: Active Sub check)
│   ├── layout.jsx                     // Dashboard Shell: Persistent Sidebar, Topbar with Charity Badge
│   ├── page.jsx                       // User Overview: Active 5 Scores, Upcoming Draw Ticket, Charity %
│   ├── scores/
│   │   └── page.jsx                   // Score Management: 5-slot Rolling Display, New Entry Form, History
│   ├── charity/
│   │   └── page.jsx                   // Charity Center: My Impact Meter, % Allocation Slider, Switch Charity
│   ├── draws/
│   │   └── page.jsx                   // Draw History: My Participation, Matched Numbers, Result Cards
│   ├── winnings/
│   │   ├── page.jsx                   // Winnings Overview: Total Won, Payout Status, Claim Actions
│   │   └── [winnerId]/
│   │       └── verify/page.jsx        // Winner Verification: Score Screenshot Upload & Status Tracker
│   └── settings/
│       └── page.jsx                   // Subscription Management (Upgrade/Cancel), Profile, Security
│
└── admin/                             // Administrator Control Plane (Middleware: Role === 'admin')
    ├── layout.jsx                     // Admin Shell: Red-accented Admin Nav, Server Status, Quick Actions
    ├── page.jsx                       // Admin Executive Dashboard: MRR, Charity Totals, Jackpot, System Health
    ├── users/
    │   ├── page.jsx                   // User Roster: Search, Filter by Plan/Status, Score Inspector
    │   └── [id]/page.jsx              // User Detail & Admin Overrides: Edit Scores, Adjust Subscription
    ├── draws/
    │   ├── page.jsx                   // Draw Console: Past Draws Table, Jackpot Rollover Tracker
    │   └── new/page.jsx               // Draw Engine Simulator: Algorithm Selector, Simulate, Publish Draw
    ├── charities/
    │   ├── page.jsx                   // Charity Manager: Table with stats, quick-toggle Active/Featured
    │   ├── new/page.jsx               // Add Charity Form: Media upload, mission, event creation
    │   └── [id]/edit/page.jsx         // Edit Charity Form: Update metadata, events, and metrics
    ├── winners/
    │   └── page.jsx                   // Winner Verification Queue: Proof inspection, Approve/Reject, Payout
    └── analytics/
        └── page.jsx                   // Reports & Deep Analytics: Score distribution histograms, Charity KPIs
```

---

## 3. Screen-by-Screen Component Architecture

### 3.1 Public Marketing Pages

#### 3.1.1 Homepage (`/`)
- **Header**:
  - Brand Logo: `digital.` (Gold/Cyan) `HEROES` (White).
  - Navigation links: *Charities*, *How It Works*, *Draws*, *Pricing*.
  - Action Group: *Sign In* (Ghost button) + *Join the Movement* (Glowing primary CTA).
- **Hero Section**:
  - Headline: *"Track Your Game. Fund What Matters. Win Together."*
  - Sub-headline: Eliminates traditional golf tropes—highlights the synergy of personal golf tracking, real charity contribution, and monthly cash prize draws.
  - Live Jackpot Ticker: Animated counter showing current monthly pool (e.g., `$12,450.00`) with countdown to next draw date.
  - Dual CTAs: `[Start Subscription]` (Primary) and `[Explore Verified Charities]` (Secondary).
- **Live Draw Preview Card**:
  - Displays last month's winning 5 numbers in glowing glass balls with rollover jackpot notice.
- **Charity Spotlight Carousel**:
  - Features 3 highlighted charities with "Total Donated to Date" and upcoming Charity Golf Days.
- **How It Works 4-Step Interactive Card Grid**:
  1. *Join & Choose*: Select your monthly or annual subscription and designate your charity.
  2. *Log 5 Scores*: Enter your latest Stableford scores (1–45) with rolling auto-updates.
  3. *Fund Good Causes*: At least 10% of every fee goes straight to your chosen foundation.
  4. *Enter Monthly Draws*: Your 5 scores become your lottery ticket for 5, 4, and 3-number match prizes.
- **Interactive Prize Calculator**:
  - Slider: Active subscribers count $\to$ dynamically previews 5-match jackpot, 4-match pool, 3-match pool, and charity donation totals.
- **Footer**:
  - Legal disclaimer (Skill/Draw rules, Charity transparency disclosures), links, copyright 2026.

#### 3.1.2 Charity Directory (`/charities`)
- **Filter Bar**:
  - Search Input: Real-time debounced query by charity name or keyword.
  - Category Pills: `All`, `Healthcare`, `Youth & Education`, `Veterans`, `Environment`, `Community`.
  - Sort By: `Most Supported`, `Highest Funds Raised`, `Recently Added`.
- **Charities Grid**:
  - Cards with high-resolution banner, official logo, category badge, short mission statement, raised funds progress bar, and supporter count.
  - Actions: `[View Profile]` and `[Direct Donation]`.

#### 3.1.3 Charity Profile (`/charities/[slug]`)
- **Hero Banner**: Organization banner with verified non-profit badge and direct contact details.
- **Mission & Impact Section**: Detailed story, key achievements, and breakdown of where donor funds go.
- **Upcoming Events (Charity Golf Days)**:
  - Event cards with date, venue location, event description, and external registration link.
- **Supporter Stats Widget**: Total platform donors and aggregate funds directed from subscriptions.
- **Action Sticky Bar**:
  - `[Select as My Platform Charity]` (updates logged-in user preference or pre-fills registration).
  - `[Make Direct Donation]` (opens Instant Donate Modal).

#### 3.1.4 Draw Mechanics & History (`/draws`)
- **Next Draw Countdown**: High-impact timer (Days:Hours:Minutes:Seconds) to next month's draw execution.
- **Prize Pool Tier Breakdown Table**:
  - Tier 1: 5-Match | 40% Share | Rollover Enabled | Projected Jackpot
  - Tier 2: 4-Match | 35% Share | Split Equally
  - Tier 3: 3-Match | 25% Share | Split Equally
- **Historical Draws Archive**:
  - Accordion list of all past published draws with draw date, drawn numbers, total winners count per tier, and total payout amounts.

---

### 3.2 Subscriber Dashboard Experience

#### 3.2.1 Dashboard Overview (`/dashboard`)
- **Subscription Status Banner**:
  - Plan type (`Monthly` or `Yearly`), status indicator (`Active` with glowing green badge), next renewal date, and quick link to billing.
- **Active 5-Score Card Deck**:
  - Visual display of the 5 numbers representing the user's active ticket for the upcoming draw.
  - Each score badge shows the round date, golf score (1–45), and age rank (from #1 Most Recent to #5 Oldest).
  - Alert indicator if user has `< 5` scores: *"Log X more scores to complete your draw ticket!"*
- **Charity Contribution Summary**:
  - Card showing chosen charity logo, name, contribution percentage (e.g., `15%`), and total estimated donations generated to date.
- **Winnings Quick Banner**:
  - Highlights recent wins with an urgent action badge: `[Upload Proof to Claim $X]` if pending verification.

#### 3.2.2 Score Management Portal (`/dashboard/scores`)
- **Score Slots Visualizer (5 Slots)**:
  - Five distinct digital cards showing current active scores arranged chronologically (newest to oldest).
  - Highlights the **FIFO target**: clearly indicates which score is currently slot #5 and will be replaced upon next entry.
- **New Score Entry Form**:
  - Input 1: **Score (Stableford Format)**: Number stepper / slider constrained to range `1` to `45`.
  - Input 2: **Round Date**: Date picker (defaults to today; cannot select a date already entered).
  - Input 3: **Course / Club Name** (Optional).
  - Validation: Real-time duplicate date check. If date exists, displays message: *"A score already exists for this date. Click here to edit it."*
  - Submit Button: `[Submit Score]` with instant slot slide-in animation.
- **Score History Table**:
  - Paginated archive of all entered scores (current active + previously archived).
  - Inline action buttons: `[Edit]` (modal) and `[Delete]`.

#### 3.2.3 Charity Center (`/dashboard/charity`)
- **Current Recipient Card**:
  - In-depth profile of currently selected charity.
  - Switch Charity CTA: opens modal allowing instant re-assignment from directory.
- **Voluntary Contribution Adjuster**:
  - Interactive slider starting at **10% (Mandatory minimum)** up to **100%**.
  - Real-time monthly contribution preview: e.g., *"At 20% of your $25/mo plan, you donate $5.00 every month."*
  - Save button with confirmation toast.
- **Direct Donation History**:
  - List of standalone contributions made with downloadable tax receipts.

#### 3.2.4 Winnings & Verification Portal (`/dashboard/winnings`)
- **Winnings Stat Cards**:
  - *Total Lifetime Winnings* | *Pending Verification* | *Paid Out*
- **Winnings Table**:
  - Columns: Draw Date, Matched Numbers Count (3, 4, or 5), Prize Amount, Verification Status (`Pending Proof`, `Under Review`, `Approved`, `Rejected`), Payout Status (`Unpaid`, `Paid`).
- **Proof Upload Sheet / Modal (`/dashboard/winnings/[winnerId]/verify`)**:
  - Explanatory guidelines: *"To verify your prize, upload a clear screenshot of your official golf score history (e.g. Golf Australia, USGA GHIN, WHS) confirming your 5 entered scores and dates."*
  - Drag-and-drop image upload zone (PNG, JPG, WebP up to 10MB).
  - Proof preview with re-upload option.
  - Rejection note banner (if previously rejected by admin, shows admin's reason for re-submission).
  - Submit Button: `[Submit Verification Proof]`.

---

### 3.3 Admin Control Plane

#### 3.3.1 Admin Overview (`/admin`)
- **KPI Metric Ribbon**:
  - Total Active Subscribers (MRR / ARR breakdown)
  - Total Charity Funds Generated to Date
  - Current Unclaimed Jackpot Rollover Balance
  - Pending Winner Verifications Queue Count
- **System Activity Feed**:
  - Recent score logs, subscription activations, draw executions, and winner submissions.

#### 3.3.2 Draw Simulator & Publishing Console (`/admin/draws/new`)
- **Draw Configuration Card**:
  - Target Draw Month selector (e.g. `March 2026`).
  - Algorithm Selector:
    - Option 1: **Random (Uniform Discrete 1–45)**
    - Option 2: **Score-Frequency Algorithmic (Weighted by subscriber submitted scores)**
- **Simulation Control**:
  - `[Run Simulation]` button:
    - Backend generates candidate 5 numbers.
    - Scans all active subscriber tickets.
    - Displays Simulation Results Table:
      - Drawn Numbers Display (5 glowing digits)
      - Total Active Tickets Evaluated
      - 5-Match Winners Count & Individual Payout
      - 4-Match Winners Count & Individual Payout
      - 3-Match Winners Count & Individual Payout
      - Next Month's Projected Rollover Amount
- **Publish Safeguard**:
  - Requires admin typing confirmation string (`CONFIRM PUBLISH`).
  - Action: `[Publish Official Draw]` (Locks results, generates Winner records, alerts subscribers).

#### 3.3.3 Winner Verification & Payout Manager (`/admin/winners`)
- **Filter Tabs**: `Needs Review (Pending Proof)`, `Under Review (Proof Uploaded)`, `Approved (Unpaid)`, `Completed (Paid)`, `Rejected`.
- **Winner Inspection Card**:
  - Winner details: User Name, Email, Subscription Plan, Home Club.
  - Draw details: Matched Numbers, Prize Amount, Tier.
  - Proof Preview: Side-by-side view of **User Claimed Scores** vs. **Uploaded Official Screenshot**.
  - Actions:
    - `[Approve Proof]`: Moves status to `Approved`.
    - `[Reject Proof]`: Opens dialog requesting rejection reason (notifies user).
    - `[Record Payout]`: Enter payment reference ID (e.g. Stripe Transfer ID, Bank wire ref), marking status as `Paid`.

#### 3.3.4 Charity CRUD Suite (`/admin/charities`)
- **Charity Management Table**:
  - Name, Category, Total Raised, Active Status toggle, Featured on Homepage toggle.
- **Charity Editor Form (`/admin/charities/[id]/edit`)**:
  - Fields for Name, Tagline, Description, Website, Logo URL, Banner URL, Category selector.
  - Event Builder: Add/remove upcoming Charity Golf Days (Title, Date, Location, URL).

#### 3.3.5 User Roster & Score Override (`/admin/users`)
- **User Roster Table**:
  - Name, Email, Role, Subscription Status, Current 5-Score set, Selected Charity.
- **User Inspector Modal**:
  - Ability to manually correct a fraudulent or corrupted score entry.
  - Manual subscription override for customer service escalations.

---

## 4. Modal & Interactive Dialog Tree

```
Modal Manager
├── [Auth] Forgot Password Dialog
├── [Score] Edit Score Modal (Update date/score with validation)
├── [Score] Confirm Delete Score Dialog
├── [Charity] Quick Charity Selector Modal
├── [Donation] Direct Donation Checkout Modal (Amount, Card details, Dedication)
├── [Winner] Proof Screenshot Upload Dialog
├── [Admin Draw] Simulation Confirmation Modal
├── [Admin Winner] Reject Proof Modal (Requires reason text)
└── [Admin Winner] Record Payout Modal (Payment method & transaction reference)
```

---

## 5. Responsive Breakpoint & Viewport Rules

- **Mobile Viewport (`< 768px`)**:
  - Fixed bottom navigation bar with 4 primary icons: *Home*, *Scores (5 Slots)*, *Charity*, *Winnings*.
  - Draw ticket cards stack vertically into horizontal swipeable carousels.
  - Tables collapse into card-based list items with expandable disclosure details.
- **Tablet Viewport (`768px - 1024px`)**:
  - Collapsible slim sidebar with icon tooltips.
  - 2-column grid for dashboard widgets.
- **Desktop Viewport (`> 1024px`)**:
  - Full expansive dashboard with multi-column analytical panels, persistent sidebar, and ambient glow effects.
