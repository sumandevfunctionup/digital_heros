"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Trophy,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GolferDrawsPage() {
  const { user } = useAuth();
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [pastDraws, setPastDraws] = useState([]);
  const [userWinnings, setUserWinnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [drawRes, scoreRes, pastRes, winRes] = await Promise.all([
          fetch("/api/draws/upcoming"),
          fetch("/api/scores"),
          fetch("/api/draws"),
          fetch("/api/winners"),
        ]);

        const [drawJson, scoreJson, pastJson, winJson] = await Promise.all([
          drawRes.json(),
          scoreRes.json(),
          pastRes.json(),
          winRes.json(),
        ]);

        if (drawJson.success) setUpcomingDraw(drawJson.data);
        if (scoreJson.success && scoreJson.data?.scores) setUserScores(scoreJson.data.scores);
        if (pastJson.success && pastJson.data?.draws) setPastDraws(pastJson.data.draws);
        if (winJson.success && winJson.data?.winnings) setUserWinnings(winJson.data.winnings);
      } catch (err) {
        console.error("Failed to load draw data:", err);
        toast.error("Could not load draw participation data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute countdown
  const targetDate = upcomingDraw?.nextDrawDate ? new Date(upcomingDraw.nextDrawDate) : new Date("2026-10-01T00:00:00Z");
  const userScoreNumbers = userScores.map((s) => s.score);
  const isTicketComplete = userScoreNumbers.length === 5;

  return (
    <div className="space-y-8 selection:bg-amber-500/30">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Draw Participation & Tickets
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PRD § 06 & § 10
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Track your active 5-score monthly draw ticket, matched winning numbers, and historical draw entries.
          </p>
        </div>

        <Link href="/dashboard/scores">
          <Button className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2">
            <Zap className="w-4 h-4 fill-black" />
            Manage 5-Score Ticket
          </Button>
        </Link>
      </div>

      {/* Active Draw Ticket Card */}
      <div className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#121622] via-[#0E1119] to-[#0A0C12] p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Upcoming Monthly Draw
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Draw Target: {targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-right">
                <div className="text-[10px] uppercase font-mono text-white/50">Total Projected Pool</div>
                <div className="text-lg font-black font-mono text-amber-400">
                  ${(upcomingDraw?.estimatedTotalPool || 1500).toLocaleString()}
                </div>
              </div>

              {upcomingDraw?.jackpotRolloverIn > 0 && (
                <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
                  <div className="text-[10px] uppercase font-mono text-amber-300">Rollover Jackpot Included</div>
                  <div className="text-lg font-black font-mono text-amber-300">
                    +${upcomingDraw.jackpotRolloverIn.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User's Active 5-Score Ticket */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-white/70 flex items-center gap-2">
                <span>Your Official 5-Number Draw Ticket</span>
                {isTicketComplete ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Ticket Verified (5/5)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <AlertCircle className="w-3 h-3" /> Incomplete ({userScoreNumbers.length}/5)
                  </span>
                )}
              </div>

              <span className="text-[11px] text-white/50">
                Rule: 1–45 Stableford rolling scores
              </span>
            </div>

            {/* 5 Ball Display */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-xl">
              {[0, 1, 2, 3, 4].map((index) => {
                const scoreObj = userScores[index];
                const hasScore = Boolean(scoreObj);
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                      hasScore
                        ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                        : "bg-white/5 border-dashed border-white/20 text-white/30"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-white/40 mb-1">
                      Slot #{index + 1}
                    </span>
                    <span className={`text-2xl sm:text-3xl font-black font-mono ${hasScore ? "text-amber-400" : "text-white/20"}`}>
                      {hasScore ? scoreObj.score : "—"}
                    </span>
                    <span className="text-[9px] text-white/40 truncate mt-1 max-w-[70px]">
                      {hasScore ? new Date(scoreObj.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Empty"}
                    </span>
                  </div>
                );
              })}
            </div>

            {!isTicketComplete && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-200">
                    You have logged <strong className="text-white">{userScoreNumbers.length}</strong> of 5 required scores. Enter {5 - userScoreNumbers.length} more round to qualify for this month&apos;s draw!
                  </p>
                </div>
                <Link href="/dashboard/scores">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs">
                    Log Score Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Winnings Summary Alert Banner */}
      {userWinnings.length > 0 && (
        <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                You have won {userWinnings.length} prize{userWinnings.length > 1 ? "s" : ""}!
              </h3>
              <p className="text-xs text-emerald-300">
                Total prize winnings recorded: <strong className="font-mono">${userWinnings.reduce((sum, w) => sum + w.prizeAmount, 0).toLocaleString()}</strong>.
              </p>
            </div>
          </div>

          <Link href="/dashboard/winnings">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2">
              View Winnings & Submit Proof
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Historical Draws & Result Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Official Published Draws Archive
          </h2>
          <span className="text-xs font-mono text-white/50">
            {pastDraws.length} Official Draw{pastDraws.length !== 1 ? "s" : ""}
          </span>
        </div>

        {pastDraws.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/10 bg-[#0F1118]/60 backdrop-blur-sm space-y-3">
            <Clock className="w-8 h-8 text-white/30 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Published Draws Yet</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              The platform administrator runs the official draw at the beginning of each calendar month. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastDraws.map((draw) => {
              // Calculate how many numbers the user matches with their current scores
              const matchedNumbers = userScoreNumbers.filter((num) =>
                draw.drawnNumbers.includes(num)
              );
              const matchCount = matchedNumbers.length;
              const hasWon = matchCount >= 3;

              return (
                <div
                  key={draw._id}
                  className={`p-6 rounded-3xl border transition-all bg-[#0F1118]/80 backdrop-blur-xl ${
                    hasWon
                      ? "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Draw Meta */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/10 text-white border border-white/15">
                          Draw #{draw.drawNumber || "1"}
                        </span>
                        <span className="text-xs text-white/50 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(draw.drawDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {draw.algorithm === "score_frequency" ? "Algorithmic Weighted" : "Uniform Random"}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white">
                        Cycle Month: <span className="font-mono text-amber-400">{draw.drawMonth}</span>
                      </div>
                    </div>

                    {/* 5 Drawn Winning Balls */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/50 mr-2 hidden sm:inline">
                        Winning Numbers:
                      </span>
                      <div className="flex items-center gap-2">
                        {draw.drawnNumbers.map((num, idx) => {
                          const isMatched = userScoreNumbers.includes(num);
                          return (
                            <div
                              key={idx}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm sm:text-base border transition-all ${
                                isMatched
                                  ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105"
                                  : "bg-white/5 text-white/90 border-white/15"
                              }`}
                            >
                              {num}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* User Match Badge */}
                    <div className="flex items-center gap-3">
                      {hasWon ? (
                        <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center">
                          <div className="text-[10px] font-mono text-amber-300 uppercase font-bold">
                            Prize Match!
                          </div>
                          <div className="text-sm font-extrabold text-amber-400">
                            {matchCount} Numbers Matched
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                          <div className="text-[10px] font-mono text-white/40 uppercase">
                            Your Ticket Match
                          </div>
                          <div className="text-xs font-semibold text-white/70">
                            {matchCount} of 5 Matched
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Draw Pool Breakdown */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-white/40">Total Prize Pool</div>
                      <div className="font-mono font-bold text-white">
                        ${draw.totalPoolAmount?.toLocaleString() || "1,500"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40">Tier 1 (5-Match Jackpot)</div>
                      <div className="font-mono font-bold text-amber-400">
                        ${draw.tier1Pool?.toLocaleString() || "600"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40">Tier 2 (4-Match)</div>
                      <div className="font-mono font-bold text-cyan-400">
                        ${draw.tier2Pool?.toLocaleString() || "525"}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40">Rollover to Next Month</div>
                      <div className="font-mono font-bold text-emerald-400">
                        ${draw.jackpotRolloverOut?.toLocaleString() || "0"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
