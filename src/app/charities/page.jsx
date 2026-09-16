"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Search,
  Calendar,
  Users,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import DirectDonationModal from "@/components/DirectDonationModal";

export default function CharitiesPage() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDonationCharity, setSelectedDonationCharity] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Healthcare",
    "Youth & Education",
    "Veterans",
    "Environment",
    "Community",
  ];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory !== "All") params.set("category", selectedCategory);

    fetch(`/api/charities?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.charities) {
          setCharities(data.data.charities);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300 mb-4">
          <Heart className="h-3.5 w-3.5 fill-amber-400/20" />
          <span>Verified Non-Profit Partners</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Charity Discovery Directory
        </h1>
        <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
          Every subscriber directs a portion of their subscription to one of these verified causes. Explore their missions, upcoming Charity Golf Days, and make direct contributions.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
        {/* Search input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities by name or mission..."
            className="w-full rounded-xl border border-white/10 bg-[#11141B] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Charities Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/10" />
          ))}
        </div>
      ) : charities.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-[#11141B] p-8">
          <p className="text-base text-slate-400">No charities match your search query.</p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="mt-4 text-xs font-bold text-amber-400 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((charity) => (
            <div
              key={charity._id}
              className="rounded-2xl border border-white/10 bg-[#11141B] overflow-hidden flex flex-col justify-between hover:border-amber-400/30 transition shadow-xl group"
            >
              <div>
                {/* Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={charity.bannerUrl}
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#11141B] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                    {charity.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-300 transition">
                    {charity.name}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mb-2.5">
                    {charity.tagline}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {charity.description}
                  </p>

                  {/* Upcoming Event preview */}
                  {charity.events && charity.events.length > 0 && (
                    <div className="rounded-lg border border-white/5 bg-white/5 p-2.5 text-[11px] text-slate-300 flex items-center gap-2 mb-4">
                      <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{charity.events[0].title}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 border-t border-white/5 mt-auto">
                <div className="flex items-center justify-between text-xs py-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Funds Raised
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${(charity.totalFundsRaised || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Supporters
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      {(charity.supporterCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setSelectedDonationCharity(charity)}
                    className="rounded-lg border border-amber-400/40 bg-amber-400/10 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
                  >
                    Direct Donate
                  </button>
                  <Link
                    href={`/charities/${charity.slug}`}
                    className="rounded-lg bg-white/10 py-2 text-xs font-bold text-white text-center hover:bg-white/20 transition flex items-center justify-center gap-1"
                  >
                    <span>View Story</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Direct Donation Modal */}
      {selectedDonationCharity && (
        <DirectDonationModal
          charity={selectedDonationCharity}
          isOpen={Boolean(selectedDonationCharity)}
          onClose={() => setSelectedDonationCharity(null)}
        />
      )}
    </div>
  );
}
