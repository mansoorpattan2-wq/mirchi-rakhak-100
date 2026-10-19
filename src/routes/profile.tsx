import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { ProfileView } from "@/components/views/ProfileView";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <PhoneShell>
      <AppHeader />
      <ProfileView />
      <BottomNav />
    </PhoneShell>
  );
}
