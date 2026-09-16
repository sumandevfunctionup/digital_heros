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
  console.log("   TESTING STRICT FORM VALIDATION: EMAIL FORMAT & OPTIONAL LAST NAME");
  console.log("   Target: " + BASE_URL);
  console.log("================================================================================\n");

  const timestamp = Date.now();

  // Test 1: Rejects missing First Name
  console.log("[1] Testing Missing First Name...");
  const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `valid${timestamp}@example.com`,
      password: "Password123!",
      firstName: "",
      lastName: "Test",
    }),
  });
  const data1 = await res1.json();
  check(res1.status === 400, "Registration rejects missing First Name with HTTP 400");
  check(data1.error?.message?.toLowerCase().includes("first name"), "Error message specifies First Name is required");

  // Test 2: Rejects invalid email formats
  console.log("\n[2] Testing Strict Email Validation...");
  const invalidEmails = [
    "plainaddress",
    "missingatsign.com",
    "@missingusername.com",
    "username@.com",
    "username@domain",
    "username@domain.c",
  ];

  for (const badEmail of invalidEmails) {
    const resBad = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: badEmail,
        password: "Password123!",
        firstName: "Tiger",
        lastName: "Woods",
      }),
    });
    check(resBad.status === 400, `Rejects invalid email '${badEmail}' with HTTP 400`);
  }

  // Test 3: Successfully registers with First Name only (NO Last Name provided)
  console.log("\n[3] Testing Registration with First Name ONLY (Last Name Optional)...");
  const singleNameEmail = `solo${timestamp}@example.com`;
  const res3 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: singleNameEmail,
      password: "Password123!",
      firstName: "Rory",
      // Notice: NO lastName provided
      charityContributionPercent: 15,
    }),
  });
  const data3 = await res3.json();
  check(res3.status === 201, "Registration succeeds with First Name only (HTTP 201 Created)");
  check(data3.success === true, "Response envelope reports success: true");
  check(data3.data?.user?.firstName === "Rory", "User created with correct firstName");
  check(data3.data?.user?.lastName === "", "User created with empty string for optional lastName");
  const soloToken = data3.data?.token;

  // Test 4: Profile update works with empty Last Name
  console.log("\n[4] Testing Profile Update with Optional Last Name...");
  const res4 = await fetch(`${BASE_URL}/api/auth/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${soloToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: "RoryUpdated",
      lastName: "", // explicitly empty
    }),
  });
  const data4 = await res4.json();
  check(res4.status === 200, "Profile update succeeds with empty lastName (HTTP 200)");
  check(data4.data?.user?.firstName === "RoryUpdated", "Updated firstName recorded");

  // Test 5: Successfully registers with both First Name and Last Name
  console.log("\n[5] Testing Registration with Both First and Last Name...");
  const fullNameEmail = `full${timestamp}@example.com`;
  const res5 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: fullNameEmail,
      password: "Password123!",
      firstName: "Collin",
      lastName: "Morikawa",
      charityContributionPercent: 20,
    }),
  });
  const data5 = await res5.json();
  check(res5.status === 201, "Registration succeeds with both names (HTTP 201 Created)");
  check(data5.data?.user?.firstName === "Collin", "Correct firstName recorded");
  check(data5.data?.user?.lastName === "Morikawa", "Correct lastName recorded");

  console.log("\n================================================================================");
  console.log(`   VALIDATION TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
