import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Charity from "@/models/Charity";
import { requireAdmin } from "@/lib/auth";
import { charitySchema, formatZodError } from "@/lib/validators";

/**
 * GET /api/charities
 * Public charity directory with category filter, search, and featured query
 */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    const hasPagination = searchParams.has("page") || searchParams.has("limit");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = searchParams.has("limit")
      ? Math.min(100, Math.max(1, parseInt(searchParams.get("limit"), 10)))
      : hasPagination
      ? 12
      : 0;

    const total = await Charity.countDocuments(query);
    const totalPages = limit > 0 ? Math.ceil(total / limit) || 1 : 1;

    let charitiesQuery = Charity.find(query)
      .sort({ isFeatured: -1, totalFundsRaised: -1 })
      .select("-__v");

    if (limit > 0) {
      charitiesQuery = charitiesQuery.skip((page - 1) * limit).limit(limit);
    }

    const charities = await charitiesQuery;

    return NextResponse.json({
      success: true,
      data: { charities },
      meta: {
        total,
        page,
        limit: limit > 0 ? limit : total,
        totalPages,
        hasNextPage: limit > 0 ? page < totalPages : false,
        hasPrevPage: limit > 0 ? page > 1 : false,
      },
    });
  } catch (error) {
    console.error("[API Get Charities Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch charities.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charities
 * Admin only: Create new charity
 */
export async function POST(request) {
  try {
    await connectDB();
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const parseResult = charitySchema.safeParse(body);
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

    const existingCharity = await Charity.findOne({
      $or: [{ slug: parseResult.data.slug }, { name: parseResult.data.name }],
    });

    if (existingCharity) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHARITY_EXISTS",
            message: "A charity with this name or slug already exists.",
          },
        },
        { status: 409 }
      );
    }

    const charity = await Charity.create(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        data: { charity },
        message: "Charity created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Create Charity Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create charity.",
        },
      },
      { status: 500 }
    );
  }
}
