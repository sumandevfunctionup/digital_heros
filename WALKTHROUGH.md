# Walkthrough — digital.HEROES Complete Backend API Suite

The complete backend API architecture for **digital.HEROES** has been implemented, connected to MongoDB Atlas, seeded with realistic platform data, and verified with **20/20 automated integration tests**.

---

## 1. Summary of Deliverables

### A. Mongoose Data Models ([src/models/](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/))
* **[User.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/User.js)**: Roles (`user`, `admin`), subscription lifecycles, and charity allocation preference (minimum 10%).
* **[Score.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/Score.js)**: Stableford format integer validation ($1 \le \text{score} \le 45$), `isCurrentActive` flag, and **compound unique index** on `{ userId: 1, date: 1 }` preventing duplicate entries on the same date.
* **[Charity.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/Charity.js)**: Categories, impact metrics, fundraising counters, and upcoming **Charity Golf Day events**.
* **[Draw.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/Draw.js)**: Monthly draw results, 5 drawn numbers, pool tier breakdown (40% / 35% / 25%), and jackpot rollover tracking.
* **[Winner.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/Winner.js)**: 4-stage verification and payout pipeline (`pending_proof` $\to$ `proof_submitted` $\to$ `approved` / `rejected` $\to$ `paid`).
* **[Donation.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/models/Donation.js)**: Direct standalone charitable giving records.

---

### B. Core Engines & Security ([src/lib/](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/lib/))
* **[auth.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/lib/auth.js)**: Edge-compatible JWT signing and verification via `jose`, password hashing via `bcryptjs`, and RBAC middleware guards:
  * `requireAuth`: Validates session cookie or Bearer token.
  * `requireAdmin`: Enforces administrative privilege.
  * `requireActiveSubscriber`: Enforces real-time subscription access validation.
* **[validators.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/lib/validators.js)**: Zod schemas and `formatZodError` for input validation.
* **[drawEngine.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/lib/drawEngine.js)**:
  * **Random Mode**: Uniform sampling of 5 unique numbers (1–45).
  * **Score-Frequency Algorithmic Mode**: Frequency-weighted sampling based on actual scores from active subscribers with Laplace smoothing.
  * **Prize Pool Tiers**: 40% Tier 1 (Rollover enabled), 35% Tier 2, 25% Tier 3, equal split for ties, and rollover accumulation.

---

### C. Route Handlers ([src/app/api/](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/app/api/))
| Method | Endpoint | Access | Function |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Register user with charity selection and issue JWT |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and issue session |
| `POST` | `/api/auth/logout` | Public | Invalidate auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Return profile, charity, and 5-score ticket completion status |
| `GET` | `/api/scores` | Subscriber | Fetch active 5 scores (reverse-chronological order) |
| `POST` | `/api/scores` | Subscriber | Record score: validates 1–45, enforces 1/date, rolls FIFO |
| `PATCH` | `/api/scores/[id]` | Owner / Admin | Edit score or course name |
| `DELETE` | `/api/scores/[id]` | Owner / Admin | Delete score with archive backfill |
| `GET` | `/api/charities` | Public | List charities with category filter and search |
| `GET` | `/api/charities/[slug]` | Public | Detail profile with Charity Golf Day events |
| `POST` | `/api/charities` | Admin | Create charity listing |
| `POST` | `/api/donations` | Public / User | Process direct standalone charity donation |
| `GET` | `/api/draws/upcoming` | Public | Return next draw countdown, estimated pool, and rollover |
| `GET` | `/api/draws` | Public | Archive of published historical draws |
| `POST` | `/api/admin/draws/simulate`| Admin | Dry-run simulation (Random or Frequency Weighted) |
| `POST` | `/api/admin/draws/publish` | Admin | Officially publish draw and create winner records |
| `GET` | `/api/winners` | Subscriber | View my winning prizes and claim status |
| `POST` | `/api/winners/[id]/proof` | Winner | Submit official golf screenshot proof |
| `GET` | `/api/admin/winners` | Admin | Winner review queue with status breakdown |
| `PATCH` | `/api/admin/winners/[id]/review` | Admin | Approve or reject verification proof |
| `PATCH` | `/api/admin/winners/[id]/payout` | Admin | Mark payout completed with reference |
| `POST` | `/api/subscriptions/checkout` | User | Subscribe to Monthly or Yearly plan |
| `GET` | `/api/subscriptions/status` | User | Real-time subscription state check |
| `GET` | `/api/admin/users` | Admin | Paginated subscriber roster with search |
| `PATCH` | `/api/admin/users/[id]` | Admin | Override subscription or user profile |
| `GET` | `/api/admin/analytics` | Admin | Executive dashboard KPIs (MRR, donations, pool totals) |
| `GET` | `/api/openapi.json` | Public | Complete OpenAPI 3.0 JSON specification |
| `GET` | `/api/docs` | Public | Interactive dark-mode Swagger UI documentation portal |
| `GET` | `/docs` | Public | Next.js App Router Swagger UI page |

---

## 2. Interactive Swagger UI & OpenAPI Specification

We have integrated full **Swagger / OpenAPI 3.0** documentation covering every API route handler and MongoDB schema:

* **OpenAPI 3.0 Specification**: [src/lib/swaggerSpec.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/src/lib/swaggerSpec.js)
  * Exhaustively defines all schemas (`User`, `Score`, `Charity`, `Draw`, `Winner`, `Donation`, response envelopes).
  * Defines all paths, parameters, request bodies, status codes, and security schemes (`bearerAuth` and `cookieAuth`).
* **Endpoints**:
  * `http://localhost:3000/api/docs`: Interactive, dark-mode Swagger UI portal.
  * `http://localhost:3000/docs`: App Router client page embedding Swagger UI.
  * `http://localhost:3000/api/openapi.json`: Raw OpenAPI 3.0 JSON spec export for tooling (Postman, Insomnia, Swagger Codegen).

---

## 3. Verification & Automated Test Results

The test suite in [scripts/test-apis.js](file:///home/suman/Desktop/workplace/digital_heros/digital_heros/scripts/test-apis.js) was executed against the live server:

```
🧪 Starting End-to-End API Integration Tests against http://localhost:3000...

--- 1. System, DB Health & Swagger OpenAPI Docs ---
✅ PASS: Database connection is healthy and connected
✅ PASS: OpenAPI 3.0 specification served with all MongoDB schemas (User, Score, Charity, Draw, Winner, Donation)
✅ PASS: Interactive Swagger UI portal rendered at /api/docs

--- 2. Charity Ecosystem ---
✅ PASS: Fetched all seeded charities
✅ PASS: Fetched charity detail with Charity Golf Day events
✅ PASS: Direct standalone donation processed successfully

--- 3. Draw Engine Public Endpoints ---
✅ PASS: Upcoming draw reflects $1,500 carried-over jackpot rollover
✅ PASS: Public past draws archive lists Draw #100

--- 4. Authentication & Subscriber Session ---
✅ PASS: Subscriber logged in and received JWT
✅ PASS: User profile confirms 5 active scores and completed draw ticket

--- 5. Score Management Engine (Stableford 1-45 & FIFO) ---
✅ PASS: Retrieved user's active 5 scores
✅ PASS: Rejected score > 45 with HTTP 422 (Stableford constraint)
✅ PASS: Blocked duplicate score entry on same date with HTTP 409 Conflict
✅ PASS: Successfully added 6th score: FIFO auto-archived oldest score and maintained exactly 5 active scores

--- 6. Winner Verification Pipeline (PRD § 09) ---
✅ PASS: Subscriber sees prize won in Draw #100
✅ PASS: Winner submitted official golf screenshot: Status updated to 'proof_submitted'

--- 7. Admin Control Plane & Review Pipeline ---
✅ PASS: Admin authenticated successfully
✅ PASS: Admin verification queue reflects submitted proof
✅ PASS: Admin approved winner proof: Status updated to 'approved'
✅ PASS: Admin executed payout: Status updated to 'paid' with payment reference

--- 8. Admin Draw Simulation Engine ---
✅ PASS: Simulated score-frequency draw: Generated 5 numbers and computed tier pools (40%/35%/25%)

--- 9. Admin Reports & Analytics ---
✅ PASS: Executive analytics dashboard generated KPIs (MRR, charity totals, prize pools)

==================================================
🏁 Test Run Complete: 22 Passed, 0 Failed out of 22 tests.
==================================================
```

---

## 3. Seeded Accounts for Testing

| Account | Email | Password | Role / State |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@digitalheroes.co.in` | `Admin1234!` | Full control plane access |
| **Active Subscriber 1** | `subscriber@digitalheroes.co.in` | `Player1234!` | Active monthly plan · 5 scores · Prize winner in Draw #100 |
| **Active Subscriber 2** | `golfer@digitalheroes.co.in` | `Player1234!` | Active annual plan · 5 scores logged |
