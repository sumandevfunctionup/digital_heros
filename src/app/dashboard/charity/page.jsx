"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  HeartHandshake,
  ArrowRight,
  Sliders,
} from "lucide-react";
import DirectDonationModal from "@/components/DirectDonationModal";
import { Button } from "@/components/ui/button";

export default function CharityDashboardPage() {
  const { user, refreshUser } = useAuth();
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedCharityId, setSelectedCharityId] = useState(
    user?.selectedCharity?._id || user?.selectedCharity?.id || ""
  );
  const [contributionPercent, setContributionPercent] = useState(
    user?.charityContributionPercent || 10
  );

  // Standalone Direct Donation Modal
  const [directDonationCharity, setDirectDonationCharity] = useState(null);

  useEffect(() => {
    async function loadCharities() {
      try {
        setLoading(true);
        const res = await fetch("/api/charities");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.charities) {
            setCharities(json.data.charities);
            if (!selectedCharityId && json.data.charities.length > 0) {
              setSelectedCharityId(json.data.charities[0]._id);
            }
          }
        }
      } catch {
        toast.error("Failed to load charities");
      } finally {
        setLoading(false);
      }
    }

    loadCharities();
  }, []);

  useEffect(() => {
    if (user?.selectedCharity?._id) {
      setSelectedCharityId(user.selectedCharity._id);
    }
    if (user?.charityContributionPercent) {
      setContributionPercent(user.charityContributionPercent);
    }
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (contributionPercent < 10) {
      toast.error("PRD Rule: Minimum charity contribution is 10%.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedCharityId: selectedCharityId || null,
          charityContributionPercent: Number(contributionPercent),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to update charity allocation.");
        return;
      }

      toast.success("Charity allocation saved successfully!");
      await refreshUser();
    } catch {
      toast.error("Network error updating charity preferences.");
    } finally {
      setSaving(false);
    }
  };

  const monthlyFee = user?.subscriptionPlan === "yearly" ? 20.83 : 25;
  const calculatedCharityMonthly = ((monthlyFee * contributionPercent) / 100).toFixed(2);
  const calculatedCharityAnnual = (calculatedCharityMonthly * 12).toFixed(2);

  const activeCharity = charities.find((c) => c._id === selectedCharityId);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-rose-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Charity Allocation & Giving Pledge
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          PRD § 04: Digital Heroes empowers golfers to be philanthropic champions. Direct at least 10% (up to 100%) of your recurring membership fee straight to the registered cause of your choice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Percentage Slider */}
        <div className="lg:col-span-2 space-y-8">
          <form
            onSubmit={handleSavePreferences}
            className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6"
          >
            {/* Contribution Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Monthly Contribution Percentage
                </label>
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-2xl font-black text-emerald-400">
                    {contributionPercent}%
                  </span>
                  <span className="text-xs text-white/40">of fee</span>
                </div>
              </div>

              {/* Slider Input */}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={contributionPercent}
                onChange={(e) => setContributionPercent(Number(e.target.value))}
                className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
              />

              <div className="flex justify-between text-[11px] font-mono text-white/40 mt-2">
                <span className="text-amber-400 font-semibold">10% Minimum</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span className="text-emerald-400 font-semibold">100% Full Hero</span>
              </div>
            </div>

            {/* Real-time Math Summary Card */}
            <div className="p-4 rounded-2xl bg-[#121520] border border-white/10 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40">
                  Monthly Giving Impact
                </span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  ${calculatedCharityMonthly}{" "}
                  <span className="text-xs font-normal text-white/40">/ mo</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40">
                  Projected 1-Year Impact
                </span>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  ${calculatedCharityAnnual}{" "}
                  <span className="text-xs font-normal text-white/40">/ yr</span>
                </div>
              </div>
            </div>

            {/* Charity Selector Cards */}
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Select Your Beneficiary Charity Partner
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {charities.map((charity) => {
                  const isSelected = charity._id === selectedCharityId;
                  return (
                    <div
                      key={charity._id}
                      onClick={() => setSelectedCharityId(charity._id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all flex items-start gap-3 ${
                        isSelected
                          ? "bg-gradient-to-br from-rose-500/15 via-[#16141F] to-[#0F1118] border-rose-500/50 shadow-lg shadow-rose-500/10"
                          : "bg-[#121520] border-white/10 hover:border-white/25"
                      }`}
                    >
                      <img
                        src={charity.logoUrl}
                        alt={charity.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">
                            {charity.name}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-mono text-rose-300">
                          {charity.category}
                        </span>
                        <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                          {charity.tagline}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/40">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Locked into monthly automated disbursement</span>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-500/20"
              >
                {saving ? "Saving Changes..." : "Save Giving Pledge"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Selected Charity Spotlight & Standalone Giving */}
        <div className="space-y-6">
          {activeCharity ? (
            <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="aspect-video w-full rounded-2xl overflow-hidden mb-4 border border-white/10">
                <img
                  src={activeCharity.bannerUrl}
                  alt={activeCharity.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {activeCharity.category}
                </span>
                <span className="text-xs text-white/40">
                  {activeCharity.supporterCount || 0} Supporters
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{activeCharity.name}</h3>
              <p className="text-xs text-white/60 mt-2 leading-relaxed">
                {activeCharity.description}
              </p>

              <div className="mt-5 pt-5 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/50 mb-1 font-mono">
                  <span>Community Raised</span>
                  <span className="text-emerald-400 font-bold">
                    ${activeCharity.totalFundsRaised?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDirectDonationCharity(activeCharity)}
                className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all border border-white/15 flex items-center justify-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Make One-Time Direct Donation
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 text-center text-white/40 text-xs">
              Select a charity on the left to see their mission profile.
            </div>
          )}
        </div>
      </div>

      {/* Standalone Direct Donation Modal */}
      {directDonationCharity && (
        <DirectDonationModal
          charity={directDonationCharity}
          isOpen={!!directDonationCharity}
          onClose={() => setDirectDonationCharity(null)}
          onSuccess={() => {
            setDirectDonationCharity(null);
            refreshUser();
          }}
        />
      )}
    </div>
  );
}
