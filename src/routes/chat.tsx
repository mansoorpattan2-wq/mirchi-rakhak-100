import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/components/PhoneShell";
import { AppHeader } from "@/components/AppHeader";
import { ChatView } from "@/components/views/ChatView";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  return (
    <PhoneShell>
      <AppHeader />
      <ChatView />
      <BottomNav />
    </PhoneShell>
  );
}
