import { Plus } from "lucide-react";

import SectionHeader from "@/components/common/SectionHeader";
import GamePoster from "@/components/game/GamePoster";
import GamePosterSkeleton from "@/components/game/GamePosterSkeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGroupGamesQuery } from "@/hooks/useGroupGames";

const MAX_PREVIEW_GAMES = 10;
const SKELETON_ITEMS = 5;

type GroupGamesSectionProps = {
  groupId: string;
  onViewAllGames: () => void;
};

export default function GroupGamesSection({ groupId, onViewAllGames }: GroupGamesSectionProps) {
  const { data: games, isLoading, isError } = useGroupGamesQuery(groupId);

  const previewGames = games?.slice(0, MAX_PREVIEW_GAMES) ?? [];
  const viewAllAction = (
    <Button variant="link" size="sm" onClick={onViewAllGames}>
      Ver todos
    </Button>
  );

  return (
    <Card className="gap-4 px-5 py-5 sm:px-6">
      {isLoading ? (
        <>
          <SectionHeader title="Jogos do grupo" action={viewAllAction} />

          <div className="flex gap-3 overflow-hidden" role="status" aria-busy="true">
            {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
              <GamePosterSkeleton key={index} variant="strip" />
            ))}
            <span className="sr-only">Carregando jogos</span>
          </div>
        </>
      ) : isError ? (
        <>
          <SectionHeader title="Jogos do grupo" action={viewAllAction} />

          <p className="text-sm text-destructive">Não foi possível carregar os jogos.</p>
        </>
      ) : (
        <Carousel opts={{ align: "start" }} className="flex w-full min-w-0 flex-col gap-4">
          <SectionHeader
            title="Jogos do grupo"
            action={
              <div className="flex shrink-0 items-center gap-1">
                {viewAllAction}
                <div className="hidden items-center gap-1 sm:flex">
                  <CarouselPrevious className="static translate-x-0 translate-y-0" />
                  <CarouselNext className="static translate-x-0 translate-y-0" />
                </div>
              </div>
            }
          />

          <CarouselContent className="-ml-3 pt-1">
            <CarouselItem className="basis-auto pl-3">
              <button
                type="button"
                onClick={onViewAllGames}
                className="flex aspect-[3/4] w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:w-28"
              >
                <Plus className="size-5" aria-hidden="true" />
                <span className="px-2 text-center text-xs font-medium">Adicionar jogo</span>
              </button>
            </CarouselItem>

            {previewGames.map((game) => (
              <CarouselItem key={game.id} className="basis-auto pl-3">
                <GamePoster game={game} size="sm" />
              </CarouselItem>
            ))}

            {previewGames.length === 0 && (
              <CarouselItem className="basis-auto pl-3">
                <p className="flex h-full items-center px-2 py-6 text-sm text-muted-foreground">
                  Nenhum jogo adicionado ainda.
                </p>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      )}
    </Card>
  );
}
