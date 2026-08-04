import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const APP_LOGO_SRC = "/logo.png";
const APP_NAME = "Town Exchange";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-soft-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button className="flex items-center gap-2.5" onClick={() => navigate("/")}>
            <img
              src={APP_LOGO_SRC}
              alt={APP_NAME}
              className="h-8 w-8 rounded-full object-contain bg-white shadow-soft-sm border border-border"
            />
            <span className="font-display text-base font-semibold text-foreground">{APP_NAME}</span>
          </button>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{user.name}</span>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
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
