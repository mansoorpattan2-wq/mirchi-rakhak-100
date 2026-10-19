import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LogOut, Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { accountCopy, accountErrorMessage } from "@/lib/auth/copy";
import { useLang } from "@/lib/i18n";
import { AccountFooter, AccountLoading, AccountShell } from "./AccountShell";

export function LogoutView() {
  const auth = useAuth();
  const { lang } = useLang();
  const c = accountCopy[lang];
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState<unknown>(null);
  if (auth.loading) return <AccountLoading />;
  const signedOut = !auth.user;
  async function logout() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await auth.signOut();
    } catch (cause) {
      setError(cause);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  return (
    <AccountShell>
      <section className="logout-content">
        <div className="logout-art">
          <span className="logout-art-ring" />
          <span className="logout-art-ring inner" />
          <Sprout size={78} strokeWidth={1.3} />
          <span className="logout-art-leaf">✦</span>
        </div>
        <p className="account-eyebrow">{c.logoutTag}</p>
        <h1>
          {signedOut ? c.signedOutTitle : c.logoutTitle}
          <span>{signedOut ? c.signedOutAccent : c.logoutAccent}</span>
        </h1>
        <p className="account-description">{signedOut ? c.signedOutSub : c.logoutSub}</p>
        {auth.user?.email && <p className="logout-email">{auth.user.email}</p>}
        {error !== null && (
          <p role="alert" className="account-error">
            {accountErrorMessage(error, lang)}
          </p>
        )}
        <div className="logout-actions">
          {signedOut ? (
            <Link className="account-primary" to="/login" search={{ redirect: "/home" }}>
              {c.signIn}
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <button className="account-primary" onClick={() => void logout()} disabled={busy}>
                <LogOut size={18} />
                {busy ? c.working : c.logoutButton}
              </button>
              <Link className="account-secondary" to="/home">
                {c.cancel}
              </Link>
            </>
          )}
        </div>
      </section>
      <AccountFooter />
    </AccountShell>
  );
}
