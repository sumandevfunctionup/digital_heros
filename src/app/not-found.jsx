import Link from "next/link";
import { ArrowLeft, Home, Compass, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] bg-[#08090C] text-white flex items-center justify-center px-4 py-16 selection:bg-amber-500/30">
      <div className="max-w-xl w-full text-center space-y-8 relative">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Visual Motif */}
        <div className="relative inline-block">
          <div className="text-8xl sm:text-9xl font-extrabold tracking-tighter bg-gradient-to-b from-white via-white/80 to-white/10 bg-clip-text text-transparent font-mono">
            404
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest whitespace-nowrap">
            Off Course · Out of Bounds
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Lost in the Rough?
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-md mx-auto leading-relaxed">
            The page you are looking for has been moved, removed, or never existed in the digital.HEROES ecosystem.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Return to Homepage
            </Button>
          </Link>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Golfer Dashboard
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
          <Link href="/charities" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            Verified Charities
          </Link>
          <Link href="/draws" className="hover:text-amber-400 transition-colors">
            Draw Mechanics & Rollover
          </Link>
          <Link href="/how-it-works" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            How It Works
          </Link>
        </div>
      </div>
    </div>
  );
}
