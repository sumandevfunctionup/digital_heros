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
    const status = searchParams.get("status");
    const verificationStatus = searchParams.get("verificationStatus");
    const payoutStatus = searchParams.get("payoutStatus");

    const query = {};
    if (status) {
      if (status === "pending_approval" || status === "proof_submitted") {
        query.$or = [{ status: "pending_approval" }, { status: "proof_submitted" }, { verificationStatus: "proof_submitted" }];
      } else if (status === "paidout" || status === "paid") {
        query.$or = [{ status: "paidout" }, { status: "paid" }, { payoutStatus: "paid" }];
      } else if (status === "approved") {
        query.$or = [
          { status: "approved" },
          { verificationStatus: "approved", payoutStatus: { $ne: "paid" } },
        ];
      } else {
        query.status = status;
      }
    } else {
      if (verificationStatus) query.verificationStatus = verificationStatus;
      if (payoutStatus) {
        if (payoutStatus === "unpaid") {
          query.payoutStatus = { $ne: "paid" };
        } else {
          query.payoutStatus = payoutStatus;
        }
      }
    }

    const winners = await Winner.find(query)
      .populate("userId", "firstName lastName email homeClub handicapIndex subscriptionStatus")
      .populate("drawId", "drawNumber drawMonth drawDate drawnNumbers")
      .populate("reviewedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    const counts = {
      pending_proof: await Winner.countDocuments({
        $or: [{ status: "pending_proof" }, { verificationStatus: "pending_proof", payoutStatus: { $ne: "paid" } }],
      }),
      proof_submitted: await Winner.countDocuments({
        $or: [{ status: "pending_approval" }, { status: "proof_submitted" }, { verificationStatus: "proof_submitted" }],
      }),
      pending_approval: await Winner.countDocuments({
        $or: [{ status: "pending_approval" }, { status: "proof_submitted" }, { verificationStatus: "proof_submitted" }],
      }),
      approved: await Winner.countDocuments({
        $or: [{ status: "approved" }, { verificationStatus: "approved", payoutStatus: { $ne: "paid" } }],
      }),
      rejected: await Winner.countDocuments({
        $or: [{ status: "rejected" }, { verificationStatus: "rejected" }],
      }),
      paid: await Winner.countDocuments({
        $or: [{ status: "paidout" }, { status: "paid" }, { payoutStatus: "paid" }],
      }),
      paidout: await Winner.countDocuments({
        $or: [{ status: "paidout" }, { status: "paid" }, { payoutStatus: "paid" }],
      }),
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
