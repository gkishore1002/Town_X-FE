import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/context/AuthDrawerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { TownExchangeBrand } from "@/components/brand/TownExchangeLogo";

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const logoutToHome = useLogout();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-soft-sm safe-top">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 sm:px-4 py-3 min-w-0">
          <TownExchangeBrand
            asButton
            logoSize={32}
            onClick={() => navigate("/")}
            wordmarkClassName="text-foreground"
          />

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user && (
              <>
                <div className="flex sm:hidden items-center">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {user.role}
                  </Badge>
                </div>
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate max-w-[140px]">{user.name}</span>
                  <Badge variant="secondary" className="capitalize shrink-0">
                    {user.role}
                  </Badge>
                </div>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={logoutToHome} className="shrink-0">
              <LogOut className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-5 sm:py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {actions}
        </div>

        {children}
      </div>
    </div>
  );
}

export default DashboardShell;
