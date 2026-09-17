import mongoose from "mongoose";

const DrawSchema = new mongoose.Schema(
  {
    drawNumber: {
      type: Number,
      required: [true, "Draw number is required"],
      unique: true,
      index: true,
    },
    drawMonth: {
      type: String,
      required: [true, "Draw month (e.g. 2026-03) is required"],
      index: true,
    },
    drawDate: {
      type: Date,
      required: [true, "Draw date is required"],
    },
    algorithmType: {
      type: String,
      enum: ["random", "frequency_weighted"],
      required: true,
      default: "random",
    },
    status: {
      type: String,
      enum: ["draft_simulation", "published"],
      default: "draft_simulation",
      index: true,
    },
    // The 5 winning numbers (Stableford range 1-45)
    drawnNumbers: {
      type: [Number],
      validate: {
        validator: function (nums) {
          if (!nums || nums.length !== 5) return false;
          const unique = new Set(nums);
          return (
            unique.size === 5 &&
            nums.every((n) => Number.isInteger(n) && n >= 1 && n <= 45)
          );
        },
        message: "drawnNumbers must contain exactly 5 unique integers between 1 and 45",
      },
    },

    // Pool Financial Snapshot (PRD § 06 & § 07)
    activeSubscribersCount: {
      type: Number,
      required: true,
      default: 0,
    },
    basePrizePool: {
      type: Number,
      required: true,
      default: 0,
    },
    jackpotRolloverIn: {
      type: Number,
      default: 0,
    },
    totalPrizePool: {
      type: Number,
      required: true,
      default: 0,
    },

    // Tier Allocations (40% / 35% / 25%)
    tier1Pool: { type: Number, required: true, default: 0 }, // 40% (5 matches)
    tier2Pool: { type: Number, required: true, default: 0 }, // 35% (4 matches)
    tier3Pool: { type: Number, required: true, default: 0 }, // 25% (3 matches)

    // Winner breakdown
    tier1WinnersCount: { type: Number, default: 0 },
    tier2WinnersCount: { type: Number, default: 0 },
    tier3WinnersCount: { type: Number, default: 0 },

    tier1PayoutPerWinner: { type: Number, default: 0 },
    tier2PayoutPerWinner: { type: Number, default: 0 },
    tier3PayoutPerWinner: { type: Number, default: 0 },

    // Unclaimed 5-match jackpot rollover forward (PRD § 07)
    jackpotRolloverOut: { type: Number, default: 0 },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for published draws archive, latest rollover lookup, and month validation
DrawSchema.index({ status: 1, drawNumber: -1 });
DrawSchema.index({ status: 1, drawDate: -1 });
DrawSchema.index({ drawMonth: 1, status: 1 });

export default mongoose.models.Draw || mongoose.model("Draw", DrawSchema);
