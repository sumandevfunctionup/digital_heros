import mongoose from "mongoose";

/**
 * Payment Schema
 * Immutable audit ledger of all membership subscription transactions,
 * Stripe webhook confirmations, and charity pledge allocations.
 */
const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    charityAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
    },
    status: {
      type: String,
      enum: ["succeeded", "failed", "pending", "refunded"],
      default: "succeeded",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    cardBrand: {
      type: String,
      default: "Visa",
    },
    cardLast4: {
      type: String,
      default: "4242",
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeInvoiceId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      index: true,
    },
    receiptUrl: {
      type: String,
    },
    eventType: {
      type: String,
      default: "invoice.payment_succeeded",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user payment history, analytics revenue aggregation, and charity allocation
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ charityId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
