"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Heart, X, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export default function DirectDonationModal({ charity, isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState(50);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !charity) return null;

  const presetAmounts = [25, 50, 100, 250];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || amount < 1) {
      toast.error("Please enter a donation amount of at least $1.");
      return;
    }
    if (!donorEmail) {
      toast.error("Please provide an email address for your tax receipt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charityId: charity._id,
          amount: Number(amount),
          donorName: donorName.trim() || "Anonymous Donor",
          donorEmail: donorEmail.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to process donation");
      }

      // Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#FBBF24", "#10B981", "#06B6D4"],
      });

      toast.success(data.message || `Thank you for donating $${amount} to ${charity.name}!`);
      if (onSuccess) onSuccess(data.data.donation);
      onClose();
    } catch (err) {
      toast.error(err.message || "Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#11141B] shadow-2xl p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Heart className="h-5 w-5 fill-amber-400/20" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Direct Charity Donation</h3>
            <p className="text-xs text-amber-400/90 font-medium">100% Directed to {charity.name}</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Standalone contributions are not tied to gameplay or draw entries. 100% of your gift goes directly to funding their community programs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Amount ($ USD)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`py-2 text-sm font-bold rounded-lg border transition ${
                    amount === preset
                      ? "border-amber-400 bg-amber-400/10 text-amber-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom Amount"
                className="w-full rounded-lg border border-white/10 bg-[#0C0F17] pl-8 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Donor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Leave blank to donate anonymously"
                className="w-full rounded-lg border border-white/10 bg-[#0C0F17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email for Tax Receipt <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-lg border border-white/10 bg-[#0C0F17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Personal Message / Dedication (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message of support..."
              className="w-full rounded-lg border border-white/10 bg-[#0C0F17] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-white/5 p-2.5 rounded-lg border border-white/5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Encrypted PCI-compliant transaction. Direct tax receipt provided immediately.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Donation...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Donate ${amount} Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
