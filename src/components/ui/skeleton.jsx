import { cn } from "cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer rounded-xl bg-white/[0.06] border border-white/[0.04] animate-pulse pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
