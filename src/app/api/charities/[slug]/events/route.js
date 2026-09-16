import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Charity from "@/models/Charity";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

/**
 * POST /api/charities/[id]/events
 * Admin only: Add a Charity Golf Day or fundraising tournament
 */
export async function POST(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { slug } = await context.params;
    const body = await request.json();

    if (!body.title || !body.date || !body.location) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Title, date, and location are required for a charity event.",
          },
        },
        { status: 400 }
      );
    }

    const query = mongoose.Types.ObjectId.isValid(slug) ? { _id: slug } : { slug };
    const charity = await Charity.findOne(query);

    if (!charity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHARITY_NOT_FOUND",
            message: "Charity not found.",
          },
        },
        { status: 404 }
      );
    }

    if (!Array.isArray(charity.events)) {
      charity.events = [];
    }

    charity.events.push({
      title: body.title,
      date: new Date(body.date),
      location: body.location,
      description: body.description || "",
      registrationUrl: body.registrationUrl || "",
    });

    await charity.save();

    return NextResponse.json({
      success: true,
      data: { charity },
      message: "Charity event added successfully.",
    });
  } catch (error) {
    console.error("[API Add Charity Event Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to add charity event.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charities/[id]/events
 * Admin only: Remove an event by eventId query parameter
 */
export async function DELETE(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_EVENT_ID",
            message: "eventId query parameter is required.",
          },
        },
        { status: 400 }
      );
    }

    const query = mongoose.Types.ObjectId.isValid(slug) ? { _id: slug } : { slug };
    const charity = await Charity.findOneAndUpdate(
      query,
      { $pull: { events: { _id: eventId } } },
      { new: true }
    );

    if (!charity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHARITY_NOT_FOUND",
            message: "Charity not found.",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { charity },
      message: "Charity event removed successfully.",
    });
  } catch (error) {
    console.error("[API Remove Charity Event Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to remove charity event.",
        },
      },
      { status: 500 }
    );
  }
}
