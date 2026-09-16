import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Charity from "@/models/Charity";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/charities/[slug]
 * Detailed profile with events and story
 */
export async function GET(request, context) {
  try {
    await connectDB();
    const { slug } = await context.params;

    const charity = await Charity.findOne({ slug });
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
    });
  } catch (error) {
    console.error("[API Get Charity Detail Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch charity details.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/charities/[slug]
 * Admin only: Update charity details or add events
 */
export async function PUT(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { slug } = await context.params;
    const body = await request.json();

    const charity = await Charity.findOneAndUpdate({ slug }, body, {
      new: true,
      runValidators: true,
    });

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
      message: "Charity updated successfully.",
    });
  } catch (error) {
    console.error("[API Update Charity Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update charity.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charities/[slug]
 * Admin only: Soft delete (set isActive: false)
 */
export async function DELETE(request, context) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { slug } = await context.params;
    const charity = await Charity.findOneAndUpdate(
      { slug },
      { isActive: false },
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
      message: "Charity deactivated successfully.",
    });
  } catch (error) {
    console.error("[API Delete Charity Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to deactivate charity.",
        },
      },
      { status: 500 }
    );
  }
}
