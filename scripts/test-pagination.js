/**
 * Targeted Pagination Test Script
 * Verifies page, limit, and meta structure across all updated endpoints
 */

const BASE_URL = "http://localhost:3000";

async function run() {
  console.log("=== VERIFYING STANDARDIZED API PAGINATION ===");
  let passed = 0;
  let failed = 0;

  function assert(cond, msg) {
    if (cond) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. First authenticate as admin & register fresh golfer
  const authAdminRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@digitalheroes.co.in",
      password: "Admin1234!",
    }),
  });
  const authAdminData = await authAdminRes.json();
  const adminCookie = authAdminRes.headers.get("set-cookie") || "";
  const adminToken = authAdminData.data?.token;

  const testEmail = `page_test_${Date.now()}@digitalheroes.co.in`;
  const regUserRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "Password123!",
      firstName: "Page",
      lastName: "Tester",
      charityContributionPercent: 20,
    }),
  });
  const regUserData = await regUserRes.json();
  const userToken = regUserData.data?.token;
  const userCookie = regUserRes.headers.get("set-cookie") || "";

  // Endpoint 1: Public Charities (/api/charities?page=1&limit=2)
  console.log("\n[1. Testing /api/charities]");
  {
    const res = await fetch(`${BASE_URL}/api/charities?page=1&limit=2`);
    const json = await res.json();
    assert(res.ok && json.success, "Charities API responded with success");
    assert(json.data.charities.length <= 2, "Charities limited to 2 items");
    assert(json.meta && json.meta.page === 1 && json.meta.limit === 2, "Meta contains page=1 and limit=2");
    assert(typeof json.meta.total === "number", `Total count is number (${json.meta.total})`);
    assert(typeof json.meta.totalPages === "number", `Total pages is number (${json.meta.totalPages})`);
  }

  // Endpoint 2: Public Published Draws (/api/draws?page=1&limit=2)
  console.log("\n[2. Testing /api/draws]");
  {
    const res = await fetch(`${BASE_URL}/api/draws?page=1&limit=2`);
    const json = await res.json();
    assert(res.ok && json.success, "Draws API responded with success");
    assert(Array.isArray(json.data.draws) && json.data.draws.length <= 2, "Draws limited to 2 items");
    assert(json.meta && json.meta.page === 1 && json.meta.limit === 2, "Meta contains page=1 and limit=2");
    assert(typeof json.meta.total === "number", `Total draws count is number (${json.meta.total})`);
  }

  // Endpoint 3: Admin Users (/api/admin/users?page=1&limit=2)
  console.log("\n[3. Testing /api/admin/users]");
  {
    const res = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=2`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Cookie: adminCookie,
      },
    });
    const json = await res.json();
    assert(res.ok && json.success, "Admin Users API responded with success");
    assert(Array.isArray(json.data.users) && json.data.users.length <= 2, "Admin users limited to 2 items");
    assert(json.meta && json.meta.page === 1 && json.meta.limit === 2, "Meta contains page=1 and limit=2");
    assert(typeof json.meta.total === "number", `Total users count is number (${json.meta.total})`);
  }

  // Endpoint 4: Admin Winners (/api/admin/winners?page=1&limit=2)
  console.log("\n[4. Testing /api/admin/winners]");
  {
    const res = await fetch(`${BASE_URL}/api/admin/winners?page=1&limit=2`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        Cookie: adminCookie,
      },
    });
    const json = await res.json();
    assert(res.ok && json.success, "Admin Winners API responded with success");
    assert(Array.isArray(json.data.winners) && json.data.winners.length <= 2, "Admin winners limited to 2 items");
    assert(json.meta && json.meta.page === 1 && json.meta.limit === 2, "Meta contains page=1 and limit=2");
    assert(json.data.counts && typeof json.data.counts.all === "number", "Global filter counts preserved");
  }

  // Endpoint 5: Personal Winnings (/api/winners?page=1&limit=2)
  console.log("\n[5. Testing /api/winners]");
  {
    const res = await fetch(`${BASE_URL}/api/winners?page=1&limit=2`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Cookie: userCookie,
      },
    });
    const json = await res.json();
    assert(res.ok && json.success, "Personal Winnings API responded with success");
    assert(Array.isArray(json.data.winnings) && json.data.winnings.length <= 2, "Winnings limited to 2 items");
    assert(json.meta && json.meta.page === 1 && json.meta.limit === 2, "Meta contains page=1 and limit=2");
    assert(typeof json.data.totalWon === "number", "Aggregate totalWon preserved");
  }

  // Endpoint 6: Golfer Score History (/api/scores/history?page=1&limit=2)
  console.log("\n[6. Testing /api/scores/history]");
  {
    const res = await fetch(`${BASE_URL}/api/scores/history?page=1&limit=2`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Cookie: userCookie,
      },
    });
    const json = await res.json();
    assert(res.ok && json.success, "Score History API responded with success");
    assert(Array.isArray(json.data.scores) && json.data.scores.length <= 2, "Scores history limited to 2 items");
    assert(json.data.meta && json.data.meta.page === 1 && json.data.meta.limit === 2, "Meta contains page=1 and limit=2");
  }

  console.log("\n==================================================");
  console.log(`PAGINATION VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
