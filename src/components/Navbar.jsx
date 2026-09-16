"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Sparkles,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Coins,
  Target,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jackpotData, setJackpotData] = useState({ pool: 1500, rollover: 1500 });

  useEffect(() => {
    fetch("/api/draws/upcoming")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setJackpotData({
            pool: data.data.estimatedTotalPool || 1500,
            rollover: data.data.jackpotRolloverIn || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { name: "Charities", href: "/charities", icon: Heart },
    { name: "How It Works", href: "/how-it-works", icon: Target },
    { name: "Draws & Prizes", href: "/draws", icon: Trophy },
    { name: "Pricing", href: "/pricing", icon: Coins },
    { name: "API Docs", href: "/docs", icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#08090C]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-1.5 text-xl font-extrabold tracking-tight">
            <span className="text-amber-400 transition-transform group-hover:scale-105">digital.</span>
            <span className="text-white">HEROES</span>
          </Link>

          {/* Live Jackpot Ticker Pill */}
          <Link
            href="/draws"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:border-amber-400/50 hover:bg-amber-500/20 transition shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>Next Draw: ${jackpotData.pool.toLocaleString()}</span>
            {jackpotData.rollover > 0 && (
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-200 uppercase font-bold">
                Rollover
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition hover:text-white ${
                  isActive ? "text-amber-400 font-semibold" : "text-slate-400"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:border-amber-400/40 hover:text-white transition"
              >
                <LayoutDashboard className="h-4 w-4 text-amber-400" />
                <span>Dashboard</span>
                {user.role === "admin" ? (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Staff
                  </span>
                ) : (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      user.isTicketComplete
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {user.activeScoresCount || 0}/5 Scores
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                title="Sign out"
                className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Join the Movement
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5 transition"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0C0F17] px-4 pt-3 pb-5 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <link.icon className="h-4 w-4 text-amber-400" />
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-white/10 pt-3">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-sm font-medium text-white"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-amber-400" />
                    Dashboard
                  </span>
                  {user.role === "admin" ? (
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-300">
                      Staff
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                      {user.activeScoresCount || 0}/5 Scores
                    </span>
                  )}
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Control Plane
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/20 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-white/10 py-2 text-center text-sm font-medium text-white hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-amber-500 py-2 text-center text-sm font-bold text-black hover:bg-amber-400"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
