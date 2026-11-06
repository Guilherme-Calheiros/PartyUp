import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, type ReactNode } from "react";

import { GroupOptionsContext, type GroupOptions } from "@/contexts/GroupOptionsContext";
import { apiFetch } from "@/lib/api";
import { groupKeys } from "@/lib/queryKeys";

type GroupOptionsProviderProps = {
  children: ReactNode;
};

async function fetchGroupOptions(): Promise<GroupOptions> {
  const response = await apiFetch("/groups/options");

  if (!response.ok) {
    throw new Error("Não foi possível carregar as opções de grupo.");
  }

  return response.json();
}

export function GroupOptionsProvider({ children }: GroupOptionsProviderProps) {
  const { data, isLoading } = useQuery({
    queryKey: groupKeys.options,
    queryFn: fetchGroupOptions,
  });

  const options = useMemo<GroupOptions>(() => data ?? { icons: [], colors: [] }, [data]);

  const getColor = useCallback(
    (key: string) => options.colors.find((color) => color.key === key),
    [options.colors],
  );

  const value = useMemo(
    () => ({
      icons: options.icons,
      colors: options.colors,
      isLoading,
      getColor,
    }),
    [options, isLoading, getColor],
  );

  return <GroupOptionsContext.Provider value={value}>{children}</GroupOptionsContext.Provider>;
}
