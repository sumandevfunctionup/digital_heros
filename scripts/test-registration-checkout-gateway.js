import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function run() {
  console.log("================================================================================");
  console.log("   TEST SUITE: REGISTRATION & PAYMENT GATEWAY VERIFICATION");
  console.log("   Target:", BASE_URL);
  console.log("================================================================================\n");

  // Step 1: Register a new user
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const testEmail = `golfer_${randomSuffix}@example.com`;
  console.log(`[1] Registering brand new user: ${testEmail}...`);

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password123!",
      firstName: "Tiger",
      lastName: "Woods",
      charityContributionPercent: 15,
    }),
  });

  const regJson = await regRes.json();
  if (!regRes.ok || !regJson.success) {
    console.error("❌ Registration failed:", regJson);
    process.exit(1);
  }

  const token = regJson.data.token;
  const user = regJson.data.user;
  console.log("  ✅ PASS: User registered successfully.");
  console.log(`  ℹ️  User subscriptionStatus: "${user.subscriptionStatus}"`);

  if (user.subscriptionStatus !== "none") {
    console.error(`❌ FAIL: Expected subscriptionStatus 'none', but got '${user.subscriptionStatus}'!`);
    process.exit(1);
  }
  console.log("  ✅ PASS: New user subscriptionStatus is correctly 'none' (NOT active)!\n");

  // Step 2: Fetch current profile session
  console.log("[2] Checking user session via GET /api/auth/me...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meJson = await meRes.json();
  console.log(`  ℹ️  Session subscriptionStatus: "${meJson.data.user.subscriptionStatus}"`);
  if (meJson.data.user.subscriptionStatus !== "none") {
    console.error("❌ FAIL: User session shows active prematurely!");
    process.exit(1);
  }
  console.log("  ✅ PASS: User session strictly confirms subscriptionStatus: 'none'.\n");

  // Step 3: Trigger Payment Gateway Checkout (Stripe mode)
  console.log("[3] Requesting Stripe Payment Gateway Checkout (POST /api/subscriptions/checkout)...");
  const checkoutRes = await fetch(`${BASE_URL}/api/subscriptions/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan: "monthly",
      mode: "stripe",
      redirect: true,
      returnUrl: "/dashboard/settings",
    }),
  });

  const checkoutJson = await checkoutRes.json();
  if (!checkoutRes.ok || !checkoutJson.success) {
    console.error("❌ Checkout failed:", checkoutJson);
    process.exit(1);
  }

  console.log("  ✅ PASS: Checkout endpoint succeeded with HTTP 200.");
  console.log(`  ℹ️  Stripe Checkout URL: ${checkoutJson.data.checkoutUrl?.substring(0, 50)}...`);
  console.log(`  ℹ️  Stripe Session ID: ${checkoutJson.data.sessionId}`);

  if (!checkoutJson.data.checkoutUrl?.includes("stripe.com")) {
    console.error("❌ FAIL: Expected official Stripe checkout URL!");
    process.exit(1);
  }
  console.log("  ✅ PASS: Generated official Stripe Payment Gateway Hosted Checkout URL!");

  // Verify Stripe Session Redirection Path
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const stripeSession = await stripe.checkout.sessions.retrieve(checkoutJson.data.sessionId);
  console.log(`  ℹ️  Stripe Session success_url: ${stripeSession.success_url}`);
  if (!stripeSession.success_url.includes("/checkout/success")) {
    console.error("❌ FAIL: Stripe session success_url does not use /checkout/success!");
    process.exit(1);
  }
  console.log("  ✅ PASS: Verified Stripe success_url strictly uses /checkout/success path!\n");

  // Step 4: Verify user remains 'none' until payment is actually made
  console.log("[4] Verifying user did NOT automatically get marked active after generating checkout session...");
  const verifyMeRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const verifyMeJson = await verifyMeRes.json();
  if (verifyMeJson.data.user.subscriptionStatus !== "none") {
    console.error("❌ FAIL: User was silently marked active before payment was completed!");
    process.exit(1);
  }
  console.log("  ✅ PASS: User remains strictly in 'none' status until webhook/payment confirms!\n");

  // Step 5: Test Unsubscribed Golfer Seed Account
  console.log("[5] Verifying seeded 'newgolfer@digitalheroes.co.in' account...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "newgolfer@digitalheroes.co.in",
      password: "Player1234!",
    }),
  });
  const loginJson = await loginRes.json();
  if (!loginRes.ok || !loginJson.success) {
    console.error("❌ Login failed for newgolfer:", loginJson);
    process.exit(1);
  }

  console.log(`  ℹ️  newgolfer subscriptionStatus: "${loginJson.data.user.subscriptionStatus}"`);
  if (loginJson.data.user.subscriptionStatus !== "none") {
    console.error("❌ FAIL: newgolfer seed account is not 'none'!");
    process.exit(1);
  }
  console.log("  ✅ PASS: Seeded newgolfer account is confirmed unsubscribed ('none').\n");

  console.log("================================================================================");
  console.log("   ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (5 / 5)");
  console.log("================================================================================\n");
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
