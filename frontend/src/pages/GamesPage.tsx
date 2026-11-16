import { useState } from "react";
import { Gamepad2, Search, X } from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import NoResultsState from "@/components/common/NoResultsState";
import SectionHeader from "@/components/common/SectionHeader";
import GamePoster from "@/components/game/GamePoster";
import GamePosterSkeleton from "@/components/game/GamePosterSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchGamesQuery } from "@/hooks/useSearchGamesQuery";
import { useTrendingGamesQuery } from "@/hooks/useTrendingGamesQuery";
import type { GameSearchResult } from "@/types/game";

const MIN_SEARCH_LENGTH = 4;
const SEARCH_PAGE_SIZE = 50;

function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      role="status"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <GamePosterSkeleton key={index} variant="grid" />
      ))}

      <span className="sr-only">Carregando jogos</span>
    </div>
  );
}

type GameGridProps = {
  games: GameSearchResult[];
};

function GameGrid({ games }: GameGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {games.map((game) => (
        <li key={game.id}>
          <GamePoster game={game} size="fill" />
        </li>
      ))}
    </ul>
  );
}

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const trimmedSearch = search.trim();
  const hasActiveSearch = trimmedSearch.length >= MIN_SEARCH_LENGTH;
  const hasPartialSearch = trimmedSearch.length > 0 && !hasActiveSearch;

  const trendingQuery = useTrendingGamesQuery();
  const searchQuery = useSearchGamesQuery(search, SEARCH_PAGE_SIZE);

  function clearSearch() {
    setSearch("");
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Jogos</h1>
          <p className="text-sm text-muted-foreground">
            Descubra o que está em alta e explore o catálogo de jogos.
          </p>
        </div>

        <div className="flex max-w-xl flex-col gap-2">
          <div className="relative" role="search">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar jogos no catálogo..."
              aria-label="Pesquisar jogos no catálogo"
              className="h-10 pr-10 pl-9"
            />

            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={clearSearch}
                aria-label="Limpar busca"
                className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X aria-hidden="true" />
              </Button>
            )}
          </div>

          {hasPartialSearch && (
            <p className="text-xs text-muted-foreground">
              Digite pelo menos {MIN_SEARCH_LENGTH} caracteres para pesquisar.
            </p>
          )}
        </div>
      </div>

      {hasActiveSearch ? (
        <section className="flex flex-col gap-4">
          <SectionHeader
            title={`Resultados para “${trimmedSearch}”`}
            description={
              searchQuery.data
                ? `${searchQuery.data.length} ${
                    searchQuery.data.length === 1 ? "jogo encontrado" : "jogos encontrados"
                  }`
                : "Buscando no catálogo de jogos."
            }
            action={
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Limpar busca
              </Button>
            }
          />

          {searchQuery.isPending ? (
            <GameGridSkeleton />
          ) : searchQuery.isError ? (
            <ErrorState
              title="Não foi possível pesquisar os jogos"
              message={
                searchQuery.error instanceof Error
                  ? searchQuery.error.message
                  : "Não foi possível pesquisar os jogos."
              }
              onRetry={searchQuery.refetch}
            />
          ) : !searchQuery.data || searchQuery.data.length === 0 ? (
            <NoResultsState
              title="Nenhum jogo encontrado"
              description={`Não encontramos jogos com “${trimmedSearch}”. Tente outro nome.`}
              resetLabel="Limpar busca"
              onReset={clearSearch}
            />
          ) : (
            <GameGrid games={searchQuery.data} />
          )}
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <SectionHeader title="Em alta agora" />

          {trendingQuery.isLoading ? (
            <GameGridSkeleton count={12} />
          ) : trendingQuery.isError ? (
            <ErrorState
              title="Não foi possível carregar os jogos em alta"
              message={
                trendingQuery.error instanceof Error
                  ? trendingQuery.error.message
                  : "Não foi possível carregar os jogos em alta."
              }
              onRetry={trendingQuery.refetch}
            />
          ) : !trendingQuery.data || trendingQuery.data.length === 0 ? (
            <EmptyState
              icon={Gamepad2}
              title="Nenhum jogo em alta no momento"
              description="Volte mais tarde para conferir os jogos mais populares."
            />
          ) : (
            <GameGrid games={trendingQuery.data} />
          )}
        </section>
      )}
    </div>
  );
}
