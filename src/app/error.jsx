"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log unexpected runtime errors
    console.error("[Global App Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[85vh] bg-[#08090C] text-white flex items-center justify-center px-4 py-16 selection:bg-amber-500/30">
      <div className="max-w-md w-full text-center space-y-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
          <AlertTriangle className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase tracking-widest">
            System Fault Detected
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white pt-2">
            Something Went Wrong
          </h1>
          <p className="text-sm text-white/60 leading-relaxed">
            An unexpected error occurred while processing this request. Our engineering telemetry has captured the diagnostic trace.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-left font-mono text-xs text-rose-300 break-words max-h-32 overflow-y-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-2.5 rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
