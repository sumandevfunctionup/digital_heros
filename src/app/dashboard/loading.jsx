import { DashboardOverviewSkeleton } from "@/components/ui/SkeletonLoaders";

export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <DashboardOverviewSkeleton />
    </div>
  );
}
