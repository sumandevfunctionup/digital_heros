# digital.HEROES — Project Dependency Architecture & Specification
**Document Version:** 1.0 (March 2026 Edition)  
**Classification:** Complete Dependency Roster, Purpose Audit, & Installation Guide  
**Target Environment:** Node.js `>= 20.x` · Next.js `16.3.5` · React `19.2.8` · MongoDB Atlas  

---

## 1. Executive Summary & Compatibility Architecture

The digital.HEROES platform is engineered around modern, lightweight, and high-performance packages designed to support:
1. **International Stableford Golf Scoring** (1–45 score validation, FIFO rolling buffer, strict date uniqueness).
2. **Subscription & Direct Giving Engine** (Stripe subscription lifecycles, webhook processing, direct charitable donations).
3. **Monthly Draw & Rollover Logic** (Standard Random vs. Score-Frequency Algorithmic simulations).
4. **"Feel, not Fairway" Motion Aesthetics** (Dark-mode obsidian glassmorphism, micro-animations, glowing counters, celebrating confetti).
5. **Strict Winner Verification** (Proof upload, admin inspection, payout audit trails).

> [!IMPORTANT]
> **React 19 & Next.js 16 Note**: The project runs on **React 19.2.8** and **Next.js 16.3.5**. All selected libraries are verified compatible with React 19 Server/Client Components.

---

## 2. Dependency Roster by Functional Domain

### 2.1 Core Framework & Runtime
| Package | Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `next` | `16.3.5` | Dependency | Full-stack framework (App Router, Server Components, Route Handlers). | ✅ Installed |
| `react` | `19.2.8` | Dependency | UI library supporting React 19 actions, hooks, and transitions. | ✅ Installed |
| `react-dom` | `19.2.8` | Dependency | DOM renderer for React 19. | ✅ Installed |
| `typescript` | `^5` | Dev | Type safety across schemas, API payloads, and component props. | ✅ Installed |
| `@types/node` | `^20` | Dev | Type definitions for Node.js runtime environments. | ✅ Installed |
| `@types/react` | `^19` | Dev | TypeScript definitions for React 19. | ✅ Installed |
| `@types/react-dom` | `^19` | Dev | TypeScript definitions for React DOM 19. | ✅ Installed |

---

### 2.2 Database & Data Modeling
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `mongoose` | `^9.10.1` | Dependency | MongoDB ODM. Powers models for `User`, `Score`, `Charity`, `Draw`, `Winner`, `Donation`, and enforces the compound unique index on `{ userId, date }`. | ✅ Installed |

---

### 2.3 Authentication, Security & Cryptography
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `bcryptjs` | `^2.4.3` | Dependency | Secure password hashing (salt + hash) for user registration and credential login. Zero native C++ compilation bindings required. | ✅ Installed |
| `jose` | `^5.9.6` | Dependency | High-performance, Edge-compatible JWT signing and verification. Used by Next.js middleware and API route guards for session validation. | ✅ Installed |
| `cookie` | `^1.0.2` | Dependency | Parsing and serializing HttpOnly, Secure authentication cookies across requests and route handlers. | ✅ Installed |

---

### 2.4 Data Validation & Contract Integrity
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `zod` | `^3.24.2` | Dependency | Schema validation for all API inputs: Stableford score range `[1, 45]`, date strings, registration fields, charity contribution percentage `[10, 100]`. | ✅ Installed |

---

### 2.5 Payments, Subscriptions & Webhooks
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `stripe` | `^17.7.0` | Dependency | Official Stripe Node SDK for monthly/annual recurring subscription checkout sessions, billing customer portal, and standalone direct donations. | ✅ Installed |

---

### 2.6 UI System, Icons & "Feel, not Fairway" Motion Aesthetics
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `lucide-react` | `^1.46.0` | Dependency | Modern, minimalist icon set (trophy, heart, shield, calendar, check, alert, etc.). | ✅ Installed |
| `tailwindcss` | `^4` | Dev | Utility-first CSS engine configured for dark-mode glassmorphism and modern palettes. | ✅ Installed |
| `@tailwindcss/postcss`| `^4` | Dev | PostCSS plugin for Tailwind v4 compiler. | ✅ Installed |
| `clsx` | `^2.1.1` | Dependency | Utility for constructing conditional className strings. | ✅ Installed |
| `tailwind-merge` | `^3.0.2` | Dependency | Merges Tailwind classes without style conflicts (critical for shadcn primitives). | ✅ Installed |
| `motion` | `^12.4.7` | Dependency | Modern React 19 motion engine (Framer Motion successor). Powers score slot sliding animations, glowing jackpot counters, and draw roll reveals. | ✅ Installed |
| `canvas-confetti` | `^1.9.4` | Dependency | Celebration particle bursts for winning tickets and completed charity milestones. | ✅ Installed |
| `@types/canvas-confetti` | `^1.9.0` | Dev | Type definitions for `canvas-confetti`. | ✅ Installed |
| `sonner` | `^2.0.1` | Dependency | Ultra-sleek, dark-mode toast notification manager for instant feedback on score saves, errors, and payouts. | ✅ Installed |
| `class-variance-authority` | `^0.7.1` | Dependency | Component variant orchestration for buttons, badges, and cards. | ✅ Installed |
| `@base-ui/react` | `^1.8.0` | Dependency | Accessible, unstyled UI primitives. | ✅ Installed |
| `shadcn` | `^4.21.0` | Dependency | Component scaffolding CLI and base utilities. | ✅ Installed |

---

### 2.7 Date, Time & Schedule Calculations
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `date-fns` | `^4.1.0` | Dependency | Formatting and calculating round dates, relative time (`"3 days ago"`), monthly draw countdowns, and reverse-chronological score sorting. | ✅ Installed |

---

### 2.8 Analytics & Data Visualization (Admin Control Plane)
| Package | Recommended Version | Type | Purpose & Usage in digital.HEROES | Status |
| :--- | :---: | :---: | :--- | :---: |
| `recharts` | `^2.15.1` | Dependency | Composable charting library for the Admin Dashboard: MRR growth curves, charity contribution splits, prize payout trends, and score frequency histograms. | ✅ Installed |

---

## 3. Package Grouping & One-Click Install Commands

To equip the project with all necessary packages in one command, execute the following from `digital_heros/`:

### Core Production Dependencies
```bash
npm install bcryptjs jose cookie zod stripe clsx tailwind-merge motion canvas-confetti sonner date-fns recharts
```

### Development Dependencies & Typings
```bash
npm install -D @types/bcryptjs @types/canvas-confetti
```

---

## 4. Environment Variables Mapping to Dependencies

Each integrated package connects to specific keys in [.env](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/.env):

| Environment Variable | Target Package / Purpose | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongoose` | `mongodb+srv://user:pass@cluster.mongodb.net/digital_heroes` |
| `JWT_SECRET` | `jose` / authentication | `super_secure_random_64_char_key` |
| `NEXT_PUBLIC_APP_URL` | Application root / Redirects | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | `stripe` backend SDK | `sk_test_51...` |
| `STRIPE_WEBHOOK_SECRET` | `stripe` webhook verification | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Frontend Stripe Elements | `pk_test_51...` |
| `NODE_ENV` | Next.js runtime environment | `development` / `production` |

---

## 5. Dependency Audit & Health Check

### Currently Installed:
- Next.js `16.3.5` + React `19.2.8`
- Tailwind CSS `v4` with PostCSS
- `mongoose` `^9.10.1` (MongoDB connection active and functional)
- `lucide-react` `^1.46.0`
- `class-variance-authority`, `@base-ui/react`, `shadcn`

### Packages to Add for Complete PRD Execution:
1. **Security & Auth**: `bcryptjs`, `jose`, `cookie`
2. **Validation**: `zod`
3. **Billing**: `stripe`
4. **Motion & UI Polish**: `motion`, `canvas-confetti`, `sonner`, `clsx`, `tailwind-merge`
5. **Time & Visuals**: `date-fns`, `recharts`
