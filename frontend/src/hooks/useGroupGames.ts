import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch, throwIfApiError } from "@/lib/api";
import { getIgdbCoverUrl } from "@/lib/games";
import { groupKeys } from "@/lib/queryKeys";
import type { GameSearchResult } from "@/types/game";
import type { GroupGame } from "@/types/group";

const MAX_GAMES_PER_REQUEST = 15;

type AddGroupGamesPayload = {
  id: number;
  name: string;
  cover: { image_id: string } | null;
};

type GroupGameResponse = {
  id: string;
  igdbId: number;
  name: string;
  coverImageId: string | null;
};

function toAddGamePayload(game: GameSearchResult): AddGroupGamesPayload {
  return {
    id: game.id,
    name: game.name,
    cover: game.coverImageId ? { image_id: game.coverImageId } : null,
  };
}

function toGroupGame(game: GroupGameResponse): GroupGame {
  return {
    ...game,
    coverUrl: getIgdbCoverUrl(game.coverImageId),
  };
}

async function addGroupGames(groupId: string, games: GameSearchResult[]) {
  const uniqueGames = Array.from(new Map(games.map((game) => [game.id, game])).values());

  for (let index = 0; index < uniqueGames.length; index += MAX_GAMES_PER_REQUEST) {
    const batch = uniqueGames.slice(index, index + MAX_GAMES_PER_REQUEST);

    const response = await apiFetch(`/groups/${groupId}/games`, {
      method: "POST",
      body: JSON.stringify(batch.map(toAddGamePayload)),
    });

    await throwIfApiError(response, "Não foi possível adicionar os jogos ao grupo.");
  }
}

async function removeGroupGame(groupId: string, gameId: string) {
  const response = await apiFetch(`/groups/${groupId}/games/${gameId}`, {
    method: "DELETE",
  });

  await throwIfApiError(response, "Não foi possível remover o jogo do grupo.");
}

export function useGroupGamesQuery(groupId: string) {
  return useQuery({
    queryKey: groupKeys.games(groupId),
    queryFn: async (): Promise<GroupGame[]> => {
      const response = await apiFetch(`/groups/${groupId}/games`);

      await throwIfApiError(response, "Não foi possível carregar os jogos do grupo.");

      const games = (await response.json()) as GroupGameResponse[];

      return games.map(toGroupGame);
    },
    enabled: !!groupId,
  });
}

export function useAddGroupGamesMutation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (games: GameSearchResult[]) => addGroupGames(groupId, games),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.games(groupId) });
    },
  });
}

export function useRemoveGroupGameMutation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => removeGroupGame(groupId, gameId),
    onMutate: async (gameId) => {
      await queryClient.cancelQueries({ queryKey: groupKeys.games(groupId) });

      const previousGames = queryClient.getQueryData<GroupGame[]>(groupKeys.games(groupId));

      queryClient.setQueryData<GroupGame[]>(groupKeys.games(groupId), (current) =>
        current?.filter((game) => game.id !== gameId),
      );

      return { previousGames };
    },
    onError: (_error, _gameId, context) => {
      if (context?.previousGames) {
        queryClient.setQueryData(groupKeys.games(groupId), context.previousGames);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.games(groupId) });
    },
  });
}
