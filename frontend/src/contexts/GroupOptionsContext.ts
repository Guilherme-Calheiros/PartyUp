import type { GroupColorOption } from "@/constants/group-colors";
import { createContext, useContext } from "react";

export type GroupOptions = {
  icons: string[];
  colors: GroupColorOption[];
};

export type GroupOptionsContextType = {
  icons: string[];
  colors: GroupColorOption[];
  isLoading: boolean;
  getColor: (key: string) => GroupColorOption | undefined;
};

export const GroupOptionsContext = createContext<GroupOptionsContextType | undefined>(undefined);

export function useGroupOptions() {
  const context = useContext(GroupOptionsContext);

  if (!context) {
    throw new Error("useGroupOptions deve ser usado dentro de um GroupOptionsProvider.");
  }

  return context;
}
