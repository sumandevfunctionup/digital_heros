import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Winner from "@/models/Winner";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/winners
 * Subscriber portal: view all prizes won by logged-in user
 */
export async function GET(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const winnings = await Winner.find({ userId: user._id })
      .populate("drawId", "drawNumber drawMonth drawDate drawnNumbers")
      .sort({ createdAt: -1 });

    const totalWon = winnings
      .filter(
        (w) =>
          w.status === "approved" ||
          w.status === "paidout" ||
          w.status === "paid" ||
          w.verificationStatus === "approved" ||
          w.payoutStatus === "paid"
      )
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    const pendingClaimCount = winnings.filter(
      (w) =>
        w.status === "pending" ||
        w.status === "pending_proof" ||
        w.status === "rejected" ||
        w.verificationStatus === "pending_proof" ||
        w.verificationStatus === "rejected"
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        winnings,
        totalWon,
        pendingClaimCount,
      },
    });
  } catch (error) {
    console.error("[API Get Winnings Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch winnings.",
        },
      },
      { status: 500 }
    );
  }
}
