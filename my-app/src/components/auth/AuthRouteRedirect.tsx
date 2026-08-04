import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthDrawer, type AuthDrawerMode } from "@/context/AuthDrawerContext";
import TownLoader from "@/components/shared/TownLoader";
import type { UserRole } from "@/types/user";

type AuthLocationState = {
  from?: string;
  defaultRole?: UserRole;
  feedState?: unknown;
};

/** Opens the auth drawer then sends the user to the marketing page (legacy /login, /signup). */
export function AuthRouteRedirect({ mode }: { mode: AuthDrawerMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { openAuthDrawer } = useAuthDrawer();

  useEffect(() => {
    const state = location.state as AuthLocationState | null;
    openAuthDrawer(mode, {
      from: state?.from,
      defaultRole: state?.defaultRole,
      feedState: state?.feedState,
    });
    navigate("/", { replace: true });
  }, [location.state, mode, navigate, openAuthDrawer]);

  return <TownLoader fullScreen size="md" label="Opening sign in" />;
}

/** When a protected route is hit while logged out, open login drawer on marketing page. */
export function AuthRequiredRedirect({
  from,
  feedState,
}: {
  from: string;
  feedState?: unknown;
}) {
  const navigate = useNavigate();
  const { openAuthDrawer } = useAuthDrawer();

  useEffect(() => {
    openAuthDrawer("login", { from, feedState });
    navigate("/", { replace: true });
  }, [from, feedState, navigate, openAuthDrawer]);

  return <TownLoader fullScreen size="md" label="Redirecting" />;
}

export default AuthRouteRedirect;
