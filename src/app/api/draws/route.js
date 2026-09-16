import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Draw from "@/models/Draw";

/**
 * GET /api/draws
 * Archive of all officially published draws
 */
export async function GET() {
  try {
    await connectDB();

    const draws = await Draw.find({ status: "published" })
      .sort({ drawNumber: -1 })
      .select("-__v");

    return NextResponse.json({
      success: true,
      data: { draws },
      meta: { total: draws.length },
    });
  } catch (error) {
    console.error("[API Get Draws Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch past draws.",
        },
      },
      { status: 500 }
    );
  }
}
