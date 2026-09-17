import { AnalyticsSkeleton } from "@/components/ui/SkeletonLoaders";

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <AnalyticsSkeleton />
    </div>
  );
}
