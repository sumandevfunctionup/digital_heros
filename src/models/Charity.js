import mongoose from "mongoose";

const CharityEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Event title is required"],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  location: {
    type: String,
    required: [true, "Event location is required"],
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  registrationUrl: {
    type: String,
    default: "",
    trim: true,
  },
});

const CharitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Charity name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tagline: {
      type: String,
      required: [true, "Tagline is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: [
        "Healthcare",
        "Youth & Education",
        "Veterans",
        "Environment",
        "Disaster Relief",
        "Community",
      ],
      required: [true, "Category is required"],
      index: true,
    },
    logoUrl: {
      type: String,
      required: [true, "Logo URL is required"],
    },
    bannerUrl: {
      type: String,
      required: [true, "Banner URL is required"],
    },
    websiteUrl: {
      type: String,
      default: "",
    },
    totalFundsRaised: {
      type: Number,
      default: 0,
      min: 0,
    },
    supporterCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Upcoming events such as Charity Golf Days (PRD § 08.2)
    events: [CharityEventSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Charity || mongoose.model("Charity", CharitySchema);
