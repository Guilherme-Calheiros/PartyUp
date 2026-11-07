import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupDetail } from "@/types/group";

export type CreateGroupPayload = {
  name: string;
  description: string | null;
  iconKey: string;
  colorKey: string;
  groupPictureUrl: string | null;
};

async function createGroup(payload: CreateGroupPayload): Promise<GroupDetail> {
  const response = await apiFetch("/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  await throwIfApiError(response, "Não foi possível criar o grupo.");

  return response.json();
}

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
}

export type UpdateGroupPayload = {
  name: string;
  description: string;
  iconKey: string;
  colorKey: string;
};

export type UpdatedGroup = Pick<
  GroupDetail,
  "id" | "name" | "description" | "iconKey" | "colorKey" | "groupPictureUrl"
>;

async function updateGroup(groupId: string, payload: UpdateGroupPayload): Promise<UpdatedGroup> {
  const response = await apiFetch(`/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  await throwIfApiError(response, "Não foi possível salvar as alterações.");

  return response.json();
}

export function useUpdateGroupMutation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateGroupPayload) => updateGroup(groupId, payload),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData<GroupDetail>(groupKeys.detail(groupId), (current) =>
        current ? { ...current, ...updatedGroup } : current,
      );
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
    },
  });
}
