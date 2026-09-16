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

    if (winner.verificationStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAPPROVED_WINNER",
            message: `Cannot execute payout for a prize in '${winner.verificationStatus}' status. Proof must be approved first.`,
          },
        },
        { status: 400 }
      );
    }

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
