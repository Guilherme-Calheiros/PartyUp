import { useMutation, useQuery } from "@tanstack/react-query";
import { createContext, useCallback, useContext, type ReactNode } from "react";

import { apiFetch } from "@/lib/api";
import { profileKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";

export type User = {
  userName: string;
  email: string;
  avatarSeed: string;
  profilePictureUrl: string | null;
};

type RefreshUserOptions = {
  silent?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: (options?: RefreshUserOptions) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

async function fetchProfile(): Promise<User | null> {
  const response = await apiFetch("/profile/me");

  if (response.status === 401 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar o perfil.");
  }

  return response.json();
}

export function AuthProvider({ children }: AuthProviderProps) {
  const profileQuery = useQuery({
    queryKey: profileKeys.me,
    queryFn: fetchProfile,
  });

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: profileKeys.me });
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiFetch("/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(profileKeys.me, null);
    },
  });

  async function logout() {
    await logoutMutation.mutateAsync();
  }

  const user = profileQuery.data ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user != null,
        isLoading: profileQuery.isPending,
        refreshUser,
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
