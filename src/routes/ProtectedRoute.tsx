import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types/IRoleType";
import { useProjectContext } from "@/context/ProjectContext";
import { buildThemeRoutePath } from "@/utils/userProjectAccess";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles: Role[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const { temasPermitidos, hasThemeScope } = useProjectContext();

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  if (user.role === "USER" && hasThemeScope) {
    const firstAllowedTheme = temasPermitidos[0] ?? null;

    if (location.pathname === "/relatorio") {
      return <Navigate to="/panorama" replace />;
    }

    if (location.pathname === "/relatorio-opiniao" && firstAllowedTheme) {
      return <Navigate to={buildThemeRoutePath(firstAllowedTheme)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
