import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Winner from "@/models/Winner";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/winners
 * Admin verification queue with filtering options (PRD § 09 & § 11)
 */
export async function GET(request) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const verificationStatus = searchParams.get("verificationStatus");
    const payoutStatus = searchParams.get("payoutStatus");

    const query = {};
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (payoutStatus) query.payoutStatus = payoutStatus;

    const winners = await Winner.find(query)
      .populate("userId", "firstName lastName email homeClub handicapIndex subscriptionStatus")
      .populate("drawId", "drawNumber drawMonth drawDate drawnNumbers")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    const counts = {
      pending_proof: await Winner.countDocuments({ verificationStatus: "pending_proof" }),
      proof_submitted: await Winner.countDocuments({ verificationStatus: "proof_submitted" }),
      approved: await Winner.countDocuments({ verificationStatus: "approved" }),
      rejected: await Winner.countDocuments({ verificationStatus: "rejected" }),
      paid: await Winner.countDocuments({ payoutStatus: "paid" }),
    };

    return NextResponse.json({
      success: true,
      data: {
        winners,
        counts,
      },
      meta: { total: winners.length },
    });
  } catch (error) {
    console.error("[API Admin Get Winners Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch winners queue.",
        },
      },
      { status: 500 }
    );
  }
}
