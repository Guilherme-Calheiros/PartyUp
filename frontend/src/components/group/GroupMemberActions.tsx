import { useState } from "react";
import { Crown, MoreVertical, ShieldCheck, ShieldMinus, UserMinus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
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
import { apiFetch, throwIfApiError } from "@/lib/api";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupMember, GroupRole } from "@/types/group";

type MemberAction = "promote" | "demote" | "kick" | "transfer";

const DIALOG_CONFIG: Record<
  MemberAction,
  {
    title: string;
    description: (name: string) => string;
    confirmLabel: string;
    destructive: boolean;
  }
> = {
  promote: {
    title: "Promover membro?",
    description: (name) => `Tornar ${name} administrador do grupo?`,
    confirmLabel: "Promover",
    destructive: false,
  },
  demote: {
    title: "Rebaixar administrador?",
    description: (name) => `Tornar ${name} membro comum do grupo?`,
    confirmLabel: "Rebaixar",
    destructive: false,
  },
  kick: {
    title: "Expulsar membro?",
    description: (name) => `Remover ${name} do grupo? Essa ação não pode ser desfeita.`,
    confirmLabel: "Expulsar",
    destructive: true,
  },
  transfer: {
    title: "Transferir propriedade?",
    description: (name) =>
      `Transferir a propriedade do grupo para ${name}? Você passará a ser membro.`,
    confirmLabel: "Transferir",
    destructive: true,
  },
};

const ERROR_MESSAGES: Record<MemberAction, string> = {
  promote: "Não foi possível promover o membro.",
  demote: "Não foi possível rebaixar o administrador.",
  kick: "Não foi possível expulsar o membro.",
  transfer: "Não foi possível transferir a propriedade.",
};

type GroupMemberActionsProps = {
  groupId: string;
  member: GroupMember;
  viewerId?: string;
  viewerRole: GroupRole;
};

export default function GroupMemberActions({
  groupId,
  member,
  viewerId,
  viewerRole,
}: GroupMemberActionsProps) {
  const [pendingAction, setPendingAction] = useState<MemberAction | null>(null);
  const queryClient = useQueryClient();

  const actionMutation = useMutation({
    mutationFn: async (action: MemberAction) => {
      let response: Response;

      if (action === "promote" || action === "demote") {
        response = await apiFetch(`/groups/${groupId}/members/${member.userId}/role`, {
          method: "PATCH",
          body: JSON.stringify({
            newRole: action === "promote" ? "Admin" : "Member",
          }),
        });
      } else if (action === "kick") {
        response = await apiFetch(`/groups/${groupId}/members/${member.userId}/kick`, {
          method: "POST",
        });
      } else {
        response = await apiFetch(`/groups/${groupId}/transfer-ownership`, {
          method: "PATCH",
          body: JSON.stringify({ newOwnerId: member.userId }),
        });
      }

      await throwIfApiError(response, ERROR_MESSAGES[action]);
    },
    onSuccess: async () => {
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
    onError: (error) => {
      console.error("Erro ao executar ação do membro:", error);
    },
  });

  const isSelf = member.userId === viewerId;
  const canChangeRole = viewerRole === "Owner";
  const canTransfer = viewerRole === "Owner";
  const canKick = viewerRole === "Owner" || (viewerRole === "Admin" && member.role === "Member");

  const hasActions = canChangeRole || canTransfer || canKick;

  if (!viewerId || isSelf || viewerRole === "Member" || !hasActions) {
    return null;
  }

  const dialog = pendingAction ? DIALOG_CONFIG[pendingAction] : null;
  const isPending = actionMutation.isPending;
  const actionError = actionMutation.error?.message ?? null;

  function handleConfirm() {
    if (pendingAction) {
      actionMutation.mutate(pendingAction);
    }
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open && !isPending) {
      actionMutation.reset();
      setPendingAction(null);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label={`Ações de ${member.userName}`} />
          }
        >
          <MoreVertical aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-52">
          {canChangeRole && member.role === "Member" && (
            <DropdownMenuItem onClick={() => setPendingAction("promote")}>
              <ShieldCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              Promover a administrador
            </DropdownMenuItem>
          )}

          {canChangeRole && member.role === "Admin" && (
            <DropdownMenuItem onClick={() => setPendingAction("demote")}>
              <ShieldMinus className="mr-2 h-4 w-4" aria-hidden="true" />
              Rebaixar para membro
            </DropdownMenuItem>
          )}

          {canTransfer && (
            <DropdownMenuItem onClick={() => setPendingAction("transfer")}>
              <Crown className="mr-2 h-4 w-4" aria-hidden="true" />
              Transferir propriedade
            </DropdownMenuItem>
          )}

          {(canChangeRole || canTransfer) && canKick && <DropdownMenuSeparator />}

          {canKick && (
            <DropdownMenuItem variant="destructive" onClick={() => setPendingAction("kick")}>
              <UserMinus className="mr-2 h-4 w-4" aria-hidden="true" />
              Expulsar do grupo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pendingAction !== null} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog?.title}</DialogTitle>
            <DialogDescription>{dialog?.description(member.userName)}</DialogDescription>
          </DialogHeader>

          {actionError && <p className="text-sm text-destructive">{actionError}</p>}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>
              Cancelar
            </DialogClose>
            <Button
              variant={dialog?.destructive ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? "Processando..." : dialog?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
