import { createFileRoute } from "@tanstack/react-router";
import { LogoutView } from "@/components/auth/LogoutView";
export const Route = createFileRoute("/logout")({ component: LogoutView });
