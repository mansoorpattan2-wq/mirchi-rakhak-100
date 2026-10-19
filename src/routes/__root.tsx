import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import { LanguageProvider } from "@/lib/i18n";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth/context";
import { AppAccess } from "@/components/auth/AppAccess";
import "@/styles.css";
import "@/account.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MirchiRakshak AI — Chili Plant Disease Detection" },
      {
        name: "description",
        content:
          "AI-powered chili plant disease detection, leaf diagnosis, smart weather advisory, and remedies.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-earth-100 text-earth-900 min-h-screen antialiased selection:bg-chili-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <AppAccess>
              <Outlet />
            </AppAccess>
          </AuthProvider>
          <Toaster position="top-center" richColors />
        </LanguageProvider>
        <Scripts />
      </body>
    </html>
  );
}
