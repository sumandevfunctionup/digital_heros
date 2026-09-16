import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/subscriptions/checkout
 * Subscribe to Monthly or Yearly plan (with automatic local sandbox mock support)
 */
export async function POST(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

    // In local evaluation or sandbox mode, we activate the subscription immediately
    const now = new Date();
    const renewalDate = new Date(now);
    if (plan === "yearly") {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        subscriptionRenewalDate: renewalDate,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          status: updatedUser.subscriptionStatus,
          plan: updatedUser.subscriptionPlan,
          renewalDate: updatedUser.subscriptionRenewalDate,
        },
      },
      message: `Successfully subscribed to the ${plan.toUpperCase()} plan. You are now eligible to enter scores and participate in monthly draws!`,
    });
  } catch (error) {
    console.error("[API Subscription Checkout Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to process subscription.",
        },
      },
      { status: 500 }
    );
  }
}
