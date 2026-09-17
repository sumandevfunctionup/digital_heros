import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

// Import all models
import User from "../src/models/User.js";
import Score from "../src/models/Score.js";
import Charity from "../src/models/Charity.js";
import Draw from "../src/models/Draw.js";
import Winner from "../src/models/Winner.js";
import Donation from "../src/models/Donation.js";
import Payment from "../src/models/Payment.js";

const models = [
  { name: "User", model: User },
  { name: "Score", model: Score },
  { name: "Charity", model: Charity },
  { name: "Draw", model: Draw },
  { name: "Winner", model: Winner },
  { name: "Donation", model: Donation },
  { name: "Payment", model: Payment },
];

async function syncAllIndexes() {
  console.log("🔌 Connecting to MongoDB Atlas with serverless IPv4 config...");
  const opts = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    autoIndex: true,
  };

  await mongoose.connect(MONGODB_URI, opts);
  console.log(`✅ Connected to database: ${mongoose.connection.name} (${mongoose.connection.host})`);

  console.log("\n==================================================");
  console.log("🚀 SYNCHRONIZING MONGOOSE SCHEMAS WITH MONGODB ATLAS");
  console.log("==================================================\n");

  let totalIndexes = 0;

  for (const { name, model } of models) {
    console.log(`⏳ Synchronizing indexes for [${name}] (${model.collection.collectionName})...`);
    try {
      await model.syncIndexes();
      const currentIndexes = await model.collection.indexes();
      totalIndexes += currentIndexes.length;

      console.log(`  ✅ Synced successfully.`);
      console.log(`  📊 Active Indexes (${currentIndexes.length}):`);
      currentIndexes.forEach((idx) => {
        const keys = Object.entries(idx.key)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        const flags = [];
        if (idx.unique) flags.push("UNIQUE");
        if (idx.sparse) flags.push("SPARSE");
        const flagStr = flags.length ? ` [${flags.join(", ")}]` : "";
        console.log(`     • ${idx.name} -> { ${keys} }${flagStr}`);
      });
      console.log("");
    } catch (err) {
      console.error(`  ❌ Error syncing [${name}]:`, err.message);
    }
  }

  console.log("==================================================");
  console.log(`🎉 ALL INDEXES SYNCHRONIZED! Total active indexes across ${models.length} collections: ${totalIndexes}`);
  console.log("==================================================\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB.");
}

syncAllIndexes().catch((err) => {
  console.error("❌ Fatal sync error:", err);
  process.exit(1);
});
