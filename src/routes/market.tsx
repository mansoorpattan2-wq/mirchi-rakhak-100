import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { MarketView } from "@/components/views/MarketView";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/market")({
  component: MarketPage,
});

function MarketPage() {
  return (
    <PhoneShell>
      <AppHeader />
      <MarketView />
      <BottomNav />
    </PhoneShell>
  );
}
