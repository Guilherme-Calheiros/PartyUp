import { Skeleton } from "@/components/ui/skeleton";

type GamePosterSkeletonVariant = "grid" | "strip" | "search";

type GamePosterSkeletonProps = {
  variant?: GamePosterSkeletonVariant;
};

export default function GamePosterSkeleton({ variant = "grid" }: GamePosterSkeletonProps) {
  if (variant === "search") {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-16 w-12 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div className="w-24 shrink-0 sm:w-28">
        <Skeleton className="aspect-[3/4] w-full rounded-lg" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-[3/4] w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
