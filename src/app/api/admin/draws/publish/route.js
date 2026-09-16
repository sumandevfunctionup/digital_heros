import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Draw from "@/models/Draw";
import Winner from "@/models/Winner";
import { requireAdmin } from "@/lib/auth";
import { drawPublishSchema, formatZodError } from "@/lib/validators";
import { executeDrawCalculation } from "@/lib/drawEngine";

/**
 * POST /api/admin/draws/publish
 * Admin only: Immutably publish monthly draw and create Winner records (PRD § 06 & § 09)
 */
export async function POST(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const parseResult = drawPublishSchema.safeParse(body);
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

    const { drawMonth, algorithmType, drawnNumbers } = parseResult.data;

    // Strict Uniqueness Rule: Each draw month and year (YYYY-MM) must be unique
    const existingPublished = await Draw.findOne({
      drawMonth,
      status: "published",
    });

    if (existingPublished) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DRAW_ALREADY_PUBLISHED",
            message: `A draw has already been published for month ${drawMonth}. Each draw month/year must be unique.`,
            drawNumber: existingPublished.drawNumber,
          },
        },
        { status: 409 }
      );
    }

    // Determine next sequential drawNumber
    const lastDraw = await Draw.findOne().sort({ drawNumber: -1 });
    const nextDrawNumber = lastDraw ? lastDraw.drawNumber + 1 : 101;

    // Execute finalized calculation using the confirmed numbers
    const finalizedResults = await executeDrawCalculation({
      drawMonth,
      algorithmType,
      forcedNumbers: drawnNumbers,
    });

    // Create the published Draw
    const drawDoc = await Draw.create({
      drawNumber: nextDrawNumber,
      drawMonth,
      drawDate: new Date(),
      algorithmType,
      status: "published",
      drawnNumbers: finalizedResults.drawnNumbers,
      activeSubscribersCount: finalizedResults.activeSubscribersCount,
      basePrizePool: finalizedResults.basePrizePool,
      jackpotRolloverIn: finalizedResults.jackpotRolloverIn,
      totalPrizePool: finalizedResults.totalPrizePool,
      tier1Pool: finalizedResults.tier1Pool,
      tier2Pool: finalizedResults.tier2Pool,
      tier3Pool: finalizedResults.tier3Pool,
      tier1WinnersCount: finalizedResults.tier1WinnersCount,
      tier2WinnersCount: finalizedResults.tier2WinnersCount,
      tier3WinnersCount: finalizedResults.tier3WinnersCount,
      tier1PayoutPerWinner: finalizedResults.tier1PayoutPerWinner,
      tier2PayoutPerWinner: finalizedResults.tier2PayoutPerWinner,
      tier3PayoutPerWinner: finalizedResults.tier3PayoutPerWinner,
      jackpotRolloverOut: finalizedResults.jackpotRolloverOut,
      publishedBy: user._id,
      publishedAt: new Date(),
    });

    // Create Winner documents strictly in 'pending' status and 'unpaid' payoutStatus (PRD § 09)
    const winnerDocsToCreate = finalizedResults.winners.map((w) => ({
      drawId: drawDoc._id,
      userId: w.userId,
      tier: w.tier,
      matchCount: w.matchCount,
      matchedNumbers: w.matchedNumbers,
      userSubmittedScores: w.userSubmittedScores,
      prizeAmount: w.prizeAmount,
      status: "pending",
      verificationStatus: "pending_proof",
      payoutStatus: "unpaid",
    }));

    let createdWinners = [];
    if (winnerDocsToCreate.length > 0) {
      createdWinners = await Winner.insertMany(winnerDocsToCreate);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          draw: drawDoc,
          winnersCount: createdWinners.length,
          rolloverToNextMonth: drawDoc.jackpotRolloverOut,
        },
        message: `Draw #${drawDoc.drawNumber} officially published with ${createdWinners.length} winners queued for verification.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Publish Draw Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to publish draw.",
        },
      },
      { status: 500 }
    );
  }
}
