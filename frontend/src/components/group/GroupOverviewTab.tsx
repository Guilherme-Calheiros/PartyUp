import { CalendarDays, Users } from "lucide-react";

import SectionHeader from "@/components/common/SectionHeader";
import GroupGamesSection from "@/components/group/GroupGamesSection";
import GroupMembersPreviewCard from "@/components/group/GroupMembersPreviewCard";
import GroupOwnerMeta from "@/components/group/GroupOwnerMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/date";
import type { GroupDetail } from "@/types/group";

type GroupOverviewTabProps = {
  group: GroupDetail;
  onViewAllMembers: () => void;
  onViewAllGames: () => void;
  onViewMoreAbout: () => void;
};

export default function GroupOverviewTab({
  group,
  onViewAllMembers,
  onViewAllGames,
  onViewMoreAbout,
}: GroupOverviewTabProps) {
  const createdAt = formatShortDate(group.createdAt);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:items-start">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-3">
        <Card className="gap-4 px-5 py-5 sm:px-6">
          <SectionHeader title="Visão geral" description="Resumo do grupo." />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden="true" />
                Membros
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{group.memberCount}</p>
            </div>

            <div className="rounded-lg border border-border px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Criado em
              </p>
              <p className="mt-1 text-sm font-medium">{createdAt ?? "—"}</p>
            </div>
          </div>
        </Card>

        <GroupGamesSection groupId={group.id} onViewAllGames={onViewAllGames} />
      </div>

      <div className="flex min-w-0 flex-col gap-6 lg:col-span-1">
        <GroupMembersPreviewCard groupId={group.id} onViewAllMembers={onViewAllMembers} />

        <Card className="gap-3 px-5 py-5 sm:px-4">
          <SectionHeader title="Sobre o grupo" />

          <p className="line-clamp-4 text-sm whitespace-pre-line text-muted-foreground">
            {group.description?.trim() || "Este grupo ainda não possui uma descrição."}
          </p>

          <GroupOwnerMeta ownerName={group.ownerName} createdAt={createdAt} />

          <Button variant="link" size="sm" className="self-start px-0" onClick={onViewMoreAbout}>
            Ver mais
          </Button>
        </Card>
      </div>
    </div>
  );
}
