import Link from "next/link";
import { Heart, Shield, Trophy } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#060709] text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-2xl font-black tracking-tight text-white">
              <span className="text-amber-400">digital.</span>HEROES
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              The modern golf tracking platform where personal performance meets real community impact. Log your Stableford scores, support verified charities, and compete in monthly cash prize draws.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                Verified Non-Profits
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-amber-400" />
                Min. 10% Contribution
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-cyan-400" />
                Tiered Prize Draws
              </span>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Membership & Pricing
                </Link>
              </li>
              <li>
                <Link href="/charities" className="hover:text-white transition">
                  Charity Directory
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/draws" className="hover:text-white transition">
                  Draws & Prize Pool
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-white transition">
                  Interactive API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Subscriber Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/scores" className="hover:text-white transition">
                  Score Entry (5 Slots)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/winnings" className="hover:text-white transition">
                  Claim Winnings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  Admin Control Surface
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Rules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Regulations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/terms#stableford" className="hover:text-white transition">
                  Stableford 1–45 Rules
                </Link>
              </li>
              <li>
                <Link href="/terms#rollover" className="hover:text-white transition">
                  40/35/25 Rollover Terms
                </Link>
              </li>
              <li>
                <Link href="/terms#charity" className="hover:text-white transition">
                  Charity Transparency
                </Link>
              </li>
              <li>
                <Link href="/terms#gaming" className="hover:text-white transition">
                  Responsible Gaming
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 digital.HEROES. Sample Trainee Selection Assignment. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built with Next.js 16 & MongoDB Atlas</span>
            <span className="text-emerald-400 font-medium">● Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
