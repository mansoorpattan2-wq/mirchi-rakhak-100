import { createFileRoute } from "@tanstack/react-router";
import { EntryView } from "@/components/auth/AppAccess";

export const Route = createFileRoute("/")({
  component: EntryView,
});
