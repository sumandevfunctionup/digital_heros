import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/scores/history
 * Returns the authenticated user's complete score history (active + archived)
 * Supports pagination via query parameters: ?page=1&limit=20
 */
export async function GET(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const total = await Score.countDocuments({ userId: user._id });
    const scores = await Score.find({ userId: user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        scores,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("[API Get Score History Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch score history.",
        },
      },
      { status: 500 }
    );
  }
}
