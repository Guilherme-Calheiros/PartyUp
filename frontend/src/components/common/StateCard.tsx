import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StateTone = "default" | "muted" | "destructive";

const TONE_STYLES: Record<StateTone, { bubble: string; icon: string }> = {
  default: {
    bubble: "size-14 rounded-2xl bg-primary/10 text-primary",
    icon: "size-7",
  },
  muted: {
    bubble: "size-14 rounded-2xl bg-muted text-muted-foreground",
    icon: "size-7",
  },
  destructive: {
    bubble: "size-12 rounded-full bg-destructive/10 text-destructive",
    icon: "size-6",
  },
};

type StateCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: StateTone;
  role?: "alert" | "status";
  className?: string;
  children?: ReactNode;
};

export default function StateCard({
  icon: Icon,
  title,
  description,
  tone = "default",
  role,
  className,
  children,
}: StateCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <Card className={cn("items-center gap-4 px-6 py-12 text-center", className)} role={role}>
      <span className={cn("flex items-center justify-center", styles.bubble)}>
        <Icon className={styles.icon} aria-hidden="true" />
      </span>

      <div className="max-w-md">
        <p className="font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>

      {children}
    </Card>
  );
}
