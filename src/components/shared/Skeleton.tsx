"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-stone-200 ${className}`}
    />
  );
}

export function MealCardSkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

export function WeekDaySkeleton() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white flex flex-col min-h-[180px]">
      <div className="px-2 py-1.5 text-center border-b border-stone-100">
        <Skeleton className="h-3 w-8 mx-auto" />
      </div>
      <div className="flex-1 p-1.5 space-y-1">
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function WeekPlannerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <WeekDaySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DailyPlannerSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
