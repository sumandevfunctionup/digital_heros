import { Skeleton } from "@/components/ui/skeleton";
import { CardGridSkeleton } from "@/components/ui/SkeletonLoaders";

export default function CharitiesLoading() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-xl" />
        ))}
      </div>

      {/* 6 Charity Cards Skeleton */}
      <CardGridSkeleton count={6} />
    </div>
  );
}
