import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { ScanView } from "@/components/views/ScanView";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
});

function ScanPage() {
  return (
    <PhoneShell>
      <AppHeader />
      <ScanView />
      <BottomNav />
    </PhoneShell>
  );
}
