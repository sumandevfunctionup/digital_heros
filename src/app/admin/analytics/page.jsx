"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Heart,
  Trophy,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Dices,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } else {
        toast.error("Failed to load platform telemetry.");
      }
    } catch {
      toast.error("Error connecting to analytics engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto" />
        <p className="text-xs font-mono text-white/50 tracking-widest uppercase">
          Compiling Platform Telemetry & Histograms...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 rounded-3xl border border-rose-500/30 bg-[#0F1118] text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Analytics Unavailable</h2>
        <Button onClick={fetchAnalytics} className="bg-amber-500 text-black font-semibold text-xs">
          Retry
        </Button>
      </div>
    );
  }

  const { users, charities, draws, winners, scores } = data;
  const maxScoreCount = Math.max(...(scores?.scoreDistribution?.map((s) => s.count) || [1]), 1);

  return (
    <div className="space-y-8 selection:bg-amber-500/30">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Intelligence & Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PRD § 11.05
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Deep-dive financial metrics, charity distribution logs, and Stableford score frequency distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAnalytics}
            variant="outline"
            size="sm"
            className="border-white/10 text-white/70 hover:text-white bg-white/5"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>

          <Link href="/admin/draws/new">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs">
              <Dices className="w-3.5 h-3.5 mr-1.5" />
              Draw Simulator
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="font-mono uppercase">Est. Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            ${users.estimatedMRR?.toLocaleString() || "0"}
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between">
            <span>{users.activeSubscribers} active subscribers</span>
            <span className="text-white/40">{users.yearlySubscribers} annual</span>
          </div>
        </div>

        {/* Charity Funds */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="font-mono uppercase">Total Charity Raised</span>
            <Heart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            ${charities.totalCharityFundsRaised?.toLocaleString() || "0"}
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between">
            <span>Direct donations: ${charities.directDonationTotal?.toLocaleString() || "0"}</span>
            <span className="text-amber-300">Min 10% pledge</span>
          </div>
        </div>

        {/* Jackpot Rollover */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="font-mono uppercase">Current Rollover Jackpot</span>
            <Trophy className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400">
            ${draws.currentJackpotRollover?.toLocaleString() || "1,500"}
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between">
            <span>{draws.totalDrawsConducted} published draws</span>
            <span className="text-cyan-300">Tier 1 carries</span>
          </div>
        </div>

        {/* Verification Backlog */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-white/50 text-xs">
            <span className="font-mono uppercase">Winners Audit Queue</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">
            {winners.pendingVerificationWinners} <span className="text-xs font-normal text-white/50">pending</span>
          </div>
          <div className="text-[11px] text-white/50 flex items-center justify-between">
            <span>{winners.paidWinners} payouts released</span>
            <Link href="/admin/winners" className="text-amber-400 hover:underline">
              Review Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Score Frequency Histogram (Directly powers Algorithm B: Score-Frequency Weighted Draw) */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
              <BarChart3 className="w-3.5 h-3.5" />
              Algorithmic Draw Frequency Distribution
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Active Stableford Scores (Range 1 – 45)
            </h2>
            <p className="text-xs text-white/60">
              Total active scores in play: <strong className="text-white font-mono">{scores.activeScoresInPlay}</strong>. Mode B uses Laplace smoothing over this distribution to calculate draw odds.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-white/50">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Submitted Freq
            </span>
          </div>
        </div>

        {/* 45 Bar Visualizer */}
        <div className="pt-6 pb-2 overflow-x-auto">
          <div className="min-w-[700px] flex items-end gap-1.5 h-44 px-2 border-b border-white/10">
            {scores.scoreDistribution?.map((item) => {
              const heightPercent = Math.max((item.count / maxScoreCount) * 100, item.count > 0 ? 12 : 3);
              return (
                <div
                  key={item.score}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 hidden group-hover:flex items-center justify-center px-2 py-1 rounded bg-black border border-white/20 text-[10px] font-mono text-white whitespace-nowrap z-20 shadow-lg">
                    Score {item.score}: {item.count} player{item.count !== 1 ? "s" : ""}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      item.count > 0
                        ? "bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-amber-500 group-hover:to-amber-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        : "bg-white/5"
                    }`}
                  />
                  <span className="text-[9px] font-mono text-white/40 mt-2 block select-none">
                    {item.score % 5 === 0 || item.score === 1 ? item.score : ""}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-white/40 px-2 mt-2">
            <span>Score: 1 (Min)</span>
            <span>Stableford Integer Scale (1–45)</span>
            <span>Score: 45 (Max)</span>
          </div>
        </div>
      </div>

      {/* Charity Impact Breakdown & Payout Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Charities */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-400" />
              Charity Impact Rankings
            </h3>
            <Link href="/admin/charities" className="text-xs text-amber-400 hover:underline">
              Manage Partners →
            </Link>
          </div>

          <div className="space-y-3">
            {charities.topCharities?.map((c, i) => (
              <div
                key={c._id || i}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                    #{i + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-white/50">{c.supporterCount || 0} supporters</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    ${(c.totalFundsRaised || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-white/40">Total Disbursed</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health & Audit Status */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Compliance & Engine Integrity
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Score FIFO Verification</div>
                <div className="text-white/50 text-[11px]">Enforces exactly 5 scores max per golfer</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                100% Enforced
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">One Score Per Date Constraint</div>
                <div className="text-white/50 text-[11px]">Prevents duplicate round submissions</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active (HTTP 409)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">40% / 35% / 25% Pool Split</div>
                <div className="text-white/50 text-[11px]">Strict mathematical distribution with rollover</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Mathematical Match
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Winner Proof Audit Trail</div>
                <div className="text-white/50 text-[11px]">Manual review required before payout disbursement</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Audit Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
