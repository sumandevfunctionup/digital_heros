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

    // Unified Winner Status Lifecycle:
    // - "pending": Initial state when created upon draw publishing (awaiting proof)
    // - "pending_proof": Alias for pending
    // - "pending_approval": Proof submitted, awaiting admin review ("pending approve")
    // - "proof_submitted": Alias for pending_approval
    // - "rejected": Scorecard proof rejected by admin with reason
    // - "approved": Scorecard verified & approved; eligible for payout (locked)
    // - "paidout": Prize payout executed and permanently finalized
    status: {
      type: String,
      enum: [
        "pending",
        "pending_proof",
        "pending_approval",
        "proof_submitted",
        "rejected",
        "approved",
        "paidout",
        "paid",
      ],
      default: "pending",
      index: true,
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

WinnerSchema.pre("save", function () {
  // When a winner is first created, it MUST strictly start as status: "pending" and payoutStatus: "unpaid"
  // Never initialize a new winner as "paid", "paidout", or "approved"
  if (this.isNew) {
    this.status = "pending";
    this.verificationStatus = "pending_proof";
    this.payoutStatus = "unpaid";
    this.paidAt = null;
    this.payoutReference = null;
    this.payoutMethod = null;
    return;
  }

  // Synchronize unified status with legacy fields for full backwards-compatibility
  if (this.isModified("status")) {
    if (this.status === "paidout" || this.status === "paid") {
      this.status = "paidout";
      this.verificationStatus = "approved";
      this.payoutStatus = "paid";
    } else if (this.status === "approved") {
      this.verificationStatus = "approved";
      this.payoutStatus = "unpaid";
    } else if (this.status === "rejected") {
      this.verificationStatus = "rejected";
      this.payoutStatus = "unpaid";
    } else if (this.status === "pending_approval" || this.status === "proof_submitted") {
      this.status = "pending_approval";
      this.verificationStatus = "proof_submitted";
      this.payoutStatus = "unpaid";
    } else {
      this.status = "pending";
      this.verificationStatus = "pending_proof";
      this.payoutStatus = "unpaid";
    }
  } else if (this.isModified("verificationStatus") || this.isModified("payoutStatus")) {
    if (this.payoutStatus === "paid") {
      this.status = "paidout";
    } else if (this.verificationStatus === "rejected") {
      this.status = "rejected";
    } else if (this.verificationStatus === "approved") {
      this.status = "approved";
    } else if (this.verificationStatus === "proof_submitted") {
      this.status = "pending_approval";
    } else {
      this.status = "pending";
    }
  }
});

WinnerSchema.pre("insertMany", function (next, docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      // Force newly created winners to status: "pending" and payoutStatus: "unpaid"
      doc.status = "pending";
      doc.verificationStatus = "pending_proof";
      doc.payoutStatus = "unpaid";
      doc.paidAt = null;
      doc.payoutReference = null;
      doc.payoutMethod = null;
    });
  }
  if (typeof next === "function") next();
});

// Compound indexes for user's winnings portal, admin verification queue, and draw winner lookups
WinnerSchema.index({ userId: 1, createdAt: -1 });
WinnerSchema.index({ drawId: 1, createdAt: -1 });
WinnerSchema.index({ status: 1, createdAt: -1 });
WinnerSchema.index({ verificationStatus: 1, createdAt: -1 });
WinnerSchema.index({ payoutStatus: 1, createdAt: -1 });
WinnerSchema.index({ verificationStatus: 1, payoutStatus: 1 });
WinnerSchema.index({ drawId: 1, userId: 1 });

if (mongoose.models?.Winner) {
  delete mongoose.models.Winner;
}

export default mongoose.model("Winner", WinnerSchema);
