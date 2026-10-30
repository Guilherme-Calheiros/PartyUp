import { apiFetch } from "@/lib/api";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
    userName: string;
    email: string;
    avatarSeed: string;
    profilePictureUrl: string | null;
}

type RefreshUserOptions = {
    silent?: boolean;
}

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    refreshUser: (options?: RefreshUserOptions) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    async function refreshUser(options?: RefreshUserOptions){
        if (!options?.silent) {
            setIsLoading(true);
        }

        try {
            const response = await apiFetch("/profile/me");

            if(!response.ok){
                setUser(null);
                return;
            }

            const data: User = await response.json();
            setUser(data);
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            if (!options?.silent) {
                setIsLoading(false);
            }
        }
    }

    async function logout() {
        const response = await apiFetch("/auth/logout", {
            method: "POST",
        })

        if (!response.ok) {
            throw new Error("Não foi possível encerrar a sessão.");
        }

        setUser(null);
    }

    useEffect(() => {
        refreshUser();
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user != null,
                isLoading,
                refreshUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);

    if(!context){
        throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
    }

    return context;
}