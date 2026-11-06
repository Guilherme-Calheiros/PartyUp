import { useCallback, useEffect } from "react";
import { NavLink, useSearchParams } from "react-router";
import { ChevronRight, Plus, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import FilterBar from "@/components/common/FilterBar";
import NoResultsState from "@/components/common/NoResultsState";
import Pagination from "@/components/common/Pagination";
import GroupAvatar from "@/components/GroupAvatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, getApiErrorMessage } from "@/lib/api";
import { getPageFromParams } from "@/lib/pagination";
import { groupKeys } from "@/lib/queryKeys";
import type { GroupRole, GroupSummary, PagedGroups } from "@/types/group";

const PAGE_SIZE = 9;

type RoleFilter = "all" | GroupRole;

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "Owner", label: "Meus" },
  { value: "Admin", label: "Administrador" },
  { value: "Member", label: "Membro" },
];

function parseRoleFilter(value: string | null): RoleFilter {
  const match = ROLE_FILTERS.find((filter) => filter.value === value);
  return match ? match.value : "all";
}

function GroupsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="h-full flex-row items-center gap-4 px-4 py-4">
          <Skeleton className="size-12 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}

      <span className="sr-only">Carregando grupos</span>
    </div>
  );
}

function GroupCard({ group }: { group: GroupSummary }) {
  return (
    <NavLink
      to={`/grupos/${group.id}`}
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
    >
      <Card className="h-full flex-row items-center gap-4 px-4 py-4 transition-colors group-hover:bg-muted/60">
        <GroupAvatar
          iconKey={group.iconKey}
          colorKey={group.colorKey}
          imageUrl={group.groupPictureUrl}
          size={48}
          alt=""
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{group.name}</p>

          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            {group.memberCount} {group.memberCount === 1 ? "membro" : "membros"}
          </p>
        </div>

        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Card>
    </NavLink>
  );
}

export default function GroupsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = getPageFromParams(searchParams.get("page"));
  const roleFilter = parseRoleFilter(searchParams.get("role"));

  const goToPage = useCallback(
    (nextPage: number) => {
      setSearchParams(
        (previous) => {
          const params = new URLSearchParams(previous);

          if (nextPage <= 1) {
            params.delete("page");
          } else {
            params.set("page", String(nextPage));
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const changeRoleFilter = useCallback(
    (nextRole: RoleFilter) => {
      setSearchParams(
        (previous) => {
          const params = new URLSearchParams(previous);

          if (nextRole === "all") {
            params.delete("role");
          } else {
            params.set("role", nextRole);
          }

          params.delete("page");

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const {
    data: groups,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: groupKeys.list(page, PAGE_SIZE, roleFilter),
    queryFn: async (): Promise<PagedGroups> => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });

      if (roleFilter !== "all") {
        params.set("role", roleFilter);
      }

      const response = await apiFetch(`/groups?${params.toString()}`);

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, "Não foi possível carregar seus grupos."),
        );
      }

      return response.json();
    },
  });

  useEffect(() => {
    if (groups && groups.totalPages > 0 && page > groups.totalPages) {
      goToPage(groups.totalPages);
    }
  }, [groups, page, goToPage]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Meus grupos</h1>
          <p className="text-sm text-muted-foreground">
            Acesse os grupos dos quais você participa.
          </p>
        </div>

        <Button render={<NavLink to="/grupos/novo" />} className="w-full sm:w-auto">
          <Plus aria-hidden="true" />
          Novo grupo
        </Button>
      </div>

      {isLoading ? (
        <GroupsSkeleton />
      ) : error ? (
        <ErrorState
          title="Não foi possível carregar seus grupos"
          message={
            error instanceof Error ? error.message : "Não foi possível carregar seus grupos."
          }
          onRetry={refetch}
        />
      ) : groups && groups.totalCount === 0 && roleFilter === "all" ? (
        <EmptyState
          icon={Users}
          title="Você ainda não participa de nenhum grupo"
          description="Crie um grupo para reunir sua galera e começar a organizar os jogos."
          action={
            <Button render={<NavLink to="/grupos/novo" />}>
              <Plus aria-hidden="true" />
              Criar meu primeiro grupo
            </Button>
          }
        />
      ) : groups ? (
        <div className="flex flex-col gap-4">
          <FilterBar
            options={ROLE_FILTERS}
            value={roleFilter}
            onChange={changeRoleFilter}
            ariaLabel="Filtrar grupos"
          />

          {groups.totalCount === 0 ? (
            <NoResultsState
              icon={Users}
              title="Nenhum grupo encontrado"
              description="Não há grupos que correspondam a esse filtro."
              resetLabel="Ver todos os grupos"
              onReset={() => changeRoleFilter("all")}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groups.items.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>

              {groups.totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={groups.totalPages}
                  onPageChange={goToPage}
                  ariaLabel="Paginação dos grupos"
                />
              )}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
