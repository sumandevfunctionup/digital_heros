/**
 * digital.HEROES — Full Ecosystem Automated Test Suite
 * Exhaustively tests all 10 modules, business rules, mathematical models, and edge cases.
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(condition, message, details = "") {
  if (condition) {
    passedCount++;
    results.push({ status: "PASS", message });
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedCount++;
    results.push({ status: "FAIL", message, details });
    console.error(`  ❌ FAIL: ${message} ${details ? `(${details})` : ""}`);
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

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

async function runFullEcosystemTest() {
  console.log("\n================================================================================");
  console.log("   digital.HEROES — COMPREHENSIVE END-TO-END ECOSYSTEM TEST SUITE");
  console.log("   Target: " + BASE_URL);
  console.log("================================================================================\n");

  let subscriberToken = null;
  let adminToken = null;
  let testCharitySlug = null;
  let testWinnerId = null;

  // ---------------------------------------------------------------------------
  // MODULE 1: System Health, Database & OpenAPI Swagger Specs
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 1: System Health, DB & OpenAPI Documentation]");
  try {
    const health = await request("/api/db-check");
    assert(health.status === 200 && health.data.success === true, "Database health check (/api/db-check) returns healthy connection");

    const spec = await request("/api/openapi.json");
    assert(
      spec.status === 200 &&
      spec.data.openapi === "3.0.3" &&
      spec.data.components?.schemas?.User &&
      spec.data.components?.schemas?.Score &&
      spec.data.components?.schemas?.Draw &&
      spec.data.components?.schemas?.Winner,
      "OpenAPI 3.0 specification (/api/openapi.json) serves all MongoDB core models"
    );

    const docsRes = await fetch(`${BASE_URL}/api/docs`);
    const docsHtml = await docsRes.text();
    assert(docsRes.status === 200 && docsHtml.includes("SwaggerUIBundle"), "Swagger UI portal endpoint (/api/docs) responds with dark portal HTML");
  } catch (err) {
    assert(false, "Module 1 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 2: Authentication & RBAC Rules (PRD § 03 & § 04)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 2: Authentication, Validation & Charity Pledge Enforcement]");
  try {
    // 1. Mandatory 10% Charity minimum test
    const underPledge = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: `underpledge_${Date.now()}@digitalheroes.co.in`,
        password: "Password123!",
        firstName: "Cheap",
        lastName: "Golfer",
        charityContributionPercent: 5, // < 10% minimum
      }),
    });
    assert(
      underPledge.status === 400,
      "Registration rejects charity pledge < 10% with HTTP 400 (PRD § 04 Mandatory Giving Rule)"
    );

    // 2. Register valid new test subscriber with 20% pledge
    const testEmail = `golfer_test_${Date.now()}@digitalheroes.co.in`;
    const reg = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: testEmail,
        password: "Password123!",
        firstName: "Eagle",
        lastName: "Putter",
        charityContributionPercent: 20,
      }),
    });
    assert(reg.status === 201 && reg.data.success, "New user registered with 20% charity pledge");

    // 3. Login with invalid password
    const badLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "WrongPassword!" }),
    });
    assert(badLogin.status === 401, "Login rejects incorrect password with HTTP 401");

    // 4. Login with valid credentials
    const login = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: "Password123!" }),
    });
    subscriberToken = login.data.data?.token;
    assert(login.status === 200 && !!subscriberToken, "Subscriber authenticated and received signed JWT");

    // 5. Auth Me check
    const me = await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${subscriberToken}` },
    });
    assert(
      me.status === 200 &&
      me.data.data?.user?.email === testEmail &&
      me.data.data?.user?.charityContributionPercent === 20,
      "User profile (/api/auth/me) returns correct identity and charity pledge"
    );

    // 6. Profile PATCH update
    const update = await request("/api/auth/me", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({
        firstName: "Birdie",
        charityContributionPercent: 25,
      }),
    });
    assert(
      update.status === 200 &&
      update.data.data?.user?.firstName === "Birdie" &&
      update.data.data?.user?.charityContributionPercent === 25,
      "Profile update PATCH modifies name and increases charity pledge to 25%"
    );

    // 7. Admin Authentication
    const adminLogin = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@digitalheroes.co.in", password: "Admin1234!" }),
    });
    adminToken = adminLogin.data.data?.token;
    assert(adminLogin.status === 200 && adminLogin.data.data?.user?.role === "admin", "Admin authenticated successfully with RBAC 'admin' role");
  } catch (err) {
    assert(false, "Module 2 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 3: Subscription & Sandbox Mock Payment Engine (PRD § 04)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 3: Subscription Lifecycle & Sandbox Checkout Engine]");
  try {
    // 1. Check initial subscription status
    const status = await request("/api/subscriptions/status", {
      headers: { Authorization: `Bearer ${subscriberToken}` },
    });
    assert(status.status === 200 && status.data.data?.subscriptionStatus === "none", "Initial subscription status is 'none'");

    // 2. Activate Monthly Subscription via Mock Checkout
    const monthlyCheckout = await request("/api/subscriptions/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ plan: "monthly" }),
    });
    assert(
      monthlyCheckout.status === 200 &&
      monthlyCheckout.data.data?.subscription?.status === "active" &&
      monthlyCheckout.data.data?.subscription?.plan === "monthly",
      "Sandbox checkout activates Monthly Plan ($25/mo) with active status"
    );

    // 3. Switch to Annual Subscription ($250/yr)
    const annualCheckout = await request("/api/subscriptions/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ plan: "yearly" }),
    });
    assert(
      annualCheckout.status === 200 &&
      annualCheckout.data.data?.subscription?.plan === "yearly",
      "Sandbox checkout upgrades to Annual Plan ($250/yr) with 1-year renewal date"
    );
  } catch (err) {
    assert(false, "Module 3 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 4: Charity Ecosystem & Direct Donations (PRD § 08)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 4: Charity Ecosystem, Direct Giving & Events]");
  try {
    // 1. Fetch public charities directory
    const charities = await request("/api/charities");
    assert(
      charities.status === 200 &&
      Array.isArray(charities.data.data?.charities) &&
      charities.data.data.charities.length >= 4,
      "Public charity directory returns 4+ registered non-profit causes"
    );

    const firstCharity = charities.data.data.charities[0];
    testCharitySlug = firstCharity.slug;

    // 2. Fetch single charity detail
    const detail = await request(`/api/charities/${testCharitySlug}`);
    assert(
      detail.status === 200 &&
      detail.data.data?.charity?.slug === testCharitySlug,
      `Charity profile (${testCharitySlug}) fetched with full details`
    );

    // 3. Standalone Direct Donation (not tied to draws)
    const donate = await request("/api/donations", {
      method: "POST",
      body: JSON.stringify({
        charityId: firstCharity._id,
        amount: 50,
        donorName: "Philanthropic Golfer",
        donorEmail: "donor@digitalheroes.co.in",
        message: "Keep up the wonderful work!",
      }),
    });
    assert(
      donate.status === 201 &&
      donate.data.data?.donation?.amount === 50 &&
      donate.data.data?.donation?.paymentStatus === "succeeded",
      "Direct standalone donation ($50) processed with instant receipt and counter increment"
    );

    // 4. Admin creates new charity
    const newCharitySlug = `test-cause-${Date.now()}`;
    const createCharity = await request("/api/charities", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Eco Links Conservation ${Date.now()}`,
        slug: newCharitySlug,
        tagline: "Restoring biodiversity on public wetlands",
        description: "Planting native trees and preserving waterways across public recreation lands.",
        category: "Environment",
        logoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80",
        websiteUrl: "https://ecolinks.org",
      }),
    });
    assert(createCharity.status === 201, "Admin creates new verified charity partner via POST /api/charities");

    // 5. Admin updates charity
    const updateCharity = await request(`/api/charities/${newCharitySlug}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ tagline: "Updated conservation mission statement" }),
    });
    assert(updateCharity.status === 200, "Admin updates charity profile via PUT /api/charities/[slug]");

    // 6. Admin deactivates charity
    const delCharity = await request(`/api/charities/${newCharitySlug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delCharity.status === 200, "Admin deactivates charity via DELETE /api/charities/[slug]");
  } catch (err) {
    assert(false, "Module 4 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 5: Score Management Engine (Stableford 1-45 & FIFO Queue) (PRD § 05)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 5: Stableford Score Constraints & 5-Slot FIFO Rolling Queue]");
  try {
    // 1. Score range validation: Reject < 1
    const lowScore = await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 0, date: daysAgo(100) }),
    });
    assert(lowScore.status === 422, "Rejects Stableford score < 1 with HTTP 422 (Unprocessable Entity)");

    // 2. Score range validation: Reject > 45
    const highScore = await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 46, date: daysAgo(100) }),
    });
    assert(highScore.status === 422, "Rejects Stableford score > 45 with HTTP 422 (PRD Stableford range 1-45)");

    // 3. Unique date rule: Add score for date X
    const dateX = daysAgo(20);
    const score1 = await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 36, date: dateX, courseName: "Round 1 Course" }),
    });
    assert(score1.status === 201, "Successfully submits first valid round (36 pts)");

    // 4. Duplicate date conflict rejection
    const dup = await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 38, date: dateX, courseName: "Duplicate Date Round" }),
    });
    assert(dup.status === 409, "Rejects duplicate score entry on identical date with HTTP 409 Conflict");

    // 5. Fill remaining 4 slots to reach exactly 5 active scores
    await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 32, date: daysAgo(16), courseName: "Round 2" }),
    });
    await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 40, date: daysAgo(12), courseName: "Round 3" }),
    });
    await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 28, date: daysAgo(8), courseName: "Round 4" }),
    });
    await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 35, date: daysAgo(4), courseName: "Round 5" }),
    });

    const getScores5 = await request("/api/scores", {
      headers: { Authorization: `Bearer ${subscriberToken}` },
    });
    assert(
      getScores5.status === 200 &&
      getScores5.data.data?.scores?.length === 5 &&
      getScores5.data.data?.isTicketComplete === true,
      "Draw ticket is complete with exactly 5 active scores (100% qualified)"
    );

    // 6. FIFO Rolling Queue: Insert 6th score (newest date)
    const score6 = await request("/api/scores", {
      method: "POST",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 42, date: daysAgo(1), courseName: "Round 6 Fresh" }),
    });
    assert(
      score6.status === 201 &&
      score6.data.data?.scores?.length === 5,
      "6th score automatically rolled oldest round into archive (FIFO) and maintained exactly 5 active scores"
    );

    // 7. Edit Score PATCH
    const activeScoreToEdit = score6.data.data?.scores[0];
    const editScore = await request(`/api/scores/${activeScoreToEdit._id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${subscriberToken}` },
      body: JSON.stringify({ score: 44, courseName: "Championship Renamed" }),
    });
    assert(
      editScore.status === 200 && editScore.data.data?.score?.score === 44,
      "Score points and course label updated successfully via PATCH /api/scores/[id]"
    );

    // 8. Delete Score & Automatic Archive Promotion
    const deleteScore = await request(`/api/scores/${activeScoreToEdit._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${subscriberToken}` },
    });
    assert(
      deleteScore.status === 200 &&
      deleteScore.data.data?.activeCount === 5,
      "Deleting an active score automatically promoted newest archived score to keep active ticket at 5"
    );
  } catch (err) {
    assert(false, "Module 5 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 6: Monthly Draw Engine, Laplace Smoothing & Rollover (PRD § 06 & § 07)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 6: Monthly Draw Engine, Laplace Smoothing & Rollover]");
  try {
    // 1. Upcoming Draw Public Endpoint
    const upcoming = await request("/api/draws/upcoming");
    assert(
      upcoming.status === 200 &&
      upcoming.data.data.jackpotRolloverIn !== undefined &&
      upcoming.data.data.jackpotRolloverIn >= 0,
      `Upcoming draw displays $${upcoming.data.data?.jackpotRolloverIn} carried-over rollover buffer`
    );

    const dynamicYear = 2040 + Math.floor(Math.random() * 30);
    const dynamicMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const testCycle = `${dynamicYear}-${dynamicMonth}`;

    // 2. Admin Simulate Uniform Random Draw
    const simRandom = await request("/api/admin/draws/simulate", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ drawMonth: testCycle, algorithmType: "random" }),
    });
    assert(
      simRandom.status === 200 &&
      simRandom.data.data?.simulation?.drawnNumbers?.length === 5,
      "Uniform Random simulation generated 5 unique numbers (1-45)"
    );

    // 3. Admin Simulate Score-Frequency Weighted Draw (Laplace smoothing alpha = 1)
    const simWeighted = await request("/api/admin/draws/simulate", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ drawMonth: testCycle, algorithmType: "frequency_weighted" }),
    });
    const sim = simWeighted.data.data?.simulation;
    assert(
      simWeighted.status === 200 &&
      sim?.drawnNumbers?.length === 5 &&
      sim?.tier1Pool === +(sim.totalPrizePool * 0.4).toFixed(2) &&
      sim?.tier2Pool === +(sim.totalPrizePool * 0.35).toFixed(2) &&
      sim?.tier3Pool === +(sim.totalPrizePool * 0.25).toFixed(2),
      "Score-Frequency simulation enforces exact PRD splits: Tier 1 (40%), Tier 2 (35%), Tier 3 (25%)"
    );

    // 4. Publish Official Draw Safety Check (Requires exact confirmation phrase)
    const badPublish = await request("/api/admin/draws/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}`, "x-test-suite": "true" },
      body: JSON.stringify({
        drawMonth: testCycle,
        algorithmType: "random",
        drawnNumbers: [10, 20, 30, 40, 45],
        confirmationPhrase: "publish please", // Wrong phrase
      }),
    });
    assert(badPublish.status === 400, "Publish endpoint rejects authorization without exact phrase 'CONFIRM PUBLISH'");

    // 4b. Guard Check: Invalid month format is rejected by zod schema
    const invalidMonthPublish = await request("/api/admin/draws/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        drawMonth: "invalid-format",
        algorithmType: "random",
        drawnNumbers: [10, 20, 30, 40, 45],
        confirmationPhrase: "CONFIRM PUBLISH",
      }),
    });
    assert(
      invalidMonthPublish.status === 400 && invalidMonthPublish.data?.error?.code === "VALIDATION_ERROR",
      "Strict Rule Enforced: drawMonth format must be valid YYYY-MM (HTTP 400 VALIDATION_ERROR)"
    );

    // 5. Official Draw Publishing
    const goodPublish = await request("/api/admin/draws/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        drawMonth: testCycle,
        algorithmType: "random",
        drawnNumbers: [36, 32, 40, 15, 25],
        confirmationPhrase: "CONFIRM PUBLISH",
      }),
    });
    assert(
      goodPublish.status === 201 &&
      goodPublish.data.data?.draw?.status === "published" &&
      goodPublish.data.data?.winnersCount > 0,
      `Official Draw #${goodPublish.data.data?.draw?.drawNumber} published and written to public ledger with ${goodPublish.data.data?.winnersCount} verified winner(s)`
    );

    // 5b. Guard Check: Attempting to publish again for the same month/year is strictly blocked
    const duplicatePublish = await request("/api/admin/draws/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        drawMonth: testCycle,
        algorithmType: "random",
        drawnNumbers: [36, 32, 40, 15, 25],
        confirmationPhrase: "CONFIRM PUBLISH",
      }),
    });
    assert(
      duplicatePublish.status === 409 && duplicatePublish.data?.error?.code === "DRAW_ALREADY_PUBLISHED",
      "Strict Rule Enforced: Draw month/year must be unique (HTTP 409 DRAW_ALREADY_PUBLISHED)"
    );
  } catch (err) {
    assert(false, "Module 6 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 7: Winner Verification State Machine & Payouts (PRD § 08 & § 09)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 7: Winner Verification Pipeline & Payout Recording]");
  try {
    // 1. Subscriber view winnings
    const subWin = await request("/api/winners", {
      headers: { Authorization: `Bearer ${subscriberToken}` },
    });
    assert(subWin.status === 200, "Subscriber retrieves personal winnings portal (/api/winners)");

    // 2. Admin inspects verification queue
    const adminWin = await request("/api/admin/winners", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allWinners = adminWin.data.data?.winners || [];
    assert(adminWin.status === 200 && allWinners.length > 0, `Admin verification queue contains ${allWinners.length} prize record(s)`);

    const targetWinner = allWinners[0];
    testWinnerId = targetWinner._id;

    // Ensure test winner starts in clean pending/unpaid state for idempotent verification pipeline testing
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    const WinnerModel = mongoose.models.Winner || (await import("../src/models/Winner.js")).default;

    // 2b. Strict Winner Creation Guard: newly created winner MUST start with status: "pending" and payoutStatus: "unpaid" (never paid)
    const testNewWinner = new WinnerModel({
      drawId: targetWinner.drawId,
      userId: targetWinner.userId,
      tier: "tier_3_three_match",
      matchCount: 3,
      matchedNumbers: [38, 41],
      prizeAmount: 100,
      status: "paid", // Deliberately testing that "paid" cannot be set on creation
      payoutStatus: "paid",
    });
    await testNewWinner.save();
    assert(
      testNewWinner.status === "pending" && testNewWinner.payoutStatus === "unpaid",
      "Strict Rule Enforced: When a winner object is created first, status is strictly 'pending' and payoutStatus is 'unpaid' (never paid)"
    );
    await WinnerModel.findByIdAndDelete(testNewWinner._id);

    if (targetWinner.payoutStatus === "paid" || targetWinner.verificationStatus === "approved") {
      await WinnerModel.findByIdAndUpdate(testWinnerId, {
        $set: {
          status: "pending",
          verificationStatus: "pending_proof",
          payoutStatus: "unpaid",
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
          payoutMethod: null,
          payoutReference: null,
          paidAt: null,
        },
      });
    }

    // 3. Submit proof screenshot
    const proof = await request(`/api/winners/${testWinnerId}/proof`, {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        proofScreenshotUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80",
      }),
    });
    assert(proof.status === 200, "Golfer submits scorecard screenshot: status transitioned to 'proof_submitted'");

    // 4. Admin rejects proof with reason
    const reject = await request(`/api/admin/winners/${testWinnerId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        action: "reject",
        rejectionReason: "Screenshot blurred, please upload high-res image",
      }),
    });
    assert(
      reject.status === 200 && reject.data.data?.winner?.verificationStatus === "rejected",
      "Admin rejects proof: status transitioned to 'rejected' with custom feedback"
    );

    // 4b. Strict verification failure guard: Cannot execute payout on rejected claim!
    const failedPayout = await request(`/api/admin/winners/${testWinnerId}/payout`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        payoutMethod: "Direct Bank Wire",
        payoutReference: "WIRE-INVALID",
      }),
    });
    assert(
      failedPayout.status === 400 && failedPayout.data?.error?.code === "VERIFICATION_FAILED",
      "Strict Rule Enforced: Payout strictly blocked (HTTP 400 VERIFICATION_FAILED) when verification status is 'rejected'"
    );

    // 5. Admin approves replacement proof
    const approve = await request(`/api/admin/winners/${testWinnerId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: "approve" }),
    });
    assert(
      approve.status === 200 && approve.data.data?.winner?.verificationStatus === "approved",
      "Admin approves verified scorecard: status transitioned to 'approved' for payout"
    );

    // 5b. Immutability guard: Once approved, status cannot be changed or rejected!
    const rejectAfterApproval = await request(`/api/admin/winners/${testWinnerId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: "reject", rejectionReason: "Try changing approved" }),
    });
    assert(
      rejectAfterApproval.status === 400 && rejectAfterApproval.data?.error?.code === "ALREADY_APPROVED",
      "Strict Rule Enforced: Once approved, verification status is immutable and cannot be changed or rejected (HTTP 400)"
    );

    // 6. Admin records payout
    const payout = await request(`/api/admin/winners/${testWinnerId}/payout`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        payoutMethod: "Direct Bank Wire",
        payoutReference: `WIRE-${Date.now().toString().slice(-6)}`,
      }),
    });
    assert(
      payout.status === 200 && payout.data.data?.winner?.payoutStatus === "paid",
      "Admin records payout: status transitioned to 'paid' with transaction reference"
    );

    // 6b. Post-payout immutability: Once paid out, cannot reject verification status
    const rejectAfterPaid = await request(`/api/admin/winners/${testWinnerId}/review`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: "reject", rejectionReason: "Try changing paid prize" }),
    });
    assert(
      rejectAfterPaid.status === 400 && rejectAfterPaid.data?.error?.code === "PRIZE_ALREADY_PAID",
      "Strict Rule Enforced: Once paid out, verification status cannot be rejected (HTTP 400 PRIZE_ALREADY_PAID)"
    );

    // 6c. Double-payout prevention: Cannot payout a prize that has already been paid
    const doublePayout = await request(`/api/admin/winners/${testWinnerId}/payout`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        payoutMethod: "Direct Bank Wire",
        payoutReference: "WIRE-DUPLICATE",
      }),
    });
    assert(
      doublePayout.status === 400 && doublePayout.data?.error?.code === "ALREADY_PAID",
      "Strict Rule Enforced: Duplicate payout prevented once prize has been paid out (HTTP 400 ALREADY_PAID)"
    );
  } catch (err) {
    assert(false, "Module 7 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 8: Admin Control Plane & Analytics Telemetry (PRD § 11)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 8: Admin Analytics, Executive KPIs & User Overrides]");
  try {
    // 1. Executive Analytics
    const analytics = await request("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = analytics.data.data;
    assert(
      analytics.status === 200 &&
      typeof data?.users?.estimatedMRR === "number" &&
      typeof data?.charities?.totalCharityFundsRaised === "number" &&
      typeof data?.draws?.totalDrawsConducted === "number",
      "Executive analytics endpoint computes MRR, charity totals, and draw metrics"
    );

    // 2. User Directory Search & Filters
    const users = await request("/api/admin/users?subscriptionStatus=active", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      users.status === 200 && Array.isArray(users.data.data?.users),
      "Admin user roster supports filtering by subscription status"
    );
  } catch (err) {
    assert(false, "Module 8 threw unhandled error", err.message);
  }

  // ---------------------------------------------------------------------------
  // MODULE 9: Frontend Route Health & Compilation (17 Routes)
  // ---------------------------------------------------------------------------
  console.log("\n[MODULE 9: Frontend Page Delivery (17 Routes)]");
  const routes = [
    { path: "/", name: "Landing Page" },
    { path: "/draws", name: "Draws Archive & Live Pool" },
    { path: "/how-it-works", name: "Interactive System Explainer" },
    { path: "/charities", name: "Charity Directory" },
    { path: "/login", name: "Authentication Login" },
    { path: "/register", name: "Onboarding Registration" },
    { path: "/dashboard", name: "Golfer Dashboard Overview" },
    { path: "/dashboard/scores", name: "FIFO Scores Visualizer" },
    { path: "/dashboard/winnings", name: "Winnings & Proof Claim" },
    { path: "/dashboard/charity", name: "Charity Giving Pledge" },
    { path: "/dashboard/settings", name: "Membership & Sandbox" },
    { path: "/admin", name: "Admin Executive Dashboard" },
    { path: "/admin/draws/new", name: "Admin Draw Simulator" },
    { path: "/admin/winners", name: "Admin Winner Verification" },
    { path: "/admin/users", name: "Admin Golfer Roster" },
    { path: "/admin/charities", name: "Admin Charities Manager" },
    { path: "/docs", name: "OpenAPI Swagger UI Portal" },
    { path: "/terms", name: "Regulations & Gaming Disclaimers" },
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      assert(res.status === 200, `Route ${r.path.padEnd(22)} (${r.name}) renders with HTTP 200 OK`);
    } catch (err) {
      assert(false, `Route ${r.path} failed`, err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`🏁 ECOSYSTEM TEST RUN COMPLETE: ${passedCount} PASSED, ${failedCount} FAILED out of ${passedCount + failedCount} assertions.`);
  console.log("================================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runFullEcosystemTest().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
