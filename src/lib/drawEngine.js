import User from "@/models/User";
import Score from "@/models/Score";
import Draw from "@/models/Draw";

/**
 * Generate 5 unique random integers between 1 and 45 (PRD § 06)
 */
export function generateRandomDrawNumbers() {
  const numbers = new Set();
  while (numbers.size < 5) {
    const num = Math.floor(Math.random() * 45) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generate 5 unique numbers weighted by score frequency (PRD § 06 Algorithmic Mode)
 */
export async function generateFrequencyWeightedDrawNumbers(activeTickets) {
  // Build frequency table of scores 1-45 from active tickets
  const freqMap = new Array(46).fill(1); // Laplace smoothing factor alpha = 1

  for (const ticket of activeTickets) {
    for (const s of ticket.scores) {
      if (s >= 1 && s <= 45) {
        freqMap[s] += 1;
      }
    }
  }

  const selected = new Set();
  const availableNumbers = Array.from({ length: 45 }, (_, i) => i + 1);

  while (selected.size < 5) {
    // Calculate total weight of remaining available numbers
    const remainingWeights = availableNumbers.filter((n) => !selected.has(n));
    const totalWeight = remainingWeights.reduce((acc, n) => acc + freqMap[n], 0);

    let randomVal = Math.random() * totalWeight;
    for (const num of remainingWeights) {
      randomVal -= freqMap[num];
      if (randomVal <= 0) {
        selected.add(num);
        break;
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Gathers all active subscribers with complete 5-score tickets
 */
export async function getEligibleSubscribersAndTickets() {
  // Find all active subscribers (strictly role: "user" to exclude administrators)
  const activeSubscribers = await User.find({
    role: "user",
    subscriptionStatus: { $in: ["active", "trialing"] },
  }).select("_id email firstName lastName subscriptionStatus");

  const subscriberMap = new Map();
  for (const sub of activeSubscribers) {
    subscriberMap.set(sub._id.toString(), sub);
  }

  // Find active scores for these subscribers
  const activeScores = await Score.find({
    userId: { $in: Array.from(subscriberMap.keys()) },
    isCurrentActive: true,
  }).sort({ date: -1 });

  // Group scores by user
  const userScoresMap = new Map();
  for (const scoreDoc of activeScores) {
    const uid = scoreDoc.userId.toString();
    if (!userScoresMap.has(uid)) {
      userScoresMap.set(uid, []);
    }
    userScoresMap.get(uid).push(scoreDoc);
  }

  // Filter only tickets that have exactly 5 scores (or active scores)
  const eligibleTickets = [];
  for (const [userId, scores] of userScoresMap.entries()) {
    if (scores.length === 5) {
      const user = subscriberMap.get(userId);
      eligibleTickets.push({
        user,
        userId: user._id,
        scores: scores.map((s) => s.score),
        scoreDocs: scores.map((s) => ({ score: s.score, date: s.date })),
      });
    }
  }

  return { activeSubscribers, eligibleTickets };
}

/**
 * Core Draw Calculation Engine
 */
export async function executeDrawCalculation({
  drawMonth,
  algorithmType = "random",
  forcedNumbers = null,
}) {
  const { activeSubscribers, eligibleTickets } = await getEligibleSubscribersAndTickets();

  // Find last published draw to get jackpot rollover in (PRD § 07)
  const lastDraw = await Draw.findOne({ status: "published" }).sort({ drawNumber: -1 });
  const jackpotRolloverIn = lastDraw ? lastDraw.jackpotRolloverOut || 0 : 0;

  // Base prize pool: e.g. $15 per active subscriber
  const SUBSCRIPTION_PRIZE_PORTION = 15;
  const basePrizePool = Math.max(
    500, // minimum floor
    activeSubscribers.length * SUBSCRIPTION_PRIZE_PORTION
  );
  const totalPrizePool = basePrizePool + jackpotRolloverIn;

  // Tier distributions (PRD § 07)
  const tier1Pool = +(totalPrizePool * 0.4).toFixed(2); // 40% (5 matches)
  const tier2Pool = +(totalPrizePool * 0.35).toFixed(2); // 35% (4 matches)
  const tier3Pool = +(totalPrizePool * 0.25).toFixed(2); // 25% (3 matches)

  // Generate drawn numbers
  let drawnNumbers = forcedNumbers;
  if (!drawnNumbers || drawnNumbers.length !== 5) {
    if (algorithmType === "frequency_weighted") {
      drawnNumbers = await generateFrequencyWeightedDrawNumbers(eligibleTickets);
    } else {
      drawnNumbers = generateRandomDrawNumbers();
    }
  }

  const drawnSet = new Set(drawnNumbers);

  // Evaluate matching scores for all eligible tickets
  const tier1Winners = [];
  const tier2Winners = [];
  const tier3Winners = [];

  for (const ticket of eligibleTickets) {
    const matched = ticket.scores.filter((s) => drawnSet.has(s));
    const matchCount = matched.length;

    if (matchCount === 5) {
      tier1Winners.push({
        user: ticket.user,
        userId: ticket.userId,
        matchedNumbers: matched,
        userSubmittedScores: ticket.scoreDocs,
        tier: "tier_1_five_match",
        matchCount: 5,
      });
    } else if (matchCount === 4) {
      tier2Winners.push({
        user: ticket.user,
        userId: ticket.userId,
        matchedNumbers: matched,
        userSubmittedScores: ticket.scoreDocs,
        tier: "tier_2_four_match",
        matchCount: 4,
      });
    } else if (matchCount === 3) {
      tier3Winners.push({
        user: ticket.user,
        userId: ticket.userId,
        matchedNumbers: matched,
        userSubmittedScores: ticket.scoreDocs,
        tier: "tier_3_three_match",
        matchCount: 3,
      });
    }
  }

  // Calculate payouts per winner (equal split, PRD § 07)
  const tier1WinnersCount = tier1Winners.length;
  const tier2WinnersCount = tier2Winners.length;
  const tier3WinnersCount = tier3Winners.length;

  const tier1PayoutPerWinner =
    tier1WinnersCount > 0 ? +(tier1Pool / tier1WinnersCount).toFixed(2) : 0;
  const tier2PayoutPerWinner =
    tier2WinnersCount > 0 ? +(tier2Pool / tier2WinnersCount).toFixed(2) : 0;
  const tier3PayoutPerWinner =
    tier3WinnersCount > 0 ? +(tier3Pool / tier3WinnersCount).toFixed(2) : 0;

  // Unclaimed 5-match jackpot rollover rule: carries forward if 0 winners (PRD § 07)
  const jackpotRolloverOut = tier1WinnersCount === 0 ? tier1Pool : 0;

  // Assign individual prize amounts to winners
  for (const w of tier1Winners) w.prizeAmount = tier1PayoutPerWinner;
  for (const w of tier2Winners) w.prizeAmount = tier2PayoutPerWinner;
  for (const w of tier3Winners) w.prizeAmount = tier3PayoutPerWinner;

  return {
    drawMonth,
    algorithmType,
    drawnNumbers,
    activeSubscribersCount: activeSubscribers.length,
    eligibleTicketsCount: eligibleTickets.length,
    basePrizePool,
    jackpotRolloverIn,
    totalPrizePool,
    tier1Pool,
    tier2Pool,
    tier3Pool,
    tier1WinnersCount,
    tier2WinnersCount,
    tier3WinnersCount,
    tier1PayoutPerWinner,
    tier2PayoutPerWinner,
    tier3PayoutPerWinner,
    jackpotRolloverOut,
    winners: [...tier1Winners, ...tier2Winners, ...tier3Winners],
  };
}
