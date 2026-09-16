import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Charity from "@/models/Charity";
import Draw from "@/models/Draw";
import Winner from "@/models/Winner";
import Donation from "@/models/Donation";
import Score from "@/models/Score";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/analytics
 * High-level executive KPIs and platform statistics (PRD § 11: Reports & analytics)
 */
export async function GET(request) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    // 1. User & Subscription metrics (strictly role: "user" to exclude admins)
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeSubscribers = await User.countDocuments({
      role: "user",
      subscriptionStatus: { $in: ["active", "trialing"] },
    });
    const monthlySubscribers = await User.countDocuments({
      role: "user",
      subscriptionStatus: "active",
      subscriptionPlan: "monthly",
    });
    const yearlySubscribers = await User.countDocuments({
      role: "user",
      subscriptionStatus: "active",
      subscriptionPlan: "yearly",
    });

    // MRR Calculation ($25/mo for monthly, $20/mo equivalent for $240/yr)
    const estimatedMRR = monthlySubscribers * 25 + yearlySubscribers * 20;

    // 2. Charity Impact metrics
    const charities = await Charity.find().select("totalFundsRaised supporterCount name");
    const totalCharityFundsRaised = charities.reduce(
      (sum, c) => sum + (c.totalFundsRaised || 0),
      0
    );

    const directDonations = await Donation.find({ paymentStatus: "succeeded" });
    const directDonationTotal = directDonations.reduce((sum, d) => sum + d.amount, 0);

    // 3. Draw & Prize metrics
    const publishedDraws = await Draw.find({ status: "published" }).sort({ drawNumber: -1 });
    const totalPrizesAwarded = publishedDraws.reduce(
      (sum, d) => sum + (d.totalPrizePool - d.jackpotRolloverOut),
      0
    );
    const currentJackpotRollover = publishedDraws.length > 0 ? publishedDraws[0].jackpotRolloverOut : 0;

    // 4. Winner metrics
    const totalWinners = await Winner.countDocuments();
    const paidWinners = await Winner.countDocuments({ payoutStatus: "paid" });
    const pendingVerificationWinners = await Winner.countDocuments({
      verificationStatus: { $in: ["pending_proof", "proof_submitted"] },
    });

    // 5. Score activity metrics
    const totalScoresLogged = await Score.countDocuments();
    const activeScoreTickets = await Score.countDocuments({ isCurrentActive: true });

    // Aggregate score distribution for 1-45 frequency histogram
    const scoreAgg = await Score.aggregate([
      { $match: { isCurrentActive: true } },
      { $group: { _id: "$score", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const scoreDistribution = Array.from({ length: 45 }, (_, i) => {
      const scoreNum = i + 1;
      const found = scoreAgg.find((s) => s._id === scoreNum);
      return { score: scoreNum, count: found ? found.count : 0 };
    });

    return NextResponse.json({
      success: true,
      data: {
        users: {
          totalUsers,
          activeSubscribers,
          monthlySubscribers,
          yearlySubscribers,
          estimatedMRR,
        },
        charities: {
          totalCharityFundsRaised,
          directDonationTotal,
          activeCharitiesCount: charities.length,
          topCharities: charities
            .sort((a, b) => b.totalFundsRaised - a.totalFundsRaised)
            .slice(0, 5),
        },
        draws: {
          totalDrawsConducted: publishedDraws.length,
          totalPrizesAwarded,
          currentJackpotRollover,
          latestDraw: publishedDraws[0] || null,
        },
        winners: {
          totalWinners,
          paidWinners,
          pendingVerificationWinners,
        },
        scores: {
          totalScoresLogged,
          activeScoresInPlay: activeScoreTickets,
          scoreDistribution,
        },
      },
    });
  } catch (error) {
    console.error("[API Admin Analytics Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to generate analytics.",
        },
      },
      { status: 500 }
    );
  }
}
