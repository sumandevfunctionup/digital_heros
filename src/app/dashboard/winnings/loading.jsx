import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton, StatsGridSkeleton } from "@/components/ui/SkeletonLoaders";

export default function WinningsLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* KPI Stats */}
      <StatsGridSkeleton count={3} />

      {/* Winnings Table Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <TableSkeleton rows={5} cols={6} />
      </div>
    </div>
  );
}
