import { CalendarDays, Crown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatLongDate } from "@/lib/date";
import type { GroupDetail } from "@/types/group";

type GroupAboutTabProps = {
  group: GroupDetail;
};

export default function GroupAboutTab({ group }: GroupAboutTabProps) {
  const createdAt = formatLongDate(group.createdAt);

  return (
    <Card className="gap-3 px-5 py-5 sm:px-6">
      <div>
        <h2 className="font-heading text-lg font-medium">Sobre o grupo</h2>
        <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
          {group.description?.trim() ||
            "Este grupo ainda não possui uma descrição. Em breve você poderá adicionar mais detalhes."}
        </p>
      </div>

      <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Crown className="size-3.5" aria-hidden="true" />
          Dono: <span className="font-medium text-foreground">{group.ownerName}</span>
        </span>

        {createdAt && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Criado em {createdAt}
          </span>
        )}
      </div>
    </Card>
  );
}
