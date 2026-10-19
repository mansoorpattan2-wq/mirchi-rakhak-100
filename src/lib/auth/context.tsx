import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { firebaseAuthAdapter } from "./firebase-browser";
import { authErrorCode, type AccountUser, type AuthAdapter } from "./types";

type AuthContextValue = {
  user: AccountUser | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  signIn: AuthAdapter["signIn"];
  signUp: AuthAdapter["signUp"];
  signInWithGoogle: AuthAdapter["signInWithGoogle"];
  resetPassword: AuthAdapter["resetPassword"];
  signOut: AuthAdapter["signOut"];
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  adapter = firebaseAuthAdapter,
}: {
  children: ReactNode;
  adapter?: AuthAdapter;
}) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let current = true;
    const fail = (cause: unknown) => {
      if (current) {
        setUser(null);
        setError(authErrorCode(cause));
        setLoading(false);
      }
    };
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = adapter.subscribe((nextUser) => {
        if (!current) return;
        setUser(nextUser);
        setLoading(false);
        setError(null);
      }, fail);
    } catch (cause) {
      fail(cause);
    }
    return () => {
      current = false;
      unsubscribe?.();
    };
  }, [adapter, attempt]);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    retry: () => {
      setLoading(true);
      setError(null);
      setAttempt((value) => value + 1);
    },
    async signIn(...args) {
      const next = await adapter.signIn(...args);
      setUser(next);
      setError(null);
      return next;
    },
    async signUp(...args) {
      const next = await adapter.signUp(...args);
      setUser(next);
      setError(null);
      return next;
    },
    async signInWithGoogle() {
      const next = await adapter.signInWithGoogle();
      setUser(next);
      setError(null);
      return next;
    },
    resetPassword: (email) => adapter.resetPassword(email),
    async signOut() {
      await adapter.signOut();
      setUser(null);
      setError(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
