import SectionHeader from "@/components/common/SectionHeader";
import GroupOwnerMeta from "@/components/group/GroupOwnerMeta";
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
      <SectionHeader title="Sobre o grupo" />

      <p className="text-sm whitespace-pre-line text-muted-foreground">
        {group.description?.trim() ||
          "Este grupo ainda não possui uma descrição. Em breve você poderá adicionar mais detalhes."}
      </p>

      <GroupOwnerMeta
        ownerName={group.ownerName}
        createdAt={createdAt}
        showCreated={!!createdAt}
        className="gap-1"
      />
    </Card>
  );
}
