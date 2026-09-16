"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Heart,
  Calendar,
  MapPin,
  ExternalLink,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import DirectDonationModal from "@/components/DirectDonationModal";

export default function CharityDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetch(`/api/charities/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.charity) {
          setCharity(data.data.charity);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelectAsMyCharity = async () => {
    if (!user) {
      toast.error("Please sign in or register to set this as your platform charity.");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedCharityId: charity._id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`You are now directing your subscription to ${charity.name}!`);
        await refreshUser();
      } else {
        throw new Error(data.error?.message || "Failed to update charity preference");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Charity Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The requested charity profile could not be located.</p>
        <Link
          href="/charities"
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Directory
        </Link>
      </div>
    );
  }

  const isCurrentSelection = user?.selectedCharity?._id === charity._id;

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/charities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Charity Directory
      </Link>

      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 mb-8 shadow-2xl">
        <img
          src={charity.bannerUrl}
          alt={charity.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090C] via-[#08090C]/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
              {charity.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              {charity.name}
            </h1>
            <p className="text-xs sm:text-sm text-amber-400/90 font-medium mt-1">
              {charity.tagline}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDonationModal(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition"
            >
              Direct Donate
            </button>

            {user && (
              <button
                onClick={handleSelectAsMyCharity}
                disabled={isCurrentSelection}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5 ${
                  isCurrentSelection
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default"
                    : "bg-white/10 border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isCurrentSelection ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    My Current Charity
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 text-amber-400" />
                    Set As My Charity
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Mission Story */}
        <div className="md:col-span-2 space-y-8">
          <div className="rounded-2xl border border-white/10 bg-[#11141B] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Mission & Community Purpose
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {charity.description}
            </p>
            {charity.websiteUrl && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <a
                  href={charity.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                >
                  <span>Visit Official Foundation Website</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Upcoming Events (Charity Golf Days PRD § 08.2) */}
          <div className="rounded-2xl border border-white/10 bg-[#11141B] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-400" />
              Upcoming Charity Golf Days & Events
            </h2>
            {charity.events && charity.events.length > 0 ? (
              <div className="space-y-4">
                {charity.events.map((event, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/5 bg-[#0A0D13] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-white">{event.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-400" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                          {event.location}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-400 mt-2">{event.description}</p>
                      )}
                    </div>

                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition whitespace-nowrap text-center"
                      >
                        Register to Play
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No public tournaments scheduled at this time. Check back soon!
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Stats Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#11141B] p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Impact Overview
            </h3>

            <div>
              <span className="text-xs text-slate-400 block">Total Directed Funds</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                ${(charity.totalFundsRaised || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">From player subscription fees & gifts</span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="text-xs text-slate-400 block">Active Backers</span>
              <div className="text-2xl font-black text-white font-mono mt-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-400" />
                {(charity.supporterCount || 0).toLocaleString()} Players
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setShowDonationModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-black hover:from-amber-400 hover:to-amber-500 transition shadow-lg shadow-amber-500/15"
              >
                <Sparkles className="h-4 w-4" />
                Make a Standalone Donation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Donation Modal */}
      {showDonationModal && (
        <DirectDonationModal
          charity={charity}
          isOpen={showDonationModal}
          onClose={() => setShowDonationModal(false)}
          onSuccess={(donation) => {
            setCharity((prev) => ({
              ...prev,
              totalFundsRaised: (prev.totalFundsRaised || 0) + donation.amount,
            }));
          }}
        />
      )}
    </div>
  );
}
