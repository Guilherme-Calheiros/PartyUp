import SectionHeader from "@/components/common/SectionHeader";
import GroupGameRouletteSection from "@/components/group/GroupGameRouletteSection";
import GroupGamesSection from "@/components/group/GroupGamesSection";
import GroupMembersPreviewCard from "@/components/group/GroupMembersPreviewCard";
import GroupOwnerMeta from "@/components/group/GroupOwnerMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/date";
import type { GroupDetail } from "@/types/group";
import GroupScheduleSection from "./GroupScheduleSection";

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <GroupGameRouletteSection groupId={group.id} />

          <GroupScheduleSection />
        </div>

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
