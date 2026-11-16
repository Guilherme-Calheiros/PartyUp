import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type FullPageLoaderProps = {
  label?: string;
  className?: string;
};

export default function FullPageLoader({
  label = "Carregando...",
  className,
}: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-svh w-full flex-col items-center justify-center gap-4 px-4",
        className,
      )}
      role="status"
      aria-busy="true"
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
