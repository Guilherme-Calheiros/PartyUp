import { Users } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import GroupMemberActions from "@/components/group/GroupMemberActions";
import MemberList from "@/components/group/MemberList";
import MemberListSkeleton from "@/components/group/MemberListSkeleton";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import type { GroupRole } from "@/types/group";

type GroupMembersTabProps = {
  groupId: string;
  viewerRole: GroupRole;
};

function MembersSkeleton() {
  return (
    <Card className="gap-4 px-5 py-5 sm:px-6" role="status" aria-busy="true">
      <Skeleton className="h-5 w-28" />
      <MemberListSkeleton count={5} />
      <span className="sr-only">Carregando membros</span>
    </Card>
  );
}

export default function GroupMembersTab({ groupId, viewerRole }: GroupMembersTabProps) {
  const { user } = useAuth();
  const { data: members, isLoading, error, refetch } = useGroupMembers(groupId);

  if (isLoading) {
    return <MembersSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Não foi possível carregar os membros"
        message={error instanceof Error ? error.message : "Não foi possível carregar os membros."}
        onRetry={refetch}
      />
    );
  }

  if (!members || members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum membro por aqui"
        description="Os membros do grupo aparecerão nesta seção."
      />
    );
  }

  return (
    <Card className="gap-4 px-5 py-5 sm:px-6">
      <h2 className="font-heading text-lg font-medium">Membros</h2>

      <MemberList
        members={members}
        renderActions={(member) => (
          <GroupMemberActions
            groupId={groupId}
            member={member}
            viewerId={user?.id}
            viewerRole={viewerRole}
          />
        )}
      />
    </Card>
  );
}
