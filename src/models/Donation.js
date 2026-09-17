import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: [true, "charityId is required"],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Minimum donation amount is 1"],
    },
    donorName: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, "Donor email is required"],
      trim: true,
      lowercase: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "succeeded",
      index: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    paymentReference: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user donations, charity reporting, and platform analytics
DonationSchema.index({ charityId: 1, paymentStatus: 1, createdAt: -1 });
DonationSchema.index({ userId: 1, createdAt: -1 });
DonationSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);
