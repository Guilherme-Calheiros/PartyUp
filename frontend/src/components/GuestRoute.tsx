import { Navigate, Outlet } from "react-router";
import FullPageLoader from "@/components/common/FullPageLoader";
import { useAuth } from "@/contexts/AuthContext";

export default function GuestRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  return <Outlet />;
}
