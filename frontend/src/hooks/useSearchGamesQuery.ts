import { useQuery } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { toGameSearchResult, type IgdbGameResponse } from "@/lib/games";
import { gameKeys } from "@/lib/queryKeys";
import type { GameSearchResult } from "@/types/game";
import { useDebounce } from "./useDebounce";

const MIN_SEARCH_LENGTH = 4;

export function useSearchGamesQuery(search: string, pageSize = 20) {
  const debouncedSearch = useDebounce(search, 400);
  const trimmedSearch = debouncedSearch.trim();

  return useQuery<GameSearchResult[]>({
    queryKey: gameKeys.search(trimmedSearch, pageSize),

    queryFn: async () => {
      const params = new URLSearchParams({
        query: trimmedSearch,
        pageSize: String(pageSize),
      });

      const response = await apiFetch(`/games/search?${params}`);

      await throwIfApiError(response, "Erro ao pesquisar jogos.");

      const games = (await response.json()) as IgdbGameResponse[];

      return games.map(toGameSearchResult);
    },

    enabled: trimmedSearch.length >= MIN_SEARCH_LENGTH,
    staleTime: 30_000,
  });
}
