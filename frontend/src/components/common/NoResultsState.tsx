import { SearchX, type LucideIcon } from "lucide-react";

import StateCard from "@/components/common/StateCard";
import { Button } from "@/components/ui/button";

type NoResultsStateProps = {
  title: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
  icon?: LucideIcon;
  className?: string;
};

export default function NoResultsState({
  title,
  description,
  onReset,
  resetLabel = "Limpar filtros",
  icon: Icon = SearchX,
  className,
}: NoResultsStateProps) {
  return (
    <StateCard
      icon={Icon}
      title={title}
      description={description}
      tone="muted"
      className={className}
    >
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </StateCard>
  );
}
