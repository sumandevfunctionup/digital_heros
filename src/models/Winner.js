import mongoose from "mongoose";

const WinnerSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["tier_1_five_match", "tier_2_four_match", "tier_3_three_match"],
      required: true,
      index: true,
    },
    matchCount: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },
    matchedNumbers: [{ type: Number }],
    userSubmittedScores: [
      {
        score: Number,
        date: Date,
      },
    ],
    prizeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Winner Verification Lifecycle (PRD § 09)
    verificationStatus: {
      type: String,
      enum: ["pending_proof", "proof_submitted", "approved", "rejected"],
      default: "pending_proof",
      index: true,
    },
    proofScreenshotUrl: {
      type: String,
      default: null,
    },
    proofSubmittedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // Payout Lifecycle (PRD § 09: Pending -> Paid)
    payoutStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
      index: true,
    },
    payoutMethod: {
      type: String,
      default: null,
    },
    payoutReference: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Winner || mongoose.model("Winner", WinnerSchema);
