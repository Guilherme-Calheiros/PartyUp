import { useState } from "react";
import { Check, Gamepad2, Loader2, Plus, Save, Search, X } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  useAddGroupGamesMutation,
  useGroupGamesQuery,
  useRemoveGroupGameMutation,
} from "@/hooks/useGroupGames";
import { useSearchGamesQuery } from "@/hooks/useSearchGamesQuery";
import { cn } from "@/lib/utils";
import type { GameSearchResult } from "@/types/game";

const MIN_SEARCH_LENGTH = 4;

type GroupGamesTabProps = {
  groupId: string;
};

function GroupGamesSkeleton() {
  return (
    <Card className="px-5 py-5 sm:px-6" role="status" aria-busy="true">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index}>
            <GamePosterSkeleton variant="grid" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Carregando jogos do grupo</span>
    </Card>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-1" role="status" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <GamePosterSkeleton key={index} variant="search" />
      ))}

      <span className="sr-only">Pesquisando jogos</span>
    </div>
  );
}

export default function GroupGamesTab({ groupId }: GroupGamesTabProps) {
  const [search, setSearch] = useState("");
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [pendingGames, setPendingGames] = useState<GameSearchResult[]>([]);

  const { data: groupGames, isLoading, isError, error, refetch } = useGroupGamesQuery(groupId);

  const addGamesMutation = useAddGroupGamesMutation(groupId);
  const removeGameMutation = useRemoveGroupGameMutation(groupId);

  const {
    data: games,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useSearchGamesQuery(search);

  const trimmedSearch = search.trim();
  const canSearch = trimmedSearch.length >= MIN_SEARCH_LENGTH;
  const savedGames = groupGames ?? [];
  const savedIgdbIds = new Set(savedGames.map((game) => game.igdbId));
  const pendingIds = new Set(pendingGames.map((game) => game.id));

  function handleOpenAddGame() {
    addGamesMutation.reset();
    setSearch("");
    setPendingGames([]);
    setIsAddGameOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    if (!open && addGamesMutation.isPending) {
      return;
    }

    setIsAddGameOpen(open);

    if (!open) {
      setSearch("");
      setPendingGames([]);
      addGamesMutation.reset();
    }
  }

  function handleTogglePendingGame(game: GameSearchResult) {
    setPendingGames((current) =>
      current.some((item) => item.id === game.id)
        ? current.filter((item) => item.id !== game.id)
        : [...current, game],
    );
  }

  function handleSaveGames() {
    if (pendingGames.length === 0) {
      return;
    }

    addGamesMutation.mutate(pendingGames, {
      onSuccess: () => {
        setIsAddGameOpen(false);
        setSearch("");
        setPendingGames([]);
      },
    });
  }

  function handleRemoveGame(gameId: string) {
    removeGameMutation.mutate(gameId);
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Jogos do Grupo"
        action={
          <Button onClick={handleOpenAddGame} aria-label="Adicionar jogo">
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">Adicionar jogo</span>
          </Button>
        }
      />

      {isLoading ? (
        <GroupGamesSkeleton />
      ) : isError ? (
        <ErrorState
          title="Não foi possível carregar os jogos"
          message={
            error instanceof Error ? error.message : "Não foi possível carregar os jogos do grupo."
          }
          onRetry={refetch}
        />
      ) : savedGames.length === 0 ? (
        <EmptyState
          icon={Gamepad2}
          title="Nenhum jogo adicionado"
          description="Adicione jogos para mostrar o que o grupo curte jogar."
          action={
            <Button variant="outline" onClick={handleOpenAddGame}>
              <Plus aria-hidden="true" />
              Adicionar jogo
            </Button>
          }
        />
      ) : (
        <Card className="px-5 py-5 sm:px-6">
          {removeGameMutation.isError && (
            <p className="mb-4 text-sm text-destructive">{removeGameMutation.error.message}</p>
          )}

          <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {savedGames.map((game) => {
              const isRemoving =
                removeGameMutation.isPending && removeGameMutation.variables === game.id;

              return (
                <li key={game.id} className="group">
                  <GamePoster game={game} size="fill">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleRemoveGame(game.id)}
                      disabled={removeGameMutation.isPending}
                      aria-label={`Remover ${game.name} do grupo`}
                      title={`Remover ${game.name} do grupo`}
                      className={cn(
                        "absolute top-1.5 right-1.5 rounded-full bg-background/90 shadow-sm backdrop-blur-sm transition-opacity",
                        "focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
                      )}
                    >
                      {isRemoving ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        <X aria-hidden="true" />
                      )}
                    </Button>
                  </GamePoster>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <Dialog open={isAddGameOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar jogos</DialogTitle>
            <DialogDescription>
              Pesquise e selecione os jogos. Eles só serão salvos no grupo ao clicar em “Salvar
              jogos”.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar jogos..."
              aria-label="Pesquisar jogos"
              className="pl-8"
              autoFocus
            />
          </div>

          {pendingGames.length > 0 && (
            <Carousel
              opts={{ align: "start" }}
              className="flex w-full min-w-0 flex-col gap-2"
              aria-label="Jogos selecionados"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  Selecionados
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
                    {pendingGames.length}
                  </span>
                </p>

                <div className="flex shrink-0 items-center gap-1">
                  <CarouselPrevious className="static translate-x-0 translate-y-0" />
                  <CarouselNext className="static translate-x-0 translate-y-0" />

                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setPendingGames([])}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <CarouselContent className="-ml-2">
                {pendingGames.map((game) => (
                  <CarouselItem key={game.id} className="basis-auto pl-2">
                    <GamePoster game={game} size="xs" rounded="md" caption="xs">
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        aria-label={`Remover ${game.name} da seleção`}
                        title={`Remover ${game.name} da seleção`}
                        onClick={() => handleTogglePendingGame(game)}
                        className="absolute top-1 right-1 rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
                      >
                        <X aria-hidden="true" />
                      </Button>
                    </GamePoster>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {!canSearch ? (
              <p className="px-2 py-10 text-center text-sm text-muted-foreground">
                Digite pelo menos {MIN_SEARCH_LENGTH} caracteres para pesquisar.
              </p>
            ) : isSearchLoading ? (
              <SearchResultsSkeleton />
            ) : isSearchError ? (
              <div className="flex flex-col items-center gap-3 px-2 py-10 text-center">
                <p className="text-sm text-destructive">Erro ao pesquisar jogos.</p>
                <Button variant="outline" size="sm" onClick={() => refetchSearch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : !games || games.length === 0 ? (
              <p className="px-2 py-10 text-center text-sm text-muted-foreground">
                Nenhum jogo encontrado.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {games.map((game) => {
                  const isInGroup = savedIgdbIds.has(game.id);
                  const isSelected = pendingIds.has(game.id);
                  const platforms = game.platforms?.map((platform) => platform.name).join(", ");

                  return (
                    <li
                      key={game.id}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                    >
                      <GamePoster game={game} size="thumb" rounded="md" caption="none" />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{game.name}</p>
                        {platforms && (
                          <p className="truncate text-xs text-muted-foreground">{platforms}</p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={isInGroup || isSelected ? "secondary" : "default"}
                        disabled={isInGroup}
                        onClick={() => handleTogglePendingGame(game)}
                      >
                        {isInGroup ? (
                          <>
                            <Check aria-hidden="true" />
                            No grupo
                          </>
                        ) : isSelected ? (
                          <>
                            <X aria-hidden="true" />
                            Remover
                          </>
                        ) : (
                          <>
                            <Plus aria-hidden="true" />
                            Adicionar
                          </>
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {addGamesMutation.isError && (
            <p className="text-sm text-destructive">{addGamesMutation.error.message}</p>
          )}

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" disabled={addGamesMutation.isPending} />}
            >
              Cancelar
            </DialogClose>

            <Button
              onClick={handleSaveGames}
              disabled={pendingGames.length === 0 || addGamesMutation.isPending}
            >
              {addGamesMutation.isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Save aria-hidden="true" />
              )}
              {addGamesMutation.isPending ? "Salvando..." : "Salvar jogos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
