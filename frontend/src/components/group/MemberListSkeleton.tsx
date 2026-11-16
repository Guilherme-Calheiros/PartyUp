import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MemberListSkeletonProps = {
  count?: number;
  className?: string;
};

export default function MemberListSkeleton({ count = 5, className }: MemberListSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-1.5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}
