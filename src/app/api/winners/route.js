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

    const url = new URL(request?.url || "http://localhost/api/winners");
    const hasPagination = url.searchParams.has("page") || url.searchParams.has("limit");
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = url.searchParams.has("limit")
      ? Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit"), 10)))
      : hasPagination
      ? 10
      : 0;

    const total = await Winner.countDocuments({ userId: user._id });
    const totalPages = limit > 0 ? Math.ceil(total / limit) || 1 : 1;

    let winningsQuery = Winner.find({ userId: user._id })
      .populate("drawId", "drawNumber drawMonth drawDate drawnNumbers")
      .sort({ createdAt: -1 });

    if (limit > 0) {
      winningsQuery = winningsQuery.skip((page - 1) * limit).limit(limit);
    }

    const winnings = await winningsQuery;

    // Calculate user lifetime aggregates across all records
    const allUserWinnings = await Winner.find({ userId: user._id }).select("prizeAmount status verificationStatus payoutStatus");

    const totalWon = allUserWinnings
      .filter(
        (w) =>
          w.status === "approved" ||
          w.status === "paidout" ||
          w.status === "paid" ||
          w.verificationStatus === "approved" ||
          w.payoutStatus === "paid"
      )
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0);

    const pendingClaimCount = allUserWinnings.filter(
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
      meta: {
        total,
        page,
        limit: limit > 0 ? limit : total,
        totalPages,
        hasNextPage: limit > 0 ? page < totalPages : false,
        hasPrevPage: limit > 0 ? page > 1 : false,
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
