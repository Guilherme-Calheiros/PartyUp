import { Link, useNavigate, useParams } from "react-router";
import { CalendarDays, Crown, Link2Off, LogIn, Users, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import GroupAvatar from "@/components/GroupAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch, throwIfApiError } from "@/lib/api";
import { formatLongDate } from "@/lib/date";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupInvite, JoinGroupResponse } from "@/types/group";

function InviteSkeleton() {
  return (
    <Card className="items-center gap-4 px-5 py-10" role="status" aria-busy="true">
      <Skeleton className="size-24 rounded-3xl" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />

      <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>

      <span className="sr-only">Carregando convite</span>
    </Card>
  );
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: invite,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: groupKeys.inviteByToken(token ?? ""),
    queryFn: async (): Promise<GroupInvite> => {
      const response = await apiFetch(`/invites/${token}`);

      await throwIfApiError(response, "Não foi possível carregar o convite.");

      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  const joinMutation = useMutation({
    mutationFn: async (): Promise<JoinGroupResponse> => {
      const response = await apiFetch(`/invites/${token}/join`, {
        method: "POST",
      });

      await throwIfApiError(response, "Não foi possível entrar no grupo.");

      return response.json();
    },
    onSuccess: async ({ groupId }) => {
      await queryClient.invalidateQueries({
        queryKey: groupKeys.all,
      });
      navigate(`/grupos/${groupId}`, { replace: true });
    },
    onError: (joinError) => {
      console.error("Erro ao entrar no grupo:", joinError);
    },
  });

  if (!token) {
    return null;
  }

  const isInviteUnavailable = error instanceof ApiError && error.status === 404;
  const isJoining = joinMutation.isPending;
  const joinError = joinMutation.error?.message ?? null;
  const createdAt = invite ? formatLongDate(invite.createdAt) : null;

  function handleJoin() {
    joinMutation.reset();
    joinMutation.mutate();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      {isLoading ? (
        <InviteSkeleton />
      ) : isInviteUnavailable ? (
        <EmptyState
          icon={Link2Off}
          title="Convite indisponível"
          description="Este convite é inválido ou não existe mais. Peça um novo link a quem enviou o convite."
          action={
            <Button render={<Link to="/inicio" />}>
              <X aria-hidden="true" />
              Voltar ao início
            </Button>
          }
        />
      ) : error ? (
        <ErrorState
          title="Não foi possível carregar o convite"
          message={error instanceof Error ? error.message : "Não foi possível carregar o convite."}
          onRetry={refetch}
        >
          <Button variant="outline" render={<Link to="/inicio" />}>
            <X aria-hidden="true" />
            Voltar ao início
          </Button>
        </ErrorState>
      ) : invite ? (
        <Card className="gap-0 overflow-hidden py-0">
          <div className="flex flex-col items-center gap-4 px-5 py-8 text-center sm:px-8">
            <GroupAvatar
              iconKey={invite.iconKey}
              colorKey={invite.colorKey}
              imageUrl={invite.groupPictureUrl}
              size={96}
              alt=""
            />

            <div className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Convite para o grupo
              </p>
              <h1 className="font-heading text-2xl font-bold tracking-tight break-words">
                {invite.name}
              </h1>
              {invite.description?.trim() && (
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                  {invite.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" aria-hidden="true" />
                {invite.membersCount} {invite.membersCount === 1 ? "membro" : "membros"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Crown className="size-3.5" aria-hidden="true" />
                Dono: <span className="font-medium text-foreground">{invite.ownerUserName}</span>
              </span>

              {createdAt && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Criado em {createdAt}
                </span>
              )}
            </div>

            {joinError && <p className="text-sm text-destructive">{joinError}</p>}

            <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
              <Button className="flex-1" onClick={handleJoin} disabled={isJoining}>
                <LogIn aria-hidden="true" />
                {isJoining ? "Entrando..." : "Entrar no grupo"}
              </Button>

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/inicio")}
                disabled={isJoining}
              >
                <X aria-hidden="true" />
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
