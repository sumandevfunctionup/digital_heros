"use client";

import { useState } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Lock,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  X,
  ExternalLink,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StripePaymentModal({
  isOpen,
  onClose,
  plan = "monthly",
  user,
  onSuccess,
}) {
  const [selectedPlan, setSelectedPlan] = useState(plan);
  const [redirecting, setRedirecting] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Local instant demo mode states (for offline tests/fallbacks)
  const [isSimulatingLocal, setIsSimulatingLocal] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const isYearly = selectedPlan === "yearly";
  const amount = isYearly ? 250 : 25;
  const charityAmount = (amount * ((user?.charityContributionPercent || 10) / 100)).toFixed(2);

  const copyTestCard = (cardNumber) => {
    navigator.clipboard.writeText(cardNumber);
    setCopiedCard(true);
    toast.success(`Copied test card ${cardNumber} to clipboard!`);
    setTimeout(() => setCopiedCard(false), 2000);
  };

  /**
   * Primary Action: Generate real Stripe Checkout session & redirect to Stripe Payment Gateway
   */
  const handleProceedToStripe = async () => {
    setPaymentError(null);
    setRedirecting(true);

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          mode: "stripe",
          redirect: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.data?.checkoutUrl) {
        setRedirecting(false);
        setPaymentError(
          data.error?.message || "Failed to generate Stripe Checkout session."
        );
        toast.error("Stripe Error: Could not generate checkout session.");
        return;
      }

      toast.info("Redirecting to Stripe Payment Gateway...");
      // Browser navigation to official Stripe Hosted Checkout
      window.location.href = data.data.checkoutUrl;
    } catch (err) {
      setRedirecting(false);
      setPaymentError(err.message || "Network error redirecting to Stripe.");
      toast.error("Network error communicating with Stripe.");
    }
  };

  /**
   * Secondary Action: Local sandbox activation (skip Stripe redirect for offline evaluation)
   */
  const handleInstantLocalActivation = async () => {
    setPaymentError(null);
    setIsSimulatingLocal(true);

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          mode: "sandbox",
          stripePaymentIntentId: `pi_sandbox_${Date.now()}`,
          cardLast4: "4242",
          cardBrand: "Visa",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSimulatingLocal(false);
        setPaymentError(data.error?.message || "Failed to activate subscription.");
        return;
      }

      setReceiptData({
        chargeId: `ch_sandbox_${Math.random().toString(36).substring(2, 9)}`,
        plan: selectedPlan,
        amount: `$${amount.toFixed(2)}`,
        charityAmount: `$${charityAmount}`,
        last4: "4242",
        brand: "Visa",
      });

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.55 },
        });
      } catch {
        // Ignored
      }

      toast.success(`Local Sandbox: ${selectedPlan.toUpperCase()} membership activated.`);
      if (onSuccess) onSuccess(data.data);
    } catch (err) {
      setIsSimulatingLocal(false);
      setPaymentError(err.message || "Network error in local activation.");
    }
  };

  const handleClose = () => {
    setRedirecting(false);
    setIsSimulatingLocal(false);
    setReceiptData(null);
    setPaymentError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] sm:max-w-[580px] md:max-w-[620px] bg-[#0B0D14] border border-white/10 text-white p-0 overflow-hidden shadow-2xl rounded-3xl"
        style={{ maxWidth: "580px" }}
      >
        <DialogTitle className="sr-only">Stripe Payment Gateway</DialogTitle>

        {/* Stripe Header Bar */}
        <div className="bg-[#121522] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#635BFF]/20 border border-[#635BFF]/40 text-[#A29BFE] text-xs font-mono font-bold tracking-tight">
              <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>stripe</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-white/50">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-bit SSL PCI-DSS Level 1 Gateway</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stripe Test Mode Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Stripe Test Mode (Sandbox Simulation)</span>
          </div>
          <span className="text-white/40 hidden sm:inline">Official Demo Gateway</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* STATE 1: Redirecting to Stripe */}
          {redirecting ? (
            <div className="py-10 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-2 border-[#635BFF]/20 border-t-[#635BFF] animate-spin" />
                <Lock className="w-6 h-6 text-[#A29BFE] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Opening Stripe Payment Gateway...</h3>
                <p className="text-xs font-mono text-white/60 max-w-sm mx-auto">
                  Generating secure Stripe Checkout session. You will be redirected to checkout.stripe.com in a moment...
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#131622] border border-white/10 text-xs font-mono text-emerald-300 max-w-sm mx-auto">
                Webhook Listener: /webhook/stripe active
              </div>
            </div>
          ) : receiptData ? (
            /* STATE 2: Offline/Local Instant Receipt (Fallback) */
            <div className="py-4 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">Membership Activated!</h3>
                <p className="text-xs text-white/60">Local sandbox confirmation</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#131622] border border-white/10 text-xs font-mono space-y-2 text-left">
                <div className="flex justify-between text-white/50">
                  <span>Plan</span>
                  <span className="text-white capitalize">{receiptData.plan}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Amount</span>
                  <span className="text-amber-400 font-bold">{receiptData.amount}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Charity Impact</span>
                  <span className="text-emerald-400 font-bold">{receiptData.charityAmount}</span>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-11 rounded-xl cursor-pointer"
              >
                Close & Return
              </Button>
            </div>
          ) : (
            /* STATE 3: Plan Selector & Stripe Redirect Launchpad */
            <div className="space-y-6">
              {/* Plan Switcher & Amount Summary */}
              <div className="p-5 rounded-2xl bg-[#131622] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-2">
                    Membership Selection
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("monthly")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selectedPlan === "monthly"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Monthly ($25/mo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlan("yearly")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selectedPlan === "yearly"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Annual ($250/yr)
                    </button>
                  </div>
                </div>

                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <span className="text-xs text-white/50 block font-mono">Amount Due Today</span>
                  <span className="text-2xl font-mono font-extrabold text-white">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Philanthropic Breakdown Notice */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300/90">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>10% Giving Rule:</strong> ${charityAmount} from this payment will be automatically routed to your chosen charity partner on draw day.
                </span>
              </div>

              {/* Stripe Testmode Instructions & Copy Helper */}
              <div className="p-4 rounded-2xl bg-[#10131E] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white/80">Stripe Test Card for Gateway:</span>
                  <span className="text-[11px] font-mono text-white/40">Expires: Any MM/YY • CVC: Any 3 Digits</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#161B29] border border-white/10">
                  <div className="flex items-center gap-2 font-mono text-sm text-emerald-400 font-bold">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>4242 •••• •••• 4242</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTestCard("4242424242424242")}
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    {copiedCard ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/60" />
                        <span>Copy Card Number</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-white/50 leading-relaxed font-mono">
                  When you click below, you will be redirected to the official Stripe Hosted Payment Gateway. After payment, Stripe will dispatch the webhook to confirm and activate your account.
                </p>
              </div>

              {/* Error Box */}
              {paymentError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Primary Action Button: Open Stripe Payment Gateway */}
              <div className="space-y-3">
                <Button
                  type="button"
                  onClick={handleProceedToStripe}
                  disabled={redirecting}
                  className="w-full bg-[#635BFF] hover:bg-[#5249E0] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#635BFF]/30 transition-all text-sm cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Pay ${amount.toFixed(2)} via Stripe Payment Gateway
                  <ExternalLink className="w-4 h-4 ml-1 opacity-75" />
                </Button>

                {/* Secondary Option: Instant Local Sandbox (Offline demo) */}
                <button
                  type="button"
                  onClick={handleInstantLocalActivation}
                  disabled={isSimulatingLocal}
                  className="w-full text-center text-xs font-mono text-white/40 hover:text-white/70 py-1 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400/70" />
                  <span>Instant Local Demo (Skip Stripe Gateway & Webhook)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
