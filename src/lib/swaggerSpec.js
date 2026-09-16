/**
 * Complete OpenAPI 3.0 Specification for digital.HEROES
 * Incorporating all API Route Handlers and Mongoose Models
 */
export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "digital.HEROES API",
    version: "1.0.0",
    description: `
**digital.HEROES** is a subscription-driven web platform uniting golf performance tracking, transparent charity fundraising, and monthly draw-based rewards.

### Core Business Pillars
1. **Score Management**: Stableford scoring format strictly between **1 and 45**. Exactly the latest **5 scores** are retained in a rolling FIFO queue. Strictly **one score per date** per user.
2. **Charity Ecosystem**: Minimum **10%** of every subscription fee funds the subscriber's chosen verified charity, with voluntary upscaling and direct standalone donations.
3. **Monthly Draw Engine**: Two modes (**Random** vs **Score-Frequency Weighted**). Three prize tiers:
   - **Tier 1 (5 Matches)**: **40% of pool** · **Jackpot Rollover = YES**
   - **Tier 2 (4 Matches)**: **35% of pool** · Rollover = NO (Split equally)
   - **Tier 3 (3 Matches)**: **25% of pool** · Rollover = NO (Split equally)
4. **Winner Verification**: Only winners submit proof (official screenshot from GHIN / Golf Australia / WHS). 4-state state machine (\`pending_proof\` → \`proof_submitted\` → \`approved\`/\`rejected\` → \`paid\`).
    `,
    contact: {
      name: "digital.HEROES Engineering",
      url: "https://digitalheroes.co.in",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server",
    },
  ],
  tags: [
    { name: "System", description: "Health checks & diagnostics" },
    { name: "Auth", description: "Authentication & session management" },
    { name: "Scores", description: "Stableford 1-45 scoring & 5-score FIFO buffer" },
    { name: "Charities", description: "Public charity directory & event profiles" },
    { name: "Donations", description: "Direct standalone charitable giving" },
    { name: "Draws", description: "Public draw schedules & published history" },
    { name: "Winners", description: "Subscriber winnings & proof upload" },
    { name: "Subscriptions", description: "Subscription lifecycles & checkout" },
    { name: "Admin - Draws", description: "Draw simulation & official publishing" },
    { name: "Admin - Winners", description: "Proof verification queue & payout reconciliation" },
    { name: "Admin - Users", description: "Subscriber roster browsing & profile overrides" },
    { name: "Admin - Analytics", description: "Executive dashboard KPIs & financial metrics" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Pass JWT token in Authorization: Bearer <token>",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "dh_token",
        description: "HttpOnly session cookie set automatically on login/registration",
      },
    },
    schemas: {
      // 1. User Schema
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a2b3c4d5e6f7a8b9c0d1" },
          email: { type: "string", format: "email", example: "subscriber@digitalheroes.co.in" },
          firstName: { type: "string", example: "Jordan" },
          lastName: { type: "string", example: "Spieth" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
          subscriptionStatus: {
            type: "string",
            enum: ["none", "trialing", "active", "past_due", "canceled", "lapsed"],
            example: "active",
          },
          subscriptionPlan: {
            type: "string",
            enum: ["monthly", "yearly", null],
            nullable: true,
            example: "monthly",
          },
          subscriptionRenewalDate: { type: "string", format: "date-time", nullable: true },
          selectedCharityId: { type: "string", nullable: true, example: "65f1a2b3c4d5e6f7a8b9c0e2" },
          charityContributionPercent: { type: "number", minimum: 10, maximum: 100, default: 10, example: 15 },
          handicapIndex: { type: "number", nullable: true, example: 4.2 },
          homeClub: { type: "string", nullable: true, example: "Dallas National" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },

      // 2. Score Schema
      Score: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a2b3c4d5e6f7a8b9c0f3" },
          userId: { type: "string", example: "65f1a2b3c4d5e6f7a8b9c0d1" },
          score: {
            type: "integer",
            minimum: 1,
            maximum: 45,
            description: "Stableford score format (range 1-45, PRD § 05)",
            example: 38,
          },
          date: {
            type: "string",
            format: "date-time",
            description: "Normalized round date (strictly 1 score per date per user)",
            example: "2026-03-14T00:00:00.000Z",
          },
          courseName: { type: "string", example: "Pebble Beach" },
          isCurrentActive: {
            type: "boolean",
            description: "True if included in user's active 5 draw ticket pool",
            example: true,
          },
          archivedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // 3. Charity Schema
      Charity: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1a2b3c4d5e6f7a8b9c0e2" },
          name: { type: "string", example: "Veterans On The Green" },
          slug: { type: "string", example: "veterans-on-the-green" },
          tagline: { type: "string", example: "Rehabilitation through adaptive golf" },
          description: { type: "string", example: "Empowering wounded veterans through adaptive golf clinics..." },
          category: {
            type: "string",
            enum: [
              "Healthcare",
              "Youth & Education",
              "Veterans",
              "Environment",
              "Disaster Relief",
              "Community",
            ],
            example: "Veterans",
          },
          logoUrl: { type: "string", format: "uri", example: "https://images.unsplash.com/..." },
          bannerUrl: { type: "string", format: "uri", example: "https://images.unsplash.com/..." },
          websiteUrl: { type: "string", format: "uri", example: "https://veteransonthegreen.org" },
          totalFundsRaised: { type: "number", example: 24500 },
          supporterCount: { type: "number", example: 420 },
          isFeatured: { type: "boolean", example: true },
          isActive: { type: "boolean", example: true },
          events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                _id: { type: "string" },
                title: { type: "string", example: "Annual Veterans Memorial Golf Classic" },
                date: { type: "string", format: "date-time" },
                location: { type: "string", example: "Torrey Pines South, San Diego, CA" },
                description: { type: "string" },
                registrationUrl: { type: "string", format: "uri" },
              },
            },
          },
        },
      },

      // 4. Draw Schema
      Draw: {
        type: "object",
        properties: {
          _id: { type: "string" },
          drawNumber: { type: "integer", example: 101 },
          drawMonth: { type: "string", example: "2026-03" },
          drawDate: { type: "string", format: "date-time" },
          algorithmType: { type: "string", enum: ["random", "frequency_weighted"], example: "frequency_weighted" },
          status: { type: "string", enum: ["draft_simulation", "published"], example: "published" },
          drawnNumbers: {
            type: "array",
            items: { type: "integer", minimum: 1, maximum: 45 },
            minItems: 5,
            maxItems: 5,
            example: [7, 18, 24, 38, 41],
          },
          activeSubscribersCount: { type: "integer", example: 840 },
          basePrizePool: { type: "number", example: 12600 },
          jackpotRolloverIn: { type: "number", example: 1500 },
          totalPrizePool: { type: "number", example: 14100 },
          tier1Pool: { type: "number", description: "40% share (Rollover enabled)", example: 5640 },
          tier2Pool: { type: "number", description: "35% share", example: 4935 },
          tier3Pool: { type: "number", description: "25% share", example: 3525 },
          tier1WinnersCount: { type: "integer", example: 0 },
          tier2WinnersCount: { type: "integer", example: 4 },
          tier3WinnersCount: { type: "integer", example: 38 },
          tier1PayoutPerWinner: { type: "number", example: 0 },
          tier2PayoutPerWinner: { type: "number", example: 1233.75 },
          tier3PayoutPerWinner: { type: "number", example: 92.76 },
          jackpotRolloverOut: { type: "number", description: "Carried forward to next month's Tier 1 pool", example: 5640 },
        },
      },

      // 5. Winner Schema
      Winner: {
        type: "object",
        properties: {
          _id: { type: "string" },
          drawId: { type: "string" },
          userId: { type: "string" },
          tier: {
            type: "string",
            enum: ["tier_1_five_match", "tier_2_four_match", "tier_3_three_match"],
            example: "tier_3_three_match",
          },
          matchCount: { type: "integer", enum: [3, 4, 5], example: 3 },
          matchedNumbers: { type: "array", items: { type: "integer" }, example: [38, 41] },
          prizeAmount: { type: "number", example: 937.5 },
          verificationStatus: {
            type: "string",
            enum: ["pending_proof", "proof_submitted", "approved", "rejected"],
            example: "approved",
          },
          proofScreenshotUrl: { type: "string", format: "uri", nullable: true },
          proofSubmittedAt: { type: "string", format: "date-time", nullable: true },
          reviewedBy: { type: "string", nullable: true },
          reviewedAt: { type: "string", format: "date-time", nullable: true },
          rejectionReason: { type: "string", nullable: true },
          payoutStatus: { type: "string", enum: ["unpaid", "paid"], example: "paid" },
          payoutMethod: { type: "string", nullable: true, example: "Stripe Connect Transfer" },
          payoutReference: { type: "string", nullable: true, example: "TXN_STRIPE_9876543210" },
          paidAt: { type: "string", format: "date-time", nullable: true },
        },
      },

      // 6. Donation Schema
      Donation: {
        type: "object",
        properties: {
          _id: { type: "string" },
          userId: { type: "string", nullable: true },
          charityId: { type: "string" },
          amount: { type: "number", example: 75 },
          donorName: { type: "string", example: "Phil Mickelson" },
          donorEmail: { type: "string", format: "email", example: "phil@example.com" },
          paymentStatus: { type: "string", enum: ["pending", "succeeded", "failed"], example: "succeeded" },
          message: { type: "string", example: "Keep up the great work!" },
          paymentReference: { type: "string", example: "DON_1710582000000_A1B2C3" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      // Envelopes
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string", example: "Operation succeeded" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "Invalid input" },
              details: { type: "array", items: { type: "object" } },
            },
          },
        },
      },
    },
  },
  paths: {
    // System
    "/api/db-check": {
      get: {
        tags: ["System"],
        summary: "Database connectivity check",
        description: "Checks MongoDB Atlas connection status and returns active readyState.",
        responses: {
          200: {
            description: "MongoDB is connected",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
    },

    // Auth
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register new user account",
        description: "Creates account with optional charity selection and issues JWT session cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "firstName"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 6 },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  selectedCharityId: { type: "string" },
                  charityContributionPercent: { type: "number", minimum: 10, maximum: 100, default: 10 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with credentials",
        description: "Authenticates email and password, issuing an HttpOnly JWT cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Authenticated successfully" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Sign out user",
        description: "Clears session cookie.",
        responses: { 200: { description: "Signed out" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile and session",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "User profile with active scores count" },
          401: { description: "Unauthorized" },
        },
      },
    },

    // Scores (Stableford 1-45 & FIFO)
    "/api/scores": {
      get: {
        tags: ["Scores"],
        summary: "Get active 5 scores (reverse-chronological order)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Active 5 draw ticket scores" } },
      },
      post: {
        tags: ["Scores"],
        summary: "Record new Stableford score",
        description: `
Enforces all PRD § 05 rules:
- Range: 1-45 (Stableford format). Returns 422 if invalid.
- Date: Strictly one entry per date per user. Returns 409 Conflict if duplicate.
- FIFO rolling queue: If 5 scores exist, auto-archives the oldest score by date.
        `,
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["score", "date"],
                properties: {
                  score: { type: "integer", minimum: 1, maximum: 45, example: 39 },
                  date: { type: "string", format: "date", example: "2026-03-16" },
                  courseName: { type: "string", example: "Augusta National" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Score recorded; updated 5 active scores returned" },
          403: { description: "Subscription required" },
          409: { description: "Duplicate score on this date" },
          422: { description: "Score outside 1-45 range" },
        },
      },
    },
    "/api/scores/{id}": {
      patch: {
        tags: ["Scores"],
        summary: "Edit existing score or course name",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  score: { type: "integer", minimum: 1, maximum: 45 },
                  courseName: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Score updated" } },
      },
      delete: {
        tags: ["Scores"],
        summary: "Delete score entry",
        description: "Deletes score, and if in active 5, backfills from archive if available.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Score deleted" } },
      },
    },
    "/api/scores/history": {
      get: {
        tags: ["Scores"],
        summary: "Paginated score history",
        description: "Retrieves complete archive of active and historic scores for authenticated user.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "Paginated score list",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
          },
        },
      },
    },

    // Charities
    "/api/charities": {
      get: {
        tags: ["Charities"],
        summary: "List verified charities with search and category filters",
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "featured", schema: { type: "boolean" } },
        ],
        responses: { 200: { description: "List of charities" } },
      },
      post: {
        tags: ["Charities"],
        summary: "Create new charity (Admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "slug", "tagline", "description", "category", "logoUrl", "bannerUrl"],
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  tagline: { type: "string" },
                  description: { type: "string" },
                  category: { type: "string" },
                  logoUrl: { type: "string", format: "uri" },
                  bannerUrl: { type: "string", format: "uri" },
                  websiteUrl: { type: "string", format: "uri" },
                  isFeatured: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Charity created" } },
      },
    },
    "/api/charities/{slug}": {
      get: {
        tags: ["Charities"],
        summary: "Get charity profile with Charity Golf Day events",
        parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Charity details" } },
      },
      put: {
        tags: ["Charities"],
        summary: "Update charity (Admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Charity updated" } },
      },
      delete: {
        tags: ["Charities"],
        summary: "Soft delete/deactivate charity (Admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "slug", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Charity deactivated" } },
      },
    },
    "/api/charities/{id}/events": {
      post: {
        tags: ["Charities"],
        summary: "Add Charity Golf Day event (Admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "date", "location"],
                properties: {
                  title: { type: "string" },
                  date: { type: "string", format: "date-time" },
                  location: { type: "string" },
                  description: { type: "string" },
                  registrationUrl: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Event added" } },
      },
      delete: {
        tags: ["Charities"],
        summary: "Remove Charity Golf Day event (Admin only)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" } },
          { in: "query", name: "eventId", required: true, schema: { type: "string" } },
        ],
        responses: { 200: { description: "Event removed" } },
      },
    },

    // Donations
    "/api/donations": {
      post: {
        tags: ["Donations"],
        summary: "Make direct standalone donation to charity",
        description: "100% credited to the charity. Independent of subscription and gameplay.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["charityId", "amount", "donorEmail"],
                properties: {
                  charityId: { type: "string" },
                  amount: { type: "number", minimum: 1 },
                  donorName: { type: "string" },
                  donorEmail: { type: "string", format: "email" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Donation receipt" } },
      },
    },

    // Draws
    "/api/draws/upcoming": {
      get: {
        tags: ["Draws"],
        summary: "Get upcoming draw countdown and jackpot rollover stats",
        responses: { 200: { description: "Upcoming draw estimations" } },
      },
    },
    "/api/draws": {
      get: {
        tags: ["Draws"],
        summary: "Archive of published monthly draws",
        responses: { 200: { description: "Past draw records" } },
      },
    },
    "/api/draws/{id}": {
      get: {
        tags: ["Draws"],
        summary: "Get specific draw details and winners list",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Draw details and winner roster" },
          404: { description: "Draw not found" },
        },
      },
    },

    // Winners
    "/api/winners": {
      get: {
        tags: ["Winners"],
        summary: "Subscriber winnings portal",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "User winning prizes and verification status" } },
      },
    },
    "/api/winners/{winnerId}/proof": {
      post: {
        tags: ["Winners"],
        summary: "Upload official golf platform screenshot proof",
        description: "Winner submits official screenshot (GHIN/Golf Australia/WHS). Sets status to 'proof_submitted'.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "winnerId", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["proofScreenshotUrl"],
                properties: {
                  proofScreenshotUrl: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Proof uploaded" } },
      },
    },

    // Subscriptions
    "/api/subscriptions/checkout": {
      post: {
        tags: ["Subscriptions"],
        summary: "Subscribe to Monthly or Yearly plan",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["plan"],
                properties: {
                  plan: { type: "string", enum: ["monthly", "yearly"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Subscription activated" } },
      },
    },
    "/api/subscriptions/status": {
      get: {
        tags: ["Subscriptions"],
        summary: "Real-time subscription status validation (PRD § 04)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Subscription status" } },
      },
    },
    "/api/subscriptions/cancel": {
      post: {
        tags: ["Subscriptions"],
        summary: "Cancel subscription at period end (PRD § 04)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: { description: "Cancellation scheduled" },
          400: { description: "No active subscription" },
        },
      },
    },
    "/api/subscriptions/webhook": {
      post: {
        tags: ["Subscriptions"],
        summary: "Stripe webhook processor (Mock / Sandbox)",
        description: "Receives invoice and subscription lifecycle events.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: { 200: { description: "Event processed" } },
      },
    },

    // Admin Operations
    "/api/admin/draws/simulate": {
      post: {
        tags: ["Admin - Draws"],
        summary: "Simulate monthly draw (Random or Score-Frequency Weighted)",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["drawMonth", "algorithmType"],
                properties: {
                  drawMonth: { type: "string", example: "2026-03" },
                  algorithmType: { type: "string", enum: ["random", "frequency_weighted"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Dry-run simulation results" } },
      },
    },
    "/api/admin/draws/publish": {
      post: {
        tags: ["Admin - Draws"],
        summary: "Officially commit and publish monthly draw",
        description: "Requires confirmationPhrase 'CONFIRM PUBLISH'. Creates Winner records in 'pending_proof'.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["drawMonth", "algorithmType", "drawnNumbers", "confirmationPhrase"],
                properties: {
                  drawMonth: { type: "string", example: "2026-03" },
                  algorithmType: { type: "string", enum: ["random", "frequency_weighted"] },
                  drawnNumbers: { type: "array", items: { type: "integer" } },
                  confirmationPhrase: { type: "string", example: "CONFIRM PUBLISH" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Draw published" } },
      },
    },
    "/api/admin/winners": {
      get: {
        tags: ["Admin - Winners"],
        summary: "Winner verification review queue",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { in: "query", name: "verificationStatus", schema: { type: "string" } },
          { in: "query", name: "payoutStatus", schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of winner records" } },
      },
    },
    "/api/admin/winners/{winnerId}/review": {
      patch: {
        tags: ["Admin - Winners"],
        summary: "Approve or reject verification proof",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "winnerId", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: {
                  action: { type: "string", enum: ["approve", "reject"] },
                  rejectionReason: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Status updated" } },
      },
    },
    "/api/admin/winners/{winnerId}/payout": {
      patch: {
        tags: ["Admin - Winners"],
        summary: "Mark prize payout as completed",
        description: "Only approved prizes can be paid. Records transaction reference.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "winnerId", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["payoutMethod", "payoutReference"],
                properties: {
                  payoutMethod: { type: "string", example: "Stripe Connect Transfer" },
                  payoutReference: { type: "string", example: "TXN_STRIPE_9876543210" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Payout recorded" } },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Admin - Users"],
        summary: "Subscriber roster browsing",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "subscriptionStatus", schema: { type: "string" } },
          { in: "query", name: "role", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Roster of users" } },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["Admin - Users"],
        summary: "Inspect user details, score history, and winnings",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User profile and history" } },
      },
      patch: {
        tags: ["Admin - Users"],
        summary: "Admin override for subscription or user profile",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User updated" } },
      },
    },
    "/api/admin/analytics": {
      get: {
        tags: ["Admin - Analytics"],
        summary: "Platform executive KPIs and financial reports",
        description: "Returns MRR estimates, total donations, total prizes, rollover balances, and draw metrics.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: { 200: { description: "Executive KPI dashboard" } },
      },
    },
  },
};
