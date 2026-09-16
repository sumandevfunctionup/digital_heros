/**
 * test-fifo-rolling.js
 * End-to-end verification of Automatic FIFO Rolling (PRD § 05)
 * 1. Signs in subscriber@digitalheroes.co.in
 * 2. Fetches active 5 scores and archive count
 * 3. Tests duplicate date rejection (HTTP 409)
 * 4. Submits a new distinct round date
 * 5. Verifies FIFO roll: exactly 5 active scores, oldest moved to archive
 * 6. Verifies rolled score metadata returned in payload
 * 7. Deletes the newly added round and verifies archived score auto-promotes back
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  console.log("=== STARTING FIFO ROLLING VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Sign in subscriber
  console.log("\n1. Authenticating as subscriber...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "subscriber@digitalheroes.co.in",
      password: "Player1234!",
    }),
  });

  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  assert(loginRes.ok && token, "Subscriber logged in successfully");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch initial scores
  console.log("\n2. Fetching current scores state...");
  const initialRes = await fetch(`${BASE_URL}/api/scores`, { headers: authHeaders });
  const initialData = await initialRes.json();
  assert(initialRes.ok && initialData.success, "GET /api/scores succeeded");
  
  const initialScores = initialData.data.scores;
  const initialArchived = initialData.data.archivedScores;
  console.log(`   Active scores: ${initialScores.length}, Archived: ${initialArchived.length}`);
  assert(initialScores.length === 5, "Subscriber currently has 5 active scores");
  
  const oldestActiveScore = initialScores[initialScores.length - 1];
  console.log(`   Oldest active score in Slot #5: ${oldestActiveScore.courseName} (${oldestActiveScore.score} pts, date: ${oldestActiveScore.date.split("T")[0]})`);

  // 3. Test duplicate date conflict
  console.log("\n3. Testing duplicate date enforcement (PRD § 05)...");
  const dupDate = oldestActiveScore.date.split("T")[0];
  const dupRes = await fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      score: 37,
      date: dupDate,
      courseName: "Duplicate Date Course",
    }),
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 409, `POST with duplicate date ${dupDate} rejected with 409 Conflict`);
  assert(dupData.error?.code === "DUPLICATE_DATE_SCORE", "Error code is DUPLICATE_DATE_SCORE");

  // 4. Test FIFO rolling with a new distinct date
  console.log("\n4. Testing automatic FIFO rolling with a new round...");
  // Use a future date guaranteed not to collide
  const newDate = "2026-10-01";
  const newCourse = "Spyglass Hill Autumn Open";
  const newScoreVal = 42;

  const rollRes = await fetch(`${BASE_URL}/api/scores`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      score: newScoreVal,
      date: newDate,
      courseName: newCourse,
    }),
  });

  const rollData = await rollRes.json();
  assert(rollRes.status === 201, "POST /api/scores succeeded with 201 Created");
  assert(rollData.data?.newScore !== undefined, "newScore returned in response");
  assert(rollData.data?.rolledScore !== null, "rolledScore returned in response");
  console.log(`   Rolled score reported by API: ${rollData.data?.rolledScore?.courseName} (${rollData.data?.rolledScore?.score} pts)`);
  assert(rollData.data?.rolledScore?._id === oldestActiveScore._id, "API correctly identified oldest active score as rolled");
  assert(rollData.data?.scores?.length === 5, "Active scores strictly maintained at 5");
  assert(rollData.data?.isComplete === true, "isComplete is true");
  assert(rollData.data?.scores[0].courseName === newCourse, "New score is now at Slot #1 (newest)");

  const createdId = rollData.data.newScore._id;

  // 5. Verify GET /api/scores reflects the roll
  console.log("\n5. Verifying GET /api/scores reflects the roll in state...");
  const verifyRes = await fetch(`${BASE_URL}/api/scores`, { headers: authHeaders });
  const verifyData = await verifyRes.json();
  const rolledInArchive = verifyData.data.archivedScores.find((s) => s._id === oldestActiveScore._id);
  assert(!!rolledInArchive, "Previously oldest active score is now in archivedScores");
  assert(rolledInArchive?.isCurrentActive === false, "Rolled score has isCurrentActive: false");
  assert(verifyData.data.archivedScores.length === initialArchived.length + 1, "Archive count incremented by exactly 1");

  // 6. Test delete & promotion (restores previous state)
  console.log("\n6. Cleaning up by deleting the test round & verifying backfill...");
  const delRes = await fetch(`${BASE_URL}/api/scores/${createdId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const delData = await delRes.json();
  assert(delRes.ok, "DELETE /api/scores/[id] succeeded");
  assert(delData.data?.promotedScore?._id === oldestActiveScore._id, "Oldest archived score was promoted back to active 5");
  assert(delData.data?.scores?.length === 5, "Active count remains 5 after promotion");

  console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Test encountered error:", err);
  process.exit(1);
});
