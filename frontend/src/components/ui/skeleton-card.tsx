import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const SkeletonStat = ({ className }: { className?: string }) => (
  <div className={cn("p-5 rounded-2xl border bg-card space-y-2", className)}>
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-3 w-16" />
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-5 rounded-2xl border bg-card space-y-3", className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export const SkeletonList = ({ rows = 4, className }: { rows?: number; className?: string }) => (
  <div className={cn("rounded-2xl border bg-card overflow-hidden divide-y", className)}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-3.5">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn("p-5 rounded-2xl border bg-card space-y-3", className)}>
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-48 w-full rounded-xl" />
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6 pb-24 md:pb-8">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <Skeleton className="h-9 w-48 rounded-xl" />
    </div>
    <Skeleton className="h-36 w-full rounded-2xl" />
    <div className="grid grid-cols-2 gap-4">
      <SkeletonStat />
      <SkeletonStat />
    </div>
    <SkeletonList rows={5} />
  </div>
);
