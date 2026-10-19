import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { HomeView } from "@/components/views/HomeView";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  return (
    <PhoneShell>
      <AppHeader />
      <HomeView />
      <BottomNav />
    </PhoneShell>
  );
}
