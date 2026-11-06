import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import StateCard from "@/components/common/StateCard";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <StateCard icon={icon} title={title} description={description} className={className}>
      {action}
    </StateCard>
  );
}
