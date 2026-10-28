
import { NavLink } from "react-router";
import { Button } from "@/components/ui/button";

function Logo() {
  return (
    <NavLink
      to="/"
      className="focus-visible:ring-ring flex items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="text-base font-semibold tracking-tight">
        PartyUp
      </span>
    </NavLink>
  );
}

export default function PublicNavbar() {
  return (
    <header className="border-border bg-background w-full border-b">
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Navegação principal">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              render={<NavLink to="/login" />}
            >
              Entrar
            </Button>

            <Button
              size="sm"
              render={<NavLink to="/register" />}
            >
              Cadastrar
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
