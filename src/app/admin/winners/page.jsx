"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Coins,
  DollarSign,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminWinnersVerificationPage() {
  const [winners, setWinners] = useState([]);
  const [counts, setCounts] = useState({
    pending_proof: 0,
    proof_submitted: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
  });
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Review Dialog State
  const [inspectingWinner, setInspectingWinner] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewing, setReviewing] = useState(false);

  // Payout Dialog State
  const [payingWinner, setPayingWinner] = useState(null);
  const [payoutMethod, setPayoutMethod] = useState("Direct Bank Wire");
  const [payoutReference, setPayoutReference] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      let url = "/api/admin/winners";
      if (activeTab === "needs_review") {
        url += "?verificationStatus=proof_submitted";
      } else if (activeTab === "pending_proof") {
        url += "?verificationStatus=pending_proof";
      } else if (activeTab === "approved") {
        url += "?verificationStatus=approved";
      } else if (activeTab === "paid") {
        url += "?payoutStatus=paid";
      }

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setWinners(json.data.winners || []);
          if (json.data.counts) setCounts(json.data.counts);
        }
      }
    } catch {
      toast.error("Failed to load winners queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [activeTab]);

  const handleReviewAction = async (action) => {
    if (!inspectingWinner) return;

    if (action === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection explanation for the golfer.");
      return;
    }

    try {
      setReviewing(true);
      const res = await fetch(`/api/admin/winners/${inspectingWinner._id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: action === "reject" ? rejectionReason.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to submit review.");
        return;
      }

      toast.success(
        action === "approve"
          ? "Winner scorecard verified and approved for payout!"
          : "Proof rejected. Golfer notified to provide replacement screenshot."
      );

      setInspectingWinner(null);
      setRejectionReason("");
      await fetchWinners();
    } catch {
      toast.error("Network error submitting review.");
    } finally {
      setReviewing(false);
    }
  };

  const handleRecordPayout = async (e) => {
    e.preventDefault();
    if (!payingWinner) return;

    if (!payoutReference.trim()) {
      toast.error("Transaction reference is required.");
      return;
    }

    try {
      setSubmittingPayout(true);
      const res = await fetch(`/api/admin/winners/${payingWinner._id}/payout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutMethod,
          payoutReference: payoutReference.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json.error?.message || "Failed to record payout.");
        return;
      }

      toast.success(json.message || "Payout recorded successfully!");
      setPayingWinner(null);
      setPayoutReference("");
      await fetchWinners();
    } catch {
      toast.error("Network error recording payout.");
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Winner Scorecard Verification & Payout Queue
          </h2>
        </div>
        <p className="text-sm text-white/60 mt-1 max-w-3xl leading-relaxed">
          PRD § 08 & § 09: Inspect golfer scorecard proof screenshots against recorded Stableford rounds. Authorize prize disbursements and maintain complete audit trails.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { id: "all", label: "All Claims", count: null },
          {
            id: "needs_review",
            label: "Needs Review",
            count: counts.proof_submitted,
            highlight: counts.proof_submitted > 0,
          },
          { id: "pending_proof", label: "Awaiting Proof", count: counts.pending_proof },
          { id: "approved", label: "Approved (Ready for Payout)", count: counts.approved },
          { id: "paid", label: "Paid", count: counts.paid },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    tab.highlight
                      ? "bg-amber-500 text-black font-black"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Queue Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 backdrop-blur-xl">
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-white/50">
            Loading verification queue...
          </div>
        ) : winners.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/50">No winners found in this category.</p>
            <p className="text-xs text-white/30 mt-1">Queue is clear.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/50 uppercase font-mono text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Golfer</th>
                  <th className="py-3 px-4">Draw / Period</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Prize Amount</th>
                  <th className="py-3 px-4">Matched Numbers</th>
                  <th className="py-3 px-4">Verification State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {winners.map((win) => (
                  <tr key={win._id} className="hover:bg-white/5 transition-colors">
                    {/* Golfer */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">
                        {win.userId?.firstName} {win.userId?.lastName}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">
                        {win.userId?.email}
                      </div>
                    </td>

                    {/* Draw */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-white">
                        Draw #{win.drawId?.drawNumber || "—"}
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">
                        {win.drawId?.drawMonth}
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          win.matchTier === 1
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : win.matchTier === 2
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        Tier {win.matchTier}
                      </span>
                    </td>

                    {/* Prize */}
                    <td className="py-4 px-4 font-mono text-base font-bold text-emerald-400">
                      ${win.prizeAmount?.toLocaleString()}
                    </td>

                    {/* Matched Numbers */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 font-mono text-xs">
                        {win.matchedNumbers?.map((n, i) => (
                          <span
                            key={i}
                            className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center font-bold"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-4 px-4">
                      {win.payoutStatus === "paid" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Paid Out
                        </span>
                      ) : win.verificationStatus === "proof_submitted" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                          Under Review
                        </span>
                      ) : win.verificationStatus === "approved" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Approved
                        </span>
                      ) : win.verificationStatus === "rejected" ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/40 bg-white/5 border border-white/10">
                          Awaiting Proof
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {win.proofScreenshotUrl && (
                          <Button
                            onClick={() => setInspectingWinner(win)}
                            className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            Inspect
                          </Button>
                        )}

                        {win.verificationStatus === "approved" && win.payoutStatus !== "paid" && (
                          <Button
                            onClick={() => {
                              setPayingWinner(win);
                              setPayoutReference(`TXN-${Date.now().toString().slice(-6)}`);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Payout
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect & Review Proof Dialog */}
      <Dialog
        open={!!inspectingWinner}
        onOpenChange={(open) => !open && setInspectingWinner(null)}
      >
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              Scorecard Proof Inspection
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Verify that the scorecard image matches the golfer&apos;s entered rounds and Stableford points.
            </DialogDescription>
          </DialogHeader>

          {inspectingWinner && (
            <div className="space-y-4 my-2">
              <div className="p-3 rounded-xl bg-[#121520] border border-white/10 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-white/40 block">Golfer:</span>
                  <span className="font-bold text-white">
                    {inspectingWinner.userId?.firstName} {inspectingWinner.userId?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Prize Amount:</span>
                  <span className="font-bold font-mono text-emerald-400">
                    ${inspectingWinner.prizeAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proof Image Preview */}
              <div>
                <span className="text-xs font-mono text-white/40 block mb-1">
                  SUBMITTED SCORECARD SCREENSHOT:
                </span>
                <div className="h-56 rounded-xl overflow-hidden border border-white/15 bg-black/50 relative group">
                  <img
                    src={inspectingWinner.proofScreenshotUrl}
                    alt="Scorecard Proof"
                    className="w-full h-full object-contain"
                  />
                  <a
                    href={inspectingWinner.proofScreenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/80 hover:text-white border border-white/20 text-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Full
                  </a>
                </div>
              </div>

              {/* Rejection input */}
              <div>
                <label className="block text-xs font-mono text-white/60 mb-1">
                  REJECTION REASON (if rejecting):
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Points on scorecard do not match entered Stableford score"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction("reject")}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold"
                >
                  Reject Proof
                </Button>
                <Button
                  type="button"
                  disabled={reviewing}
                  onClick={() => handleReviewAction("approve")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                >
                  {reviewing ? "Processing..." : "Approve Proof"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payout Dialog */}
      <Dialog open={!!payingWinner} onOpenChange={(open) => !open && setPayingWinner(null)}>
        <DialogContent className="bg-[#0F1118] border-white/15 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Disburse Prize Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-white/50">
              Record bank wire or payment transaction reference to mark this winner as paid.
            </DialogDescription>
          </DialogHeader>

          {payingWinner && (
            <form onSubmit={handleRecordPayout} className="space-y-4 my-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                <span className="text-white/60 block">Payout Target:</span>
                <span className="font-bold text-white text-sm">
                  ${payingWinner.prizeAmount?.toLocaleString()} to{" "}
                  {payingWinner.userId?.firstName} {payingWinner.userId?.lastName} (
                  {payingWinner.userId?.email})
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  PAYMENT METHOD *
                </label>
                <Input
                  type="text"
                  required
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="bg-[#121520] border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5">
                  TRANSACTION REFERENCE *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. WIRE-2026-981742"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="bg-[#121520] border-white/15 text-white text-xs font-mono"
                />
              </div>

              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPayingWinner(null)}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPayout}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold"
                >
                  {submittingPayout ? "Recording..." : "Confirm Payout"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
