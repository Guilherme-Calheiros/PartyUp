import { CalendarDays, Users } from "lucide-react";

import GroupMemberRow from "@/components/group/GroupMemberRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { formatLongDate } from "@/lib/date";
import type { GroupDetail } from "@/types/group";

const MAX_PREVIEW_MEMBERS = 6;

type GroupOverviewTabProps = {
  group: GroupDetail;
  onViewAllMembers: () => void;
};

function MembersPreviewSkeleton() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-1.5">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}

      <span className="sr-only">Carregando membros</span>
    </div>
  );
}

export default function GroupOverviewTab({ group, onViewAllMembers }: GroupOverviewTabProps) {
  const createdAt = formatLongDate(group.createdAt);
  const { data: members, isLoading, error, refetch } = useGroupMembers(group.id);

  const previewMembers = members?.slice(0, MAX_PREVIEW_MEMBERS) ?? [];
  const remainingMembers = Math.max((members?.length ?? 0) - previewMembers.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-4 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-heading text-lg font-medium">Visão geral</h2>
          <p className="text-sm text-muted-foreground">Resumo do grupo.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
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

      <Card className="gap-3 px-5 py-5 sm:w-1/4 sm:min-w-64 sm:self-start sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-heading text-lg font-medium">Membros</h2>

          <Button variant="link" size="sm" onClick={onViewAllMembers}>
            Ver todos
          </Button>
        </div>

        {isLoading ? (
          <MembersPreviewSkeleton />
        ) : error ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Não foi possível carregar os membros."}
            </p>
            <Button variant="link" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        ) : previewMembers.length > 0 ? (
          <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2">
              {previewMembers.map((member) => (
                <GroupMemberRow key={member.userId} member={member} />
              ))}
            </ul>

            {remainingMembers > 0 && (
              <p className="text-xs text-muted-foreground">Mais {remainingMembers}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum membro por aqui ainda.</p>
        )}
      </Card>
    </div>
  );
}
