import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/users
 * Admin only: Roster of all users with search, subscription status filters, and pagination
 */
export async function GET(request) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const subscriptionStatus = searchParams.get("subscriptionStatus");
    const role = searchParams.get("role");

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }
    if (subscriptionStatus && subscriptionStatus !== "All") {
      query.subscriptionStatus = subscriptionStatus;
    }
    if (role && role !== "All") {
      query.role = role;
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    const users = await User.find(query)
      .populate("selectedCharityId", "name slug")
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { users },
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("[API Admin Get Users Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch user roster.",
        },
      },
      { status: 500 }
    );
  }
}
