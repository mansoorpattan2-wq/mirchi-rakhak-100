import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Store, MessageCircle, User, ScanLine } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", icon: Home, key: "dashboard" as const },
  { to: "/market", icon: Store, key: "marketplace" as const },
  { to: "/scan", icon: ScanLine, key: "scan" as const, primary: true },
  { to: "/chat", icon: MessageCircle, key: "chat" as const },
  { to: "/profile", icon: User, key: "profile" as const },
];

export function BottomNav() {
  const { t } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <div className="h-24" aria-hidden />
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[406px] z-40">
        <div className="glass rounded-2xl shadow-xl ring-1 ring-black/5 flex items-center justify-around px-2 py-2">
          {items.map(({ to, icon: Icon, key, primary }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-14",
                  primary && "bg-chili-600 text-white -mt-6 h-14 justify-center shadow-lg shadow-chili-600/30 ring-4 ring-earth-50",
                  !primary && active && "text-leaf-700 bg-leaf-600/10",
                  !primary && !active && "text-stone-400",
                )}
                aria-label={t(key)}
              >
                <Icon className={cn(primary ? "size-6" : "size-5")} strokeWidth={2.2} />
                {!primary && (
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t(key)}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
