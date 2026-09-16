"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Heart,
  Trophy,
  Target,
  Sparkles,
  ArrowLeft,
  FileCheck,
} from "lucide-react";

export default function TermsAndRegulationsPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-amber-500/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>

        {/* Page Hero Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium">
            <Scale className="w-3.5 h-3.5" />
            <span>Official Platform Standards & Regulations</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Governance, Rules &{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Disclaimers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-white/60 leading-relaxed">
            digital.HEROES operates at the intersection of international golf handicapping, non-profit philanthropy, and regulatory prize pool mechanics. Review our binding rules below.
          </p>
        </div>

        {/* Section 1: Stableford 1-45 Scoring Rules */}
        <div id="stableford" className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">1. Stableford 1–45 Scoring Rules (PRD § 05)</h2>
              <p className="text-xs text-white/50">Performance equity across golfers of every handicap level</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/70 space-y-3 leading-relaxed pt-2">
            <p>
              • <strong>Permitted Range:</strong> All round submissions must be scored in the international Stableford format, restricted to integer values between <strong>1 and 45</strong> (inclusive). Submissions outside this range are rejected by automated validation.
            </p>
            <p>
              • <strong>Strict 1 Score Per Date:</strong> To preserve audit trails and prevent score stuffing, users may log strictly <strong>one round per calendar date</strong>. Submissions on an existing date require modifying or deleting the prior entry.
            </p>
            <p>
              • <strong>Rolling 5-Score FIFO Capacity:</strong> Each subscriber maintains exactly 5 active round scores forming their monthly draw ticket. Logging a 6th score automatically shifts the oldest score by date into the subscriber’s permanent archive. Deleting an active score automatically promotes the most recent archived round.
            </p>
          </div>
        </div>

        {/* Section 2: 40/35/25 Rollover & Prize Terms */}
        <div id="rollover" className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">2. Prize Pool Decomposition & Rollover Terms (PRD § 06 & § 07)</h2>
              <p className="text-xs text-white/50">Mathematical distribution and jackpot carry-forward policy</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/70 space-y-3 leading-relaxed pt-2">
            <p>
              • <strong>Pool Composition:</strong> Every recurring subscriber contributes a fixed portion ($15 equivalent) of their subscription into the gross monthly prize pool, augmented by any rollover from preceding draws.
            </p>
            <p>
              • <strong>Tier Allocation:</strong>
              <br />— <strong>Tier 1 (5-Number Match):</strong> 40% of the gross pool. Splits equally among all 5-match winners. If 0 entries match all 5 numbers, <strong>100% of the Tier 1 pool rolls over</strong> to the next month’s Tier 1 jackpot.
              <br />— <strong>Tier 2 (4-Number Match):</strong> 35% of the gross pool. Splits equally among 4-match winners (no rollover).
              <br />— <strong>Tier 3 (3-Number Match):</strong> 25% of the gross pool. Splits equally among 3-match winners (no rollover).
            </p>
            <p>
              • <strong>Draw Algorithms:</strong> Platform administrators may configure either <em>Uniform Random</em> sampling or <em>Score-Frequency Weighted</em> sampling using Laplace smoothing (&alpha; = 1) to ensure all scores retain non-zero probability.
            </p>
          </div>
        </div>

        {/* Section 3: Charity Transparency & Min. 10% Contribution */}
        <div id="charity" className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">3. Charity Transparency & Giving Pledge (PRD § 08)</h2>
              <p className="text-xs text-white/50">Mandatory charitable governance and non-profit verification</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/70 space-y-3 leading-relaxed pt-2">
            <p>
              • <strong>Mandatory 10% Minimum:</strong> By platform rule, every active subscriber directs a minimum of 10% of their recurring fee to a verified charity partner selected during registration or updated in their dashboard.
            </p>
            <p>
              • <strong>Voluntary Up-Scaling:</strong> Golfers may voluntarily scale their giving up to 100% of their subscription at any time without impacting their draw eligibility.
            </p>
            <p>
              • <strong>Direct Standalone Donations:</strong> 100% of standalone direct donations go directly to the designated cause (minus external payment processing fees). Standalone donations do not grant draw tickets.
            </p>
          </div>
        </div>

        {/* Section 4: Winner Verification & Proof Audit */}
        <div id="verification" className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">4. Winner Verification & Audit Process (PRD § 09)</h2>
              <p className="text-xs text-white/50">Integrity checks prior to authorized cash disbursements</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/70 space-y-3 leading-relaxed pt-2">
            <p>
              • <strong>Verification Scope:</strong> Verification applies strictly to prize winners matching 3, 4, or 5 numbers in an officially published draw.
            </p>
            <p>
              • <strong>Scorecard Proof:</strong> Winners must provide an official screenshot from their recognized golf handicap system (MiScore, Golf Genius, Golf Australia, USGA GHIN, or signed club board) verifying the round date and Stableford points entered.
            </p>
            <p>
              • <strong>State Machine:</strong> Claims progress through <code>pending_proof</code> &rarr; <code>proof_submitted</code> &rarr; <code>approved</code> &rarr; <code>paid</code>. Submissions failing verification may be rejected with feedback, permitting one resubmission.
            </p>
          </div>
        </div>

        {/* Section 5: Responsible Gaming & Disclaimers */}
        <div id="gaming" className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-500/10 border border-white/20 flex items-center justify-center text-slate-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">5. Responsible Gaming & Legal Disclaimers (PRD § 03 & § 12)</h2>
              <p className="text-xs text-white/50">Subscriber eligibility and compliance requirements</p>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-white/70 space-y-3 leading-relaxed pt-2">
            <p>
              • <strong>Eligibility:</strong> Participation in monthly cash draws is restricted to registered subscribers in active or trialing status. Platform staff and administrators are strictly exempt from draw ticket qualification.
            </p>
            <p>
              • <strong>Fair Play Guarantee:</strong> All draw results, winning numbers, and prize records are immutably archived on the public ledger viewable at <Link href="/draws" className="text-amber-400 hover:underline">/draws</Link>.
            </p>
            <p>
              • <strong>Subscription Cancellation:</strong> Members may cancel anytime via their dashboard settings. Access remains active until the end of the paid billing period.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Join digital.HEROES Today</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
