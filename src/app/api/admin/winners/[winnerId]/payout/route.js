import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Winner from "@/models/Winner";
import { requireAdmin } from "@/lib/auth";
import { winnerPayoutSchema, formatZodError } from "@/lib/validators";

/**
 * PATCH /api/admin/winners/[winnerId]/payout
 * Admin only: Mark prize payout as completed with payment reference (PRD § 09: Pending -> Paid)
 */
export async function PATCH(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { winnerId } = await context.params;
    const body = await request.json();

    const parseResult = winnerPayoutSchema.safeParse(body);
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

    const { payoutMethod, payoutReference } = parseResult.data;

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

    // Strict Guard: Verification MUST be approved. If verification failed (rejected) or incomplete, DO NOT payout!
    if (winner.status === "rejected" || winner.verificationStatus === "rejected") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VERIFICATION_FAILED",
            message: "Verification failed (rejected). Payout is strictly prohibited for rejected claims.",
          },
        },
        { status: 400 }
      );
    }

    if (winner.status !== "approved" && winner.verificationStatus !== "approved") {
      const currentStat = winner.status || winner.verificationStatus;
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAPPROVED_WINNER",
            message: `Scorecard proof is '${currentStat}'. Payout is strictly prohibited unless verification status is 'approved'.`,
          },
        },
        { status: 400 }
      );
    }

    if (winner.status === "paidout" || winner.status === "paid" || winner.payoutStatus === "paid") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_PAID",
            message: "This prize has already been paid out and finalized.",
          },
        },
        { status: 400 }
      );
    }

    winner.status = "paidout";
    winner.payoutStatus = "paid";
    winner.payoutMethod = payoutMethod;
    winner.payoutReference = payoutReference;
    winner.paidAt = new Date();
    await winner.save();

    return NextResponse.json({
      success: true,
      data: { winner },
      message: `Payout of $${winner.prizeAmount.toFixed(2)} recorded successfully with reference ${payoutReference}.`,
    });
  } catch (error) {
    console.error("[API Record Payout Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to record payout.",
        },
      },
      { status: 500 }
    );
  }
}
