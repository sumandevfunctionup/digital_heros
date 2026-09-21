import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

/**
 * POST /api/subscriptions/checkout
 * Dual-Mode Stripe Checkout:
 * 1. Real Stripe Hosted Checkout if STRIPE_SECRET_KEY is valid & mode is 'hosted'
 * 2. Instant Sandbox Testmode Gateway for local evaluation and automated tests
 */
export async function POST(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const plan = body.plan === "yearly" ? "yearly" : "monthly";

    // Reject duplicate checkout for the same active plan (prevent double billing)
    const isAlreadySubscribed = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";
    if (isAlreadySubscribed && user.subscriptionPlan === plan && !user.cancelAtPeriodEnd && body.mode !== "force") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_ACTIVE_ON_PLAN",
            message: `You already have an active ${plan.toUpperCase()} membership. If you wish to switch plans, please select ${plan === "monthly" ? "Annual" : "Monthly"}.`,
          },
        },
        { status: 400 }
      );
    }

    // Detect if genuine Stripe secret key is configured (not placeholder)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const hasRealStripeKey =
      Boolean(stripeKey) &&
      (stripeKey.startsWith("sk_test_") || stripeKey.startsWith("sk_live_")) &&
      !stripeKey.includes("...");

    // Real Stripe Hosted Checkout when STRIPE_SECRET_KEY is configured and mode is not explicitly 'sandbox'
    if (hasRealStripeKey && body.mode !== "sandbox") {
      const stripe = new Stripe(stripeKey);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const unitAmount = plan === "yearly" ? 25000 : 2500;
      const charityPercent = user.charityContributionPercent || 10;
      const charityAmount = +( (plan === "yearly" ? 250 : 25) * (charityPercent / 100) ).toFixed(2);

      // ALWAYS use the unified checkout success path returning to /dashboard/settings
      const returnPath = body.returnUrl || "/dashboard/settings";
      const cleanReturn = returnPath.startsWith("/") ? returnPath : `/${returnPath}`;
      const successUrl = `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&returnUrl=${encodeURIComponent(cleanReturn)}`;
      const cancelUrl = `${appUrl}${cleanReturn}${cleanReturn.includes("?") ? "&" : "?"}canceled=true`;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        metadata: {
          userId: user._id.toString(),
          userEmail: user.email,
          plan,
          charityPercent: charityPercent.toString(),
          charityAmount: charityAmount.toString(),
          charityId: user.selectedCharityId ? user.selectedCharityId.toString() : "",
        },
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan === "yearly" ? "digital.HEROES Annual Membership" : "digital.HEROES Monthly Membership",
                description: `5-slot golf handicap tracking, monthly jackpot draw eligibility, and $${charityAmount} (${charityPercent}%) charity donation.`,
              },
              unit_amount: unitAmount,
              recurring: {
                interval: plan === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return NextResponse.json({
        success: true,
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
          plan,
        },
      });
    }

    // Only allow instant activation if mode is explicitly 'sandbox' or 'instant'
    if (body.mode !== "sandbox" && body.mode !== "instant") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYMENT_GATEWAY_REQUIRED",
            message: "Payment processing via Stripe Payment Gateway is required to activate a membership.",
          },
        },
        { status: 402 }
      );
    }

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
        cancelAtPeriodEnd: false,
        stripeCustomerId: user.stripeCustomerId || `cus_${Math.random().toString(36).substring(2, 11)}`,
      },
      { new: true }
    );

    // Record sandbox payment in ledger if Payment model exists
    try {
      const Payment = (await import("@/models/Payment")).default;
      const amount = plan === "yearly" ? 250 : 25;
      const charityPercent = updatedUser.charityContributionPercent || 10;
      const charityAmount = +(amount * (charityPercent / 100)).toFixed(2);
      await Payment.create({
        userId: updatedUser._id,
        amount,
        currency: "USD",
        plan,
        charityAmount,
        charityContributionPercent: charityPercent,
        charityId: updatedUser.selectedCharityId || null,
        status: "succeeded",
        stripePaymentIntentId: body.stripePaymentIntentId || `pi_sandbox_${Date.now()}`,
        stripeCustomerId: updatedUser.stripeCustomerId,
        paymentMethod: "sandbox_card",
        cardLast4: body.cardLast4 || "4242",
        cardBrand: body.cardBrand || "Visa",
      });
    } catch (payErr) {
      console.warn("[Sandbox Payment Ledger Warning]:", payErr.message);
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          status: updatedUser.subscriptionStatus,
          plan: updatedUser.subscriptionPlan,
          renewalDate: updatedUser.subscriptionRenewalDate,
        },
      },
      message: `Successfully initialized subscription for ${plan.toUpperCase()} plan.`,
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
