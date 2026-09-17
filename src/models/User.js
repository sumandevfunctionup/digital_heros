import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },

    // Subscription status
    subscriptionStatus: {
      type: String,
      enum: ["none", "trialing", "active", "past_due", "canceled", "lapsed"],
      default: "none",
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    subscriptionRenewalDate: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },

    // Charity preference (PRD § 08: minimum 10%, user can voluntarily increase)
    selectedCharityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
    charityContributionPercent: {
      type: Number,
      min: [10, "Minimum charity contribution is 10%"],
      max: [100, "Maximum charity contribution is 100%"],
      default: 10,
    },

    // Golf Profile Metadata
    handicapIndex: {
      type: Number,
      default: null,
    },
    homeClub: {
      type: String,
      default: null,
      trim: true,
    },
    activeScoresCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound and single-field performance indexes
UserSchema.index({ stripeSubscriptionId: 1 }, { sparse: true });
UserSchema.index({ role: 1, subscriptionStatus: 1, createdAt: -1 });
UserSchema.index({ subscriptionStatus: 1, createdAt: -1 });
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ selectedCharityId: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model("User", UserSchema);
