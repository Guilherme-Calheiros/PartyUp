import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, type ReactNode } from "react";

import { useProfileQuery } from "@/hooks/useProfile";
import { apiFetch, throwIfApiError } from "@/lib/api";
import { clearPrivateQueries, clearSettledMutations } from "@/lib/authCache";
import type { User } from "@/types/user";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: Error | null;
  isRetrying: boolean;
  retryAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const profileQuery = useProfileQuery();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
      });

      await throwIfApiError(response, "Não foi possível encerrar a sessão.");
    },
    onSuccess: () => {
      clearPrivateQueries(queryClient);
    },
  });

  async function logout() {
    clearSettledMutations(queryClient);
    await logoutMutation.mutateAsync();
  }

  async function retryAuth() {
    await profileQuery.refetch();
  }

  const user = profileQuery.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading: profileQuery.status === "pending",
        authError: profileQuery.error,
        isRetrying: profileQuery.isError && profileQuery.isFetching,
        retryAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }

  return context;
}
