import InlineError from "@/components/common/InlineError";
import SectionHeader from "@/components/common/SectionHeader";
import MemberList from "@/components/group/MemberList";
import MemberListSkeleton from "@/components/group/MemberListSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGroupMembers } from "@/hooks/useGroupMembers";

const MAX_PREVIEW_MEMBERS = 6;
const SKELETON_ITEMS = 3;

type GroupMembersPreviewCardProps = {
  groupId: string;
  onViewAllMembers: () => void;
};

export default function GroupMembersPreviewCard({
  groupId,
  onViewAllMembers,
}: GroupMembersPreviewCardProps) {
  const { data: members, isLoading, error, refetch } = useGroupMembers(groupId);

  const previewMembers = members?.slice(0, MAX_PREVIEW_MEMBERS) ?? [];
  const remainingMembers = Math.max((members?.length ?? 0) - previewMembers.length, 0);

  return (
    <Card className="gap-3 px-5 py-5 sm:px-4">
      <SectionHeader
        title="Membros"
        action={
          <Button variant="link" size="sm" onClick={onViewAllMembers}>
            Ver todos
          </Button>
        }
      />

      <div className="max-h-[328px] pr-1 lg:overflow-y-auto">
        {isLoading ? (
          <MemberListSkeleton count={SKELETON_ITEMS} />
        ) : error ? (
          <InlineError
            message={
              error instanceof Error ? error.message : "Não foi possível carregar os membros."
            }
            onRetry={refetch}
          />
        ) : previewMembers.length > 0 ? (
          <MemberList members={previewMembers} />
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum membro por aqui ainda.</p>
        )}
      </div>

      {remainingMembers > 0 && !isLoading && !error && (
        <p className="text-xs text-muted-foreground">Mais {remainingMembers}</p>
      )}
    </Card>
  );
}
