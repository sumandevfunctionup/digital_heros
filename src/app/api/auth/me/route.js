import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import Score from "@/models/Score";
import Charity from "@/models/Charity";

export async function GET(request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    // Populate charity if not populated
    let selectedCharity = null;
    if (user.selectedCharityId) {
      selectedCharity = await Charity.findById(user.selectedCharityId).select(
        "name slug category logoUrl totalFundsRaised"
      );
    }

    // Count user's active scores
    const activeScores = await Score.find({
      userId: user._id,
      isCurrentActive: true,
    })
      .sort({ date: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionRenewalDate: user.subscriptionRenewalDate,
          charityContributionPercent: user.charityContributionPercent,
          selectedCharity,
          activeScoresCount: activeScores.length,
          isTicketComplete: activeScores.length === 5,
        },
      },
    });
  } catch (error) {
    console.error("[API Auth Me Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch user session.",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { userProfileUpdateSchema, formatZodError } = await import("@/lib/validators");
    const parsed = userProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const { message, issues } = formatZodError(parsed.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
            issues,
          },
        },
        { status: 400 }
      );
    }

    const User = (await import("@/models/User")).default;
    const Charity = (await import("@/models/Charity")).default;

    const updateFields = {};
    if (parsed.data.firstName !== undefined) updateFields.firstName = parsed.data.firstName;
    if (parsed.data.lastName !== undefined) updateFields.lastName = parsed.data.lastName;
    if (parsed.data.charityContributionPercent !== undefined) {
      updateFields.charityContributionPercent = parsed.data.charityContributionPercent;
    }
    if (parsed.data.selectedCharityId !== undefined) {
      if (parsed.data.selectedCharityId) {
        const charityExists = await Charity.findById(parsed.data.selectedCharityId);
        if (!charityExists) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "Selected charity does not exist.",
              },
            },
            { status: 404 }
          );
        }
      }
      updateFields.selectedCharityId = parsed.data.selectedCharityId;
    }

    const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
      new: true,
      runValidators: true,
    }).populate("selectedCharityId", "name slug category logoUrl totalFundsRaised");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionPlan: updatedUser.subscriptionPlan,
          subscriptionRenewalDate: updatedUser.subscriptionRenewalDate,
          charityContributionPercent: updatedUser.charityContributionPercent,
          selectedCharity: updatedUser.selectedCharityId,
        },
      },
    });
  } catch (error) {
    console.error("[API Auth Me PATCH Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update profile.",
        },
      },
      { status: 500 }
    );
  }
}
