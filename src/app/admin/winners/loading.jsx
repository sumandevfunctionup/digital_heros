import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminWinnersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-xl" />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
        <TableSkeleton rows={6} cols={6} />
      </div>
    </div>
  );
}
