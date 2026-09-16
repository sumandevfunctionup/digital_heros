import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey || stripeKey.includes("...")) {
  console.error("❌ STRIPE_SECRET_KEY is not defined in .env");
  process.exit(1);
}

// Locate stripe binary
let stripeBin = "stripe";
const localStripeBin = path.join(process.env.HOME || "", ".local", "bin", "stripe");
if (fs.existsSync(localStripeBin)) {
  stripeBin = localStripeBin;
}

console.log("\n============================================================");
console.log("🚀 Starting Stripe Webhook Live Forwarder to localhost:3000/webhook/stripe");
console.log(`   Binary: ${stripeBin}`);
console.log(`   Target: http://localhost:3000/webhook/stripe`);
console.log("============================================================\n");

const child = spawn(
  stripeBin,
  [
    "listen",
    "--api-key",
    stripeKey,
    "--forward-to",
    "localhost:3000/webhook/stripe",
  ],
  { stdio: "inherit" }
);

child.on("error", (err) => {
  console.error("❌ Failed to spawn stripe CLI:", err.message);
});

child.on("exit", (code) => {
  console.log(`Stripe CLI process exited with code ${code}`);
});
