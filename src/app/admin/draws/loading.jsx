import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminDrawsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
}
