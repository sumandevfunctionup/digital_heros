"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Target,
  Trophy,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
} from "lucide-react";
import DirectDonationModal from "@/components/DirectDonationModal";
import { DashboardOverviewSkeleton } from "@/components/ui/SkeletonLoaders";

export default function DashboardOverviewPage() {
  const { user, refreshUser } = useAuth();
  const [scoresData, setScoresData] = useState({
    scores: [],
    totalActive: 0,
    isComplete: false,
  });
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [winningsSummary, setWinningsSummary] = useState({
    totalWon: 0,
    pendingClaimCount: 0,
    winnings: [],
  });
  const [loading, setLoading] = useState(true);
  const [donationCharity, setDonationCharity] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch active scores
        const scoresRes = await fetch("/api/scores");
        if (scoresRes.ok) {
          const sJson = await scoresRes.json();
          if (sJson.success && sJson.data) {
            setScoresData(sJson.data);
          }
        }

        // 2. Fetch upcoming draw
        const drawRes = await fetch("/api/draws/upcoming");
        if (drawRes.ok) {
          const dJson = await drawRes.json();
          if (dJson.success && dJson.data) {
            setUpcomingDraw(dJson.data);
          }
        }

        // 3. Fetch user winnings
        const winRes = await fetch("/api/winners");
        if (winRes.ok) {
          const wJson = await winRes.json();
          if (wJson.success && wJson.data) {
            setWinningsSummary(wJson.data);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const isSubscribed =
    user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";

  if (loading) {
    return <DashboardOverviewSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* 1. Winnings Notification Banner (if any pending claims) */}
      {winningsSummary.pendingClaimCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent p-5 backdrop-blur-xl shadow-lg shadow-amber-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Prize Verification Required!
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-black">
                    Action Needed
                  </span>
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  You have {winningsSummary.pendingClaimCount} prize claim awaiting your official round screenshot to unlock payout.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/winnings"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs hover:brightness-110 transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              Upload Score Proof
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Admin Privileges Banner (if admin) OR Subscription Status Alert (if inactive golfer) */}
      {user?.role === "admin" ? (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#0F1118] to-transparent p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Platform Administrator Account
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Staff Exempt
                  </span>
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  You are logged in with Superuser authority. Draw simulation, winner proof verification, and charity controls are located in the Admin Control Plane.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              Open Admin Control Plane
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : !isSubscribed ? (
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-[#0F1118] to-transparent p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Membership Inactive</h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Activate your digital.HEROES membership to enter scores, support your charity, and participate in the monthly draw.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("open-stripe-modal", { detail: { plan: "monthly" } })
                  );
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-emerald-500/25 whitespace-nowrap cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Open Payment Gateway ($25/mo)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* 3. Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ticket Completeness */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1118]/80 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Draw Entry</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {scoresData.totalActive}/5
            </span>
            <span
              className={`text-xs font-semibold ${
                scoresData.isComplete ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {scoresData.isComplete ? "Qualified" : "Incomplete"}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {scoresData.isComplete
              ? "All 5 scores locked into monthly draw"
              : `Submit ${5 - scoresData.totalActive} more round(s) to qualify`}
          </p>
        </div>

        {/* Current Draw Pool */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1118]/80 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Est. Monthly Pool</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              ${upcomingDraw?.estimatedPool ? upcomingDraw.estimatedPool.toLocaleString() : "2,500+"}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Includes ${upcomingDraw?.jackpotRolloverIn?.toLocaleString() || "1,500"} Tier 1 rollover
          </p>
        </div>

        {/* Charity Allocation */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1118]/80 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Giving Pledge</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {user?.charityContributionPercent || 10}%
            </span>
            <span className="text-xs text-rose-400 font-medium">
              {user?.selectedCharity?.name ? user.selectedCharity.name.slice(0, 14) + "..." : "Selected"}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Direct monthly contribution from your subscription
          </p>
        </div>

        {/* Total Career Winnings */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1118]/80 p-5 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Career Winnings</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">
              ${winningsSummary.totalWon.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {winningsSummary.winnings.length} total prize matches recorded
          </p>
        </div>
      </div>

      {/* 4. Active 5-Score Ticket Visualizer */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F1118] to-[#0A0C10] p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Active 5-Score Draw Ticket
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Numbers
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              PRD § 05: Your latest 5 Stableford rounds form your official draw entry. Oldest scores roll out automatically (FIFO).
            </p>
          </div>

          <Link
            href="/dashboard/scores"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Enter New Score
          </Link>
        </div>

        {/* 5 Slots Container */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const scoreItem = scoresData.scores[slotIdx];
            const isFilled = !!scoreItem;
            const isRollingTarget = slotIdx === 4 && scoresData.scores.length === 5;

            return (
              <div
                key={slotIdx}
                className={`relative rounded-2xl p-5 border transition-all ${
                  isFilled
                    ? "bg-[#121520] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-black/40"
                    : "bg-[#0B0D13]/60 border-dashed border-white/15"
                }`}
              >
                {/* Slot Tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mb-3">
                  <span>SLOT #{slotIdx + 1}</span>
                  {isRollingTarget && (
                    <span className="text-amber-400 font-semibold flex items-center gap-1" title="This score will roll into archive on next entry">
                      <Clock className="w-3 h-3" />
                      Rolling next
                    </span>
                  )}
                  {isFilled && !isRollingTarget && (
                    <span className="text-emerald-400 font-semibold">Active</span>
                  )}
                </div>

                {isFilled ? (
                  <div>
                    {/* Score Number Display */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white font-mono tracking-tight">
                        {scoreItem.score}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">pts</span>
                    </div>

                    {/* Course & Date */}
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                      <p className="font-semibold text-white/90 truncate" title={scoreItem.courseName}>
                        {scoreItem.courseName || "Course Round"}
                      </p>
                      <p className="text-[11px] text-white/40 font-mono mt-0.5">
                        {new Date(scoreItem.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-white/30 mb-2">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-white/40 font-mono">Slot Available</span>
                    <span className="text-[10px] text-white/25 mt-0.5">Enter round to fill</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Guidance */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Score format: Official Stableford (1–45 points). Exactly 1 score per date.</span>
          </div>
          <Link
            href="/dashboard/scores"
            className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 group"
          >
            <span>Manage All Rounds & History</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 5. Bottom Two-Column: Charity Impact & Monthly Draw Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Chosen Charity Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-7 backdrop-blur-xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h3 className="text-base font-bold text-white">Selected Charity Partner</h3>
              </div>
              <Link
                href="/dashboard/charity"
                className="text-xs text-white/60 hover:text-white underline underline-offset-4"
              >
                Change Charity
              </Link>
            </div>

            {user?.selectedCharity ? (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121520] border border-white/10">
                <img
                  src={user.selectedCharity.logoUrl}
                  alt={user.selectedCharity.name}
                  className="w-14 h-14 rounded-xl object-cover bg-white/5 border border-white/15"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">
                      {user.selectedCharity.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {user.selectedCharity.category}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    Your allocation:{" "}
                    <strong className="text-white font-mono">
                      {user.charityContributionPercent || 10}%
                    </strong>{" "}
                    of every monthly membership fee ($
                    {((25 * (user?.charityContributionPercent || 10)) / 100).toFixed(2)}/mo).
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#121520] border border-white/10 text-center">
                <p className="text-xs text-white/60">No specific charity partner selected.</p>
                <Link
                  href="/charities"
                  className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
                >
                  Browse our 4 registered causes
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/50">Want to make an immediate impact?</span>
            <button
              onClick={() =>
                setDonationCharity(
                  user?.selectedCharity || {
                    id: "default",
                    name: "Digital Heroes Partner Charity",
                  }
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all border border-white/15"
            >
              Direct Donation
            </button>
          </div>
        </div>

        {/* Right: Monthly Draw Engine Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-7 backdrop-blur-xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Monthly Draw Engine</h3>
              </div>
              <Link
                href="/draws"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Draw Archives</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Every month, 5 distinct numbers (1–45) are drawn using transparent algorithms. Matches against your active 5-score ticket reward tiered pools:
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              <div className="rounded-xl p-3 bg-[#121520] border border-white/10 text-center">
                <div className="text-[10px] font-mono text-white/40 uppercase">5 Matches</div>
                <div className="text-lg font-bold text-amber-400 font-mono mt-1">40%</div>
                <div className="text-[10px] text-amber-300/80 font-medium">Tier 1 + Rollover</div>
              </div>
              <div className="rounded-xl p-3 bg-[#121520] border border-white/10 text-center">
                <div className="text-[10px] font-mono text-white/40 uppercase">4 Matches</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-1">35%</div>
                <div className="text-[10px] text-cyan-300/80 font-medium">Tier 2 Pool</div>
              </div>
              <div className="rounded-xl p-3 bg-[#121520] border border-white/10 text-center">
                <div className="text-[10px] font-mono text-white/40 uppercase">3 Matches</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">25%</div>
                <div className="text-[10px] text-emerald-300/80 font-medium">Tier 3 Pool</div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>Draws conclude on the last day of each calendar month.</span>
            <Link href="/how-it-works" className="text-white hover:underline">
              How math works
            </Link>
          </div>
        </div>
      </div>

      {/* Direct Donation Modal */}
      {donationCharity && (
        <DirectDonationModal
          charity={donationCharity}
          isOpen={!!donationCharity}
          onClose={() => setDonationCharity(null)}
          onSuccess={() => {
            setDonationCharity(null);
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
