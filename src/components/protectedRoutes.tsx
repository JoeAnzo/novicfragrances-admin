// components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useRole } from "../hooks/useRole";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { role, isLoading, isLoggedIn } = useRole();

  if (isLoading) return 

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
