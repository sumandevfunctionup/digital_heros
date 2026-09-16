import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },
    // Stableford format: 1 to 45 (PRD § 05)
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [1, "Stableford score must be at least 1"],
      max: [45, "Stableford score cannot exceed 45"],
      validate: {
        validator: Number.isInteger,
        message: "Score must be an integer",
      },
    },
    // Round Date: normalized to YYYY-MM-DD
    date: {
      type: Date,
      required: [true, "Round date is required"],
      index: true,
    },
    courseName: {
      type: String,
      default: "Course Round",
      trim: true,
    },
    // Flags if this score is in the user's active 5 draw ticket pool
    isCurrentActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: Only 1 score entry per date per user (PRD § 05)
ScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

// Compound Index for fast retrieval of the 5 active scores in reverse-chronological order
ScoreSchema.index({ userId: 1, isCurrentActive: 1, date: -1 });

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);
