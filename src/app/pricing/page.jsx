"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import StripePaymentModal from "@/components/StripePaymentModal";
import {
  Check,
  ShieldCheck,
  Heart,
  Trophy,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState("monthly");
  const isSubscribed =
    user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";

  const handleCheckout = async (planType) => {
    // If user is not logged in, redirect to register with selected plan
    if (!user) {
      toast.info("Please sign in or create an account to start your subscription.");
      router.push(`/register?plan=${planType}`);
      return;
    }

    if (isSubscribed && user?.subscriptionPlan === planType && !user?.cancelAtPeriodEnd) {
      toast.info(`You are already active on the ${planType.toUpperCase()} plan!`);
      return;
    }

    // Open Interactive Stripe Payment Gateway Modal
    setCheckoutPlan(planType);
    setIsStripeModalOpen(true);
  };

  const faqs = [
    {
      q: "How does the charity allocation work?",
      a: "A mandatory minimum of 10% from every subscription payment is transferred directly to your selected verified charity. Through your dashboard, you can voluntarily increase this up to 100% at any time.",
    },
    {
      q: "How do my golf scores enter the monthly draw?",
      a: "Your latest 5 Stableford scores (ranging from 1 to 45) form your 5-number draw ticket. Whenever you log a 6th score, the oldest score is automatically rolled into your archive (FIFO queue).",
    },
    {
      q: "What happens if no one matches all 5 numbers?",
      a: "The 40% Tier-1 jackpot pool rolls over completely into next month's jackpot, compounding month after month until won. Tier-2 (4-match) and Tier-3 (3-match) prizes are always distributed equally among matching winners each month.",
    },
    {
      q: "Can I switch my chosen charity later?",
      a: "Yes! You can change your designated charity partner at any time from your dashboard Charity Center.",
    },
    {
      q: "What proof is required if I win?",
      a: "Winners simply upload a screenshot of their official handicap or round history (e.g. Golf Australia, GHIN, or WHS app) to verify the 5 entered scores before payout release.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-amber-500/30">
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Philanthropic Membership
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Play Your Game. <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400 bg-clip-text text-transparent">Fund Real Change.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Every subscription fuels verified community charities, enters you into the monthly rolling cash jackpot, and tracks your 5-score golf performance.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold uppercase tracking-wider ${billingCycle === "monthly" ? "text-white" : "text-white/40"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-[#1A1E29] border border-white/20 transition-colors focus:outline-none"
              aria-label="Toggle billing interval"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-amber-400 transition-transform ${
                  billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-amber-400" : "text-white/40"}`}>
              Annual
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Save 17%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Monthly Plan Card */}
          <Card className={`relative bg-[#0F121A]/80 border transition-all duration-300 rounded-3xl backdrop-blur-xl ${billingCycle === "monthly" ? "border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.1)]" : "border-white/10"}`}>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
                  Standard Monthly
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-white/70">
                  Flexible
                </span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white mt-4">
                $25 <span className="text-sm font-normal text-white/50">/ month</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/60 mt-1">
                Billed monthly. Pause or cancel anytime without lock-in.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-6">
              {/* Dollar Split Highlight */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Guaranteed Charity Impact:</span>
                  <span className="text-amber-400 font-mono font-bold">≥ $2.50 / mo (10%)</span>
                </div>
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Prize Pool Contribution:</span>
                  <span className="text-cyan-400 font-mono font-bold">$12.50 / mo (50%)</span>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-white/80">
                {[
                  "5-score rolling Stableford handicap tracker",
                  "1x automatic monthly draw entry (5 numbers)",
                  "Eligible for 5-Match Rollover Jackpot ($1,500+)",
                  "Eligible for 4-Match and 3-Match cash pools",
                  "Select & switch your verified charity recipient",
                  "Verified winner payout workflow & official tax receipts",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              <Button
                onClick={() => handleCheckout("monthly")}
                disabled={loadingPlan === "monthly" || (isSubscribed && user?.subscriptionPlan === "monthly" && !user?.cancelAtPeriodEnd)}
                className={`w-full py-6 rounded-2xl font-bold text-sm transition-all shadow-md ${
                  isSubscribed && user?.subscriptionPlan === "monthly" && !user?.cancelAtPeriodEnd
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                {loadingPlan === "monthly"
                  ? "Processing..."
                  : isSubscribed && user?.subscriptionPlan === "monthly" && !user?.cancelAtPeriodEnd
                  ? "Current Active Plan ✓"
                  : isSubscribed && user?.subscriptionPlan === "yearly"
                  ? "Switch to Monthly Plan"
                  : "Select Monthly Plan"}
              </Button>
            </CardFooter>
          </Card>

          {/* Annual Plan Card (Featured) */}
          <Card className={`relative bg-gradient-to-b from-[#141824] to-[#0D1017] border rounded-3xl backdrop-blur-xl transition-all duration-300 ${billingCycle === "yearly" ? "border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)]" : "border-amber-500/50"}`}>
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  Annual Founder
                </span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                  2 Months Free
                </span>
              </div>
              <CardTitle className="text-3xl font-extrabold text-white mt-4">
                $250 <span className="text-sm font-normal text-white/50">/ year</span>
                <span className="ml-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ~$20.83/mo
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-white/60 mt-1">
                Billed annually. Includes all platform perks and VIP Charity Golf Day invites.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-6">
              {/* Dollar Split Highlight */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Guaranteed Charity Impact:</span>
                  <span className="text-amber-400 font-mono font-bold">≥ $25.00 / yr (10%)</span>
                </div>
                <div className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Prize Pool Contribution:</span>
                  <span className="text-cyan-400 font-mono font-bold">$125.00 / yr (50%)</span>
                </div>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 text-xs text-white/80">
                {[
                  "All Monthly Plan features included",
                  "12 consecutive monthly draw tickets",
                  "VIP invitations to partner Charity Golf Tournaments",
                  "Priority winner proof verification queue",
                  "Founder Supporter badge in Golfer Directory",
                  "Full tax donation receipt for annual charity allocation",
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="text-white">{feat}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="p-8 pt-0">
              <Button
                onClick={() => handleCheckout("yearly")}
                disabled={loadingPlan === "yearly" || (isSubscribed && user?.subscriptionPlan === "yearly" && !user?.cancelAtPeriodEnd)}
                className={`w-full py-6 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubscribed && user?.subscriptionPlan === "yearly" && !user?.cancelAtPeriodEnd
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                    : "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black border-none shadow-amber-500/25 cursor-pointer"
                }`}
              >
                {loadingPlan === "yearly"
                  ? "Processing..."
                  : isSubscribed && user?.subscriptionPlan === "yearly" && !user?.cancelAtPeriodEnd
                  ? "Current Active Plan ✓"
                  : isSubscribed && user?.subscriptionPlan === "monthly"
                  ? "Upgrade to Annual Plan (Save 17%)"
                  : "Join as Annual Supporter"}
                {(!isSubscribed || user?.subscriptionPlan !== "yearly" || user?.cancelAtPeriodEnd) && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Trust & Transparency Banner */}
      <section className="border-y border-white/10 bg-[#0B0D13]/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">100% Verified Charities</h3>
            <p className="text-xs text-white/60">
              Every charity is formally vetted for non-profit governance and audited distribution.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Mathematically Audited Draws</h3>
            <p className="text-xs text-white/60">
              Transparent 40%/35%/25% pool splits with cryptographically reproducible draw logs.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Instant Sandbox & Secure Processing</h3>
            <p className="text-xs text-white/60">
              Fast, test-friendly sandbox checkout with instant membership activation.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-white/60">
            Everything you need to know about our subscription, charity impact, and draw mechanics.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-[#0F121A]/60 backdrop-blur-sm overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/50 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Stripe Payment Gateway Modal */}
      <StripePaymentModal
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        plan={checkoutPlan}
        user={user}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard/settings";
          } else {
            router.push("/dashboard/settings");
          }
        }}
      />
    </div>
  );
}
