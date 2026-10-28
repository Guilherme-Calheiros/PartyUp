import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedNavBar from "./AuthenticatedNavBar";
import PublicNavBar from "./PublicNavBar";


export default function ConditionalNavbar() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated
    ? <AuthenticatedNavBar />
    : <PublicNavBar />;
}