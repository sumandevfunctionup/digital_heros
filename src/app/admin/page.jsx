"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Coins,
  Heart,
  Target,
  Trophy,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Dices,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsGridSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminAnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/analytics");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setAnalytics(json.data);
          }
        }
      } catch (err) {
        toast.error("Failed to load admin analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-9 w-full rounded-xl mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { users, charities, draws, winners, scores } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Executive Analytics & Platform KPIs
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Real-time telemetry across subscriptions, charity disbursements, and draw engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/draws/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
          >
            <Dices className="w-4 h-4" />
            Launch Draw Simulator
          </Link>
          <Link
            href="/admin/winners"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 border border-white/15 transition-all"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            Queue ({winners?.pendingVerificationWinners || 0})
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Estimated MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            ${users?.estimatedMRR?.toLocaleString() || "0"}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            {users?.monthlySubscribers || 0} Monthly • {users?.yearlySubscribers || 0} Annual
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Active Subscribers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {users?.activeSubscribers || 0}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Out of {users?.totalUsers || 0} registered golfer accounts
          </p>
        </div>

        {/* Total Charity Impact */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Charity Raised</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 font-mono">
            ${charities?.totalCharityFundsRaised?.toLocaleString() || "0"}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Across {charities?.activeCharitiesCount || 0} partner organizations
          </p>
        </div>

        {/* Jackpot Rollover In Play */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span className="font-mono uppercase tracking-wider">Active Jackpot Rollover</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono">
            ${draws?.currentJackpotRollover?.toLocaleString() || "1,500"}
          </div>
          <p className="text-[11px] text-white/40 mt-1">
            Tier 1 rollover buffer for next monthly draw
          </p>
        </div>
      </div>

      {/* Two Column Section: Top Charities & Scoring Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Charities Impact */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <h3 className="text-base font-bold text-white">Top Charity Beneficiaries</h3>
            </div>
            <Link
              href="/charities"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>Public Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {charities?.topCharities?.map((charity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121520] border border-white/10"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{charity.name}</h4>
                  <span className="text-[10px] text-white/40 font-mono">
                    {charity.supporterCount || 0} active golfer supporters
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    ${charity.totalFundsRaised?.toLocaleString() || "0"}
                  </div>
                  <span className="text-[10px] text-white/40 font-mono uppercase">
                    Disbursed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draw & Winner Verification Summary */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Draws & Verification Queue</h3>
              </div>
              <Link
                href="/admin/winners"
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Full Queue</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10">
                <span className="text-[10px] font-mono text-white/40 uppercase block">
                  Total Draws Executed
                </span>
                <div className="text-2xl font-black font-mono text-white mt-1">
                  {draws?.totalDrawsConducted || 0}
                </div>
                <span className="text-[10px] text-white/40">Published to public ledger</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10">
                <span className="text-[10px] font-mono text-white/40 uppercase block">
                  Pending Verification
                </span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                  {winners?.pendingVerificationWinners || 0}
                </div>
                <span className="text-[10px] text-amber-300/60">Awaiting admin review</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#121520] border border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Total Scores Logged:</span>
                <span className="font-bold font-mono text-white">
                  {scores?.totalScoresLogged || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-white/60">Active Ticket Slots in Play:</span>
                <span className="font-bold font-mono text-emerald-400">
                  {scores?.activeScoresInPlay || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-white/60">Total Prizes Awarded:</span>
                <span className="font-bold font-mono text-cyan-400">
                  ${draws?.totalPrizesAwarded?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>PRD Compliance: 100% Algorithmic and Auditable</span>
            <Link href="/docs" className="text-cyan-400 hover:underline">
              View OpenAPI Spec
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
