# digital.HEROES — Complete REST API Tree & Endpoint Specification
**Document Version:** 1.0 (March 2026 Edition)  
**Classification:** Backend Route Handlers & Integration Contract  
**Protocol:** REST over JSON / Next.js 16 Route Handlers (`src/app/api/...`)  

---

## 1. Global API Standards & Conventions

### 1.1 Base URL & Response Envelope
All API endpoints reside under the `/api` prefix. Standard JSON responses adhere to the unified envelope:

```typescript
// Success Response Envelope
{
  "success": true,
  "data": { ... },
  "message": "Human readable confirmation (optional)",
  "meta": { "page": 1, "total": 100 } // When paginated
}

// Error Response Envelope
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "User-friendly error explanation",
    "details": [ ... ] // Validation error array (optional)
  }
}
```

### 1.2 HTTP Status Code Matrix
- `200 OK`: Request succeeded with payload.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: Malformed JSON or schema validation failure.
- `401 Unauthorized`: Missing or expired authentication token.
- `403 Forbidden`: Authenticated, but lacking role (`admin`) or subscription permission.
- `404 Not Found`: Resource does not exist.
- `409 Conflict`: Business rule violation (e.g. duplicate score on the same date).
- `422 Unprocessable Entity`: Value outside logical bounds (e.g. score `< 1` or `> 45`).
- `500 Internal Server Error`: Unhandled database or server exception.

---

## 2. API Endpoint Hierarchy (Directory Map)

```
src/app/api/
├── auth/
│   ├── register/route.js              // POST: User registration & charity pre-selection
│   ├── login/route.js                 // POST: Credential verification & JWT issuance
│   ├── logout/route.js                // POST: Invalidate cookie/session
│   └── me/route.js                    // GET: Retrieve current user profile & subscription
│
├── subscriptions/
│   ├── checkout/route.js              // POST: Create checkout session (Stripe / Mock)
│   ├── status/route.js                // GET: Real-time subscription state validation
│   ├── cancel/route.js                // POST: Initiate cancellation at period end
│   └── webhook/route.js               // POST: Stripe webhook listener
│
├── scores/
│   ├── route.js                       // GET: Active 5 scores | POST: Add new score (FIFO + Date check)
│   ├── [id]/route.js                  // PUT/PATCH: Edit score | DELETE: Remove score
│   └── history/route.js               // GET: All historic scores (paginated)
│
├── charities/
│   ├── route.js                       // GET: List/search charities (Public) | POST: Create charity (Admin)
│   ├── [slug]/route.js                // GET: Charity detail profile by slug
│   └── [id]/route.js                  // PUT: Update charity (Admin) | DELETE: Archive charity (Admin)
│
├── donations/
│   └── route.js                       // POST: Process direct standalone charitable donation
│
├── draws/
│   ├── route.js                       // GET: Archive of published draws (Public)
│   ├── upcoming/route.js              // GET: Next draw date, countdown, and current prize pool
│   └── [id]/route.js                  // GET: Specific draw results and winning numbers
│
├── winners/
│   ├── route.js                       // GET: My winning records (Subscriber)
│   └── [winnerId]/proof/route.js      // POST: Upload score verification screenshot
│
└── admin/                             // Administrator Operations (Strict Role Guard)
    ├── analytics/route.js             // GET: High-level KPI metrics, MRR, donations, pool totals
    ├── users/
    │   ├── route.js                   // GET: Paginated subscriber list with search/filter
    │   └── [id]/route.js              // GET: User detail | PATCH: Override status/scores
    ├── draws/
    │   ├── simulate/route.js          // POST: Run draw simulation (Random or Frequency)
    │   └── publish/route.js           // POST: Commit & publish official monthly draw
    ├── winners/
    │   ├── route.js                   // GET: Verification queue
    │   ├── [winnerId]/review/route.js // PATCH: Approve or Reject proof submission
    │   └── [winnerId]/payout/route.js // PATCH: Mark payout as paid with reference ID
    └── charities/
        └── [id]/events/route.js       // POST/DELETE: Add/remove Charity Golf Day events
```

---

## 3. Detailed Endpoint Specifications

### 3.1 Authentication Endpoints (`/api/auth`)

#### 3.1.1 POST `/api/auth/register`
- **Access**: Public
- **Description**: Creates a new user account with selected initial charity recipient.
- **Request Body**:
  ```json
  {
    "email": "player@example.com",
    "password": "SecurePassword123!",
    "firstName": "Alex",
    "lastName": "Morgan",
    "selectedCharityId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "charityContributionPercent": 15
  }
  ```
- **Validation**:
  - `email`: Valid email format, unique.
  - `password`: Minimum 8 characters.
  - `charityContributionPercent`: Integer between 10 and 100 (Default: 10).
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "65f1a2b3c4d5e6f7a8b9c0d2",
        "email": "player@example.com",
        "firstName": "Alex",
        "lastName": "Morgan",
        "role": "user",
        "subscriptionStatus": "none",
        "selectedCharityId": "65f1a2b3c4d5e6f7a8b9c0d1"
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    },
    "message": "Registration successful. Please subscribe to enter monthly draws."
  }
  ```

#### 3.1.2 POST `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "player@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "65f1a2b3c4d5e6f7a8b9c0d2",
        "email": "player@example.com",
        "role": "user",
        "subscriptionStatus": "active",
        "subscriptionPlan": "monthly"
      }
    }
  }
  ```
- **Side Effect**: Sets HttpOnly session cookie `token`.

#### 3.1.3 GET `/api/auth/me`
- **Access**: Authenticated (User or Admin)
- **Response (200 OK)**: Current authenticated user profile, active subscription status, selected charity details, and count of active scores.

---

### 3.2 Subscription Endpoints (`/api/subscriptions`)

#### 3.2.1 POST `/api/subscriptions/checkout`
- **Access**: Authenticated User
- **Request Body**:
  ```json
  {
    "plan": "monthly", // "monthly" | "yearly"
    "successUrl": "http://localhost:3000/dashboard?subscribed=true",
    "cancelUrl": "http://localhost:3000/subscribe"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..." // Or mock direct activation
    }
  }
  ```

#### 3.2.2 GET `/api/subscriptions/status`
- **Access**: Authenticated User
- **Description**: Real-time evaluation of subscription validity, used by dashboard guards.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "hasActiveSubscription": true,
      "status": "active",
      "plan": "yearly",
      "renewalDate": "2027-03-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false
    }
  }
  ```

---

### 3.3 Score Management Endpoints (`/api/scores`)

#### 3.3.1 GET `/api/scores`
- **Access**: Active Subscriber or Admin
- **Description**: Returns the user's **current active 5 scores** (ordered reverse chronologically).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "scores": [
        { "_id": "score1", "score": 41, "date": "2026-03-14", "courseName": "St. Andrews Old" },
        { "_id": "score2", "score": 38, "date": "2026-03-10", "courseName": "Pebble Beach" },
        { "_id": "score3", "score": 35, "date": "2026-03-05", "courseName": "Royal Melbourne" },
        { "_id": "score4", "score": 42, "date": "2026-02-28", "courseName": "Kingston Heath" },
        { "_id": "score5", "score": 36, "date": "2026-02-20", "courseName": "Victoria Golf Club" }
      ],
      "activeCount": 5,
      "isTicketComplete": true
    }
  }
  ```

#### 3.3.2 POST `/api/scores`
- **Access**: Active Subscriber
- **Description**: Submits a new golf score. Enforces:
  1. Score range check ($1 \le \text{score} \le 45$).
  2. Strict unique date check per user (rejects duplicates for the same date).
  3. Automatic FIFO rolling logic: if 5 scores already exist, archives the oldest score by date.
- **Request Body**:
  ```json
  {
    "score": 39,
    "date": "2026-03-15",
    "courseName": "Augusta National"
  }
  ```
- **Responses**:
  - `201 Created`: Score recorded; returns new set of 5 active scores.
  - `409 Conflict`: Score already logged for this date.
    ```json
    {
      "success": false,
      "error": {
        "code": "DUPLICATE_DATE_ENTRY",
        "message": "A score entry already exists for date 2026-03-15. Duplicate entries on the same date are not allowed. Please edit your existing entry."
      }
    }
    ```
  - `422 Unprocessable Entity`: Score `< 1` or `> 45`.

#### 3.3.3 PATCH `/api/scores/[id]`
- **Access**: Active Subscriber (Owner) or Admin
- **Description**: Updates score value or course name for an existing entry. Changing date triggers unique date validation.
- **Request Body**:
  ```json
  {
    "score": 40,
    "courseName": "Augusta National (Revised)"
  }
  ```

#### 3.3.4 DELETE `/api/scores/[id]`
- **Access**: Active Subscriber (Owner) or Admin
- **Description**: Deletes a score entry. If historic scores exist in archive, system can optionally backfill the 5th slot with the most recent archived round.

---

### 3.4 Charity Endpoints (`/api/charities`)

#### 3.4.1 GET `/api/charities`
- **Access**: Public
- **Query Parameters**:
  - `search`: Case-insensitive string search on name and description.
  - `category`: Filter by category (`Healthcare`, `Veterans`, `Youth & Education`, etc.).
  - `featured`: Filter boolean (`true` / `false`).
- **Response (200 OK)**: Array of charity summary cards with total funds raised and upcoming event counts.

#### 3.4.2 GET `/api/charities/[slug]`
- **Access**: Public
- **Description**: Detailed charity profile with upcoming Charity Golf Day events, story, and impact metrics.

#### 3.4.3 POST `/api/charities` (Admin Only)
- **Access**: Administrator
- **Request Body**:
  ```json
  {
    "name": "Veterans Golf Foundation",
    "tagline": "Rehabilitation through the game of golf",
    "description": "Providing physical and emotional healing programs...",
    "category": "Veterans",
    "logoUrl": "https://...",
    "bannerUrl": "https://...",
    "websiteUrl": "https://veteransgolf.org",
    "isFeatured": true
  }
  ```

---

### 3.5 Direct Donations (`/api/donations`)

#### 3.5.1 POST `/api/donations`
- **Access**: Public or Authenticated
- **Description**: Direct charitable contribution not tied to subscription or draw entries.
- **Request Body**:
  ```json
  {
    "charityId": "65f1a2b3c4d5e6f7a8b9c0d1",
    "amount": 50.00,
    "donorName": "Jane Doe",
    "donorEmail": "jane@example.com",
    "message": "In honor of local veterans"
  }
  ```
- **Response (201 Created)**: Returns payment intent and direct contribution receipt.

---

### 3.6 Draw & Reward Endpoints (`/api/draws` & `/api/admin/draws`)

#### 3.6.1 GET `/api/draws/upcoming`
- **Access**: Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "nextDrawDate": "2026-04-01T00:00:00.000Z",
      "countdownSeconds": 1264500,
      "estimatedPrizePool": 15400.00,
      "jackpotRolloverCarriedOver": 4200.00,
      "tier1EstimatedJackpot": 6160.00, // 40%
      "tier2EstimatedPool": 5390.00,    // 35%
      "tier3EstimatedPool": 3850.00     // 25%
    }
  }
  ```

#### 3.6.2 POST `/api/admin/draws/simulate` (Admin Only)
- **Access**: Administrator
- **Description**: Executes the simulation engine without persisting official results.
- **Request Body**:
  ```json
  {
    "drawMonth": "2026-03",
    "algorithmType": "frequency_weighted" // or "random"
  }
  ```
- **Simulation Computation**:
  1. Identifies all subscribers with `subscriptionStatus === 'active'` and exactly 5 active scores.
  2. Generates 5 unique numbers (uniform random or weighted by score frequency).
  3. Matches drawn numbers against each subscriber's 5 scores.
  4. Categorizes into Tier 1 (5/5), Tier 2 (4/5), and Tier 3 (3/5).
  5. Computes individual payouts per tier based on formula:
     $$\text{Payout}_T = \frac{\text{Tier Pool}}{\text{Winners Count}_T}$$
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "simulatedNumbers": [7, 18, 24, 36, 42],
      "activeTicketsScanned": 840,
      "totalPrizePool": 12500.00,
      "tier1": { "winnersCount": 1, "payoutPerWinner": 5000.00, "rollover": 0 },
      "tier2": { "winnersCount": 4, "payoutPerWinner": 1093.75 },
      "tier3": { "winnersCount": 38, "payoutPerWinner": 82.23 },
      "nextMonthRolloverProjected": 0.00
    }
  }
  ```

#### 3.6.3 POST `/api/admin/draws/publish` (Admin Only)
- **Access**: Administrator
- **Description**: Immutably publishes official monthly draw, creates records in `Draw` and `Winner` collections, and flags winners for verification.
- **Request Body**:
  ```json
  {
    "drawMonth": "2026-03",
    "algorithmType": "frequency_weighted",
    "drawnNumbers": [7, 18, 24, 36, 42],
    "confirmationPhrase": "CONFIRM PUBLISH"
  }
  ```
- **Response (201 Created)**: Returns finalized draw record and created winner IDs.

---

### 3.7 Winner Verification & Payout Endpoints (`/api/winners` & `/api/admin/winners`)

#### 3.7.1 GET `/api/winners`
- **Access**: Authenticated Subscriber
- **Description**: Returns all winning instances for the logged-in user.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "winnings": [
        {
          "_id": "win_101",
          "drawNumber": 101,
          "tier": "tier_2_four_match",
          "matchedNumbers": [7, 18, 36, 42],
          "prizeAmount": 1093.75,
          "verificationStatus": "pending_proof",
          "payoutStatus": "unpaid",
          "proofScreenshotUrl": null
        }
      ]
    }
  }
  ```

#### 3.7.2 POST `/api/winners/[winnerId]/proof`
- **Access**: Winner User Only
- **Description**: Uploads screenshot proof from official golf platform.
- **Request Body (FormData or JSON with image URL/Base64)**:
  ```json
  {
    "screenshotUrl": "https://storage.digitalheroes.co.in/proofs/win_101.png"
  }
  ```
- **Response (200 OK)**: Status updated to `proof_submitted`.

#### 3.7.3 PATCH `/api/admin/winners/[winnerId]/review` (Admin Only)
- **Access**: Administrator
- **Description**: Approves or rejects winner verification submission.
- **Request Body**:
  ```json
  {
    "action": "approve" // or "reject"
    // "rejectionReason": "Score on 2026-03-10 shows 34 on GHIN, but 38 was submitted." (required if action is reject)
  }
  ```

#### 3.7.4 PATCH `/api/admin/winners/[winnerId]/payout` (Admin Only)
- **Access**: Administrator
- **Description**: Marks payout as completed with payment reference.
- **Request Body**:
  ```json
  {
    "payoutMethod": "Stripe Connect / Direct Wire",
    "payoutReference": "TXN_987654321_DH"
  }
  ```
- **Response (200 OK)**: Winner status updated to `paid` with `paidAt` timestamp.

---

### 3.8 Admin Reporting & Analytics (`/api/admin/analytics`)

#### 3.8.1 GET `/api/admin/analytics`
- **Access**: Administrator
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "users": { "total": 1250, "activeSubscribers": 980, "churnRatePercent": 2.1 },
      "financials": {
        "monthlyRecurringRevenue": 24500.00,
        "totalCharityFundsDistributed": 48200.00,
        "totalPrizesAwarded": 128500.00,
        "currentJackpotRollover": 8400.00
      },
      "drawStats": {
        "totalDrawsConducted": 14,
        "averageWinnersPerDraw": 42
      }
    }
  }
  ```
