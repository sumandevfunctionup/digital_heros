import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Charity from "@/models/Charity";
import Donation from "@/models/Donation";
import { getAuthSession } from "@/lib/auth";
import { donationSchema, formatZodError } from "@/lib/validators";

/**
 * POST /api/donations
 * Process direct standalone charitable donation
 */
export async function POST(request) {
  try {
    await connectDB();
    const session = await getAuthSession(request);
    const body = await request.json();

    const parseResult = donationSchema.safeParse(body);
    if (!parseResult.success) {
      const { message, issues } = formatZodError(parseResult.error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
            details: issues,
          },
        },
        { status: 400 }
      );
    }

    const { charityId, amount, donorName, donorEmail, message } = parseResult.data;

    const charity = await Charity.findById(charityId);
    if (!charity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHARITY_NOT_FOUND",
            message: "The specified charity does not exist.",
          },
        },
        { status: 404 }
      );
    }

    // Direct donations: 100% credited to the charity (PRD § 08.1)
    charity.totalFundsRaised += amount;
    await charity.save();

    const donation = await Donation.create({
      userId: session?.userId || null,
      charityId: charity._id,
      amount,
      donorName: donorName || "Anonymous Donor",
      donorEmail,
      message,
      paymentStatus: "succeeded",
      paymentReference: `DON_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          donation: {
            id: donation._id,
            amount: donation.amount,
            charityName: charity.name,
            donorName: donation.donorName,
            donorEmail: donation.donorEmail,
            paymentStatus: donation.paymentStatus,
            paymentReference: donation.paymentReference,
            createdAt: donation.createdAt,
          },
        },
        message: `Thank you! Your donation of $${amount.toFixed(2)} to ${charity.name} was successful.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Donation Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to process donation.",
        },
      },
      { status: 500 }
    );
  }
}
