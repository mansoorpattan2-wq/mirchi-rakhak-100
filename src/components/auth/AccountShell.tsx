import type { ReactNode } from "react";
import { Leaf, ShieldCheck } from "lucide-react";
import { useLang, languageOptions, type Lang } from "@/lib/i18n";
import { accountCopy } from "@/lib/auth/copy";

export function AccountBrand() {
  const { lang } = useLang();
  return (
    <div className="account-brand">
      <span className="account-logo">
        <Leaf size={23} strokeWidth={2} />
      </span>
      <div>
        <strong>
          MirchiRakshak<span>AI</span>
        </strong>
        <small>{accountCopy[lang].brand}</small>
      </div>
    </div>
  );
}

export function AccountLanguage() {
  const { lang, setLang } = useLang();
  return (
    <select
      className="account-language"
      aria-label="Change language"
      value={lang}
      onChange={(event) => setLang(event.target.value as Lang)}
    >
      {languageOptions.map((option) => (
        <option key={option.code} value={option.code}>
          {option.native}
        </option>
      ))}
    </select>
  );
}

export function AccountShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { lang } = useLang();
  return (
    <main lang={lang} className={`account-background ${className}`}>
      <div className="account-shell">
        <header className="account-top">
          <AccountBrand />
          <AccountLanguage />
        </header>
        {children}
      </div>
    </main>
  );
}

export function AccountFooter() {
  const { lang } = useLang();
  return (
    <footer className="account-footer">
      <ShieldCheck size={14} aria-hidden="true" />
      {accountCopy[lang].footer}
    </footer>
  );
}

export function AccountLoading() {
  const { lang } = useLang();
  return (
    <AccountShell>
      <div className="account-loading" role="status">
        <span className="account-loading-leaf">
          <Leaf size={34} />
        </span>
        <p>{accountCopy[lang].preparing}</p>
      </div>
    </AccountShell>
  );
}
