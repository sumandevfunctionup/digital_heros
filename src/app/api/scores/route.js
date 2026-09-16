import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import User from "@/models/User";
import { requireAuth, requireActiveSubscriber } from "@/lib/auth";
import { scoreSubmissionSchema, formatZodError } from "@/lib/validators";

/**
 * Normalizes a date to YYYY-MM-DDT00:00:00.000Z
 */
function normalizeDate(dateInput) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * GET /api/scores
 * Returns the user's active 5 scores (reverse chronological) and full archive
 */
export async function GET(request) {
  try {
    await connectDB();
    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const activeScores = await Score.find({
      userId: user._id,
      isCurrentActive: true,
    })
      .sort({ date: -1 })
      .limit(5);

    const allScores = await Score.find({
      userId: user._id,
    }).sort({ date: -1 });

    const archivedScores = allScores.filter((s) => !s.isCurrentActive);

    return NextResponse.json({
      success: true,
      data: {
        scores: activeScores,
        archivedScores,
        allScores,
        activeCount: activeScores.length,
        totalActive: activeScores.length,
        totalArchive: archivedScores.length,
        isComplete: activeScores.length === 5,
        isTicketComplete: activeScores.length === 5,
      },
    });
  } catch (error) {
    console.error("[API Get Scores Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to fetch scores.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scores
 * Adds a new score enforcing:
 * 1. Stableford format (1-45)
 * 2. Strictly ONE score per date (returns 409 if date exists)
 * 3. Rolling FIFO queue (if 5 scores exist, auto-archives the oldest by date)
 */
export async function POST(request) {
  try {
    await connectDB();
    // Enforce active subscription requirement (PRD § 04)
    const { user, errorResponse } = await requireActiveSubscriber(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const parseResult = scoreSubmissionSchema.safeParse(body);
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

    const { score, date: dateStr, courseName } = parseResult.data;
    const normalizedRoundDate = normalizeDate(dateStr);

    // Rule: Duplicate scores for the same date are not allowed (PRD § 05)
    const existingScoreOnDate = await Score.findOne({
      userId: user._id,
      date: normalizedRoundDate,
    });

    if (existingScoreOnDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_DATE_SCORE",
            message: `A score entry already exists for date ${dateStr.split("T")[0]}. Only one score entry is permitted per calendar date. You may edit or delete the existing entry.`,
            existingScoreId: existingScoreOnDate._id,
          },
        },
        { status: 409 }
      );
    }

    // Capture active scores prior to inserting the new score
    const activeBefore = await Score.find({
      userId: user._id,
      isCurrentActive: true,
    });
    const activeBeforeIds = new Set(activeBefore.map((s) => s._id.toString()));

    // Insert new score
    const newScore = await Score.create({
      userId: user._id,
      score,
      date: normalizedRoundDate,
      courseName: courseName || "Course Round",
      isCurrentActive: true,
    });

    // Enforce strictly the 5 newest rounds by date are active (PRD § 05)
    const allUserScores = await Score.find({ userId: user._id }).sort({ date: -1, createdAt: -1 });
    const top5 = allUserScores.slice(0, 5);
    const top5Ids = new Set(top5.map((s) => s._id.toString()));

    let rolledScore = null;

    for (let i = 0; i < allUserScores.length; i++) {
      const s = allUserScores[i];
      const shouldBeActive = top5Ids.has(s._id.toString());
      if (s.isCurrentActive !== shouldBeActive) {
        s.isCurrentActive = shouldBeActive;
        s.archivedAt = shouldBeActive ? null : new Date();
        await s.save();
      }

      // If previously active and now outside top 5, this round rolled into archive
      if (activeBeforeIds.has(s._id.toString()) && !shouldBeActive) {
        rolledScore = {
          _id: s._id,
          score: s.score,
          date: s.date,
          courseName: s.courseName,
        };
      }
    }

    // Retrieve refreshed state
    const updatedActiveScores = await Score.find({
      userId: user._id,
      isCurrentActive: true,
    })
      .sort({ date: -1 })
      .limit(5);

    const updatedAllScores = await Score.find({
      userId: user._id,
    }).sort({ date: -1 });

    const updatedArchived = updatedAllScores.filter((s) => !s.isCurrentActive);

    // Keep User model in sync
    await User.findByIdAndUpdate(user._id, {
      activeScoresCount: updatedActiveScores.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          newScore,
          rolledScore,
          scores: updatedActiveScores,
          archivedScores: updatedArchived,
          allScores: updatedAllScores,
          activeCount: updatedActiveScores.length,
          totalActive: updatedActiveScores.length,
          totalArchive: updatedArchived.length,
          isComplete: updatedActiveScores.length === 5,
          isTicketComplete: updatedActiveScores.length === 5,
        },
        message: rolledScore
          ? `Score recorded! ${rolledScore.courseName} (${rolledScore.score} pts) was automatically shifted to your permanent archive.`
          : "Score added to your active draw ticket!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API Post Score Error]:", error);
    // MongoDB duplicate key error safeguard (code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_DATE_SCORE",
            message: "A score for this date already exists in the system.",
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to record score.",
        },
      },
      { status: 500 }
    );
  }
}
