"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    // Simulate recovery dispatch for dev environment
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Password recovery instructions generated!");
    }, 750);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-white/60 leading-relaxed">
              Enter your email address and we will provide a secure recovery link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
                <p className="text-xs text-white/70">
                  Instructions have been prepared for <strong className="text-white font-mono">{email}</strong>.
                </p>
                <div className="text-[11px] font-mono text-amber-300 bg-black/40 p-2.5 rounded-xl border border-amber-500/20 mt-3 text-left">
                  <div className="font-bold text-amber-400 mb-0.5">Development Notice:</div>
                  In development mode, you can sign in directly using the 1-Click Quick-Fill credentials on the login screen.
                </div>
              </div>

              <Link href="/login" className="block w-full">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs py-2.5 rounded-xl">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    placeholder="golfer@digitalheroes.co.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-amber-500 text-xs py-2.5"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20"
              >
                {loading ? "Preparing Reset Link..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
