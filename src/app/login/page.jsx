"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Shield, User, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success("Welcome back to digital.HEROES!");
      const loggedUser = data.data?.user;
      if (loggedUser?.role === "admin") {
        router.push("/admin");
      } else {
        const isSubscribed =
          loggedUser?.subscriptionStatus === "active" ||
          loggedUser?.subscriptionStatus === "trialing";
        if (!isSubscribed) {
          toast.info("Please complete your subscription to activate your account.");
          router.push("/dashboard?subscribe=true");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1 text-2xl font-black tracking-tight">
            <span className="text-amber-400">digital.</span>
            <span className="text-white">HEROES</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-slate-400">
            Access your active 5-score ticket, draw participation, and charity impact.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-2xl border border-white/10 bg-[#11141B] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="player@example.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0A0D13] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-amber-400/80 hover:text-amber-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#0A0D13] pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Credentials (PRD Evaluation Helper) */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 block mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              1-Click Demo Evaluation Accounts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill("subscriber@digitalheroes.co.in", "Player1234!")}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-left hover:border-amber-400/40 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <User className="h-3 w-3 text-amber-400" />
                  Subscriber
                </div>
                <div className="text-[10px] text-slate-400 truncate">5 Scores · Active</div>
              </button>

              <button
                type="button"
                onClick={() => quickFill("newgolfer@digitalheroes.co.in", "Player1234!")}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-left hover:border-cyan-400/40 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <User className="h-3 w-3 text-cyan-400" />
                  New Golfer
                </div>
                <div className="text-[10px] text-cyan-300/80 truncate">Unsubscribed · Test Gateway</div>
              </button>

              <button
                type="button"
                onClick={() => quickFill("admin@digitalheroes.co.in", "Admin1234!")}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-left hover:border-red-400/40 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Shield className="h-3 w-3 text-red-400" />
                  Platform Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">Full Control Plane</div>
              </button>
            </div>
          </div>
        </div>

        {/* Switch to Register */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Join the Movement
          </Link>
        </p>
      </div>
    </div>
  );
}
