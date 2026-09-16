import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Draw from "@/models/Draw";

/**
 * GET /api/draws/upcoming
 * Returns next scheduled draw date, current prize pool estimates, and jackpot rollover
 */
export async function GET() {
  try {
    await connectDB();

    const activeSubscribersCount = await User.countDocuments({
      role: "user",
      subscriptionStatus: { $in: ["active", "trialing"] },
    });

    // Find last published draw to get rollover carried over
    const lastDraw = await Draw.findOne({ status: "published" }).sort({ drawNumber: -1 });
    const jackpotRolloverIn = lastDraw ? lastDraw.jackpotRolloverOut || 0 : 0;

    const basePrizePool = Math.max(500, activeSubscribersCount * 15);
    const estimatedTotalPool = basePrizePool + jackpotRolloverIn;

    // Calculate next month draw date (1st of next month)
    const now = new Date();
    const nextDrawDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const countdownSeconds = Math.max(0, Math.floor((nextDrawDate.getTime() - now.getTime()) / 1000));

    return NextResponse.json({
      success: true,
      data: {
        nextDrawDate,
        countdownSeconds,
        activeSubscribersCount,
        jackpotRolloverIn,
        estimatedTotalPool,
        tier1EstimatedJackpot: +(estimatedTotalPool * 0.4).toFixed(2), // 40%
        tier2EstimatedPool: +(estimatedTotalPool * 0.35).toFixed(2),   // 35%
        tier3EstimatedPool: +(estimatedTotalPool * 0.25).toFixed(2),   // 25%
      },
    });
  } catch (error) {
    console.error("[API Upcoming Draw Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch upcoming draw information.",
        },
      },
      { status: 500 }
    );
  }
}
