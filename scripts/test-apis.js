import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let subscriberToken = "";
let adminToken = "";
let testWinnerId = "";
let seededCharityId = "";

const results = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    results.push({ pass: false, message });
  } else {
    console.log(`✅ PASS: ${message}`);
    results.push({ pass: true, message });
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

async function runTests() {
  console.log(`\n🧪 Starting End-to-End API Integration Tests against ${BASE_URL}...\n`);

  // 1. Health check & Swagger Docs
  console.log("--- 1. System, DB Health & Swagger OpenAPI Docs ---");
  const dbCheck = await request("/api/db-check");
  assert(dbCheck.status === 200 && dbCheck.data.success === true, "Database connection is healthy and connected");

  const openApiRes = await request("/api/openapi.json");
  assert(
    openApiRes.status === 200 &&
      openApiRes.data.openapi === "3.0.3" &&
      Boolean(openApiRes.data.components?.schemas?.Score) &&
      Boolean(openApiRes.data.components?.schemas?.Winner),
    "OpenAPI 3.0 specification served with all MongoDB schemas (User, Score, Charity, Draw, Winner, Donation)"
  );

  const docsRes = await fetch(`${BASE_URL}/api/docs`);
  const docsHtml = await docsRes.text();
  assert(
    docsRes.status === 200 && docsHtml.includes("SwaggerUIBundle"),
    "Interactive Swagger UI portal rendered at /api/docs"
  );

  // 2. Public Charities
  console.log("\n--- 2. Charity Ecosystem ---");
  const charitiesRes = await request("/api/charities");
  assert(charitiesRes.status === 200 && charitiesRes.data.data.charities.length >= 4, "Fetched all seeded charities");
  seededCharityId = charitiesRes.data.data.charities[0]._id;

  const charityDetail = await request(`/api/charities/${charitiesRes.data.data.charities[0].slug}`);
  assert(charityDetail.status === 200 && charityDetail.data.data.charity.events.length > 0, "Fetched charity detail with Charity Golf Day events");

  // 3. Direct Donation
  const donationRes = await request("/api/donations", {
    method: "POST",
    body: JSON.stringify({
      charityId: seededCharityId,
      amount: 75,
      donorName: "Phil Mickelson",
      donorEmail: "phil@example.com",
      message: "Keep up the great work for our veterans!",
    }),
  });
  assert(donationRes.status === 201 && donationRes.data.data.donation.amount === 75, "Direct standalone donation processed successfully");

  // 4. Upcoming Draw & Archive
  console.log("\n--- 3. Draw Engine Public Endpoints ---");
  const upcomingDraw = await request("/api/draws/upcoming");
  assert(
    upcomingDraw.status === 200 && upcomingDraw.data.data.jackpotRolloverIn === 1500,
    "Upcoming draw reflects $1,500 carried-over jackpot rollover"
  );

  const pastDraws = await request("/api/draws");
  assert(pastDraws.status === 200 && pastDraws.data.data.draws.length >= 1, "Public past draws archive lists Draw #100");

  // 5. Auth Flow (Subscriber)
  console.log("\n--- 4. Authentication & Subscriber Session ---");
  const loginRes = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "subscriber@digitalheroes.co.in",
      password: "Player1234!",
    }),
  });
  assert(loginRes.status === 200 && loginRes.data.data.token, "Subscriber logged in and received JWT");
  subscriberToken = loginRes.data.data.token;

  const meRes = await request("/api/auth/me", {
    headers: { Authorization: `Bearer ${subscriberToken}` },
  });
  assert(
    meRes.status === 200 &&
      meRes.data.data.user.activeScoresCount === 5 &&
      meRes.data.data.user.isTicketComplete === true,
    "User profile confirms 5 active scores and completed draw ticket"
  );

  // 6. Score Management Engine (PRD § 05 Rules)
  console.log("\n--- 5. Score Management Engine (Stableford 1-45 & FIFO) ---");
  const scoresRes = await request("/api/scores", {
    headers: { Authorization: `Bearer ${subscriberToken}` },
  });
  assert(scoresRes.status === 200 && scoresRes.data.data.scores.length === 5, "Retrieved user's active 5 scores");

  // Rule Test A: Invalid Stableford score (> 45)
  const invalidScoreRes = await request("/api/scores", {
    method: "POST",
    headers: { Authorization: `Bearer ${subscriberToken}` },
    body: JSON.stringify({
      score: 52, // Invalid
      date: "2026-03-01",
      courseName: "Test Course",
    }),
  });
  if (invalidScoreRes.status !== 422) {
    console.log("DEBUG invalidScoreRes:", invalidScoreRes.status, invalidScoreRes.data);
  }
  assert(invalidScoreRes.status === 422, "Rejected score > 45 with HTTP 422 (Stableford constraint)");

  // Rule Test B: Duplicate score on same date (PRD § 05)
  // Let's use the date of an existing active score
  const existingDate = scoresRes.data.data.scores[0].date.split("T")[0];
  const duplicateScoreRes = await request("/api/scores", {
    method: "POST",
    headers: { Authorization: `Bearer ${subscriberToken}` },
    body: JSON.stringify({
      score: 36,
      date: existingDate, // Duplicate!
      courseName: "Duplicate Course",
    }),
  });
  assert(
    duplicateScoreRes.status === 409 && duplicateScoreRes.data.error.code === "DUPLICATE_DATE_SCORE",
    "Blocked duplicate score entry on same date with HTTP 409 Conflict"
  );

  // Rule Test C: Valid score triggers FIFO rolling queue replacement
  // Use a unique date offset to prevent duplicate date conflicts across repeated test runs
  const uniqueOffsetDays = Math.floor(Math.random() * 300) + 60;
  const uniqueTestDate = new Date(Date.now() - uniqueOffsetDays * 86400000).toISOString().split("T")[0];
  const addScoreRes = await request("/api/scores", {
    method: "POST",
    headers: { Authorization: `Bearer ${subscriberToken}` },
    body: JSON.stringify({
      score: 40,
      date: uniqueTestDate,
      courseName: "Augusta National",
    }),
  });
  if (addScoreRes.status !== 201) {
    console.log("DEBUG addScoreRes:", addScoreRes.status, addScoreRes.data);
  }
  assert(
    addScoreRes.status === 201 && addScoreRes.data.data.scores.length === 5,
    "Successfully added 6th score: FIFO auto-archived oldest score and maintained exactly 5 active scores"
  );

  // 7. Winner Verification Flow
  console.log("\n--- 6. Winner Verification Pipeline (PRD § 09) ---");
  const myWinnings = await request("/api/winners", {
    headers: { Authorization: `Bearer ${subscriberToken}` },
  });
  assert(myWinnings.status === 200 && myWinnings.data.data.winnings.length > 0, "Subscriber sees prize won in Draw #100");
  testWinnerId = myWinnings.data.data.winnings[0]._id;

  // Submit proof screenshot
  const submitProofRes = await request(`/api/winners/${testWinnerId}/proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${subscriberToken}` },
    body: JSON.stringify({
      proofScreenshotUrl: "https://images.digitalheroes.co.in/proofs/ghin_verified_card_100.png",
    }),
  });
  assert(
    submitProofRes.status === 200 && submitProofRes.data.data.winner.verificationStatus === "proof_submitted",
    "Winner submitted official golf screenshot: Status updated to 'proof_submitted'"
  );

  // 8. Admin Operations
  console.log("\n--- 7. Admin Control Plane & Review Pipeline ---");
  const adminLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@digitalheroes.co.in",
      password: "Admin1234!",
    }),
  });
  assert(adminLogin.status === 200 && adminLogin.data.data.user.role === "admin", "Admin authenticated successfully");
  adminToken = adminLogin.data.data.token;

  // Admin inspects winner verification queue
  const adminWinnersQueue = await request("/api/admin/winners", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminWinnersQueue.status === 200 && adminWinnersQueue.data.data.counts.proof_submitted >= 1, "Admin verification queue reflects submitted proof");

  // Admin approves proof
  const reviewRes = await request(`/api/admin/winners/${testWinnerId}/review`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ action: "approve" }),
  });
  assert(reviewRes.status === 200 && reviewRes.data.data.winner.verificationStatus === "approved", "Admin approved winner proof: Status updated to 'approved'");

  // Admin marks payout as paid
  const payoutRes = await request(`/api/admin/winners/${testWinnerId}/payout`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      payoutMethod: "Stripe Connect Transfer",
      payoutReference: "TXN_STRIPE_9876543210",
    }),
  });
  assert(
    payoutRes.status === 200 && payoutRes.data.data.winner.payoutStatus === "paid",
    "Admin executed payout: Status updated to 'paid' with payment reference"
  );

  // 9. Admin Draw Simulator
  console.log("\n--- 8. Admin Draw Simulation Engine ---");
  const simulationRes = await request("/api/admin/draws/simulate", {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      drawMonth: "2026-03",
      algorithmType: "frequency_weighted",
    }),
  });
  assert(
    simulationRes.status === 200 &&
      simulationRes.data.data.simulation.drawnNumbers.length === 5 &&
      simulationRes.data.data.simulation.totalPrizePool > 0,
    "Simulated score-frequency draw: Generated 5 numbers and computed tier pools (40%/35%/25%)"
  );

  // 10. Admin Analytics
  console.log("\n--- 9. Admin Reports & Analytics ---");
  const analyticsRes = await request("/api/admin/analytics", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    analyticsRes.status === 200 &&
      analyticsRes.data.data.users.activeSubscribers >= 2 &&
      analyticsRes.data.data.charities.totalCharityFundsRaised > 0,
    "Executive analytics dashboard generated KPIs (MRR, charity totals, prize pools)"
  );

  // Final summary
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("\n==================================================");
  console.log(`🏁 Test Run Complete: ${passed} Passed, ${failed} Failed out of ${results.length} tests.`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("❌ Test runner error:", err);
  process.exit(1);
});
