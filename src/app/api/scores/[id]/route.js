import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";
import { scoreUpdateSchema, formatZodError } from "@/lib/validators";

/**
 * PATCH /api/scores/[id]
 * Edit existing score value or course name
 */
export async function PATCH(request, context) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await request.json();

    const parseResult = scoreUpdateSchema.safeParse(body);
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
        { status: 422 }
      );
    }

    const score = await Score.findById(id);
    if (!score) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SCORE_NOT_FOUND",
            message: "Score not found.",
          },
        },
        { status: 404 }
      );
    }

    // Verify ownership (unless admin)
    if (score.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only edit your own scores.",
          },
        },
        { status: 403 }
      );
    }

    if (parseResult.data.score !== undefined) {
      score.score = parseResult.data.score;
    }
    if (parseResult.data.courseName !== undefined) {
      score.courseName = parseResult.data.courseName;
    }

    await score.save();

    const updatedActiveScores = await Score.find({
      userId: score.userId,
      isCurrentActive: true,
    })
      .sort({ date: -1 })
      .limit(5);

    const updatedAllScores = await Score.find({
      userId: score.userId,
    }).sort({ date: -1 });

    const updatedArchived = updatedAllScores.filter((s) => !s.isCurrentActive);

    return NextResponse.json({
      success: true,
      data: {
        score,
        scores: updatedActiveScores,
        archivedScores: updatedArchived,
        allScores: updatedAllScores,
        activeCount: updatedActiveScores.length,
        totalActive: updatedActiveScores.length,
        totalArchive: updatedArchived.length,
        isComplete: updatedActiveScores.length === 5,
        isTicketComplete: updatedActiveScores.length === 5,
      },
      message: "Score updated successfully.",
    });
  } catch (error) {
    console.error("[API Patch Score Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to update score.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scores/[id]
 * Deletes score, and optionally reactivates most recent archived score to restore active 5
 */
export async function DELETE(request, context) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const score = await Score.findById(id);

    if (!score) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SCORE_NOT_FOUND",
            message: "Score not found.",
          },
        },
        { status: 404 }
      );
    }

    if (score.userId.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You can only delete your own scores.",
          },
        },
        { status: 403 }
      );
    }

    const wasActive = score.isCurrentActive;
    const ownerId = score.userId;

    await Score.findByIdAndDelete(id);

    let promotedScore = null;
    // If the deleted score was in the active 5, see if an archived score can be restored
    if (wasActive) {
      const mostRecentArchived = await Score.findOne({
        userId: ownerId,
        isCurrentActive: false,
      }).sort({ date: -1, createdAt: -1 });

      if (mostRecentArchived) {
        mostRecentArchived.isCurrentActive = true;
        mostRecentArchived.archivedAt = null;
        await mostRecentArchived.save();
        promotedScore = {
          _id: mostRecentArchived._id,
          score: mostRecentArchived.score,
          date: mostRecentArchived.date,
          courseName: mostRecentArchived.courseName,
        };
      }
    }

    const updatedActiveScores = await Score.find({
      userId: ownerId,
      isCurrentActive: true,
    })
      .sort({ date: -1 })
      .limit(5);

    const updatedAllScores = await Score.find({
      userId: ownerId,
    }).sort({ date: -1 });

    const updatedArchived = updatedAllScores.filter((s) => !s.isCurrentActive);

    await User.findByIdAndUpdate(ownerId, {
      activeScoresCount: updatedActiveScores.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        promotedScore,
        scores: updatedActiveScores,
        archivedScores: updatedArchived,
        allScores: updatedAllScores,
        activeCount: updatedActiveScores.length,
        totalActive: updatedActiveScores.length,
        totalArchive: updatedArchived.length,
        isComplete: updatedActiveScores.length === 5,
        isTicketComplete: updatedActiveScores.length === 5,
      },
      message: promotedScore
        ? `Score deleted. ${promotedScore.courseName} (${promotedScore.score} pts) was promoted from archive to active ticket.`
        : "Score deleted successfully.",
    });
  } catch (error) {
    console.error("[API Delete Score Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to delete score.",
        },
      },
      { status: 500 }
    );
  }
}
