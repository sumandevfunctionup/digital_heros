import { Skeleton } from "@/components/ui/skeleton";

/**
 * Standard Table Skeleton
 * Renders realistic table rows with avatar/pill badges and column widths
 */
export function TableSkeleton({ rows = 5, cols = 5, className = "" }) {
  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <div className="w-full text-left text-xs">
        {/* Table Header Placeholder */}
        <div className="flex items-center gap-4 py-3.5 px-4 bg-white/[0.03] border-b border-white/10 rounded-t-xl">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              className={`h-4 ${
                cIdx === 0 ? "w-28" : cIdx === cols - 1 ? "w-20 ml-auto" : "w-24"
              }`}
            />
          ))}
        </div>

        {/* Table Rows Placeholder */}
        <div className="divide-y divide-white/5">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div
              key={rIdx}
              className="flex items-center gap-4 py-4 px-4 hover:bg-white/[0.02] transition-colors"
            >
              {/* Col 1: Avatar or Status Badge */}
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>

              {/* Col 2: Text/Score */}
              {cols > 2 && (
                <div className="min-w-[100px]">
                  <Skeleton className="h-4 w-20" />
                </div>
              )}

              {/* Col 3: Details */}
              {cols > 3 && (
                <div className="min-w-[120px] flex-1">
                  <Skeleton className="h-3.5 w-32" />
                </div>
              )}

              {/* Col 4: Date / Pill */}
              {cols > 4 && (
                <div className="min-w-[100px]">
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              )}

              {/* Col 5: Actions */}
              <div className="ml-auto flex items-center gap-2">
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Card Grid Skeleton
 * Matches card layouts used in charities directory, admin charities, etc.
 */
export function CardGridSkeleton({
  count = 6,
  gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
}) {
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-white/10 bg-[#11141B] overflow-hidden flex flex-col justify-between shadow-xl"
        >
          {/* Card Top / Banner */}
          <div className="relative h-44 w-full bg-white/[0.02]">
            <Skeleton className="w-full h-full rounded-none" />
            <div className="absolute top-3 left-3">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-3 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
            <div className="space-y-1.5 pt-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="pt-2">
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>

          {/* Card Footer / Actions */}
          <div className="p-6 pt-0 border-t border-white/5 mt-auto">
            <div className="flex items-center justify-between py-3">
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-2.5 w-16 ml-auto" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Skeleton className="h-9 rounded-lg" />
              <Skeleton className="h-9 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Stats KPI Grid Skeleton
 * Used on dashboard overviews, executive analytics, etc.
 */
export function StatsGridSkeleton({ count = 4, className = "" }) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 sm:gap-6 ${className}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 backdrop-blur-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Draw Card Skeleton
 * Used in Published Draws Archive and Live Pools
 */
export function DrawCardSkeleton({ count = 2 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-white/10 bg-[#0F1118]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>

          {/* Balls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <Skeleton className="h-3 w-32 mb-2" />
              <div className="flex items-center gap-3">
                {Array.from({ length: 5 }).map((_, bIdx) => (
                  <Skeleton
                    key={bIdx}
                    className="w-12 h-12 rounded-full border border-amber-500/20"
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Skeleton className="h-3 w-24 ml-auto" />
              <Skeleton className="h-7 w-32 ml-auto" />
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Charity Detail Page Skeleton
 */
export function CharityDetailSkeleton() {
  return (
    <div className="min-h-screen pb-20 space-y-8">
      {/* Hero Banner */}
      <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden border border-white/10">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl border-2 border-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>

      {/* Main Content & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <div className="pt-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-white/10 bg-[#11141B] p-6 space-y-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3.5 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
            </div>
            <Skeleton className="h-12 rounded-xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Golfer Dashboard Overview Skeleton
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-white/5 to-transparent p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl shrink-0" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <StatsGridSkeleton count={4} />

      {/* 5-Ball Ticket & Active Draw Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* 5 Balls */}
          <div className="grid grid-cols-5 gap-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col items-center justify-center p-2 space-y-2"
              >
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Charity Pledge Card */}
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3.5 w-48" />
          <div className="py-4 flex justify-center">
            <Skeleton className="w-32 h-32 rounded-full border-4 border-white/10" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Admin Analytics Dashboard Skeleton
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <StatsGridSkeleton count={4} />

      {/* Main Charts & Histograms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>

      {/* Detailed Table Placeholder */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
}
