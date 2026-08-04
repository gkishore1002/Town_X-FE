import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";

import { ROLE_HOME_ROUTE } from "@/context/AuthContext";
import type { User } from "@/types/user";
import { useAuthDrawer } from "@/context/AuthDrawerContext";
import { TownExchangeLogo, APP_NAME } from "@/components/brand/TownExchangeLogo";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

const sidePanelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 380, damping: 36, mass: 0.85 },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
};

const bottomPanelVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { type: "spring", stiffness: 380, damping: 36, mass: 0.85 },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function useIsMobileDrawer() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function AuthDrawer() {
  const reduceMotion = useReducedMotion() ?? false;
  const isMobile = useIsMobileDrawer();
  const navigate = useNavigate();
  const { isOpen, mode, options, closeAuthDrawer, setMode } = useAuthDrawer();

  const handleAuthSuccess = useCallback(
    (user: User) => {
      closeAuthDrawer();
      const redirectTo = options.from ?? ROLE_HOME_ROUTE[user.role];
      navigate(redirectTo, { replace: true, state: options.feedState });
    },
    [closeAuthDrawer, navigate, options.feedState, options.from]
  );

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeAuthDrawer]);

  const instant = reduceMotion;
  const panelVariants = isMobile ? bottomPanelVariants : sidePanelVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-[100] flex ${isMobile ? "items-end justify-center" : "justify-end"} safe-top safe-bottom`}
          role="dialog"
          aria-modal="true"
        >
          <motion.button
            type="button"
            aria-label="Close sign in panel"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            variants={instant ? undefined : backdropVariants}
            initial={instant ? false : "hidden"}
            animate="visible"
            exit="exit"
            onClick={closeAuthDrawer}
          />

          <motion.aside
            className={`relative flex flex-col border-border bg-card shadow-2xl ${
              isMobile
                ? "h-[min(92dvh,100%)] w-full max-h-[92dvh] rounded-t-2xl border-t"
                : "h-full w-full max-w-[min(100vw,380px)] border-l"
            }`}
            variants={instant ? undefined : panelVariants}
            initial={instant ? false : "hidden"}
            animate="visible"
            exit="exit"
          >
            {isMobile && (
              <div className="mx-auto mt-2 mb-1 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" />
            )}
            <div className="flex items-center justify-between border-b border-border px-4 sm:px-5 py-3 sm:py-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <TownExchangeLogo size={32} />
                <span className="font-display truncate text-base font-semibold text-foreground">{APP_NAME}</span>
              </div>
              <motion.button
                type="button"
                whileHover={instant ? undefined : { scale: 1.05 }}
                whileTap={instant ? undefined : { scale: 0.95 }}
                onClick={closeAuthDrawer}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="size-5" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-5 py-5 sm:py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mode === "login"
                      ? "Log in to browse listings, save favourites, and more."
                      : "Join Town Exchange — browse, list, or manage properties."}
                  </p>

                  <div className="mt-6">
                    {mode === "login" ? (
                      <LoginForm
                        onSuccess={handleAuthSuccess}
                        onSwitchToSignup={() => setMode("signup")}
                      />
                    ) : (
                      <SignupForm
                        defaultRole={options.defaultRole ?? "buyer"}
                        onSuccess={handleAuthSuccess}
                        onSwitchToLogin={() => setMode("login")}
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AuthDrawer;
