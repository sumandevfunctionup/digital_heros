import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

export default function ScoresLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-4">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid grid-cols-5 gap-3 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Round Submission Form Card Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* History Table Skeleton */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-6 w-52" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
}
