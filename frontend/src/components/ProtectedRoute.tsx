import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, authError, isRetrying, retryAuth } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (authError && !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-10 text-center">
        <p className="font-medium">Não foi possível verificar sua sessão.</p>
        <p className="text-sm text-muted-foreground">{authError.message}</p>
        <Button onClick={retryAuth} disabled={isRetrying}>
          {isRetrying ? "Tentando novamente..." : "Tentar novamente"}
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
