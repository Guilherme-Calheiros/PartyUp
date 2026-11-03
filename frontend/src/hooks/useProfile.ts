import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { profileKeys } from "@/lib/queryKeys";
import type { User } from "@/types/user";

async function fetchProfile(): Promise<User | null> {
  const response = await apiFetch("/profile/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar o perfil.");
  }

  return response.json();
}

export const profileQueryOptions = queryOptions({
  queryKey: profileKeys.me,
  queryFn: fetchProfile,
});

export function useProfileQuery() {
  return useQuery(profileQueryOptions);
}

export type UpdateProfilePayload = {
  userName: string;
  avatarSeed: string;
  profilePictureUrl: string | null;
};

async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await apiFetch("/profile/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  await throwIfApiError(response, "Não foi possível salvar as alterações.");

  return response.json();
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(profileKeys.me, updatedUser);
    },
  });
}
