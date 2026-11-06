import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Copy,
  Gamepad2,
  Info,
  LayoutDashboard,
  LogOut,
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import ErrorState from "@/components/common/ErrorState";
import GroupAvatar from "@/components/GroupAvatar";
import GroupAboutTab from "@/components/group/GroupAboutTab";
import GroupGamesTab from "@/components/group/GroupGamesTab";
import GroupMembersTab from "@/components/group/GroupMembersTab";
import GroupOverviewTab from "@/components/group/GroupOverviewTab";
import GroupScheduleTab from "@/components/group/GroupScheduleTab";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { ApiError, apiFetch, getApiErrorMessage, throwIfApiError } from "@/lib/api";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupDetail } from "@/types/group";

const GROUP_SECTIONS = [
  { value: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { value: "games", label: "Jogos", icon: Gamepad2 },
  { value: "schedule", label: "Agenda", icon: CalendarDays },
  { value: "members", label: "Membros", icon: Users },
  { value: "about", label: "Sobre", icon: Info },
] as const;

type GroupSection = (typeof GROUP_SECTIONS)[number]["value"];

function parseSection(value: string | null): GroupSection {
  const match = GROUP_SECTIONS.find((section) => section.value === value);
  return match?.value ?? "overview";
}

function GroupSkeleton() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-busy="true">
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-7 sm:text-left">
          <Skeleton className="size-16 shrink-0 rounded-3xl sm:size-24" />

          <div className="w-full flex-1 space-y-3 sm:w-auto">
            <Skeleton className="mx-auto h-8 w-2/3 sm:mx-0 sm:h-9 sm:w-1/2" />
            <Skeleton className="mx-auto h-4 w-1/3 sm:mx-0 sm:h-4 sm:w-1/4" />
          </div>

          <div className="flex justify-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </Card>

      <Card className="space-y-3 px-5 py-5 sm:px-6">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </Card>

      <span className="sr-only">Carregando grupo</span>
    </div>
  );
}

export default function GroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = parseSection(searchParams.get("tab"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [hasCopiedInvite, setHasCopiedInvite] = useState(false);

  const {
    data: group,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: groupKeys.detail(groupId ?? ""),
    queryFn: async (): Promise<GroupDetail> => {
      const response = await apiFetch(`/groups/${groupId}`);

      await throwIfApiError(response, "Não foi possível carregar o grupo.");

      return response.json();
    },
    enabled: !!groupId,
    retry: false,
  });

  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) {
      navigate("/grupos", { replace: true });
    }
  }, [error, navigate]);

  const {
    data: invite,
    isLoading: isInviteLoading,
    error: inviteQueryError,
    refetch: refetchInvite,
  } = useQuery({
    queryKey: groupKeys.invite(groupId ?? ""),
    queryFn: async (): Promise<{ token: string }> => {
      const response = await apiFetch(`/groups/${groupId}/invite`);

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Não foi possível gerar o link de convite."),
        );
      }

      return response.json();
    },
    enabled: !!groupId && isInviteDialogOpen,
    retry: false,
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`/groups/${groupId}/leave`, {
        method: "POST",
      });

      await throwIfApiError(response, "Não foi possivel sair do grupo.");
    },
    onSuccess: async () => {
      setIsLeaveDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: groupKeys.all,
      });
      navigate("/grupos");
    },
    onError: (error) => {
      console.error("Erro ao sair do grupo:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch(`/groups/${groupId}`, {
        method: "DELETE",
      });

      await throwIfApiError(response, "Não foi possível excluir o grupo.");
    },
    onSuccess: async () => {
      setIsDeleteDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: groupKeys.all,
      });
      navigate("/grupos");
    },
    onError: (error) => {
      console.error("Erro ao excluir o grupo:", error);
    },
  });

  if (!groupId) {
    return null;
  }

  const isGroupUnavailable = error instanceof ApiError && error.status === 404;
  const canEdit = group?.userRole === "Owner" || group?.userRole === "Admin";
  const canDelete = group?.userRole === "Owner";
  const isLeaving = leaveMutation.isPending;
  const leaveError = leaveMutation.error?.message ?? null;
  const isDeleting = deleteMutation.isPending;
  const deleteError = deleteMutation.error?.message ?? null;
  const inviteLink = invite?.token
    ? `${window.location.origin}/grupos/convite/${invite.token}`
    : "";
  const inviteError = inviteQueryError?.message ?? null;

  function handleSectionChange(value: string) {
    const section = parseSection(value);

    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous);

        if (section === "overview") {
          params.delete("tab");
        } else {
          params.set("tab", section);
        }

        return params;
      },
      { replace: true },
    );
  }

  function handleInvite() {
    setHasCopiedInvite(false);
    setIsInviteDialogOpen(true);
  }

  async function handleCopyInvite() {
    if (!inviteLink) {
      return;
    }

    await navigator.clipboard.writeText(inviteLink);
    setHasCopiedInvite(true);
  }

  function handleLeave() {
    leaveMutation.reset();
    setIsLeaveDialogOpen(true);
  }

  function handleConfirmLeave() {
    leaveMutation.mutate();
  }

  function handleEdit() {
    console.log("Editar grupo", groupId);
  }

  function handleDelete() {
    deleteMutation.reset();
    setIsDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    deleteMutation.mutate();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Button variant="ghost" size="sm" className="self-start" render={<Link to="/grupos" />}>
        <ArrowLeft aria-hidden="true" />
        Voltar para meus grupos
      </Button>

      {isLoading || isGroupUnavailable ? (
        <GroupSkeleton />
      ) : error ? (
        <ErrorState
          title="Não foi possível carregar o grupo"
          message={error instanceof Error ? error.message : "Não foi possível carregar o grupo."}
          onRetry={refetch}
        >
          <Button variant="outline" render={<Link to="/grupos" />}>
            <ArrowLeft aria-hidden="true" />
            Voltar para meus grupos
          </Button>
        </ErrorState>
      ) : group ? (
        <Tabs value={activeSection} onValueChange={handleSectionChange}>
          <Card className="gap-0 overflow-hidden py-0">
            <div className="flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-7 sm:text-left">
              <GroupAvatar
                iconKey={group.iconKey}
                colorKey={group.colorKey}
                imageUrl={group.groupPictureUrl}
                size={64}
                className="sm:hidden"
              />
              <GroupAvatar
                iconKey={group.iconKey}
                colorKey={group.colorKey}
                imageUrl={group.groupPictureUrl}
                size={96}
                className="hidden sm:flex"
              />

              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-2xl font-bold tracking-tight break-words sm:text-4xl">
                  {group.name}
                </h1>

                <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                  <Users className="size-4" aria-hidden="true" />
                  {group.memberCount} {group.memberCount === 1 ? "membro" : "membros"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 sm:ml-auto">
                <Button onClick={handleInvite}>
                  <UserPlus aria-hidden="true" />
                  Convidar
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon" aria-label="Ações do grupo" />}
                  >
                    <MoreVertical aria-hidden="true" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" sideOffset={8} className="w-48">
                    {canEdit && (
                      <DropdownMenuItem onClick={handleEdit}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Editar grupo
                      </DropdownMenuItem>
                    )}

                    {canDelete && (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isDeleting ? "Excluindo..." : "Excluir grupo"}
                      </DropdownMenuItem>
                    )}

                    {(canEdit || canDelete) && <DropdownMenuSeparator />}

                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleLeave}
                      disabled={isLeaving}
                    >
                      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                      {isLeaving ? "Saindo..." : "Sair do grupo"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsList className="border-t border-border px-1 sm:px-4">
              {GROUP_SECTIONS.map((section) => {
                const Icon = section.icon;

                return (
                  <TabsTab
                    key={section.value}
                    value={section.value}
                    aria-label={section.label}
                    className="flex-1 px-2 sm:flex-none sm:px-4"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{section.label}</span>
                  </TabsTab>
                );
              })}
            </TabsList>
          </Card>

          <TabsPanel value="overview">
            <GroupOverviewTab
              group={group}
              onViewAllMembers={() => handleSectionChange("members")}
            />
          </TabsPanel>

          <TabsPanel value="games">
            <GroupGamesTab />
          </TabsPanel>

          <TabsPanel value="schedule">
            <GroupScheduleTab />
          </TabsPanel>

          <TabsPanel value="members">
            <GroupMembersTab groupId={group.id} viewerRole={group.userRole} />
          </TabsPanel>

          <TabsPanel value="about">
            <GroupAboutTab group={group} />
          </TabsPanel>
        </Tabs>
      ) : null}

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar para o grupo</DialogTitle>
            <DialogDescription>
              Compartilhe o link abaixo para convidar alguém para {group?.name ?? "este grupo"}.
            </DialogDescription>
          </DialogHeader>

          {isInviteLoading ? (
            <div className="flex flex-col gap-2" role="status" aria-busy="true">
              <Skeleton className="h-8 w-full" />
              <span className="sr-only">Gerando link de convite</span>
            </div>
          ) : inviteError ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-destructive">{inviteError}</p>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => refetchInvite()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteLink}
                aria-label="Link de convite"
                onFocus={(event) => event.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={hasCopiedInvite ? "Link copiado" : "Copiar link"}
                onClick={handleCopyInvite}
              >
                {hasCopiedInvite ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              </Button>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Fechar</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sair do grupo?</DialogTitle>
            <DialogDescription>
              Você deixará de participar de {group?.name ?? "este grupo"}. Para voltar, precisará de
              um novo convite.
            </DialogDescription>
          </DialogHeader>

          {leaveError && <p className="text-sm text-destructive">{leaveError}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isLeaving} />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmLeave} disabled={isLeaving}>
              <LogOut aria-hidden="true" />
              {isLeaving ? "Saindo..." : "Sair do grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir grupo?</DialogTitle>
            <DialogDescription>
              Essa ação é permanente e não pode ser desfeita. Todos os dados de{" "}
              {group?.name ?? "este grupo"} serão removidos.
            </DialogDescription>
          </DialogHeader>

          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isDeleting} />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              <Trash2 aria-hidden="true" />
              {isDeleting ? "Excluindo..." : "Excluir grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
