import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location =  useLocation();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if(!isAuthenticated){
    return (
      <Navigate 
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  return <Outlet />
}