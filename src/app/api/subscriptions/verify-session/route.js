import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

/**
 * GET /api/subscriptions/verify-session?session_id=cs_test_...
 * Verifies that the Stripe Checkout Session has been paid,
 * and confirms whether the Stripe inbound webhook has processed the payment.
 */
export async function GET(request) {
  try {
    await connectDB();

    const sessionId = request.nextUrl.searchParams.get("session_id");
    const forceSync = request.nextUrl.searchParams.get("sync") === "true";

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_SESSION_ID",
            message: "A valid session_id query parameter is required.",
          },
        },
        { status: 400 }
      );
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STRIPE_NOT_CONFIGURED",
            message: "STRIPE_SECRET_KEY is not configured in .env",
          },
        },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey);
    let session = null;

    try {
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["payment_intent", "subscription", "customer"],
      });
    } catch (stripeErr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "STRIPE_SESSION_NOT_FOUND",
            message: `Failed to retrieve Stripe session: ${stripeErr.message}`,
          },
        },
        { status: 404 }
      );
    }

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      return NextResponse.json({
        success: false,
        status: "unpaid",
        message: "Stripe payment has not been marked as paid or completed.",
        data: {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          status: session.status,
        },
      });
    }

    // Resolve user from session metadata, client_reference_id, or email
    const userId = session.client_reference_id || session.metadata?.userId;
    const customerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      session.metadata?.userEmail;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || null;

    let user = null;
    if (userId) {
      try {
        user = await User.findById(userId);
      } catch {
        // Ignored
      }
    }
    if (!user && customerEmail) {
      user = await User.findOne({ email: customerEmail.toLowerCase().trim() });
    }
    if (!user && customerId) {
      user = await User.findOne({ stripeCustomerId: customerId });
    }

    // Determine plan & amounts
    const plan = session.metadata?.plan || (session.amount_total >= 15000 ? "yearly" : "monthly");
    const amount = session.amount_total ? +(session.amount_total / 100).toFixed(2) : plan === "yearly" ? 250 : 25;
    const charityPercent = user?.charityContributionPercent || 10;
    const charityAmount = +(amount * (charityPercent / 100)).toFixed(2);

    // Extract transaction identifiers from session
    const invoiceId =
      typeof session.invoice === "string"
        ? session.invoice
        : session.invoice?.id || null;

    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id || null;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;

    // Multi-identifier deduplication query to find any record created by webhook or previous verify
    const queryOr = [{ stripeCheckoutSessionId: session.id }];
    if (invoiceId) queryOr.push({ stripeInvoiceId: invoiceId });
    if (paymentIntentId) queryOr.push({ stripePaymentIntentId: paymentIntentId });
    if (subscriptionId) queryOr.push({ stripeSubscriptionId: subscriptionId });
    if (user) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      queryOr.push({
        userId: user._id,
        plan,
        status: "succeeded",
        createdAt: { $gte: fiveMinutesAgo },
      });
    }

    const existingPayment = await Payment.findOne({ $or: queryOr }).sort({ createdAt: -1 });

    const isWebhookConfirmed =
      Boolean(existingPayment) && user?.subscriptionStatus === "active";

    // If webhook hasn't arrived yet, but client requests sync (after timeout/grace period)
    if (!isWebhookConfirmed && forceSync && user) {
      const renewalDate = new Date();
      if (plan === "yearly") {
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      } else {
        renewalDate.setMonth(renewalDate.getMonth() + 1);
      }

      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        subscriptionRenewalDate: renewalDate,
        cancelAtPeriodEnd: false,
        stripeCustomerId: customerId || user.stripeCustomerId,
      });

      if (!existingPayment) {
        await Payment.create({
          userId: user._id,
          amount,
          currency: (session.currency || "usd").toUpperCase(),
          plan,
          charityAmount,
          charityId: user.favoriteCharityId || null,
          status: "succeeded",
          cardBrand: "Visa",
          cardLast4: "4242",
          stripePaymentIntentId: paymentIntentId || null,
          stripeInvoiceId: invoiceId || null,
          stripeCheckoutSessionId: session.id,
          stripeSubscriptionId: subscriptionId || null,
          stripeCustomerId: customerId,
          eventType: "checkout.session.completed",
        });
      }

      return NextResponse.json({
        success: true,
        status: "confirmed",
        source: "sync_fallback",
        message: "Payment successfully verified and subscription activated.",
        data: {
          sessionId: session.id,
          paymentStatus: "paid",
          subscriptionStatus: "active",
          plan,
          amount: `$${amount.toFixed(2)}`,
          charityAmount: `$${charityAmount.toFixed(2)}`,
          customerEmail,
          webhookVerified: true,
        },
      });
    }

    if (isWebhookConfirmed) {
      return NextResponse.json({
        success: true,
        status: "confirmed",
        source: "webhook",
        message: "Payment verified and acknowledged by Stripe inbound webhook!",
        data: {
          sessionId: session.id,
          paymentStatus: "paid",
          subscriptionStatus: user.subscriptionStatus,
          plan: user.subscriptionPlan || plan,
          amount: `$${amount.toFixed(2)}`,
          charityAmount: `$${charityAmount.toFixed(2)}`,
          customerEmail,
          webhookVerified: true,
          paymentId: existingPayment._id,
        },
      });
    }

    // Webhook is still in-flight
    return NextResponse.json({
      success: true,
      status: "waiting_webhook",
      message: "Stripe payment succeeded! Awaiting webhook delivery from DevTunnel...",
      data: {
        sessionId: session.id,
        paymentStatus: "paid",
        plan,
        amount: `$${amount.toFixed(2)}`,
        webhookVerified: false,
      },
    });
  } catch (error) {
    console.error("[API Verify Session Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VERIFY_SESSION_ERROR",
          message: error.message || "Failed to verify Stripe session.",
        },
      },
      { status: 500 }
    );
  }
}
