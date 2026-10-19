import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const s = fs.readFileSync(path.join(root, ".output/server/_ssr/PhoneShell-Dpxz0moP.mjs"), "utf8");
const i = s.indexOf("var dict =");
const j = s.indexOf("var LangCtx");
const dict = s.slice(i, j).replace("var dict =", "export const dict =").trim();

const out = `import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "te";
type Dict = Record<string, string>;

${dict}

export const languageOptions = [
  { code: "en" as const, label: "English", native: "English" },
  { code: "hi" as const, label: "Hindi", native: "हिंदी" },
  { code: "te" as const, label: "Telugu", native: "తెలుగు" },
];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const LangCtx = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("mr-lang") : null;
    if (saved === "en" || saved === "hi" || saved === "te") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("mr-lang", l);
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };
  const t = (k: string) => (dict[lang] as Dict)[k] ?? (dict.en as Dict)[k] ?? k;
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
`;

fs.writeFileSync(path.join(root, "src/lib/i18n.tsx"), out);
console.log("wrote i18n");
