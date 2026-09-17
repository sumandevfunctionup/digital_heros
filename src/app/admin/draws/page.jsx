"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dices,
  Sparkles,
  PlusCircle,
  Coins,
  History,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminDrawsConsolePage() {
  const [draws, setDraws] = useState([]);
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Upcoming draw stats & rollover
        const upRes = await fetch("/api/draws/upcoming");
        if (upRes.ok) {
          const upJson = await upRes.json();
          if (upJson.success && upJson.data) {
            setUpcoming(upJson.data);
          }
        }

        // 2. Published draws archive
        const drawsRes = await fetch("/api/draws");
        if (drawsRes.ok) {
          const dJson = await drawsRes.json();
          if (dJson.success && dJson.data?.draws) {
            setDraws(dJson.data.draws);
          }
        }
      } catch {
        toast.error("Failed to load draws history.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Draw Operations & Jackpot Ledger
            </h2>
          </div>
          <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
            PRD § 06 & § 07: Track official monthly draw publications, review historical winning numbers, monitor accumulated rollover balances, and execute new algorithmic draws.
          </p>
        </div>

        <Link
          href="/admin/draws/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/25 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch Draw Simulator</span>
        </Link>
      </div>

      {/* Rollover & Engine Summary Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#181420] via-[#120F1A] to-[#0A0C10] p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
              Active Jackpot Buffer
            </span>
            <div className="text-4xl font-black font-mono text-white">
              ${upcoming?.jackpotRolloverIn?.toLocaleString() || "1,500"}
            </div>
            <p className="text-xs text-white/60 mt-1">
              Accumulated Tier 1 rollover carrying forward into upcoming monthly draw cycle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#0F1118] border border-white/10 text-xs text-center">
              <span className="text-[10px] font-mono text-white/40 uppercase block">
                Total Published Draws
              </span>
              <span className="font-bold font-mono text-white text-base mt-0.5 block">
                {draws.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0F1118] border border-white/10 text-xs text-center">
              <span className="text-[10px] font-mono text-white/40 uppercase block">
                Active Eligible Tickets
              </span>
              <span className="font-bold font-mono text-emerald-400 text-base mt-0.5 block">
                {upcoming?.activeSubscribersCount || 2}+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Published Draws Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-white/60" />
            <h3 className="text-base font-bold text-white">Official Published Ledger</h3>
          </div>
          <span className="text-xs font-mono text-white/40">
            {draws.length} Total Published Records
          </span>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : draws.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <Dices className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/50">No published draws recorded yet.</p>
            <Link
              href="/admin/draws/new"
              className="mt-3 inline-block text-xs text-amber-400 hover:underline"
            >
              Simulate and publish your first draw
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Draw #</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Algorithm Type</th>
                  <th className="py-3 px-4">Drawn Numbers (1–45)</th>
                  <th className="py-3 px-4">Total Pool</th>
                  <th className="py-3 px-4">Winners</th>
                  <th className="py-3 px-4">Rollover Out</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {draws.map((d) => (
                  <tr key={d._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      #{d.drawNumber}
                    </td>

                    <td className="py-4 px-4 font-mono text-white/80">
                      {d.drawMonth}
                    </td>

                    <td className="py-4 px-4 capitalize text-[11px] font-mono text-white/60">
                      {d.algorithmType === "frequency_weighted"
                        ? "Score-Frequency (Laplace)"
                        : "Uniform Random"}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        {d.drawnNumbers?.map((n, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-white font-bold">
                      ${d.totalPrizePool?.toLocaleString() || "0"}
                    </td>

                    <td className="py-4 px-4 font-mono text-emerald-400 font-bold">
                      {d.winnersCount || 0}
                    </td>

                    <td className="py-4 px-4 font-mono">
                      {d.jackpotRolloverOut > 0 ? (
                        <span className="text-amber-300 font-bold">
                          ${d.jackpotRolloverOut.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
