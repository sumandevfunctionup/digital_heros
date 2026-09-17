import { Skeleton } from "@/components/ui/skeleton";
import { StatsGridSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards */}
      <StatsGridSkeleton count={4} />

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-9 w-full rounded-xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
