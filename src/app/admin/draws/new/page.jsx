"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dices,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Trophy,
  ShieldAlert,
  ArrowRight,
  Send,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminDrawSimulatorPage() {
  const router = useRouter();
  const [drawMonth, setDrawMonth] = useState("2026-12");
  const [algorithmType, setAlgorithmType] = useState("random");
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [publishedMonths, setPublishedMonths] = useState([]);

  // Publish state
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    async function fetchPublishedDraws() {
      try {
        const res = await fetch("/api/draws");
        const json = await res.json();
        if (res.ok && json.success && Array.isArray(json.data?.draws)) {
          const months = json.data.draws.map((d) => d.drawMonth);
          setPublishedMonths(months);

          // Find first unpublished candidate month
          const candidates = ["2026-12", "2027-01", "2027-03", "2027-04", "2027-05", "2027-06"];
          const nextAvailable = candidates.find((m) => !months.includes(m)) || "2026-12";
          setDrawMonth(nextAvailable);
        }
      } catch {
        // Fallback silently if fetch fails
      }
    }
    fetchPublishedDraws();
  }, []);

  const isMonthAlreadyPublished = publishedMonths.includes(drawMonth.trim());
  const isAuthorized = confirmationPhrase.trim().toUpperCase() === "CONFIRM PUBLISH";

  const handleSimulate = async (e) => {
    e.preventDefault();
    try {
      setSimulating(true);
      const res = await fetch("/api/admin/draws/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawMonth: drawMonth.trim(), algorithmType }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to run simulation.");
        return;
      }

      toast.success(json.message || "Simulation generated successfully!");
      setSimulationResult(json.data.simulation);
    } catch {
      toast.error("Network error simulating draw.");
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!simulationResult) {
      toast.error("You must run a simulation before publishing.");
      return;
    }

    if (!isAuthorized) {
      toast.error("Please type 'CONFIRM PUBLISH' to authorize.");
      return;
    }

    if (isMonthAlreadyPublished) {
      toast.error(`A draw has already been published for month ${drawMonth}. Please choose an unpublished month.`);
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch("/api/admin/draws/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drawMonth: drawMonth.trim(),
          algorithmType,
          drawnNumbers: simulationResult.drawnNumbers,
          confirmationPhrase: "CONFIRM PUBLISH",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to publish official draw.");
        return;
      }

      toast.success(
        `Draw #${json.data?.draw?.drawNumber || ""} published successfully! Winner records generated.`
      );
      router.push("/draws");
    } catch {
      toast.error("Network error publishing draw.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Monthly Draw Simulator & Publishing Terminal
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          PRD § 06 & § 07: Simulate draw outcomes, test mathematical algorithm distributions (Random vs. Score-Frequency Weighted with Laplace smoothing), and publish official monthly draws to the public ledger.
        </p>
      </div>

      {/* Simulator Config Form */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl">
        <form onSubmit={handleSimulate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Draw Month */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono text-white/60">
                  DRAW MONTH (YYYY-MM) *
                </label>
                {isMonthAlreadyPublished && (
                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Already Published
                  </span>
                )}
              </div>
              <Input
                type="text"
                pattern="^\d{4}-\d{2}$"
                placeholder="2026-12"
                required
                value={drawMonth}
                onChange={(e) => setDrawMonth(e.target.value)}
                className={`bg-[#121520] font-mono ${
                  isMonthAlreadyPublished
                    ? "border-amber-500/50 text-amber-300"
                    : "border-white/15 text-white"
                }`}
              />
              {isMonthAlreadyPublished ? (
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-amber-300/90">
                  <span>Cycle {drawMonth} is already finalized.</span>
                  <button
                    type="button"
                    onClick={() => {
                      const candidates = ["2026-12", "2027-01", "2027-03", "2027-04", "2027-05", "2027-06"];
                      const next = candidates.find((m) => !publishedMonths.includes(m)) || "2026-12";
                      setDrawMonth(next);
                    }}
                    className="underline text-amber-400 hover:text-amber-300 font-mono font-medium ml-1 cursor-pointer"
                  >
                    Suggest Next Month
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-white/40 mt-1 block">
                  Target calendar cycle (e.g. 2026-12)
                </span>
              )}
            </div>

            {/* Algorithm Selection */}
            <div>
              <label className="block text-xs font-mono text-white/60 mb-2">
                ALGORITHM ENGINE *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAlgorithmType("random")}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    algorithmType === "random"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                      : "bg-[#121520] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Uniform Random (1–45)
                </button>
                <button
                  type="button"
                  onClick={() => setAlgorithmType("frequency_weighted")}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    algorithmType === "frequency_weighted"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                      : "bg-[#121520] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Score-Weighted (Laplace)
                </button>
              </div>
              <span className="text-[10px] text-white/40 mt-1 block">
                {algorithmType === "random"
                  ? "Standard uniform probability across all 45 numbers."
                  : "Frequency-weighted by active player scores with Laplace smoothing (α = 1)."}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={simulating}
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" />
              {simulating ? "Executing Engine Math..." : "Run Draw Simulation"}
            </Button>
          </div>
        </form>
      </div>

      {/* Simulation Results Display */}
      {simulationResult && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#14121B] to-[#0A0C10] p-6 sm:p-8 backdrop-blur-xl space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Simulation Outcome
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {simulationResult.eligibleTicketsCount || 0} Eligible Tickets Evaluated
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Drawn Numbers: 5 Distinct Balls (1–45)
              </h3>
            </div>

            {/* Drawn Numbers Balls */}
            <div className="flex items-center gap-2.5">
              {simulationResult.drawnNumbers?.map((num, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-black font-mono font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-white/20"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Pool Distribution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#0F1118] border border-white/10">
              <span className="text-[10px] font-mono uppercase text-white/40 block">
                Total Prize Pool
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ${simulationResult.totalPrizePool?.toLocaleString()}
              </div>
              <span className="text-[10px] text-white/40">
                ${simulationResult.basePrizePool?.toLocaleString()} Base + $
                {simulationResult.jackpotRolloverIn?.toLocaleString()} Rollover In
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1118] border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-amber-400 block">
                Tier 1 (5 Matches - 40%)
              </span>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                ${simulationResult.tier1Pool?.toLocaleString()}
              </div>
              <span className="text-[10px] text-white/50">
                {simulationResult.tier1Winners?.length || 0} Winner(s)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1118] border border-cyan-500/30">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block">
                Tier 2 (4 Matches - 35%)
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                ${simulationResult.tier2Pool?.toLocaleString()}
              </div>
              <span className="text-[10px] text-white/50">
                {simulationResult.tier2Winners?.length || 0} Winner(s)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1118] border border-emerald-500/30">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block">
                Tier 3 (3 Matches - 25%)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
                ${simulationResult.tier3Pool?.toLocaleString()}
              </div>
              <span className="text-[10px] text-white/50">
                {simulationResult.tier3Winners?.length || 0} Winner(s)
              </span>
            </div>
          </div>

          {/* Rollover Status Alert */}
          {simulationResult.jackpotRolloverOut > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>No Tier 1 Winner:</strong> The full Tier 1 allocation of{" "}
                  <strong>${simulationResult.jackpotRolloverOut.toLocaleString()}</strong> will
                  roll over into the next calendar cycle!
                </span>
              </div>
              <span className="font-mono font-bold uppercase">Rollover Out Active</span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Jackpot Hit!</strong> Tier 1 winner found. Accumulated rollover will be
                disbursed.
              </span>
            </div>
          )}

          {/* Winners Preview List */}
          <div>
            <h4 className="text-xs font-mono uppercase text-white/50 tracking-wider mb-3">
              Simulated Winners Breakdown (
              {(simulationResult.tier1Winners?.length || 0) +
                (simulationResult.tier2Winners?.length || 0) +
                (simulationResult.tier3Winners?.length || 0)}{" "}
              Total):
            </h4>

            {simulationResult.tier1Winners?.length === 0 &&
            simulationResult.tier2Winners?.length === 0 &&
            simulationResult.tier3Winners?.length === 0 ? (
              <p className="text-xs text-white/40 italic">
                No active tickets matched 3 or more numbers in this simulated draw.
              </p>
            ) : (
              <div className="space-y-2">
                {simulationResult.tier1Winners?.map((w, i) => (
                  <div
                    key={`t1-${i}`}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-amber-300">
                      Tier 1: {w.user?.firstName} {w.user?.lastName} ({w.user?.email})
                    </span>
                    <span className="font-mono font-bold text-white">
                      ${w.prizeAmount?.toLocaleString()}
                    </span>
                  </div>
                ))}
                {simulationResult.tier2Winners?.map((w, i) => (
                  <div
                    key={`t2-${i}`}
                    className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-cyan-300">
                      Tier 2: {w.user?.firstName} {w.user?.lastName} ({w.user?.email})
                    </span>
                    <span className="font-mono font-bold text-white">
                      ${w.prizeAmount?.toLocaleString()}
                    </span>
                  </div>
                ))}
                {simulationResult.tier3Winners?.map((w, i) => (
                  <div
                    key={`t3-${i}`}
                    className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-emerald-300">
                      Tier 3: {w.user?.firstName} {w.user?.lastName} ({w.user?.email})
                    </span>
                    <span className="font-mono font-bold text-white">
                      ${w.prizeAmount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Confirm & Official Publish Form */}
          <div className="p-6 rounded-2xl bg-[#0B0D13] border border-amber-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold text-white">
                  Official Draw Publishing Authorization
                </h4>
              </div>
              {isAuthorized ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Authorization Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmationPhrase("CONFIRM PUBLISH")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer w-fit"
                >
                  ⚡ Auto-Fill "CONFIRM PUBLISH"
                </button>
              )}
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Publishing will write an immutable record to the official Draw ledger, instantiate verified Winner claim documents in the database, and announce the winning numbers publicly.
            </p>

            {isMonthAlreadyPublished && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  <strong>Cannot Publish:</strong> Month <strong>{drawMonth}</strong> has already been published. Please change the Draw Month above to an unpublished cycle before publishing.
                </span>
              </div>
            )}

            <form onSubmit={handlePublish} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Type 'CONFIRM PUBLISH' to authorize"
                  required
                  value={confirmationPhrase}
                  onChange={(e) => setConfirmationPhrase(e.target.value.toUpperCase())}
                  className={`bg-[#121520] font-mono text-xs uppercase tracking-wider transition-colors ${
                    isAuthorized
                      ? "border-emerald-500/60 text-emerald-300 bg-emerald-950/20"
                      : "border-white/20 text-white"
                  }`}
                />
              </div>

              <Button
                type="submit"
                disabled={publishing || !isAuthorized || isMonthAlreadyPublished}
                className={`font-bold text-xs px-6 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  isAuthorized && !isMonthAlreadyPublished
                    ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                }`}
              >
                {publishing ? "Publishing Official Draw..." : "Publish Official Draw"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
