"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Target,
  Trophy,
  HeartHandshake,
  Settings,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Dices,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navRef = useRef(null);
  const navContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const { scrollLeft, scrollWidth, clientWidth } = nav;
    setShowLeftArrow(scrollLeft > 6);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const container = navContainerRef.current || nav;
    if (!nav || !container) return;

    checkScroll();
    nav.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    // When mouse is anywhere on the horizontal nav bar, mouse wheel scrolls horizontally
    // allowing the user to rotate/scroll the nav bar effortlessly without needing to touch the scrollbar!
    const handleNavWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        nav.scrollLeft += e.deltaY;
      } else if (e.deltaX !== 0) {
        e.preventDefault();
        nav.scrollLeft += e.deltaX;
      }
    };

    container.addEventListener("wheel", handleNavWheel, { passive: false });

    // Automatically bring active tab into view so it is never clipped
    const timer = setTimeout(() => {
      const activeEl = nav.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
      checkScroll();
    }, 120);

    return () => {
      clearTimeout(timer);
      nav.removeEventListener("scroll", checkScroll);
      container.removeEventListener("wheel", handleNavWheel);
      window.removeEventListener("resize", checkScroll);
    };
  }, [pathname, user, checkScroll]);

  const scrollNav = (direction) => {
    if (!navRef.current) return;
    const scrollAmount = 240;
    navRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-cyan-500/20 border-b-cyan-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <p className="mt-4 text-xs font-mono text-white/50 tracking-widest uppercase animate-pulse">
          Authenticating Golfer Terminal...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = [
    ...(user.role === "admin"
      ? [
          {
            name: "Admin Control Plane",
            href: "/admin",
            icon: ShieldCheck,
            badge: "Staff",
          },
        ]
      : []),
    {
      name: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Active Scores & FIFO",
      href: "/dashboard/scores",
      icon: Target,
      badge: user.activeScoresCount !== undefined ? `${user.activeScoresCount}/5` : undefined,
    },
    {
      name: "Draw Participation",
      href: "/dashboard/draws",
      icon: Dices,
    },
    {
      name: "Winnings & Proof",
      href: "/dashboard/winnings",
      icon: Trophy,
    },
    {
      name: "Charity Allocation",
      href: "/dashboard/charity",
      icon: HeartHandshake,
      badge: `${user.charityContributionPercent || 10}%`,
    },
    {
      name: "Membership & Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isSubscribed = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-emerald-500/30">
      {/* Top Status Header - Sticky flush under main navbar */}
      <header className="border-b border-white/10 bg-[#0B0D13]/95 backdrop-blur-2xl sticky top-16 z-30 shadow-xl shadow-black/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* User Details & Identity */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-amber-500/20 border border-white/15 flex items-center justify-center shadow-inner">
                  <span className="text-lg font-bold text-emerald-400 tracking-wider">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </span>
                </div>
                {isSubscribed && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#08090C] flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Active Subscriber">
                    <ShieldCheck className="w-2.5 h-2.5 text-black stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.role === "admin" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-wider uppercase">
                      Admin Access
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span className="capitalize font-mono">
                    {user.role === "admin"
                      ? "Platform Staff (Subscription Exempt)"
                      : user.subscriptionStatus === "active"
                      ? `${user.subscriptionPlan || "Monthly"} Plan`
                      : "Subscription Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Status Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {/* Ticket State Badge */}
              {user.role === "admin" ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Status: <strong>Staff Exempt</strong></span>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono ${
                    user.isTicketComplete
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}
                >
                  {user.isTicketComplete ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>
                    Ticket: <strong>{user.activeScoresCount || 0}/5</strong>
                    {user.isTicketComplete ? " (Qualified)" : " (Needs 5)"}
                  </span>
                </div>
              )}

              {/* Charity Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Charity:{" "}
                  <strong>
                    {user.selectedCharity?.name
                      ? user.selectedCharity.name.split(" ")[0]
                      : "Default Pool"}
                  </strong>{" "}
                  ({user.charityContributionPercent || 10}%)
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs with Horizontal Scroll Controls */}
          <div ref={navContainerRef} className="relative mt-4">
            {/* Left Scroll Arrow Button & Fade Mask */}
            {showLeftArrow && (
              <div className="absolute left-0 top-0 bottom-2 z-20 flex items-center pr-4 bg-gradient-to-r from-[#0B0D13] via-[#0B0D13]/90 to-transparent">
                <button
                  type="button"
                  onClick={() => scrollNav("left")}
                  aria-label="Scroll left"
                  className="p-1.5 rounded-lg bg-[#141824] hover:bg-white/10 text-white/80 hover:text-white border border-white/20 shadow-lg shadow-black/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Right Scroll Arrow Button & Fade Mask */}
            {showRightArrow && (
              <div className="absolute right-0 top-0 bottom-2 z-20 flex items-center pl-4 bg-gradient-to-l from-[#0B0D13] via-[#0B0D13]/90 to-transparent">
                <button
                  type="button"
                  onClick={() => scrollNav("right")}
                  aria-label="Scroll right"
                  className="p-1.5 rounded-lg bg-[#141824] hover:bg-white/10 text-white/80 hover:text-white border border-white/20 shadow-lg shadow-black/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <nav
              ref={navRef}
              className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2.5 scroll-smooth nav-scrollbar touch-pan-x overscroll-x-contain"
            >
              {navLinks.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={isActive ? "true" : "false"}
                    className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-black/40 font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-emerald-400" : "text-white/40"
                      }`}
                    />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-white/5 text-white/50 border border-white/10"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
