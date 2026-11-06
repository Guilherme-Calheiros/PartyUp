import { Users } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import GroupMemberActions from "@/components/group/GroupMemberActions";
import GroupMemberRow from "@/components/group/GroupMemberRow";
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

      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 py-1.5">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>

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

      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <GroupMemberRow
            key={member.userId}
            member={member}
            actions={
              <GroupMemberActions
                groupId={groupId}
                member={member}
                viewerId={user?.id}
                viewerRole={viewerRole}
              />
            }
          />
        ))}
      </ul>
    </Card>
  );
}
