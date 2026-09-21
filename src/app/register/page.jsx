"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";

// Strict email regex requiring proper username, domain, and top-level domain
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [charities, setCharities] = useState([]);
  const [loadingCharities, setLoadingCharities] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [contributionPercent, setContributionPercent] = useState(15);
  const [plan, setPlan] = useState("monthly");
  const [submitting, setSubmitting] = useState(false);

  // Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/charities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.charities) {
          setCharities(data.data.charities);
          if (data.data.charities.length > 0) {
            setSelectedCharityId(data.data.charities[0]._id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCharities(false));
  }, []);

  // Strict field validator
  const validateField = (name, value) => {
    let error = "";
    if (name === "firstName") {
      const val = value ? value.trim() : "";
      if (!val) {
        error = "First name is required.";
      } else if (val.length < 2) {
        error = "First name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\s'-]+$/.test(val)) {
        error = "First name can only contain letters, spaces, and hyphens.";
      }
    } else if (name === "lastName") {
      // Last name is strictly OPTIONAL
      const val = value ? value.trim() : "";
      if (val && !/^[a-zA-Z\s'-]+$/.test(val)) {
        error = "Last name can only contain letters, spaces, and hyphens.";
      }
    } else if (name === "email") {
      const val = value ? value.trim() : "";
      if (!val) {
        error = "Email address is required.";
      } else if (!STRICT_EMAIL_REGEX.test(val)) {
        error = "Please enter a valid email address with a domain (e.g. name@example.com).";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required.";
      } else if (value.length < 6) {
        error = "Password must be at least 6 characters.";
      }
    }
    return error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === "firstName"
        ? firstName
        : field === "lastName"
        ? lastName
        : field === "email"
        ? email
        : password;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, val) => {
    if (field === "firstName") setFirstName(val);
    else if (field === "lastName") setLastName(val);
    else if (field === "email") setEmail(val);
    else if (field === "password") setPassword(val);

    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const validateStep1 = () => {
    const errs = {
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      password: validateField("password", password),
    };

    const activeErrors = Object.fromEntries(
      Object.entries(errs).filter(([, v]) => v !== "")
    );

    setErrors(activeErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
    });

    return Object.keys(activeErrors).length === 0;
  };

  const handleContinueToStep2 = () => {
    if (!validateStep1()) {
      toast.error("Please fill in all required fields with valid formats.");
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      setStep(1);
      toast.error("Please fill in all required personal details.");
      return;
    }

    if (!selectedCharityId) {
      toast.error("Please select a verified charity partner.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create account (lastName is optional)
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || "",
          email: email.trim().toLowerCase(),
          password,
          selectedCharityId,
          charityContributionPercent: Number(contributionPercent),
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.error?.message || "Registration failed");
      }

      // 2. Refresh user state so session is active (subscriptionStatus will be 'none')
      await refreshUser();
      toast.success("Account created successfully! Opening payment gateway...");

      // 3. Open Payment Gateway to purchase subscription using identical payment gateway flow
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("payment_gateway_redirected", "true");
          sessionStorage.setItem("payment_gateway_return_url", "/dashboard/settings");
        }

        const checkoutRes = await fetch("/api/subscriptions/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${regData.data.token}`,
          },
          body: JSON.stringify({
            plan,
            mode: "stripe",
            redirect: true,
            returnUrl: "/dashboard/settings",
          }),
        });

        const checkoutData = await checkoutRes.json();
        if (checkoutRes.ok && checkoutData.success && checkoutData.data?.checkoutUrl) {
          toast.info("Redirecting to official Stripe Payment Gateway...");
          window.location.href = checkoutData.data.checkoutUrl;
          return;
        }
      } catch (checkoutErr) {
        console.warn("[Register Checkout Redirection Notice]:", checkoutErr);
      }

      // Fallback: If not directly redirected to Stripe, enter dashboard with payment modal auto-opened
      router.push(`/dashboard?subscribe=true&plan=${plan}`);
    } catch (err) {
      toast.error(err.message || "Failed to complete registration.");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmailValid = email.trim() && STRICT_EMAIL_REGEX.test(email.trim());
  const isFirstNameValid = firstName.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(firstName.trim());
  const isPasswordValid = password.length >= 6;

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1 text-2xl font-black tracking-tight">
            <span className="text-amber-400">digital.</span>
            <span className="text-white">HEROES</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Your Subscriber Account
          </h2>
          <p className="text-xs text-slate-400">
            Select a verified foundation, set your giving percentage, and start logging scores.
          </p>
        </div>

        {/* Multi-Step Card */}
        <div className="rounded-2xl border border-white/10 bg-[#11141B] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 text-xs font-semibold">
            <span className={step === 1 ? "text-amber-400 font-bold" : "text-slate-400"}>
              Step 1: Account Information
            </span>
            <span className={step === 2 ? "text-amber-400 font-bold" : "text-slate-400"}>
              Step 2: Charity & Plan
            </span>
          </div>

          <form onSubmit={handleRegister}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* First Name (Mandatory) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>First Name <span className="text-amber-400">*</span></span>
                      {isFirstNameValid && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        onBlur={() => handleBlur("firstName")}
                        placeholder="Jordan"
                        className={`w-full rounded-xl border bg-[#0A0D13] pl-9 pr-3 py-2 text-sm text-white focus:outline-none transition ${
                          errors.firstName && touched.firstName
                            ? "border-rose-500/70 bg-rose-500/5 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                            : isFirstNameValid
                            ? "border-emerald-500/40 focus:border-emerald-400"
                            : "border-white/10 focus:border-amber-400"
                        }`}
                      />
                    </div>
                    {errors.firstName && touched.firstName && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Last Name
                      </label>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        Optional
                      </span>
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Spieth"
                      className={`w-full rounded-xl border bg-[#0A0D13] px-3 py-2 text-sm text-white focus:outline-none transition ${
                        errors.lastName && touched.lastName
                          ? "border-rose-500/70 bg-rose-500/5 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                          : "border-white/10 focus:border-amber-400"
                      }`}
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Address (Strictly Validated) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    {isEmailValid && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Valid format
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="jordan@example.com"
                      className={`w-full rounded-xl border bg-[#0A0D13] pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                        errors.email && touched.email
                          ? "border-rose-500/70 bg-rose-500/5 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                          : isEmailValid
                          ? "border-emerald-500/40 focus:border-emerald-400"
                          : "border-white/10 focus:border-amber-400"
                      }`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password (Min 6 Characters) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Password (Min 6 Characters) <span className="text-amber-400">*</span>
                    </label>
                    {isPasswordValid && (
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Valid length
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                      placeholder="••••••••"
                      className={`w-full rounded-xl border bg-[#0A0D13] pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none transition ${
                        errors.password && touched.password
                          ? "border-rose-500/70 bg-rose-500/5 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                          : isPasswordValid
                          ? "border-emerald-500/40 focus:border-emerald-400"
                          : "border-white/10 focus:border-amber-400"
                      }`}
                    />
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleContinueToStep2}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition mt-4"
                >
                  <span>Continue to Charity Selection</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Charity Picker */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Designate Your Charity Recipient (PRD § 08)
                  </label>
                  {loadingCharities ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading verified foundations...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {charities.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => setSelectedCharityId(c._id)}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                            selectedCharityId === c._id
                              ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                              : "border-white/10 bg-[#0A0D13] hover:border-white/20"
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{c.name}</span>
                              <span className="text-[10px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full font-normal">
                                {c.category}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {c.tagline}
                            </div>
                          </div>
                          {selectedCharityId === c._id && (
                            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contribution Percentage Slider */}
                <div className="rounded-xl border border-white/5 bg-[#0A0D13] p-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-300">Charity Contribution:</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {contributionPercent}% of fee
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={contributionPercent}
                    onChange={(e) => setContributionPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>10% (Mandatory minimum)</span>
                    <span>50%</span>
                    <span>100% Impact</span>
                  </div>
                </div>

                {/* Subscription Plan Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Select Subscription Plan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setPlan("monthly")}
                      className={`p-3.5 rounded-xl border cursor-pointer text-center transition ${
                        plan === "monthly"
                          ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "border-white/10 bg-[#0A0D13] hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">Monthly Plan</span>
                      <span className="text-lg font-black text-amber-300 font-mono mt-0.5 block">
                        $25<span className="text-[10px] font-normal text-slate-400">/mo</span>
                      </span>
                    </div>

                    <div
                      onClick={() => setPlan("yearly")}
                      className={`p-3.5 rounded-xl border cursor-pointer text-center transition relative overflow-hidden ${
                        plan === "yearly"
                          ? "border-amber-400 bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : "border-white/10 bg-[#0A0D13] hover:border-white/20"
                      }`}
                    >
                      <span className="absolute top-1 right-2 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                        20% Off
                      </span>
                      <span className="text-xs font-bold text-white block">Yearly Plan</span>
                      <span className="text-lg font-black text-amber-300 font-mono mt-0.5 block">
                        $240<span className="text-[10px] font-normal text-slate-400">/yr</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back and Submit Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Complete & Start Scoring
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
