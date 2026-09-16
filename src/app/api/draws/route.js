import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Draw from "@/models/Draw";
import Winner from "@/models/Winner";
import "@/models/User"; // Ensure User model registered for population

/**
 * GET /api/draws
 * Archive of all officially published draws with winners roster
 */
export async function GET() {
  try {
    await connectDB();

    const draws = await Draw.find({ status: "published" })
      .sort({ drawNumber: -1 })
      .select("-__v")
      .lean();

    const drawIds = draws.map((d) => d._id);
    const allWinners = await Winner.find({ drawId: { $in: drawIds } })
      .populate("userId", "firstName lastName homeClub email")
      .select(
        "drawId userId tier matchCount matchedNumbers prizeAmount status verificationStatus payoutStatus userSubmittedScores createdAt"
      )
      .lean();

    // Group winners by drawId
    const winnersByDraw = new Map();
    for (const w of allWinners) {
      const did = w.drawId.toString();
      if (!winnersByDraw.has(did)) {
        winnersByDraw.set(did, []);
      }
      winnersByDraw.get(did).push(w);
    }

    const enrichedDraws = draws.map((draw) => {
      const drawWinners = winnersByDraw.get(draw._id.toString()) || [];
      const totalWinnersCount =
        drawWinners.length > 0
          ? drawWinners.length
          : (draw.tier1WinnersCount || 0) + (draw.tier2WinnersCount || 0) + (draw.tier3WinnersCount || 0);

      return {
        ...draw,
        winners: drawWinners,
        winnersCount: totalWinnersCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: { draws: enrichedDraws },
      meta: { total: enrichedDraws.length },
    });
  } catch (error) {
    console.error("[API Get Draws Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch past draws.",
        },
      },
      { status: 500 }
    );
  }
}
