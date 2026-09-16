import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(condition, desc) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${desc}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${desc}`);
  }
}

async function run() {
  console.log("\n================================================================================");
  console.log("   digital.HEROES — BLUEPRINT COMPLETENESS & EXTENSION TEST SUITE");
  console.log("   Target: " + BASE_URL);
  console.log("================================================================================\n");

  // 1. Sign in Subscriber and Admin
  console.log("[1] Authenticating Test Personas...");
  const subRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "subscriber@digitalheroes.co.in", password: "Player1234!" }),
  });
  const subData = await subRes.json();
  const subCookie = subRes.headers.get("set-cookie") || "";
  const subToken = subData.data?.token;
  check(subRes.status === 200 && subToken, "Subscriber successfully authenticated");

  const adminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@digitalheroes.co.in", password: "Admin1234!" }),
  });
  const adminData = await adminRes.json();
  const adminToken = adminData.data?.token;
  check(adminRes.status === 200 && adminToken, "Admin successfully authenticated");

  // 2. Test Score History Paginated API
  console.log("\n[2] Testing Score History API (GET /api/scores/history)...");
  const histRes = await fetch(`${BASE_URL}/api/scores/history?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${subToken}` },
  });
  const histData = await histRes.json();
  check(histRes.status === 200, "Score history endpoint returns 200 OK");
  check(histData.success === true, "Response envelope contains success: true");
  check(Array.isArray(histData.data?.scores), "Response contains scores array");
  check(histData.data?.pagination?.page === 1, "Pagination metadata contains current page");

  // 3. Test Specific Draw API (GET /api/draws/[id])
  console.log("\n[3] Testing Draw Detail API (GET /api/draws/[id])...");
  const drawsListRes = await fetch(`${BASE_URL}/api/draws`);
  const drawsListData = await drawsListRes.json();
  if (drawsListData.data?.draws?.length > 0) {
    const targetDraw = drawsListData.data.draws[0];
    const singleDrawRes = await fetch(`${BASE_URL}/api/draws/${targetDraw._id}`);
    const singleDrawData = await singleDrawRes.json();
    check(singleDrawRes.status === 200, "Single draw endpoint returns 200 OK");
    check(singleDrawData.data?.draw?.drawNumber === targetDraw.drawNumber, "Draw numbers match target draw");
    check(Array.isArray(singleDrawData.data?.winners), "Draw detail includes associated winners array");
  } else {
    console.log("  ⚠️ Skipping single draw verification (no published draws yet in test DB)");
  }

  // 4. Test Subscription Cancel API (POST /api/subscriptions/cancel)
  console.log("\n[4] Testing Subscription Cancel API (POST /api/subscriptions/cancel)...");
  const cancelRes = await fetch(`${BASE_URL}/api/subscriptions/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${subToken}` },
  });
  const cancelData = await cancelRes.json();
  check(cancelRes.status === 200 || cancelRes.status === 400, "Subscription cancel endpoint responded predictably (200 or 400)");
  if (cancelRes.status === 200) {
    check(cancelData.data?.user?.cancelAtPeriodEnd === true || cancelData.data?.user?.subscriptionStatus === "canceled", "User cancellation flag recorded");
  }

  // Restore subscriber status
  await fetch(`${BASE_URL}/api/subscriptions/checkout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${subToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan: "monthly", billingInterval: "month" }),
  });

  // 5. Test Subscription Webhook API (POST /api/subscriptions/webhook)
  console.log("\n[5] Testing Subscription Webhook (POST /api/subscriptions/webhook)...");
  const webhookRes = await fetch(`${BASE_URL}/api/subscriptions/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "invoice.payment_succeeded",
      data: {
        object: {
          customer_email: "subscriber@digitalheroes.co.in",
          customerId: "cus_mock_test_123",
        },
      },
    }),
  });
  const webhookData = await webhookRes.json();
  check(webhookRes.status === 200, "Webhook endpoint responded with HTTP 200");
  check(webhookData.received === true, "Webhook event confirmed received");

  // 6. Test Charity Events API (POST & DELETE /api/charities/[slug]/events)
  console.log("\n[6] Testing Charity Events API (POST & DELETE /api/charities/[slug]/events)...");
  const eventAddRes = await fetch(`${BASE_URL}/api/charities/veterans-on-the-green/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "ANZAC Charity Golf Classic 2026",
      date: "2026-11-15T08:00:00.000Z",
      location: "Royal Melbourne Golf Club",
      description: "Annual fundraising championship for veteran rehabilitation.",
      registrationUrl: "https://veteransonthegreen.org.au/classic",
    }),
  });
  const eventAddData = await eventAddRes.json();
  const eventsList = eventAddData.data?.charity?.events || eventAddData.data?.charity?.upcomingEvents || [];
  const addedEvent = eventsList.find(
    (e) => e.title === "ANZAC Charity Golf Classic 2026"
  );
  check(Boolean(addedEvent), "Charity events contains the newly added tournament");

  if (addedEvent) {
    const eventDelRes = await fetch(
      `${BASE_URL}/api/charities/veterans-on-the-green/events?eventId=${addedEvent._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    check(eventDelRes.status === 200, "Charity event deletion returned 200 OK");
  }

  // 7. Test Admin Analytics Score Distribution Histogram (GET /api/admin/analytics)
  console.log("\n[7] Testing Admin Analytics Telemetry (GET /api/admin/analytics)...");
  const analRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const analData = await analRes.json();
  check(analRes.status === 200, "Admin analytics returned 200 OK");
  check(Array.isArray(analData.data?.scores?.scoreDistribution), "Analytics contains scoreDistribution array");
  check(analData.data?.scores?.scoreDistribution?.length === 45, "Histogram covers exact Stableford range 1 through 45");

  // 8. Test Frontend Route HTTP status
  console.log("\n[8] Testing Frontend Page Availability...");
  const pagesToTest = [
    { path: "/pricing", name: "Pricing Table Page" },
    { path: "/subscribe", name: "Subscribe Page" },
    { path: "/forgot-password", name: "Forgot Password Recovery Page" },
    { path: "/dashboard/draws", name: "Golfer Draw Participation Page", auth: subCookie },
    { path: "/admin/analytics", name: "Admin Deep Reports Page", auth: subCookie },
  ];

  for (const page of pagesToTest) {
    const pRes = await fetch(`${BASE_URL}${page.path}`, {
      headers: page.auth ? { Cookie: page.auth } : {},
    });
    check(pRes.status === 200, `Page ${page.path} (${page.name}) renders successfully with HTTP 200`);
  }

  console.log("\n================================================================================");
  console.log(`   TEST EXECUTION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
