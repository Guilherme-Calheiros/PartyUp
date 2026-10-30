
import { Home, Users, Calendar, Gamepad2, User, LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import UserAvatar from "../UserAvatar";

const desktopNavItems = [
    { label: "Início", href: "/inicio", icon: Home },
    { label: "Grupos", href: "/grupos", icon: Users },
    { label: "Agenda", href: "/agenda", icon: Calendar },
    { label: "Jogos", href: "/jogos", icon: Gamepad2 },
];

const mobileNavItems = [
    ...desktopNavItems,
    { label: "Perfil", href: "/perfil", icon: User },
];

function Logo() {
    return (
        <NavLink
            to="/inicio"
            className="flex items-center gap-2 rounded-sm text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            PartyUp
        </NavLink>
    );
}

export default function AuthenticatedNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [logoutError, setLogoutError] = useState<string | null>(null);

    useEffect(() => {
        if (!logoutError) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setLogoutError(null);
        }, 5000);

        return () => window.clearTimeout(timeoutId);
    }, [logoutError]);

    async function handleLogout() {
        setLogoutError(null);

        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            setLogoutError("Não foi possível sair. Tente novamente.");
        }
    }

    return (
        <>
            {/* Navbar desktop */}
            <header className="hidden w-full border-b border-border bg-background md:block">
                <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Logo />

                    <nav aria-label="Navegação principal">
                        <ul className="flex items-center gap-1">
                            {desktopNavItems.map((item) => {
                                const isActive = location.pathname === item.href ||
                                    location.pathname.startsWith(`${item.href}/`);

                                return (
                                    <li key={item.href}>
                                        <NavLink
                                            to={item.href}
                                            aria-current={isActive ? "page" : undefined}
                                            className={cn(
                                                "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                                "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                isActive
                                                    ? "text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {item.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Menu do usuário"
                                />
                            }
                        >
                            <UserAvatar
                                seed={user?.avatarSeed ?? ""}
                                profilePictureUrl={user?.profilePictureUrl ?? null}
                                size={36}
                            />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <UserAvatar
                                    seed={user?.avatarSeed ?? ""}
                                    profilePictureUrl={user?.profilePictureUrl ?? null}
                                    size={40}
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {user?.userName ?? "Minha conta"}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user?.email ?? ""}
                                    </p>
                                </div>
                            </div>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                render={<NavLink to="/perfil" className="flex items-center" />}
                            >
                                <User className="mr-2 h-4 w-4" />
                                Ver perfil
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Bottom navigation mobile */}
            <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
                <nav className="border-t border-border bg-background">
                    <ul className="flex h-16 items-center justify-around">
                        {mobileNavItems.map((item) => {
                            const isActive = location.pathname === item.href ||
                                location.pathname.startsWith(`${item.href}/`);
                            const Icon = item.icon;

                            return (
                                <li key={item.href} className="flex-1">
                                    <NavLink
                                        to={item.href}
                                        aria-current={isActive ? "page" : undefined}
                                        className={cn(
                                            "mx-1 flex flex-col items-center justify-center gap-1 rounded-xl border px-1 py-1 text-xs transition-colors",
                                            isActive
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-transparent text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {logoutError && (
                <div
                    role="alert"
                    className="fixed right-4 bottom-20 z-50 flex items-center gap-2 rounded-lg border border-destructive/20 bg-background px-3 py-2 text-sm font-medium text-destructive shadow-lg md:bottom-4"
                >
                    <span>{logoutError}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Fechar aviso"
                        onClick={() => setLogoutError(null)}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            )}
        </>
    );
}
