import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InlineErrorProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export default function InlineError({
  message,
  onRetry,
  retryLabel = "Tentar novamente",
  className,
}: InlineErrorProps) {
  return (
    <div role="alert" className={cn("flex flex-wrap items-center gap-2", className)}>
      <p className="text-sm text-destructive">{message}</p>

      {onRetry && (
        <Button variant="link" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
