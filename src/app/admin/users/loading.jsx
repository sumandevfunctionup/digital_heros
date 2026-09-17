import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Skeleton className="h-10 w-full sm:w-80 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-44 rounded-xl" />
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0F1118]/80 p-6 space-y-4">
        <TableSkeleton rows={8} cols={6} />
      </div>
    </div>
  );
}
