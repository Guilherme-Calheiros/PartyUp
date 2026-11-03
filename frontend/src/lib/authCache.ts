import type { QueryClient } from "@tanstack/react-query";

import { profileKeys } from "@/lib/queryKeys";

export function clearPrivateQueries(client: QueryClient) {
  const profileQuery = client.getQueryCache().find({
    queryKey: profileKeys.me,
    exact: true,
  });

  client.removeQueries({
    predicate: (query) => query !== profileQuery,
  });

  client.setQueryData(profileKeys.me, null);
}

export function clearSettledMutations(client: QueryClient) {
  const mutationCache = client.getMutationCache();

  mutationCache.getAll().forEach((mutation) => {
    if (mutation.state.status !== "pending") {
      mutationCache.remove(mutation);
    }
  });
}
