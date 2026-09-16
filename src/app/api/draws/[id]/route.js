import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Draw from "@/models/Draw";
import Winner from "@/models/Winner";
import mongoose from "mongoose";

/**
 * GET /api/draws/[id]
 * Retrieves specific published draw results, winning numbers, and winners list
 */
export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else if (!isNaN(Number(id))) {
      query = { drawNumber: Number(id) };
    } else {
      query = { drawMonth: id };
    }

    const draw = await Draw.findOne(query);
    if (!draw) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DRAW_NOT_FOUND",
            message: "The requested draw was not found.",
          },
        },
        { status: 404 }
      );
    }

    // Fetch winners for this draw
    const winners = await Winner.find({ drawId: draw._id })
      .populate("userId", "firstName lastName homeClub")
      .select("tier matchCount prizeAmount verificationStatus payoutStatus createdAt");

    return NextResponse.json({
      success: true,
      data: {
        draw,
        winners,
        totalWinners: winners.length,
      },
    });
  } catch (error) {
    console.error("[API Get Draw Detail Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch draw details.",
        },
      },
      { status: 500 }
    );
  }
}
