import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { drawSimulationSchema, formatZodError } from "@/lib/validators";
import { executeDrawCalculation } from "@/lib/drawEngine";

/**
 * POST /api/admin/draws/simulate
 * Admin only: Run simulation without persisting to DB (PRD § 06 & § 11)
 */
export async function POST(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const parseResult = drawSimulationSchema.safeParse(body);
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

    const { drawMonth, algorithmType } = parseResult.data;

    const simulationResults = await executeDrawCalculation({
      drawMonth,
      algorithmType,
    });

    return NextResponse.json({
      success: true,
      data: {
        simulation: simulationResults,
        simulatedBy: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
        },
      },
      message: `Simulation completed successfully using ${
        algorithmType === "frequency_weighted" ? "Score-Frequency Weighted" : "Standard Random"
      } algorithm.`,
    });
  } catch (error) {
    console.error("[API Simulate Draw Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to simulate draw.",
        },
      },
      { status: 500 }
    );
  }
}
