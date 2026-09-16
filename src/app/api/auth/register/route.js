import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Charity from "@/models/Charity";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema, formatZodError } from "@/lib/validators";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const parseResult = registerSchema.safeParse(body);
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

    const {
      email,
      password,
      firstName,
      lastName,
      selectedCharityId,
      charityContributionPercent,
    } = parseResult.data;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_ALREADY_EXISTS",
            message: "An account with this email address already exists.",
          },
        },
        { status: 409 }
      );
    }

    // Validate charity if selected
    let validCharityId = null;
    if (selectedCharityId) {
      const charity = await Charity.findById(selectedCharityId);
      if (charity) {
        validCharityId = charity._id;
        // Increment charity supporter count
        charity.supporterCount += 1;
        await charity.save();
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      selectedCharityId: validCharityId,
      charityContributionPercent: charityContributionPercent || 10,
      subscriptionStatus: "none",
      role: "user",
    });

    const token = await signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            subscriptionStatus: newUser.subscriptionStatus,
            selectedCharityId: newUser.selectedCharityId,
            charityContributionPercent: newUser.charityContributionPercent,
          },
          token,
        },
        message: "Registration successful. Welcome to digital.HEROES!",
      },
      { status: 201 }
    );

    // Set secure HttpOnly cookie
    response.cookies.set("dh_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[API Register Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to register user.",
        },
      },
      { status: 500 }
    );
  }
}
