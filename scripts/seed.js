import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import bcrypt from "bcryptjs";

// Load environment variables from .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env");
  process.exit(1);
}

// Schemas
import User from "../src/models/User.js";
import Score from "../src/models/Score.js";
import Charity from "../src/models/Charity.js";
import Draw from "../src/models/Draw.js";
import Winner from "../src/models/Winner.js";
import Donation from "../src/models/Donation.js";

async function seed() {
  console.log("🔌 Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log(" Connected to database:", mongoose.connection.name);

  console.log(" Clearing existing test records...");
  await Promise.all([
    User.deleteMany({}),
    Score.deleteMany({}),
    Charity.deleteMany({}),
    Draw.deleteMany({}),
    Winner.deleteMany({}),
    Donation.deleteMany({}),
  ]);

  console.log(" Seeding verified Charities with Charity Golf Days...");
  const charities = await Charity.insertMany([
    {
      name: "Veterans On The Green",
      slug: "veterans-on-the-green",
      tagline: "Rehabilitation and brotherhood through adaptive golf",
      description:
        "Dedicated to empowering wounded veterans and first responders through specialized adaptive golf clinics, mental resilience retreats, and community tournaments.",
      category: "Veterans",
      logoUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&auto=format&fit=crop&q=80",
      websiteUrl: "https://veteransonthegreen.org",
      totalFundsRaised: 24500,
      supporterCount: 420,
      isFeatured: true,
      isActive: true,
      events: [
        {
          title: "Annual Veterans Memorial Golf Classic",
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
          location: "Torrey Pines South, San Diego, CA",
          description: "18-hole scramble tournament raising funds for specialized adaptive golf carts for amputee veterans.",
          registrationUrl: "https://veteransonthegreen.org/classic-2026",
        },
      ],
    },
    {
      name: "Junior Eagle STEM Academy",
      slug: "junior-eagle-stem",
      tagline: "Combining athletic discipline with engineering and tech education",
      description:
        "Providing under-resourced youth with after-school golf tuition paired with robotics, data science, and math tutoring.",
      category: "Youth & Education",
      logoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
      websiteUrl: "https://junioreagle.org",
      totalFundsRaised: 18200,
      supporterCount: 310,
      isFeatured: true,
      isActive: true,
      events: [
        {
          title: "Future Champions Pro-Am Golf Day",
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
          location: "Pinehurst No. 2, Village of Pinehurst, NC",
          description: "Pairing junior scholars with PGA and state professionals for an inspirational 18-hole charity exhibition.",
          registrationUrl: "https://junioreagle.org/pro-am",
        },
      ],
    },
    {
      name: "Fairway To Healthcare",
      slug: "fairway-to-healthcare",
      tagline: "Mobile medical clinics for rural and underserved golf communities",
      description:
        "Funding mobile mammography, cardiac screenings, and wellness checks for groundskeepers, caddies, and rural community residents.",
      category: "Healthcare",
      logoUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&auto=format&fit=crop&q=80",
      websiteUrl: "https://fairwayhealthcare.org",
      totalFundsRaised: 31800,
      supporterCount: 560,
      isFeatured: false,
      isActive: true,
      events: [],
    },
    {
      name: "Clean Greens Environmental Initiative",
      slug: "clean-greens-initiative",
      tagline: "Water conservation and native biodiversity in sports turf",
      description:
        "Supporting wildlife habitat restoration, solar irrigation conversions, and non-chemical turf preservation across recreational green spaces.",
      category: "Environment",
      logoUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&auto=format&fit=crop&q=80",
      websiteUrl: "https://cleangreens.eco",
      totalFundsRaised: 12900,
      supporterCount: 215,
      isFeatured: false,
      isActive: true,
      events: [],
    },
  ]);

  console.log(` Created ${charities.length} charities.`);

  console.log(" Seeding Admin and Subscriber accounts...");
  const adminPasswordHash = await bcrypt.hash("Admin1234!", 10);
  const playerPasswordHash = await bcrypt.hash("Player1234!", 10);

  const admin = await User.create({
    email: "admin@digitalheroes.co.in",
    passwordHash: adminPasswordHash,
    firstName: "Platform",
    lastName: "Admin",
    role: "admin",
    subscriptionStatus: "active",
    subscriptionPlan: "yearly",
    selectedCharityId: charities[0]._id,
    charityContributionPercent: 20,
    homeClub: "The National Club",
  });

  const subscriber1 = await User.create({
    email: "subscriber@digitalheroes.co.in",
    passwordHash: playerPasswordHash,
    firstName: "Jordan",
    lastName: "Spieth",
    role: "user",
    subscriptionStatus: "active",
    subscriptionPlan: "monthly",
    subscriptionRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
    selectedCharityId: charities[0]._id,
    charityContributionPercent: 15,
    handicapIndex: 4.2,
    homeClub: "Dallas National",
  });

  const subscriber2 = await User.create({
    email: "golfer@digitalheroes.co.in",
    passwordHash: playerPasswordHash,
    firstName: "Rory",
    lastName: "McIlroy",
    role: "user",
    subscriptionStatus: "active",
    subscriptionPlan: "yearly",
    subscriptionRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 320),
    selectedCharityId: charities[1]._id,
    charityContributionPercent: 25,
    handicapIndex: +1.8,
    homeClub: "Holywood Golf Club",
  });

  // Dedicated Unsubscribed Golfer (to test first-time login payment gateway prompt)
  const unsubscribedGolfer = await User.create({
    email: "newgolfer@digitalheroes.co.in",
    passwordHash: playerPasswordHash,
    firstName: "Sam",
    lastName: "Burns",
    role: "user",
    subscriptionStatus: "none",
    subscriptionPlan: null,
    subscriptionRenewalDate: null,
    selectedCharityId: charities[0]._id,
    charityContributionPercent: 10,
    handicapIndex: 8.5,
    homeClub: "Shreveport Country Club",
  });

  console.log(" Seeding rolling 5-score histories (Stableford 1-45, distinct dates)...");
  // Helper to construct normalized UTC dates
  const daysAgo = (days) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  };

  // Subscriber 1: 5 active scores (38, 41, 35, 42, 39)
  await Score.insertMany([
    { userId: subscriber1._id, score: 39, date: daysAgo(2), courseName: "Pebble Beach", isCurrentActive: true },
    { userId: subscriber1._id, score: 42, date: daysAgo(6), courseName: "Spyglass Hill", isCurrentActive: true },
    { userId: subscriber1._id, score: 35, date: daysAgo(12), courseName: "Spanish Bay", isCurrentActive: true },
    { userId: subscriber1._id, score: 41, date: daysAgo(18), courseName: "Cypress Point", isCurrentActive: true },
    { userId: subscriber1._id, score: 38, date: daysAgo(24), courseName: "Monterey Peninsula", isCurrentActive: true },
    // Archived 6th score (demonstrating rolling FIFO replacement)
    { userId: subscriber1._id, score: 32, date: daysAgo(35), courseName: "Old Course St Andrews", isCurrentActive: false, archivedAt: daysAgo(2) },
  ]);

  // Subscriber 2: 5 active scores (36, 40, 37, 44, 38)
  await Score.insertMany([
    { userId: subscriber2._id, score: 38, date: daysAgo(1), courseName: "Royal County Down", isCurrentActive: true },
    { userId: subscriber2._id, score: 44, date: daysAgo(5), courseName: "Royal Portrush", isCurrentActive: true },
    { userId: subscriber2._id, score: 37, date: daysAgo(10), courseName: "Lahinch", isCurrentActive: true },
    { userId: subscriber2._id, score: 40, date: daysAgo(15), courseName: "Ballybunion", isCurrentActive: true },
    { userId: subscriber2._id, score: 36, date: daysAgo(22), courseName: "Portmarnock", isCurrentActive: true },
  ]);

  console.log(" Seeding initial historical Draw (#100) with unclaimed jackpot rollover...");
  const historicalDraw = await Draw.create({
    drawNumber: 100,
    drawMonth: "2026-02",
    drawDate: daysAgo(15),
    algorithmType: "random",
    status: "published",
    drawnNumbers: [7, 18, 35, 38, 41], // Matched subscriber1's 35, 38, and 41
    activeSubscribersCount: 250,
    basePrizePool: 3750,
    jackpotRolloverIn: 0,
    totalPrizePool: 3750,
    tier1Pool: 1500, // 40%
    tier2Pool: 1312.5, // 35%
    tier3Pool: 937.5, // 25%
    tier1WinnersCount: 0, // Unclaimed!
    tier2WinnersCount: 0,
    tier3WinnersCount: 1, // Subscriber 1 won Tier 3!
    tier1PayoutPerWinner: 0,
    tier2PayoutPerWinner: 0,
    tier3PayoutPerWinner: 937.5,
    jackpotRolloverOut: 1500, // 40% rolls over into next month's jackpot
    publishedBy: admin._id,
    publishedAt: daysAgo(15),
  });

  console.log(" Seeding Winner record for Subscriber 1 in Draw #100...");
  await Winner.create({
    drawId: historicalDraw._id,
    userId: subscriber1._id,
    tier: "tier_3_three_match",
    matchCount: 3,
    matchedNumbers: [35, 38, 41],
    userSubmittedScores: [
      { score: 39, date: daysAgo(2) },
      { score: 42, date: daysAgo(6) },
      { score: 35, date: daysAgo(12) },
      { score: 41, date: daysAgo(18) },
      { score: 38, date: daysAgo(24) },
    ],
    prizeAmount: 937.5,
    status: "pending",
    verificationStatus: "pending_proof", // Waiting for subscriber screenshot upload
    payoutStatus: "unpaid",
  });

  console.log("\n Database Seeding Completed Successfully!");
  console.log("--------------------------------------------------");
  console.log(" Credentials for Testing:");
  console.log(" Admin:      admin@digitalheroes.co.in / Admin1234!");
  console.log(" Subscriber: subscriber@digitalheroes.co.in / Player1234!");
  console.log(" Golfer:     golfer@digitalheroes.co.in / Player1234!");
  console.log(" Rollover Jackpot in Play: $1,500.00 from Draw #100");
  console.log("--------------------------------------------------\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
