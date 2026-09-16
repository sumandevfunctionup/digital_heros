"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target,
  Trophy,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Layers,
  Coins,
  RefreshCw,
  Camera,
} from "lucide-react";

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Subscribe & Pledge to Charity",
      icon: Heart,
      accent: "text-rose-400 border-rose-500/30 bg-rose-500/10",
      description:
        "Join digital.HEROES for $25/month (or $250/year). By rule, a minimum of 10% (and up to 100%) of your recurring membership is channeled directly to your chosen registered charity partner.",
      points: [
        "Select from verified health, youth, veteran, and environmental causes",
        "Adjust your giving pledge at any time (10% to 100%)",
        "Direct tax-effective non-profit impact every single month",
      ],
    },
    {
      number: "02",
      title: "Play Golf & Record Stableford Scores",
      icon: Target,
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
      description:
        "Whenever you tee off at your home club or traveling course, enter your official Stableford points (1 to 45). To protect competitive balance and historical integrity, exactly one score per calendar date is recorded.",
      points: [
        "Stableford scoring standardizes play across all handicaps",
        "Strict 1-score-per-day validation preserves authenticity",
        "Compatible with MiScore, Golf Genius, and club terminals",
      ],
    },
    {
      number: "03",
      title: "5-Slot Rolling Ticket Queue (FIFO)",
      icon: RefreshCw,
      accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      description:
        "Your official monthly draw entry is formed by your latest 5 rounds. As you play new golf rounds, our automatic First-In, First-Out (FIFO) engine shifts your 5th oldest round into your lifetime archive.",
      points: [
        "Your active ticket always reflects your current game",
        "Never lose a round — archived scores remain on your permanent profile",
        "Deleting an active round automatically promotes your newest archive score",
      ],
    },
    {
      number: "04",
      title: "The Monthly Draw & Rollover Jackpots",
      icon: Sparkles,
      accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
      description:
        "On the final day of every month, 5 distinct numbers (1–45) are drawn. Match your active 5-score ticket against the drawn numbers to win tiered cash prizes. If no one matches 5/5, the Tier 1 jackpot rolls over!",
      points: [
        "Tier 1 (5 Matches): 40% of pool + 100% of accumulated rollover",
        "Tier 2 (4 Matches): 35% of pool split equally among winners",
        "Tier 3 (3 Matches): 25% of pool consolation payout",
      ],
    },
    {
      number: "05",
      title: "Verifiable Verification & Payout",
      icon: ShieldCheck,
      accent: "text-white border-white/30 bg-white/10",
      description:
        "When your numbers win, simply upload a screenshot of your digital scorecard or club handicap terminal. Once our automated audit and admin panel confirm the match, payouts are dispatched via bank transfer.",
      points: [
        "State-machine tracking: Pending Proof → Under Review → Paid",
        "Transparent winner logs without displaying sensitive personal data",
        "100% compliant with sports gaming and non-profit regulations",
      ],
    },
  ];

  const faqs = [
    {
      q: "What is Stableford scoring and why is it used?",
      a: "Stableford is a points-based golf scoring system where points are awarded on each hole relative to par and your handicap (e.g. 2 points for net par, 3 points for net birdie). It eliminates blowout holes and produces a standard 18-hole score typically between 20 and 45 points, making it the ideal equitable metric for fair prize draws.",
    },
    {
      q: "How does the charity donation work?",
      a: "Every subscriber is required by PRD rules to pledge at least 10% of their subscription fee (e.g. $2.50 of the $25 monthly fee) to a registered charity partner of their choice. Golfers can voluntarily increase this pledge up to 100%. Funds are disbursed monthly directly to the non-profit organizations.",
    },
    {
      q: "What happens if I submit more than 5 golf scores?",
      a: "Our First-In First-Out (FIFO) queue keeps your latest 5 rounds active on your draw ticket. When you enter round #6, round #1 seamlessly transitions into your historical archive. You never lose historical data, and your draw ticket always reflects your freshest golf rounds.",
    },
    {
      q: "How does the jackpot rollover work?",
      a: "If a monthly draw produces no Tier 1 (5 of 5) winners, the entire 40% Tier 1 prize allocation rolls over into next month's Tier 1 jackpot pool. This allows jackpots to grow to tens of thousands of dollars until an active golfer matches all 5 numbers.",
    },
    {
      q: "What proof is required to claim a prize?",
      a: "To ensure fair play and prevent fraudulent score entries, prize winners submit a quick screenshot or photo of their club scorecard, MiScore app, or Golf Genius handicap record corresponding to the dates of their winning rounds.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>The System Behind digital.HEROES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Play Golf. Support Causes.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400">
              Win Together.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            A radical fusion of real golf performance, transparent mathematical reward engines, and high-impact charitable giving. Here is how the complete ecosystem works from round to rollover.
          </p>
        </div>

        {/* 5 Sequential Steps */}
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden transition-all hover:border-white/20"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Step Identifier */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${step.accent}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-white/40 tracking-widest uppercase block">
                        Phase {step.number}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                        {step.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="md:w-72 shrink-0 space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    {step.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prize Pool Split Math Spotlight */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#121522] to-[#0A0C10] p-8 sm:p-10 backdrop-blur-xl relative overflow-hidden text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
              PRD § 06 & § 07 Prize Mathematics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Transparent 40% / 35% / 25% Allocation
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Every dollar contributed to the prize pool is audited and distributed according to fixed algorithmic splits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-[#0F1118] border border-amber-500/30 text-left relative">
              <span className="text-3xl font-black font-mono text-amber-400">40%</span>
              <h3 className="text-sm font-bold text-white mt-1">Tier 1: 5 Matches</h3>
              <p className="text-xs text-white/50 mt-1">
                Jackpot tier. If no player matches 5 numbers, this entire pool rolls over to next month.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1118] border border-cyan-500/30 text-left relative">
              <span className="text-3xl font-black font-mono text-cyan-400">35%</span>
              <h3 className="text-sm font-bold text-white mt-1">Tier 2: 4 Matches</h3>
              <p className="text-xs text-white/50 mt-1">
                Evenly divided among all golfers who match 4 out of the 5 drawn numbers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F1118] border border-emerald-500/30 text-left relative">
              <span className="text-3xl font-black font-mono text-emerald-400">25%</span>
              <h3 className="text-sm font-bold text-white mt-1">Tier 3: 3 Matches</h3>
              <p className="text-xs text-white/50 mt-1">
                Consolation payout rewarded to all players matching 3 of the 5 drawn numbers.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-white/50">
              Clear answers to the most common golfer questions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${
                        isOpen ? "rotate-180 text-emerald-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 via-[#0F1118] to-cyan-900/20 p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Become a Digital Hero?
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto">
            Sign up in 60 seconds, choose your charity, and start entering your Stableford rounds today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/charities"
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition-all border border-white/15"
            >
              Explore Charity Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
