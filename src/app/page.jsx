"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Heart,
  Target,
  Shield,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Lock,
} from "lucide-react";
import DirectDonationModal from "@/components/DirectDonationModal";

export default function HomePage() {
  const [upcomingDraw, setUpcomingDraw] = useState(null);
  const [featuredCharities, setFeaturedCharities] = useState([]);
  const [calculatorSubscribers, setCalculatorSubscribers] = useState(1000);
  const [selectedDonationCharity, setSelectedDonationCharity] = useState(null);

  useEffect(() => {
    // 1. Fetch upcoming draw stats
    fetch("/api/draws/upcoming")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setUpcomingDraw(data.data);
        }
      })
      .catch(() => {});

    // 2. Fetch featured charities
    fetch("/api/charities?featured=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.charities) {
          setFeaturedCharities(data.data.charities);
        }
      })
      .catch(() => {});
  }, []);

  // Calculator Math (PRD § 06 & § 07)
  const calcBasePool = calculatorSubscribers * 15;
  const calcRollover = upcomingDraw?.jackpotRolloverIn || 1500;
  const calcTotalPool = calcBasePool + calcRollover;
  const calcTier1 = calcTotalPool * 0.4;
  const calcTier2 = calcTotalPool * 0.35;
  const calcTier3 = calcTotalPool * 0.25;
  const calcCharityTotal = calculatorSubscribers * 25 * 0.15; // Average 15% contribution on $25 plan

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-500/5 blur-3xl pointer-events-none -z-10" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 mb-8 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Golf Performance Meets Verified Charitable Giving</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
          Track Your Game. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">
            Fund What Matters.
          </span>{" "}
          <br className="hidden sm:inline" />
          Win Together.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Log your Stableford golf scores into an automated 5-round ticket. Direct at least 10% of your subscription to a verified charity of your choice, and compete in monthly cash draws with guaranteed jackpot rollovers.
        </p>

        {/* Live Draw Ticker Card */}
        <div className="mt-10 mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Next Monthly Draw Pool
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-mono tracking-tight">
                ${(upcomingDraw?.estimatedTotalPool || 1500).toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-2">USD</span>
              </div>
            </div>

            {upcomingDraw?.jackpotRolloverIn > 0 && (
              <div className="text-right sm:border-l sm:border-white/10 sm:pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Unclaimed Rollover
                </span>
                <div className="text-xl font-black text-amber-300 font-mono">
                  +${upcomingDraw.jackpotRolloverIn.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">Carried to 5-Match Tier</span>
              </div>
            )}
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-black shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:from-amber-400 hover:to-amber-500 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Subscription</span>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            href="/charities"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <Heart className="h-5 w-5 text-amber-400" />
            <span>Explore Verified Charities</span>
          </Link>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/10 text-xs text-slate-400 font-medium">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Stableford 1–45 Format</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Rolling 5-Score FIFO</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Min 10% Direct to Charity</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Jackpot Rollover Mechanics</span>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (4-STEP INTERACTIVE ARCHITECTURE) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Platform Engine
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How digital.HEROES Works
          </h3>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            A continuous four-step cycle connecting your golf performance to charitable impact and cash prize draws.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 relative group hover:border-amber-500/40 transition">
            <div className="text-4xl font-black text-white/10 group-hover:text-amber-500/20 transition font-mono mb-4">
              01
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Heart className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Select Your Charity</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your recipient at signup. At least 10% of your monthly or annual fee goes straight to their mission, with the freedom to voluntarily scale up to 100%.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 relative group hover:border-cyan-500/40 transition">
            <div className="text-4xl font-black text-white/10 group-hover:text-cyan-500/20 transition font-mono mb-4">
              02
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Log 5 Golf Scores</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit your rounds using international Stableford format (1–45). The system maintains your latest 5 rounds, automatically rolling forward in a FIFO queue.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 relative group hover:border-emerald-500/40 transition">
            <div className="text-4xl font-black text-white/10 group-hover:text-emerald-500/20 transition font-mono mb-4">
              03
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Community Events</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with verified non-profits and register for upcoming Charity Golf Days like pro-ams and scramble tournaments at legendary venues.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 relative group hover:border-purple-500/40 transition">
            <div className="text-4xl font-black text-white/10 group-hover:text-purple-500/20 transition font-mono mb-4">
              04
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Monthly Draw Reveal</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your 5 scores form your draw ticket. Match 5, 4, or 3 numbers for tiered prize payouts. If Tier 1 has zero winners, 40% rolls over into next month&apos;s jackpot!
            </p>
          </div>
        </div>
      </section>

      {/* 3. CHARITY SPOTLIGHT SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Giving With Purpose
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Featured Charities & Events
            </h3>
            <p className="text-slate-400 mt-2 text-sm max-w-xl">
              Every foundation is verified for transparency and direct impact. Choose who you back or make a direct gift today.
            </p>
          </div>

          <Link
            href="/charities"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            <span>View All Non-Profits</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCharities.map((charity) => (
            <div
              key={charity._id}
              className="rounded-2xl border border-white/10 bg-[#11141B] overflow-hidden flex flex-col justify-between hover:border-amber-400/30 transition shadow-xl group"
            >
              {/* Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                <img
                  src={charity.bannerUrl}
                  alt={charity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#11141B] via-transparent to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                  {charity.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1.5 group-hover:text-amber-300 transition">
                    {charity.name}
                  </h4>
                  <p className="text-xs text-amber-400/90 font-medium mb-3">
                    {charity.tagline}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6">
                    {charity.description}
                  </p>

                  {/* Upcoming Events preview */}
                  {charity.events && charity.events.length > 0 && (
                    <div className="mb-6 rounded-xl border border-white/5 bg-white/5 p-3.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Upcoming Charity Golf Day</span>
                      </div>
                      <div className="text-xs font-bold text-white">
                        {charity.events[0].title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {charity.events[0].location}
                      </div>
                    </div>
                  )}
                </div>

                {/* Metrics & Action Bar */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Total Directed Funds
                    </span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ${(charity.totalFundsRaised || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDonationCharity(charity)}
                      className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
                    >
                      Direct Donate
                    </button>
                    <Link
                      href={`/charities/${charity.slug}`}
                      className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
                    >
                      View Story
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE PRIZE & IMPACT CALCULATOR */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-[#0A0D13] p-8 md:p-14 relative overflow-hidden">
          <div className="max-w-3xl mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Transparent Mathematics
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive Pool & Charity Impact Calculator
            </h3>
            <p className="text-slate-400 mt-2 text-sm">
              Slide to simulate community scale and inspect the deterministic 40% / 35% / 25% prize distribution and charity contributions.
            </p>
          </div>

          {/* Slider input */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="font-semibold text-slate-300">Active Subscribers Community:</span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {calculatorSubscribers.toLocaleString()} Players
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={calculatorSubscribers}
              onChange={(e) => setCalculatorSubscribers(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-2">
              <span>100 Subscribers</span>
              <span>5,000 Subscribers</span>
              <span>10,000 Subscribers</span>
            </div>
          </div>

          {/* Projected Payout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Tier 1 (5-Match Jackpot)
              </span>
              <div className="text-3xl font-black text-white mt-1 font-mono">
                ${Math.round(calcTier1).toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-200/80 mt-1 block font-medium">
                40% Share · Rollover Enabled
              </span>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Tier 2 (4-Match Pool)
              </span>
              <div className="text-3xl font-black text-white mt-1 font-mono">
                ${Math.round(calcTier2).toLocaleString()}
              </div>
              <span className="text-[11px] text-cyan-200/80 mt-1 block font-medium">
                35% Share · Split Equally
              </span>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                Tier 3 (3-Match Pool)
              </span>
              <div className="text-3xl font-black text-white mt-1 font-mono">
                ${Math.round(calcTier3).toLocaleString()}
              </div>
              <span className="text-[11px] text-purple-200/80 mt-1 block font-medium">
                25% Share · Split Equally
              </span>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Monthly Charity Funds
              </span>
              <div className="text-3xl font-black text-white mt-1 font-mono">
                ${Math.round(calcCharityTotal).toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-200/80 mt-1 block font-medium">
                ~15% Average Direct Giving
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLOSING CTA BANNER */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to Play With Real Purpose?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join trainees, pros, and passionate golfers who turn their weekend Stableford scores into life-changing charitable impact and cash prize jackpots.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-8 py-4 text-base font-bold text-black hover:bg-amber-300 transition shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              <span>Explore Swagger API Docs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Direct Donation Modal */}
      {selectedDonationCharity && (
        <DirectDonationModal
          charity={selectedDonationCharity}
          isOpen={Boolean(selectedDonationCharity)}
          onClose={() => setSelectedDonationCharity(null)}
        />
      )}
    </div>
  );
}
