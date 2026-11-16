import type { GameSearchResult } from "@/types/game";

export type IgdbGameResponse = {
  id: number;
  name: string;
  cover?: {
    image_id?: string;
  };
  platforms?: {
    name: string;
  }[];
  coverUrl?: string;
};

export function getIgdbCoverUrl(imageId: string | null | undefined) {
  return imageId ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg` : null;
}

export function toGameSearchResult(game: IgdbGameResponse): GameSearchResult {
  const coverImageId = game.cover?.image_id ?? null;

  return {
    id: game.id,
    name: game.name,
    coverImageId,
    coverUrl: game.coverUrl ?? getIgdbCoverUrl(coverImageId),
    platforms: game.platforms ?? [],
  };
}
