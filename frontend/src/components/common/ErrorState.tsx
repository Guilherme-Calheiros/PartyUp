import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";

import StateCard from "@/components/common/StateCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
};

export default function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  icon = AlertCircle,
  className,
  children,
}: ErrorStateProps) {
  return (
    <StateCard
      icon={icon}
      title={title}
      description={message}
      tone="destructive"
      role="alert"
      className={cn("py-10", className)}
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {children}
        <Button onClick={onRetry}>
          <RefreshCw aria-hidden="true" />
          {retryLabel}
        </Button>
      </div>
    </StateCard>
  );
}
