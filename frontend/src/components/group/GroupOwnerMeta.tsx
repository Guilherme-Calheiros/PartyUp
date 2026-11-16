import { CalendarDays, Crown } from "lucide-react";

import { cn } from "@/lib/utils";

type GroupOwnerMetaProps = {
  ownerName: string;
  createdAt?: string | null;
  showCreated?: boolean;
  className?: string;
};

export default function GroupOwnerMeta({
  ownerName,
  createdAt,
  showCreated = true,
  className,
}: GroupOwnerMetaProps) {
  return (
    <div
      className={cn("flex flex-col items-start gap-1.5 text-xs text-muted-foreground", className)}
    >
      <span className="inline-flex items-center gap-1.5">
        <Crown className="size-3.5" aria-hidden="true" />
        Dono: <span className="font-medium text-foreground">{ownerName}</span>
      </span>

      {showCreated && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Criado em {createdAt ?? "—"}
        </span>
      )}
    </div>
  );
}
