"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Target,
  PlusCircle,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Archive,
  ShieldCheck,
  RefreshCw,
  CalendarCheck,
  Lock,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PaginationControl from "@/components/ui/PaginationControl";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

/**
 * Calculates the next available calendar date that doesn't conflict with any recorded rounds.
 */
function getSuggestedNextDate(scoresList) {
  if (!scoresList || scoresList.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  const existingDateStrs = new Set(
    scoresList
      .map((s) => (s.date ? (typeof s.date === "string" ? s.date.split("T")[0] : new Date(s.date).toISOString().split("T")[0]) : null))
      .filter(Boolean)
  );

  const todayStr = new Date().toISOString().split("T")[0];
  if (!existingDateStrs.has(todayStr)) {
    return todayStr;
  }

  // Find the most recent date in existing scores
  const sortedDates = Array.from(existingDateStrs).sort().reverse();
  const latestDate = new Date(sortedDates[0]);

  // Increment by 1 day until we find a date not in existingDateStrs
  let candidate = new Date(latestDate);
  for (let i = 1; i <= 365; i++) {
    candidate.setUTCDate(candidate.getUTCDate() + 1);
    const candidateStr = candidate.toISOString().split("T")[0];
    if (!existingDateStrs.has(candidateStr)) {
      return candidateStr;
    }
  }

  return todayStr;
}

export default function ScoresDashboardPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();

  const hasActivePlan = useMemo(() => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return (
      (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") &&
      Boolean(user.subscriptionPlan)
    );
  }, [user]);
  const [scoresData, setScoresData] = useState({
    scores: [],
    archivedScores: [],
    allScores: [],
    totalActive: 0,
    activeCount: 0,
    isComplete: false,
    isTicketComplete: false,
    totalArchive: 0,
  });
  const [allScores, setAllScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "active", "archived"
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [lastRolledScore, setLastRolledScore] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    score: "",
    date: new Date().toISOString().split("T")[0],
    courseName: "",
  });

  // Edit State
  const [editingScore, setEditingScore] = useState(null);
  const [editFormData, setEditFormData] = useState({ score: "", courseName: "" });
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/scores");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setScoresData(json.data);
          const all = json.data.allScores || json.data.scores || [];
          setAllScores(all);

          // If current form date conflicts with existing rounds, suggest next available date
          setFormData((prev) => {
            const conflict = all.some((s) => {
              const sDate = typeof s.date === "string" ? s.date.split("T")[0] : new Date(s.date).toISOString().split("T")[0];
              return sDate === prev.date;
            });
            if (conflict) {
              return { ...prev, date: getSuggestedNextDate(all) };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      toast.error("Failed to load scores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  // Safe calculated properties
  const activeScores = useMemo(() => scoresData.scores || [], [scoresData.scores]);
  const activeCount = scoresData.totalActive ?? scoresData.activeCount ?? activeScores.length;
  const isTicketComplete = Boolean(scoresData.isComplete || scoresData.isTicketComplete || activeCount === 5);

  const archivedScores = useMemo(() => {
    if (scoresData.archivedScores && scoresData.archivedScores.length > 0) {
      return scoresData.archivedScores;
    }
    return allScores.filter((s) => !s.isCurrentActive);
  }, [scoresData.archivedScores, allScores]);

  // Suggested next date
  const suggestedNextDate = useMemo(() => getSuggestedNextDate(allScores), [allScores]);

  // Real-time conflict detection with existing scores
  const duplicateScore = useMemo(() => {
    if (!formData.date || !allScores || allScores.length === 0) return null;
    return allScores.find((s) => {
      const sDate = typeof s.date === "string" ? s.date.split("T")[0] : new Date(s.date).toISOString().split("T")[0];
      return sDate === formData.date;
    });
  }, [formData.date, allScores]);

  // Filtered scores list for table
  const displayedScores = useMemo(() => {
    if (filter === "active") return activeScores;
    if (filter === "archived") return archivedScores;
    return allScores;
  }, [filter, activeScores, archivedScores, allScores]);

  // Paginated slice for current page
  const totalHistoryPages = Math.ceil(displayedScores.length / historyLimit) || 1;
  const paginatedScores = useMemo(() => {
    const start = (historyPage - 1) * historyLimit;
    return displayedScores.slice(start, start + historyLimit);
  }, [displayedScores, historyPage, historyLimit]);

  const handleSubmitScore = async (e) => {
    e.preventDefault();

    if (!hasActivePlan) {
      toast.error("Active membership required. Please activate your subscription plan to record scores.");
      return;
    }

    if (duplicateScore) {
      toast.error(`A round is already recorded for ${formData.date}. Select a distinct date.`);
      return;
    }

    const scoreVal = parseInt(formData.score, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      toast.error("Stableford score must be an integer between 1 and 45.");
      return;
    }

    if (!formData.date) {
      toast.error("Please choose the round date.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: scoreVal,
          date: formData.date,
          courseName: formData.courseName.trim() || "Course Round",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (res.status === 403 || json.error?.code === "SUBSCRIPTION_REQUIRED") {
          toast.error(
            json.error?.message ||
              "Active subscription plan required to record scores. Please activate your plan."
          );
          await refreshUser();
        } else {
          toast.error(json.error?.message || "Failed to submit score");
        }
        return;
      }

      if (json.data?.rolledScore) {
        setLastRolledScore(json.data.rolledScore);
        toast.success(
          `FIFO Roll Triggered: ${json.data.rolledScore.courseName} (${json.data.rolledScore.score} pts) shifted to permanent archive!`,
          { duration: 6000 }
        );
      } else {
        toast.success(json.message || "Score added to your active draw ticket!");
      }

      // Reset form with new suggested date
      const updatedAll = json.data?.allScores || allScores;
      setFormData({
        score: "",
        date: getSuggestedNextDate(updatedAll),
        courseName: "",
      });

      await fetchScores();
      await refreshUser();
    } catch (err) {
      toast.error("Network error submitting score.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    if (!editingScore) return;

    if (!hasActivePlan) {
      toast.error("Active subscription plan required to edit scores.");
      return;
    }

    const scoreVal = parseInt(editFormData.score, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      toast.error("Stableford score must be an integer between 1 and 45.");
      return;
    }

    try {
      setUpdating(true);
      const res = await fetch(`/api/scores/${editingScore._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: scoreVal,
          courseName: editFormData.courseName.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 403 || json.error?.code === "SUBSCRIPTION_REQUIRED") {
          toast.error(json.error?.message || "Active subscription required to edit scores.");
          await refreshUser();
        } else {
          toast.error(json.error?.message || "Failed to update score");
        }
        return;
      }

      toast.success("Score updated successfully.");
      setEditingScore(null);
      await fetchScores();
      await refreshUser();
    } catch {
      toast.error("Failed to update score.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteScore = async (scoreId) => {
    if (!hasActivePlan) {
      toast.error("Active subscription plan required to delete scores.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this round? If it is active, your latest archived score will automatically be restored into the draw ticket."
      )
    ) {
      return;
    }

    try {
      setDeletingId(scoreId);
      const res = await fetch(`/api/scores/${scoreId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (res.status === 403 || json.error?.code === "SUBSCRIPTION_REQUIRED") {
          toast.error(json.error?.message || "Active subscription required to delete scores.");
          await refreshUser();
        } else {
          toast.error(json.error?.message || "Failed to delete score");
        }
        return;
      }

      toast.success(
        json.data?.promotedScore
          ? `Score deleted. ${json.data.promotedScore.courseName} (${json.data.promotedScore.score} pts) restored from archive to active ticket.`
          : "Score removed successfully."
      );

      await fetchScores();
      await refreshUser();
    } catch {
      toast.error("Failed to delete score.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header & FIFO Explanation */}
      <div>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Stableford Scores & Rolling Queue (FIFO)
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          Digital Heroes enters your latest 5 rounds into the monthly prize draw. Whenever a new round is recorded, your 5th oldest round seamlessly shifts into your permanent archive.
        </p>
      </div>

      {/* 1. 5-Slot FIFO Interactive Visualizer */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span>Active Draw Entry Ticket</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                  isTicketComplete
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {isTicketComplete ? "5/5 Qualified" : `${activeCount}/5 Incomplete`}
              </span>
            </h3>
            <p className="text-xs text-white/50 mt-1">
              Active numbers entered into the next draw:{" "}
              <span className="font-mono text-emerald-400 font-bold">
                {activeScores.length > 0
                  ? activeScores.map((s) => s.score).join(" • ")
                  : "No scores entered yet"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-emerald-400" />
            <span className="font-medium">Automatic FIFO rolling active</span>
          </div>
        </div>

        {/* The 5 Slot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4].map((idx) => {
            const score = activeScores[idx];
            const isFilled = !!score;
            const isOldest = idx === 4 && activeScores.length === 5;

            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isFilled
                    ? isOldest
                      ? "bg-gradient-to-b from-[#1E1815] to-[#12111A] border-amber-500/40 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                      : "bg-gradient-to-b from-[#121622] to-[#0E111A] border-emerald-500/30 hover:border-emerald-500/50"
                    : "bg-[#0B0D13]/50 border-dashed border-white/15"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-3">
                  <span className="tracking-wider">SLOT #{idx + 1}</span>
                  {isOldest ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1" title="Next score entered will shift this round to your permanent archive">
                      <Clock className="w-3 h-3" />
                      Rolls next
                    </span>
                  ) : isFilled ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  ) : null}
                </div>

                {isFilled ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white font-mono">
                        {score.score}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">pts</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                      <p className="font-semibold text-white/90 truncate" title={score.courseName}>
                        {score.courseName || "Course Round"}
                      </p>
                      <p className="text-[11px] text-white/40 font-mono mt-0.5">
                        {new Date(score.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => {
                          if (!hasActivePlan) {
                            toast.error("Active subscription plan required to edit scores.");
                            return;
                          }
                          setEditingScore(score);
                          setEditFormData({ score: score.score, courseName: score.courseName || "" });
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          !hasActivePlan
                            ? "text-white/20 cursor-not-allowed"
                            : "text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                        title={!hasActivePlan ? "Active subscription plan required" : "Edit score"}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (!hasActivePlan) {
                            toast.error("Active subscription plan required to delete scores.");
                            return;
                          }
                          handleDeleteScore(score._id);
                        }}
                        disabled={deletingId === score._id || !hasActivePlan}
                        className={`p-1 rounded-md transition-colors ${
                          !hasActivePlan
                            ? "text-rose-400/20 cursor-not-allowed"
                            : "text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10"
                        }`}
                        title={!hasActivePlan ? "Active subscription plan required" : "Delete score"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/30 mb-2">
                      {!hasActivePlan && !authLoading ? (
                        <Lock className="w-4 h-4 text-amber-400/60" />
                      ) : (
                        <PlusCircle className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs text-white/40 font-mono">Empty Slot</span>
                    <span className="text-[10px] text-white/25 mt-0.5">
                      {!hasActivePlan && !authLoading ? "Active plan required" : "Add round below"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live notification when a round rolls */}
        {lastRolledScore && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>FIFO Rolling Live:</strong> {lastRolledScore.courseName} ({lastRolledScore.score} pts, {new Date(lastRolledScore.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}) was automatically shifted into your permanent archive.
              </span>
            </div>
            <button
              onClick={() => {
                setFilter("archived");
                setLastRolledScore(null);
              }}
              className="text-[11px] underline hover:text-white shrink-0"
            >
              View Archive →
            </button>
          </div>
        )}
      </div>

      {/* 2. Score Submission Form */}
      <div className={`rounded-3xl border ${!hasActivePlan && !authLoading ? "border-rose-500/30 bg-[#0F1118]/90 shadow-[0_0_50px_rgba(244,63,94,0.05)]" : "border-white/10 bg-[#0F1118]/80"} p-6 sm:p-8 backdrop-blur-xl relative transition-all`}>
        {/* Inactive Plan Lockout Callout */}
        {!hasActivePlan && !authLoading && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-transparent border border-rose-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5 sm:mt-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Active Plan Required to Record Scores
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {user?.subscriptionStatus && user.subscriptionStatus !== "none"
                      ? `${user.subscriptionStatus} plan`
                      : "No Active Plan"}
                  </span>
                </h4>
                <p className="text-xs text-white/60 mt-0.5">
                  You must have an active digital.HEROES plan (Monthly $25/mo or Annual $250/yr) to log official rounds, maintain your 5-slot draw ticket, and participate in monthly jackpot draws.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 shrink-0"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Activate Plan ($25/mo)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !hasActivePlan && !authLoading
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            }`}>
              {!hasActivePlan && !authLoading ? <Lock className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Official Stableford Round</h3>
              <p className="text-xs text-white/50">
                {!hasActivePlan && !authLoading
                  ? "Membership required to submit scores to the draw engine."
                  : "PRD § 05 Rule: Exactly one score entry per calendar date is permitted."}
              </p>
            </div>
          </div>

          {/* Suggested Date Quick Action */}
          {suggestedNextDate && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">Suggested Date:</span>
              <button
                type="button"
                disabled={!hasActivePlan}
                onClick={() => setFormData({ ...formData, date: suggestedNextDate })}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors flex items-center gap-1.5 ${
                  !hasActivePlan
                    ? "bg-white/5 border-white/5 text-white/30 cursor-not-allowed"
                    : "bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 cursor-pointer"
                }`}
                title={!hasActivePlan ? "Active plan required" : "Click to apply next available date without conflict"}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                {suggestedNextDate}
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitScore} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Stableford Score */}
            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                STABLEFORD POINTS (1–45) *
              </label>
              <Input
                type="number"
                min="1"
                max="45"
                required
                disabled={!hasActivePlan || submitting}
                placeholder={!hasActivePlan ? "Plan required" : "e.g. 38"}
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className={`bg-[#121520] font-mono text-lg ${
                  !hasActivePlan
                    ? "opacity-50 cursor-not-allowed border-white/10"
                    : "border-white/15 text-white focus:border-emerald-500"
                }`}
              />
              <span className="text-[10px] text-white/40 mt-1 block">Valid range: 1 to 45 pts</span>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                ROUND DATE *
              </label>
              <Input
                type="date"
                required
                disabled={!hasActivePlan || submitting}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`bg-[#121520] font-mono text-white ${
                  !hasActivePlan
                    ? "opacity-50 cursor-not-allowed border-white/10"
                    : duplicateScore
                    ? "border-amber-500/60 focus:border-amber-400"
                    : "border-white/15 focus:border-emerald-500"
                }`}
              />
              <span className="text-[10px] text-white/40 mt-1 block">Unique date per score</span>
            </div>

            {/* Course Name */}
            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                COURSE / CLUB NAME
              </label>
              <Input
                type="text"
                disabled={!hasActivePlan || submitting}
                placeholder={!hasActivePlan ? "Plan required" : "e.g. Augusta National"}
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                className={`bg-[#121520] ${
                  !hasActivePlan
                    ? "opacity-50 cursor-not-allowed border-white/10"
                    : "border-white/15 text-white focus:border-emerald-500"
                }`}
              />
              <span className="text-[10px] text-white/40 mt-1 block">Optional course label</span>
            </div>
          </div>

          {/* Real-time duplicate date conflict banner */}
          {duplicateScore && hasActivePlan && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-semibold text-white">
                  Date Conflict: A score is already recorded for {formData.date}
                </p>
                <p className="text-amber-200/70 text-[11px] leading-relaxed">
                  You already logged <strong>{duplicateScore.courseName || "Course Round"}</strong> ({duplicateScore.score} pts) on this date. PRD § 05 enforces strictly one score per calendar date.
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, date: suggestedNextDate })}
                    className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors"
                  >
                    Switch to Next Available Date ({suggestedNextDate})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingScore(duplicateScore);
                      setEditFormData({ score: duplicateScore.score, courseName: duplicateScore.courseName || "" });
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/70 text-[11px] transition-colors"
                  >
                    Edit Existing Round
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {!hasActivePlan
                  ? "Active digital.HEROES plan required to log scores and enter draws"
                  : activeScores.length >= 5
                  ? "Adding this round will automatically roll your oldest active score into archive."
                  : "Verified against duplicate dates & Stableford rules"}
              </span>
            </div>

            <Button
              type="submit"
              disabled={!hasActivePlan || submitting || !!duplicateScore}
              className={`font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 ${
                !hasActivePlan
                  ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/10 shadow-none"
                  : duplicateScore
                  ? "bg-amber-500/40 text-amber-950 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20"
              }`}
            >
              {!hasActivePlan ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-white/40" />
                  Active Plan Required to Submit
                </>
              ) : submitting ? (
                "Recording & Rolling..."
              ) : duplicateScore ? (
                "Date Taken — Choose Another"
              ) : activeScores.length >= 5 ? (
                "Record Round & Roll FIFO"
              ) : (
                "Submit Round"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* 3. Score History & Archive Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Full Scoring Log & Historical Archive</h3>
              <p className="text-xs text-white/50">
                All rounds played, active draw entries, and historical rounds rolled into archive.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            <button
              onClick={() => {
                setFilter("all");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                filter === "all"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              All Rounds ({allScores.length})
            </button>
            <button
              onClick={() => {
                setFilter("active");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                filter === "active"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Active Ticket ({activeCount})
            </button>
            <button
              onClick={() => {
                setFilter("archived");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                filter === "archived"
                  ? "bg-emerald-500 text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Archived FIFO ({archivedScores.length})
            </button>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : displayedScores.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/50">
              {filter === "archived"
                ? "No scores have been archived yet. Once you record more than 5 rounds, older rounds roll here automatically."
                : "No scores recorded yet."}
            </p>
            {filter !== "archived" && (
              <p className="text-xs text-white/30 mt-1">Submit your first Stableford round above.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Queue Status</th>
                  <th className="py-3 px-4">Stableford Score</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Date Played</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedScores.map((score) => {
                  const activeIdx = activeScores.findIndex((s) => s._id === score._id);
                  const isSlot5Oldest = activeIdx === 4 && activeScores.length === 5;
                  const isJustRolled = lastRolledScore && lastRolledScore._id === score._id;

                  return (
                    <tr
                      key={score._id}
                      className={`hover:bg-white/5 transition-colors ${
                        isJustRolled ? "bg-amber-500/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        {score.isCurrentActive ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Active Slot #{activeIdx + 1}
                            </span>
                            {isSlot5Oldest && (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Rolls Next
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-white/40 bg-white/5 border border-white/10">
                              <Archive className="w-3 h-3 text-white/40" />
                              Archived (FIFO Rolled)
                            </span>
                            {isJustRolled && (
                              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 rounded animate-pulse">
                                Just Rolled
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-base font-bold text-white">
                        {score.score} <span className="text-xs font-normal text-white/40">pts</span>
                      </td>
                      <td className="py-3.5 px-4 text-white/80 font-medium">
                        {score.courseName || "Course Round"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-white/50">
                        {new Date(score.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (!hasActivePlan) {
                                toast.error("Active subscription plan required to edit scores.");
                                return;
                              }
                              setEditingScore(score);
                              setEditFormData({ score: score.score, courseName: score.courseName || "" });
                            }}
                            className={`px-2 py-1 rounded transition-colors ${
                              !hasActivePlan
                                ? "text-white/20 cursor-not-allowed"
                                : "text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                            title={!hasActivePlan ? "Active subscription plan required" : "Edit score"}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (!hasActivePlan) {
                                toast.error("Active subscription plan required to delete scores.");
                                return;
                              }
                              handleDeleteScore(score._id);
                            }}
                            disabled={deletingId === score._id || !hasActivePlan}
                            className={`px-2 py-1 rounded transition-colors ${
                              !hasActivePlan
                                ? "text-rose-400/20 cursor-not-allowed"
                                : "text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                            }`}
                            title={!hasActivePlan ? "Active subscription plan required" : "Delete score"}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControl
          currentPage={historyPage}
          totalPages={totalHistoryPages}
          totalItems={displayedScores.length}
          limit={historyLimit}
          limitOptions={[10, 20, 50, 100]}
          onPageChange={setHistoryPage}
          onLimitChange={(newLimit) => {
            setHistoryLimit(newLimit);
            setHistoryPage(1);
          }}
          itemName="rounds"
          className="pt-6 border-t border-white/10"
        />
      </div>

      {/* Edit Score Modal */}
      <Dialog open={!!editingScore} onOpenChange={(open) => !open && setEditingScore(null)}>
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-400" />
              Edit Stableford Score
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Update the Stableford points or course details for this round. Date remains locked to preserve chronological queue integrity.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateScore} className="space-y-4 my-2">
            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5">
                STABLEFORD POINTS (1–45) *
              </label>
              <Input
                type="number"
                min="1"
                max="45"
                required
                value={editFormData.score}
                onChange={(e) => setEditFormData({ ...editFormData, score: e.target.value })}
                className="bg-[#121520] border-white/15 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5">
                COURSE / CLUB NAME
              </label>
              <Input
                type="text"
                value={editFormData.courseName}
                onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })}
                className="bg-[#121520] border-white/15 text-white"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditingScore(null)}
                className="text-xs text-white/60 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold"
              >
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
