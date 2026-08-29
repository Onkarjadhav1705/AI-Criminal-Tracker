import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../../types/domain";
import { useAuth } from "../../lib/auth";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!auth.hasRole(roles)) return <Navigate to="/" replace />;

  return <Outlet />;
}
