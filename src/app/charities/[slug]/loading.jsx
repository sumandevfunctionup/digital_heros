import { CharityDetailSkeleton } from "@/components/ui/SkeletonLoaders";

export default function CharityDetailLoading() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      <CharityDetailSkeleton />
    </div>
  );
}
