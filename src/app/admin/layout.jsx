"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  BarChart3,
  Dices,
  CheckSquare,
  Users,
  FileCode2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const { user, loading, login } = useAuth();
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
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="mt-4 text-xs font-mono text-white/50 tracking-widest uppercase">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  // RBAC Guard: Only role === 'admin'
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#08090C] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-[#0F1118] p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
            <p className="text-xs text-white/60 mt-2 leading-relaxed">
              Your account (<strong className="text-white">{user?.email || "Guest"}</strong>) does not have administrator privileges for the digital.HEROES control plane.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              onClick={async () => {
                await login("admin@digitalheroes.co.in", "Admin1234!");
                router.refresh();
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-amber-500/20"
            >
              Sign In with Demo Admin Account
            </Button>

            <Link
              href="/dashboard"
              className="block text-xs text-white/50 hover:text-white underline underline-offset-4"
            >
              Return to Golfer Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    {
      name: "Executive Overview",
      href: "/admin",
      icon: BarChart3,
      exact: true,
    },
    {
      name: "Deep Reports & Histograms",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
    {
      name: "Draw Simulator & Publish",
      href: "/admin/draws/new",
      icon: Dices,
    },
    {
      name: "Winner Verification",
      href: "/admin/winners",
      icon: CheckSquare,
    },
    {
      name: "Subscribers & Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Charity Partners",
      href: "/admin/charities",
      icon: Heart,
    },
    {
      name: "API Swagger Docs",
      href: "/docs",
      icon: FileCode2,
      isExternal: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-white selection:bg-amber-500/30">
      {/* Top Admin Bar - Sticky flush under main navbar */}
      <header className="border-b border-amber-500/20 bg-[#0B0D13]/95 backdrop-blur-2xl sticky top-16 z-30 shadow-xl shadow-black/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Brand / Admin Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">
                    digital.HEROES Control Plane
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Admin Terminal
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Logged in as <strong className="text-white font-mono">{user.email}</strong>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Golfer Dashboard</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Sandbox Active</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs with Horizontal Scroll Controls */}
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
              {adminNav.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (item.isExternal) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={isActive ? "true" : "false"}
                      className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap text-white/60 hover:text-white hover:bg-white/5 border border-transparent shrink-0"
                    >
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.name}</span>
                      <ExternalLink className="w-3 h-3 text-white/30" />
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-active={isActive ? "true" : "false"}
                    className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-black/40 font-semibold"
                        : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-amber-400" : "text-white/40"
                      }`}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
