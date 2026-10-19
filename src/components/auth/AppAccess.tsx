import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";
import { ONBOARDING_KEY, safeRedirect } from "@/lib/auth/navigation";
import { AccountLoading } from "./AccountShell";
import { WelcomeView } from "./WelcomeView";

const publicPaths = new Set(["/", "/welcome", "/login", "/signup", "/forgot-password", "/logout"]);
export function AppAccess({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (publicPaths.has(pathname)) return children;
  if (loading) return <AccountLoading />;
  if (!user) return <Navigate to="/login" search={{ redirect: safeRedirect(pathname) }} replace />;
  return children;
}

export function EntryView() {
  const { user, loading } = useAuth();
  const [completed, setCompleted] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      setCompleted(localStorage.getItem(ONBOARDING_KEY) === "complete");
    } catch {
      setCompleted(false);
    }
  }, []);
  if (loading || completed === null) return <AccountLoading />;
  if (user) return <Navigate to="/home" replace />;
  return completed ? (
    <Navigate to="/login" search={{ redirect: "/home" }} replace />
  ) : (
    <WelcomeView />
  );
}
