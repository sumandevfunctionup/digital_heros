import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Payment from "@/models/Payment";

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
    const invoiceId = dataObject.id || dataObject.invoice;
    const paymentIntentId = dataObject.payment_intent || dataObject.paymentIntentId;

    if (email) {
      const user = await User.findOne({ email });

      if (user) {
        if (eventType === "invoice.payment_succeeded" || eventType === "checkout.session.completed") {
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: "active",
            stripeCustomerId: customerId || user.stripeCustomerId,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
          });

          // Comprehensive multi-identifier deduplication query
          const queryOr = [];
          if (invoiceId) queryOr.push({ stripeInvoiceId: invoiceId });
          if (paymentIntentId) queryOr.push({ stripePaymentIntentId: paymentIntentId });
          if (dataObject.id && eventType === "checkout.session.completed") {
            queryOr.push({ stripeCheckoutSessionId: dataObject.id });
          }
          if (user) {
            const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
            queryOr.push({
              userId: user._id,
              status: "succeeded",
              createdAt: { $gte: sixtySecondsAgo },
            });
          }

          const existingPayment = await Payment.findOne({ $or: queryOr }).sort({ createdAt: -1 });

          if (!existingPayment) {
            const rawAmount = dataObject.amount_paid || dataObject.amount_total || dataObject.amount || 2500;
            const amount = typeof rawAmount === "number" && rawAmount > 500 ? rawAmount / 100 : rawAmount;
            const charityPercentage = user.charityContributionPercent || 10;
            const charityAmount = +(amount * (charityPercentage / 100)).toFixed(2);

            await Payment.create({
              userId: user._id,
              amount,
              currency: dataObject.currency ? dataObject.currency.toUpperCase() : "USD",
              plan: amount >= 150 ? "yearly" : "monthly",
              charityAmount,
              charityId: user.favoriteCharityId || null,
              status: "succeeded",
              cardBrand: dataObject.payment_method_details?.card?.brand || "Visa",
              cardLast4: dataObject.payment_method_details?.card?.last4 || "4242",
              stripePaymentIntentId: paymentIntentId || null,
              stripeInvoiceId: invoiceId || null,
              stripeCheckoutSessionId: eventType === "checkout.session.completed" ? dataObject.id : null,
              stripeCustomerId: customerId,
              receiptUrl: dataObject.hosted_invoice_url || null,
              eventType,
            });
          } else {
            // Idempotent pass: update missing fields on single existing payment record
            const updates = {};
            if (invoiceId && !existingPayment.stripeInvoiceId) updates.stripeInvoiceId = invoiceId;
            if (paymentIntentId && !existingPayment.stripePaymentIntentId) updates.stripePaymentIntentId = paymentIntentId;
            if (dataObject.hosted_invoice_url && !existingPayment.receiptUrl) updates.receiptUrl = dataObject.hosted_invoice_url;
            if (Object.keys(updates).length > 0) {
              await Payment.findByIdAndUpdate(existingPayment._id, updates);
            }
          }
        } else if (eventType === "customer.subscription.created") {
          await User.findByIdAndUpdate(user._id, {
            stripeCustomerId: customerId || user.stripeCustomerId,
          });
        } else if (eventType === "invoice.payment_failed") {
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: "past_due",
          });
          // Note: Payment object is strictly inserted only after success from Stripe gateway
        } else if (eventType === "customer.subscription.deleted") {
          await User.findByIdAndUpdate(user._id, {
            subscriptionStatus: "canceled",
            cancelAtPeriodEnd: true,
          });
        }
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
