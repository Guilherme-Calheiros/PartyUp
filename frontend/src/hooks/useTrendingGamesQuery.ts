import { useQuery } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { toGameSearchResult, type IgdbGameResponse } from "@/lib/games";
import { gameKeys } from "@/lib/queryKeys";
import type { GameSearchResult } from "@/types/game";

const TRENDING_PAGE_SIZE = 12;

export function useTrendingGamesQuery() {
  return useQuery<GameSearchResult[]>({
    queryKey: gameKeys.trending(),

    queryFn: async () => {
      const params = new URLSearchParams({
        pageSize: String(TRENDING_PAGE_SIZE),
      });

      const response = await apiFetch(`/games/trending?${params}`);

      await throwIfApiError(response, "Não foi possível carregar os jogos em alta.");

      const games = (await response.json()) as IgdbGameResponse[];

      return games.map(toGameSearchResult);
    },

    staleTime: 5 * 60_000,
  });
}
