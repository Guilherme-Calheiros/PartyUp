import { useQuery } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupMember } from "@/types/group";

export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: async (): Promise<GroupMember[]> => {
      const response = await apiFetch(`/groups/${groupId}/members`);

      await throwIfApiError(response, "Não foi possível carregar os membros.");

      return response.json();
    },
    enabled: !!groupId,
  });
}
