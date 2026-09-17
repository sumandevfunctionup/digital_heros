import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#08090C] text-white p-6 sm:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Hero Banner skeleton */}
      <div className="h-64 sm:h-80 rounded-3xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-end space-y-4">
        <Skeleton className="h-10 w-3/4 max-w-xl" />
        <Skeleton className="h-5 w-1/2 max-w-md" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3"
          >
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
