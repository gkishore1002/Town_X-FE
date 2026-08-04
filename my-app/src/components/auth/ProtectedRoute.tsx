import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/user";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  /** Omit to allow any authenticated user regardless of role. */
  allowedRoles?: UserRole[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
