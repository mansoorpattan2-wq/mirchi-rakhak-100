import { useRef, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Sprout,
  UserRound,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { accountCopy, accountErrorMessage } from "@/lib/auth/copy";
import { completeOnboarding, type AppPath } from "@/lib/auth/navigation";
import { useLang } from "@/lib/i18n";
import { AccountFooter, AccountShell } from "./AccountShell";

type Mode = "login" | "signup" | "reset";
export function AuthView({ mode, redirect = "/home" }: { mode: Mode; redirect?: AppPath }) {
  const { lang } = useLang();
  const c = accountCopy[lang];
  const auth = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const signup = mode === "signup";
  const reset = mode === "reset";
  if (!auth.loading && auth.user) return <Navigate to={redirect} replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (signup && password !== form.get("confirmPassword")) {
      setError("auth/password-mismatch");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      if (reset) {
        await auth.resetPassword(email);
        setResetSent(true);
      } else {
        if (signup) await auth.signUp(String(form.get("name") || ""), email, password);
        else await auth.signIn(email, password, form.get("remember") === "on");
        completeOnboarding();
        await navigate({ to: redirect, replace: true });
      }
    } catch (cause) {
      setError(
        typeof cause === "object" && cause !== null && "code" in cause
          ? String(cause.code)
          : "auth/unknown",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function google() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await auth.signInWithGoogle();
      completeOnboarding();
      await navigate({ to: redirect, replace: true });
    } catch (cause) {
      setError(
        typeof cause === "object" && cause !== null && "code" in cause
          ? String(cause.code)
          : "auth/unknown",
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const tag = reset ? c.resetTag : signup ? c.signupTag : c.loginTag;
  const title = reset ? c.resetTitle : signup ? c.signupTitle : c.loginTitle;
  const accent = reset ? c.resetAccent : signup ? c.signupAccent : c.loginAccent;
  const sub = reset ? c.resetSub : signup ? c.signupSub : c.loginSub;
  return (
    <AccountShell className="auth-form-page">
      <div className="auth-content">
        <Link
          className="account-back-link"
          to={reset ? "/login" : "/welcome"}
          {...(reset ? { search: { redirect } } : {})}
        >
          <ArrowLeft size={16} />
          {c.back}
        </Link>
        <div className="auth-emblem">
          {reset ? <LockKeyhole size={30} /> : signup ? <Sprout size={32} /> : <Leaf size={32} />}
          <span />
        </div>
        {resetSent ? (
          <section className="auth-reset-success" role="status">
            <span className="auth-success-icon">
              <Check size={30} />
            </span>
            <h1>{c.resetSent}</h1>
            <p>{c.resetSentSub}</p>
            <Link className="account-primary" to="/login" search={{ redirect }}>
              {c.backToLogin}
              <ArrowRight size={18} />
            </Link>
          </section>
        ) : (
          <>
            <div className="auth-heading">
              <p className="account-eyebrow">{tag}</p>
              <h1>
                {title}
                <span>{accent}</span>
              </h1>
              <p className="account-description">{sub}</p>
            </div>
            {!reset && (
              <>
                <button
                  className="account-google"
                  onClick={() => void google()}
                  disabled={busy || auth.loading || !!auth.error}
                >
                  <GoogleMark />
                  {c.google}
                </button>
                <div className="auth-divider">
                  <span />
                  {c.or}
                  <span />
                </div>
              </>
            )}
            {(error || auth.error) && (
              <div role="alert" className="account-error">
                {accountErrorMessage(error || auth.error, lang)}
                {auth.error && (
                  <button type="button" className="account-text-button" onClick={auth.retry}>
                    {c.retry}
                  </button>
                )}
              </div>
            )}
            <form onSubmit={submit} className="account-form" aria-busy={busy}>
              {signup && (
                <label className="account-field">
                  <span>{c.fullName}</span>
                  <div>
                    <UserRound size={17} />
                    <input
                      name="name"
                      autoComplete="name"
                      placeholder={c.namePlaceholder}
                      required
                      maxLength={80}
                      disabled={busy}
                    />
                  </div>
                </label>
              )}
              <label className="account-field">
                <span>{c.email}</span>
                <div>
                  <Mail size={17} />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder={c.emailPlaceholder}
                    required
                    maxLength={254}
                    disabled={busy}
                  />
                </div>
              </label>
              {!reset && (
                <label className="account-field">
                  <span>{c.password}</span>
                  <div>
                    <LockKeyhole size={17} />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={signup ? "new-password" : "current-password"}
                      placeholder={signup ? c.newPassword : c.passwordPlaceholder}
                      required
                      minLength={signup ? 8 : 1}
                      maxLength={128}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? c.hidePassword : c.showPassword}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
              )}
              {signup && (
                <label className="account-field">
                  <span>{c.confirmPassword}</span>
                  <div>
                    <LockKeyhole size={17} />
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={c.confirmPlaceholder}
                      required
                      minLength={8}
                      maxLength={128}
                      disabled={busy}
                    />
                  </div>
                </label>
              )}
              {!signup && !reset && (
                <div className="auth-options">
                  <label>
                    <input type="checkbox" name="remember" defaultChecked disabled={busy} />
                    {c.remember}
                  </label>
                  <Link to="/forgot-password" search={{ redirect }}>
                    {c.forgot}
                  </Link>
                </div>
              )}
              <button
                type="submit"
                className="account-primary"
                disabled={busy || auth.loading || !!auth.error}
              >
                {busy ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    {c.working}
                  </>
                ) : (
                  <>
                    {reset ? c.resetButton : signup ? c.signUp : c.signIn}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
            <p className="account-switch">
              {reset ? (
                <Link to="/login" search={{ redirect }}>
                  {c.backToLogin}
                </Link>
              ) : (
                <>
                  {signup ? c.haveAccount : c.noAccount}{" "}
                  <Link to={signup ? "/login" : "/signup"} search={{ redirect }}>
                    {signup ? c.signIn : c.signUp}
                  </Link>
                </>
              )}
            </p>
            <p className="account-security-note">
              <LockKeyhole size={12} />
              {c.privateNote}
            </p>
          </>
        )}
      </div>
      <AccountFooter />
    </AccountShell>
  );
}

function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285f4"
        d="M22.6 12.25c0-.7-.06-1.37-.18-2.02H12v3.82h5.94a5.08 5.08 0 0 1-2.2 3.34v2.77h3.57c2.09-1.92 3.29-4.75 3.29-7.91Z"
      />
      <path
        fill="#34a853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.87 0-5.3-1.94-6.17-4.54H2.14v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#fbbc05"
        d="M5.83 14.09A6.6 6.6 0 0 1 5.48 12c0-.72.13-1.42.35-2.09V7.07H2.14A11 11 0 0 0 1 12c0 1.77.42 3.44 1.14 4.93l3.69-2.84Z"
      />
      <path
        fill="#ea4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.16-3.16A10.53 10.53 0 0 0 12 1a11 11 0 0 0-9.86 6.07l3.69 2.84C6.7 7.31 9.13 5.38 12 5.38Z"
      />
    </svg>
  );
}
