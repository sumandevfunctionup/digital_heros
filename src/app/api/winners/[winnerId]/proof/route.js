import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Winner from "@/models/Winner";
import { requireAuth } from "@/lib/auth";
import { proofSubmissionSchema, formatZodError } from "@/lib/validators";

/**
 * POST /api/winners/[winnerId]/proof
 * Winner submits official golf screenshot for verification (PRD § 09)
 */
export async function POST(request, context) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { winnerId } = await context.params;
    const body = await request.json();

    const parseResult = proofSubmissionSchema.safeParse(body);
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

    const winner = await Winner.findById(winnerId);
    if (!winner) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WINNER_RECORD_NOT_FOUND",
            message: "Winner record not found.",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (winner.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only submit verification proof for your own prizes.",
          },
        },
        { status: 403 }
      );
    }

    winner.proofScreenshotUrl = parseResult.data.proofScreenshotUrl;
    winner.verificationStatus = "proof_submitted";
    winner.proofSubmittedAt = new Date();
    winner.rejectionReason = null; // Clear previous rejection if re-submitting

    await winner.save();

    return NextResponse.json({
      success: true,
      data: { winner },
      message: "Score verification screenshot submitted successfully. Admin review is pending.",
    });
  } catch (error) {
    console.error("[API Submit Proof Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to submit verification proof.",
        },
      },
      { status: 500 }
    );
  }
}
