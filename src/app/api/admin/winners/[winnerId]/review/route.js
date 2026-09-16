import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Winner from "@/models/Winner";
import { requireAdmin } from "@/lib/auth";
import { winnerReviewSchema, formatZodError } from "@/lib/validators";

/**
 * PATCH /api/admin/winners/[winnerId]/review
 * Admin only: Approve or Reject score proof submission (PRD § 09)
 */
export async function PATCH(request, context) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { winnerId } = await context.params;
    const body = await request.json();

    const parseResult = winnerReviewSchema.safeParse(body);
    if (!parseResult.success) {
      const { message, issues } = formatZodError(parseResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
            details: issues,
          },
        },
        { status: 400 }
      );
    }

    const { action, rejectionReason } = parseResult.data;

    const winner = await Winner.findById(winnerId);
    if (!winner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WINNER_NOT_FOUND",
            message: "Winner record not found.",
          },
        },
        { status: 404 }
      );
    }

    // Guard 1: Once a prize is paid out, its verification status is immutable and CANNOT be rejected or modified
    if (winner.status === "paidout" || winner.status === "paid" || winner.payoutStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PRIZE_ALREADY_PAID",
            message: "This prize has already been paid out. Verification status is permanently locked and cannot be rejected or modified.",
          },
        },
        { status: 400 }
      );
    }

    // Guard 2: Once approved, a winner's verification status is finalized and cannot be rejected or changed
    if (winner.status === "approved" || winner.verificationStatus === "approved") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_APPROVED",
            message: "Once approved, a winner's verification status is finalized and cannot be rejected or modified.",
          },
        },
        { status: 400 }
      );
    }

    if (action === "approve") {
      winner.status = "approved";
      winner.verificationStatus = "approved";
      winner.rejectionReason = null;
    } else {
      winner.status = "rejected";
      winner.verificationStatus = "rejected";
      winner.rejectionReason = rejectionReason || "Proof screenshot does not match entered scores.";
    }

    winner.reviewedBy = user._id;
    winner.reviewedAt = new Date();
    await winner.save();

    return NextResponse.json({
      success: true,
      data: { winner },
      message: `Winner verification status updated to '${winner.status}'.`,
    });
  } catch (error) {
    console.error("[API Review Winner Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to review winner.",
        },
      },
      { status: 500 }
    );
  }
}
