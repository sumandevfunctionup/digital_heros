import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/subscriptions/status
 * Real-time subscription state validation (PRD § 04)
 */
export async function GET(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const isActive =
      user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

    return NextResponse.json({
      success: true,
      data: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionRenewalDate: user.subscriptionRenewalDate,
        isActive,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[API Subscription Status Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to check subscription status.",
        },
      },
      { status: 500 }
    );
  }
}
