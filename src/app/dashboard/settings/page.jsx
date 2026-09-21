"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import {
  Settings,
  ShieldCheck,
  CreditCard,
  User,
  CheckCircle2,
  Zap,
  ArrowRight,
  Shield,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StripePaymentModal from "@/components/StripePaymentModal";
import { APP_VERSION } from "@/lib/version";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState("monthly");

  // Always reload this page upon returning from payment gateway redirection so user gets updated data
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePaymentReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      const paymentStatus =
        params.get("payment_status") ||
        params.get("payment") ||
        params.get("redirect_status");
      const wasRedirected =
        sessionStorage.getItem("payment_gateway_redirected") === "true";

      if (sessionId || paymentStatus === "success" || paymentStatus === "succeeded" || wasRedirected) {
        sessionStorage.removeItem("payment_gateway_redirected");

        // If a Stripe session ID is present in query parameters, trigger server verification sync
        if (sessionId) {
          try {
            await fetch(
              `/api/subscriptions/verify-session?session_id=${encodeURIComponent(sessionId)}&sync=true`
            );
          } catch (e) {
            console.error("Session verification error:", e);
          }
        }

        toast.success("Payment confirmed! Reloading updated membership details...");
        await refreshUser();

        // Always reload page so the user receives fresh server & client state
        if (sessionId || paymentStatus) {
          // Replace URL to strip query parameters and force fresh load from server
          window.location.replace(window.location.pathname);
        } else {
          window.location.reload();
        }
      }
    };

    handlePaymentReturn();

    // Listen for tab focus/visibility when returning from an external payment gateway tab
    const onVisibilityOrFocus = async () => {
      if (sessionStorage.getItem("payment_gateway_redirected") === "true") {
        sessionStorage.removeItem("payment_gateway_redirected");
        await refreshUser();
        window.location.reload();
      }
    };

    window.addEventListener("focus", onVisibilityOrFocus);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onVisibilityOrFocus();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileData.firstName.trim()) {
      toast.error("First name is required.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName.trim(),
          lastName: profileData.lastName.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to update profile.");
        return;
      }

      toast.success("Profile details updated.");
      await refreshUser();
    } catch {
      toast.error("Network error updating profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (user?.subscriptionPlan === plan && isSubscribed) {
      toast.info(`You are already active on the ${plan.toUpperCase()} plan.`);
      return;
    }
    setTargetPlan(plan);
    setStripeModalOpen(true);
  };

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      const res = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.data?.message || "Subscription cancelled. Membership details removed.");
        setShowCancelDialog(false);
        await refreshUser();
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        toast.error(data.error?.message || "Failed to cancel subscription.");
      }
    } catch {
      toast.error("Network error cancelling subscription.");
    } finally {
      setCanceling(false);
    }
  };

  const isSubscribed =
    user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-white/60" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Membership & Account Settings
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          Manage your subscription tier, billing cycle, and golfer profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Subscription & Membership Status OR Administrator Privileges */}
        {user?.role === "admin" ? (
          <div className="rounded-3xl border border-amber-500/30 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Administrator Authority</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  Staff / Exempt
                </span>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-6">
                This account holds platform administrative authority and is exempt from subscriber membership billing. Draws, winner verification, and system settings are governed via the control plane.
              </p>

              {/* Authority Details */}
              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10 space-y-3 mb-6 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Platform Role</span>
                  <span className="font-bold text-amber-400 font-mono">Super Administrator</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Subscription Status</span>
                  <span className="text-white font-mono">Exempt (No Billing Required)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Draw Eligibility</span>
                  <span className="text-white/50 font-mono">Excluded (Regulatory Rule)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Control Plane Access</span>
                  <span className="text-emerald-400 font-bold font-mono">Full Access (/admin)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <span>Launch Admin Control Plane</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Subscription Status</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                    isSubscribed
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {user?.subscriptionStatus || "Inactive"}
                </span>
              </div>

              <p className="text-xs text-white/60 leading-relaxed mb-6">
                Active subscribers qualify for monthly draws and direct at least 10% of their membership to charity.
              </p>

              {/* Current Details */}
              <div className="p-4 rounded-2xl bg-[#121520] border border-white/10 space-y-3 mb-6 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Current Plan</span>
                  <span
                    className={`font-bold capitalize font-mono ${
                      isSubscribed && user?.subscriptionPlan ? "text-white" : "text-white/40"
                    }`}
                  >
                    {isSubscribed && user?.subscriptionPlan ? user.subscriptionPlan : "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Next Renewal</span>
                  <span
                    className={`font-mono ${
                      isSubscribed && user?.subscriptionRenewalDate ? "text-white" : "text-white/40"
                    }`}
                  >
                    {isSubscribed && user?.subscriptionRenewalDate
                      ? new Date(user.subscriptionRenewalDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 font-mono">Charity Contribution</span>
                  <span
                    className={`font-bold font-mono ${
                      isSubscribed ? "text-emerald-400" : "text-white/40"
                    }`}
                  >
                    {isSubscribed ? `${user?.charityContributionPercent || 10}%` : "None"}
                  </span>
                </div>
              </div>

              {/* Change / Upgrade Plans */}
              <div className="space-y-3">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                  Select or Switch Plan:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly */}
                  <div
                    onClick={() => handleSubscribe("monthly")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                      user?.subscriptionPlan === "monthly" && isSubscribed
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-[#121520] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Monthly</span>
                      {user?.subscriptionPlan === "monthly" && isSubscribed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xl font-extrabold font-mono text-white mt-1">
                      $25 <span className="text-xs font-normal text-white/40">/ mo</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-1">Flexible cancel anytime</p>
                  </div>

                  {/* Yearly */}
                  <div
                    onClick={() => handleSubscribe("yearly")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-left relative ${
                      user?.subscriptionPlan === "yearly" && isSubscribed
                        ? "bg-emerald-500/10 border-emerald-500/50"
                        : "bg-[#121520] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-black uppercase">
                      Save $50
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Annual</span>
                      {user?.subscriptionPlan === "yearly" && isSubscribed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xl font-extrabold font-mono text-amber-400 mt-1">
                      $250 <span className="text-xs font-normal text-white/40">/ yr</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-1">12 draws included</p>
                  </div>
                </div>
              </div>

              {/* Cancellation Status & Actions (PRD § 04) */}
              {isSubscribed && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  {user?.cancelAtPeriodEnd || user?.subscriptionStatus === "canceled" ? (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold block">Cancellation Scheduled</span>
                        <span className="text-white/60 text-[11px]">
                          Your subscription will conclude at the end of your billing cycle on{" "}
                          {user?.subscriptionRenewalDate
                            ? new Date(user.subscriptionRenewalDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "the renewal date"}
                          . You retain full draw eligibility until then.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">Cancel Membership</span>
                        <span className="text-[11px] text-white/40 block">
                          Stops renewal at period end. Scores remain archived.
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCancelDialog(true)}
                        className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs px-3 py-1.5 rounded-xl transition"
                      >
                        Cancel Plan
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Instant mock payment for local sandbox evaluation
              </span>
            </div>
          </div>
        )}

        {/* Cancellation Confirmation Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                Cancel digital.HEROES Membership
              </DialogTitle>
              <DialogDescription className="text-xs text-white/60 pt-2 leading-relaxed">
                Are you sure you want to cancel your subscription?
                <br /><br />
                • Your membership and recurring billing will be cancelled immediately.
                <br />
                • Plan details and renewal dates will be removed from your profile.
                <br />
                • Your 5 active scores will remain securely saved in your profile.
                <br />
                • You can reactivate at any time by selecting a plan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                className="border-white/15 text-white hover:bg-white/10 text-xs"
              >
                Keep My Membership
              </Button>
              <Button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {canceling ? "Processing..." : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2. Golfer Profile Form */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-white/70" />
              <h3 className="text-lg font-bold text-white">Golfer Profile Details</h3>
            </div>

            <p className="text-xs text-white/60 mb-6">
              Update your registered name as it appears on your official golf handicap / scorecard.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  EMAIL ADDRESS
                </label>
                <Input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="bg-white/5 border-white/10 text-white/40 cursor-not-allowed font-mono text-xs"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  Email cannot be modified once registered
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">
                    FIRST NAME *
                  </label>
                  <Input
                    type="text"
                    required
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    className="bg-[#121520] border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">
                    LAST NAME (OPTIONAL)
                  </label>
                  <Input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    className="bg-[#121520] border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-all border border-white/15"
                >
                  {savingProfile ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="font-bold text-white block mb-1">Golfer Account ID</span>
              <span className="font-mono text-white/50 text-[11px] select-all">
                {user?.id || user?._id || "usr_anonymous"}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="font-bold text-white block mb-1">Application Version</span>
              <span className="font-mono text-amber-400 font-semibold text-[11px]">
                v{APP_VERSION}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Payment Gateway Modal */}
      <StripePaymentModal
        isOpen={stripeModalOpen}
        onClose={() => setStripeModalOpen(false)}
        plan={targetPlan}
        user={user}
      />
    </div>
  );
}
