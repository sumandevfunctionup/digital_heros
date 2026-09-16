import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Score from "@/models/Score";
import Winner from "@/models/Winner";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/users/[id]
 * User inspection: profile, active scores, score history, and winnings
 */
export async function GET(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const user = await User.findById(id)
      .populate("selectedCharityId", "name slug category")
      .select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
          },
        },
        { status: 404 }
      );
    }

    const scores = await Score.find({ userId: id }).sort({ date: -1 });
    const winnings = await Winner.find({ userId: id }).populate("drawId").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        user,
        scores,
        winnings,
      },
    });
  } catch (error) {
    console.error("[API Admin Get User Detail Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch user details.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Admin override: update subscription, role, or charity settings
 */
export async function PATCH(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await request.json();

    // Whitelist editable fields
    const allowedUpdates = [
      "subscriptionStatus",
      "subscriptionPlan",
      "subscriptionRenewalDate",
      "role",
      "charityContributionPercent",
      "selectedCharityId",
      "handicapIndex",
      "homeClub",
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found.",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("[API Admin Update User Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update user.",
        },
      },
      { status: 500 }
    );
  }
}
