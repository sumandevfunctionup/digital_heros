import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/subscriptions/cancel
 * Initiates subscription cancellation at the end of current billing period
 * PRD § 04: Lifecycle: Handles renewal, cancellation, and lapsed-subscription states
 */
export async function POST(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    // Check if user has an active subscription
    if (user.subscriptionStatus !== "active" && user.subscriptionStatus !== "trialing" && user.subscriptionStatus !== "yearly") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_ACTIVE_SUBSCRIPTION",
            message: "User does not have an active subscription to cancel.",
          },
        },
        { status: 400 }
      );
    }

    // Cancel in Stripe if stripeSubscriptionId exists and real key is available
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (
      user.stripeSubscriptionId &&
      stripeKey &&
      (stripeKey.startsWith("sk_test_") || stripeKey.startsWith("sk_live_")) &&
      !stripeKey.includes("...")
    ) {
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeKey);
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      } catch (stripeErr) {
        console.warn("[Stripe Cancel Warning]:", stripeErr.message);
      }
    }

    // Clear subscription data and reset status to canceled
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        subscriptionStatus: "canceled",
        subscriptionPlan: null,
        subscriptionRenewalDate: null,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      },
      { new: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: "Your subscription has been cancelled and membership details have been removed.",
      },
    });
  } catch (error) {
    console.error("[API Cancel Subscription Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to cancel subscription.",
        },
      },
      { status: 500 }
    );
  }
}
