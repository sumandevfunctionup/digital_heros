"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Coins,
  History,
  TrendingUp,
  ChevronDown,
  Award,
  Users,
} from "lucide-react";
import PaginationControl from "@/components/ui/PaginationControl";
import { DrawCardSkeleton } from "@/components/ui/SkeletonLoaders";

export default function DrawsPublicPage() {
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [pastDraws, setPastDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDraws, setExpandedDraws] = useState({});

  // Pagination for Published Draws Archive
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalDraws, setTotalDraws] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const toggleDraw = (drawId) => {
    setExpandedDraws((prev) => ({
      ...prev,
      [drawId]: !prev[drawId],
    }));
  };

  useEffect(() => {
    async function loadDraws() {
      try {
        setLoading(true);
        // 1. Fetch upcoming draw stats
        const upcomingRes = await fetch("/api/draws/upcoming");
        if (upcomingRes.ok) {
          const upJson = await upcomingRes.json();
          if (upJson.success && upJson.data) {
            setUpcomingDraw(upJson.data);
          }
        }

        // 2. Fetch past published draws with pagination
        const pastRes = await fetch(`/api/draws?page=${page}&limit=${limit}`);
        if (pastRes.ok) {
          const pastJson = await pastRes.json();
          if (pastJson.success && pastJson.data?.draws) {
            setPastDraws(pastJson.data.draws);
            setTotalDraws(pastJson.meta?.total || 0);
            setTotalPages(pastJson.meta?.totalPages || 1);

            // Default expand all draws that have winners so they are immediately visible
            const initialExpanded = {};
            pastJson.data.draws.forEach((d) => {
              if ((d.winners && d.winners.length > 0) || (d.winnersCount || 0) > 0) {
                initialExpanded[d._id] = true;
              }
            });
            setExpandedDraws(initialExpanded);
          }
        }
      } catch (err) {
        console.error("Failed to load draws:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDraws();
  }, [page, limit]);

  const totalRollover = upcomingDraw?.jackpotRolloverIn ?? 1500;
  const estimatedPool = upcomingDraw?.estimatedTotalPool ?? upcomingDraw?.estimatedPool ?? 2500;

  // Aggregate all winners across all published draws for the Champions Showcase
  const allRecentWinners = pastDraws.flatMap((d) =>
    (d.winners || []).map((w) => ({
      ...w,
      drawNumber: d.drawNumber,
      drawMonth: d.drawMonth,
      drawDrawnNumbers: d.drawnNumbers,
    }))
  );

  return (
    <div className="min-h-screen bg-[#08090C] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official digital.HEROES Monthly Draw Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Where Your Golf Scores{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
              Win Monthly Jackpots
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            Every month, 5 distinct numbers (1–45) are drawn. Match your active 5-score Stableford ticket to win cash prizes while funding registered charities across the nation.
          </p>
        </div>

        {/* Live Monthly Jackpot Banner */}
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181420] via-[#120F1A] to-[#0A0C10] p-6 sm:p-10 backdrop-blur-2xl relative overflow-hidden shadow-2xl shadow-amber-500/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                Draw #{upcomingDraw?.drawNumber || "101"} •{" "}
                {upcomingDraw?.drawMonth || "Current Month"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Estimated Prize Pool
              </h2>
              <p className="text-xs sm:text-sm text-white/60 max-w-lg">
                Includes <strong className="text-amber-300 font-mono">${totalRollover.toLocaleString()}</strong> rollover from previous draws where Tier 1 had no matching entries.
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-end">
              <div className="text-4xl sm:text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                ${estimatedPool.toLocaleString()}
              </div>
              <span className="text-xs font-mono text-white/40 mt-1 uppercase tracking-widest">
                Tier 1 Rollover Guaranteed
              </span>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/scores"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Enter My Scores
                </Link>
                <Link
                  href="/how-it-works"
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition-all border border-white/15"
                >
                  Read Draw Rules
                </Link>
              </div>
            </div>
          </div>

          {/* 3 Tier Prize Split Cards */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-[#121520] border border-amber-500/20 text-center">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                Tier 1 (5 of 5 Matches)
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">40%</div>
              <p className="text-xs text-amber-300/80 font-mono mt-0.5">
                + ${(totalRollover).toLocaleString()} Jackpot Rollover
              </p>
            </div>

            <div className="rounded-2xl p-4 bg-[#121520] border border-cyan-500/20 text-center">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Tier 2 (4 of 5 Matches)
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">35%</div>
              <p className="text-xs text-cyan-300/80 font-mono mt-0.5">
                Distributed equally among winners
              </p>
            </div>

            <div className="rounded-2xl p-4 bg-[#121520] border border-emerald-500/20 text-center">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                Tier 3 (3 of 5 Matches)
              </span>
              <div className="text-2xl font-black font-mono text-white mt-1">25%</div>
              <p className="text-xs text-emerald-300/80 font-mono mt-0.5">
                Consolation prize pool
              </p>
            </div>
          </div>
        </div>

        {/* Recent Platform Prize Champions Showcase */}
        {allRecentWinners.length > 0 && (
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-[#0F1118] to-emerald-500/10 p-6 sm:p-8 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Recent Prize Champions
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Verified Winners
                </span>
              </div>
              <span className="text-xs font-mono text-white/50">
                {allRecentWinners.length} Golfer{allRecentWinners.length > 1 ? "s" : ""} Awarded
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {allRecentWinners.slice(0, 4).map((w, idx) => (
                <div
                  key={w._id || idx}
                  className="p-4 rounded-2xl bg-[#0B0D13]/90 border border-white/10 hover:border-amber-500/40 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/40">
                      Draw #{w.drawNumber} • {w.drawMonth}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +${w.prizeAmount?.toLocaleString()}
                    </span>
                  </div>

                  <div className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors truncate">
                    {w.userId?.firstName
                      ? `${w.userId.firstName} ${w.userId.lastName || ""}`
                      : "Verified Golfer"}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-white/50 pt-1 border-t border-white/5">
                    <span className="truncate max-w-[120px]">
                      {w.userId?.homeClub || "Active Club Member"}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {w.matchCount}-Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Draw Archives */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-white/60" />
                Published Draws Archive
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Verifiable cryptographic records of previous monthly draws, winning numbers, and official prize recipients.
              </p>
            </div>
            <span className="text-xs font-mono text-white/40">
              {pastDraws.length} Official Draws Published
            </span>
          </div>

          {loading ? (
            <DrawCardSkeleton count={limit || 3} />
          ) : pastDraws.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
              <Calendar className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50">No published draws yet.</p>
              <p className="text-xs text-white/30 mt-1">
                Draws are published at the end of every monthly cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastDraws.map((draw) => {
                const isExpanded = Boolean(expandedDraws[draw._id]);
                const winnersCount = draw.winnersCount ?? (draw.winners?.length || 0);

                return (
                  <div
                    key={draw._id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isExpanded
                        ? "border-amber-500/40 bg-[#131622] shadow-xl shadow-amber-500/5"
                        : "border-white/10 bg-[#121520] hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-white">
                            Draw #{draw.drawNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-white/70">
                            {draw.drawMonth}
                          </span>
                          <span className="capitalize text-[10px] font-mono text-white/40">
                            {draw.algorithmType === "random"
                              ? "Uniform Random"
                              : "Score-Weighted Laplace"}
                          </span>
                        </div>

                        {/* Drawn Numbers Balls */}
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider mr-1">
                            Drawn:
                          </span>
                          {draw.drawnNumbers?.map((num, i) => (
                            <span
                              key={i}
                              className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shadow-inner"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Draw Stats & Action Button */}
                      <div className="flex flex-wrap items-center gap-5 text-xs text-right">
                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase">
                            Total Pool
                          </span>
                          <span className="font-bold text-white font-mono text-sm">
                            ${draw.totalPrizePool?.toLocaleString() || "0"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-white/40 block uppercase">
                            Winners
                          </span>
                          <span
                            className={`font-bold font-mono text-sm ${
                              winnersCount > 0 ? "text-emerald-400" : "text-white/40"
                            }`}
                          >
                            {winnersCount}
                          </span>
                        </div>

                        {draw.jackpotRolloverOut > 0 && (
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 block uppercase">
                              Rolled Over
                            </span>
                            <span className="font-bold text-amber-300 font-mono text-sm">
                              ${draw.jackpotRolloverOut.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Expand Winners Action */}
                        <div className="pl-2 border-l border-white/10">
                          {winnersCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleDraw(draw._id)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isExpanded
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10"
                                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                              }`}
                            >
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                {isExpanded
                                  ? "Hide Winners"
                                  : `View ${winnersCount} Winner${winnersCount > 1 ? "s" : ""}`}
                              </span>
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 block">
                              No Winners (Rollover)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Official Winners Roster */}
                    {isExpanded && (
                      <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-300">
                              Official Prize Winners — Draw #{draw.drawNumber} ({draw.drawMonth})
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-white/40">
                            PRD § 07 Prize Allocations
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {draw.winners?.map((win, idx) => {
                            const tierNum =
                              win.tier === "tier_1_five_match" || win.matchCount === 5
                                ? 1
                                : win.tier === "tier_2_four_match" || win.matchCount === 4
                                ? 2
                                : 3;

                            const matchedNums =
                              Array.isArray(win.matchedNumbers) && win.matchedNumbers.length > 0
                                ? win.matchedNumbers
                                : draw.drawnNumbers && Array.isArray(win.userSubmittedScores)
                                ? win.userSubmittedScores
                                    .map((s) => s.score)
                                    .filter((s) => draw.drawnNumbers.includes(s))
                                : [];

                            return (
                              <div
                                key={win._id || idx}
                                className="p-3.5 rounded-xl border border-white/10 bg-[#0C0E14] hover:border-amber-500/30 transition-all space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
                                      {win.userId?.firstName?.[0] || "G"}
                                    </div>
                                    <div>
                                      <div className="font-bold text-white text-xs">
                                        {win.userId?.firstName
                                          ? `${win.userId.firstName} ${win.userId.lastName || ""}`
                                          : "Verified Golfer"}
                                      </div>
                                      <div className="text-[10px] text-white/40 font-mono">
                                        {win.userId?.homeClub || "Active Club Golfer"}
                                      </div>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                      tierNum === 1
                                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                        : tierNum === 2
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                    }`}
                                  >
                                    Tier {tierNum} ({tierNum === 1 ? "5-Match" : tierNum === 2 ? "4-Match" : "3-Match"})
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                  <div>
                                    <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">
                                      Matched Balls
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5 font-mono text-xs">
                                      {matchedNums.map((n, i) => (
                                        <span
                                          key={i}
                                          className="w-5 h-5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-[10px]"
                                        >
                                          {n}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[9px] font-mono text-white/40 block uppercase tracking-wider">
                                      Prize Won
                                    </span>
                                    <span className="font-bold text-emerald-400 font-mono text-sm">
                                      ${win.prizeAmount?.toLocaleString() || "0"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <PaginationControl
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalDraws}
            limit={limit}
            limitOptions={[5, 10, 20]}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemName="published draws"
            className="pt-6 border-t border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
