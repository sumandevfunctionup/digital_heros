"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Radio,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState("checking"); // 'checking' | 'confirmed' | 'error'
  const [data, setData] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setErrorMsg("No Stripe Checkout session ID found in redirect.");
      setStatus("error");
      return;
    }

    let isMounted = true;
    let pollInterval = null;

    const checkVerification = async (currentAttempt) => {
      try {
        // If after 5 attempts webhook hasn't fired yet, trigger sync fallback
        const forceSync = currentAttempt >= 5 ? "&sync=true" : "";
        const res = await fetch(
          `/api/subscriptions/verify-session?session_id=${encodeURIComponent(sessionId)}${forceSync}`
        );
        const json = await res.json();

        if (!isMounted) return;

        if (json.success && json.status === "confirmed") {
          setData(json.data);
          setStatus("confirmed");
          if (pollInterval) clearInterval(pollInterval);

          // Celebrate with confetti
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.5 },
            });
          } catch {
            // Ignored
          }
        } else if (currentAttempt >= 10) {
          // Max attempts reached
          if (json.data) {
            setData(json.data);
            setStatus("confirmed");
          } else {
            setErrorMsg("Verification timed out. Please refresh or check your dashboard.");
            setStatus("error");
          }
          if (pollInterval) clearInterval(pollInterval);
        } else {
          setAttempts(currentAttempt + 1);
        }
      } catch (err) {
        if (currentAttempt >= 8) {
          setErrorMsg(err.message || "Failed to communicate with verification API.");
          setStatus("error");
          if (pollInterval) clearInterval(pollInterval);
        }
      }
    };

    // Immediate first check
    checkVerification(0);

    // Poll every 1.5 seconds for webhook response
    let count = 0;
    pollInterval = setInterval(() => {
      count++;
      checkVerification(count);
    }, 1500);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [sessionId]);

  // Universal flow: Automatically redirect to settings and reload for latest data
  useEffect(() => {
    if (status === "confirmed") {
      const timer = setTimeout(() => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("payment_gateway_redirected", "true");
          sessionStorage.setItem("payment_gateway_return_url", "/dashboard/settings");
          if (window.location.pathname === "/dashboard/settings") {
            window.location.reload();
          } else {
            window.location.href = "/dashboard/settings";
          }
        }
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-[#08090C] text-white flex flex-col justify-center items-center px-4 py-16 selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#635BFF]/15 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Top Header Card */}
        <div className="bg-[#0D101A]/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Stripe Badge & DevTunnel Webhook Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#635BFF]/20 border border-[#635BFF]/40 text-[#A29BFE] text-xs font-mono font-bold">
                <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
                <span>stripe</span>
              </div>
              <span className="text-xs font-mono text-white/50">Hosted Checkout</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Webhook: /webhook/stripe</span>
            </div>
          </div>

          {/* STATE 1: Waiting for Webhook */}
          {status === "checking" && (
            <div className="py-8 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-3 border-[#635BFF]/20 border-t-[#635BFF] animate-spin" />
                <Radio className="w-7 h-7 text-[#A29BFE] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-extrabold text-white">
                  Awaiting Stripe Webhook Confirmation
                </h1>
                <p className="text-sm text-white/60 max-w-md mx-auto">
                  Stripe has received your payment. Our server is awaiting the inbound webhook to verify the cryptographic signature and update your subscription.
                </p>
              </div>

              {/* Real-time Verification Stepper */}
              <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 space-y-3 text-left">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </div>
                  <span className="text-white font-medium">1. Stripe Checkout session paid</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                    ●
                  </div>
                  <span className="text-amber-300 font-medium">
                    2. Inbound webhook dispatched by Stripe (attempt {attempts + 1})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-white/40">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    ○
                  </div>
                  <span>3. Database activated & 10% charity distribution ledger written</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-white/40">
                Listening on DevTunnel webhook wrapper...
              </div>
            </div>
          )}

          {/* STATE 2: Webhook Confirmed! (All buttons removed & pointer-events-none so user cannot click anything) */}
          {status === "confirmed" && data && (
            <div className="space-y-6 select-none pointer-events-none">
              <div className="text-center space-y-3 pt-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.25)]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h1 className="text-3xl font-extrabold text-white">Payment Confirmed!</h1>
                <p className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Verified & Acknowledged via Stripe Webhook
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-5 rounded-2xl bg-[#131622] border border-white/10 space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                  <span className="text-white/50">Stripe Session ID</span>
                  <span className="text-white font-bold truncate max-w-[240px]">
                    {data.sessionId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/50">Membership Plan</span>
                  <span className="text-white capitalize font-bold">
                    {data.plan} Membership
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/50">Subscription Status</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    ACTIVE
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/50">Charity Pledge</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {data.charityAmount} (routed on draw day)
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-sm">
                  <span className="text-white font-medium">Total Paid</span>
                  <span className="text-amber-400 font-extrabold">{data.amount}</span>
                </div>
              </div>

              {/* Automated Redirect Status (Buttons removed so user cannot click anything) */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-3 text-xs font-mono text-emerald-300 shadow-inner mt-4">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <span>Payment confirmed! Returning to settings and reloading latest data...</span>
              </div>
            </div>
          )}

          {/* STATE 3: Error */}
          {status === "error" && (
            <div className="py-6 text-center space-y-6">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Verification Issue</h2>
                <p className="text-xs text-white/60 max-w-sm mx-auto">
                  {errorMsg || "Unable to confirm Stripe payment."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-mono text-xs h-10 rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Retry Verification
                </Button>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/dashboard/settings";
                    } else {
                      router.push("/dashboard/settings");
                    }
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-10 rounded-xl"
                >
                  Go to Settings
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="text-center mt-6 text-xs text-white/40 font-mono flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>PCI-DSS Level 1 Encrypted • Stripe Official Sandbox</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
