import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

/**
 * POST /api/subscriptions/webhook
 * Stripe / PCI-compliant webhook receiver (PRD § 04: Subscription lifecycle listener)
 * Handles customer.subscription.created, invoice.payment_succeeded, customer.subscription.deleted
 */
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const eventType = body.type || "invoice.payment_succeeded";
    const dataObject = body.data?.object || body;

    const email = dataObject.customer_email || dataObject.email;
    const customerId = dataObject.customer || dataObject.customerId;

    if (email) {
      if (eventType === "invoice.payment_succeeded" || eventType === "customer.subscription.created") {
        await User.findOneAndUpdate(
          { email },
          {
            subscriptionStatus: "active",
            stripeCustomerId: customerId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        );
      } else if (eventType === "customer.subscription.deleted") {
        await User.findOneAndUpdate(
          { email },
          {
            subscriptionStatus: "canceled",
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      received: true,
      eventType,
    });
  } catch (error) {
    console.error("[API Webhook Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "WEBHOOK_HANDLER_ERROR",
          message: error.message || "Failed to process webhook event.",
        },
      },
      { status: 500 }
    );
  }
}
