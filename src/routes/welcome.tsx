import { createFileRoute } from "@tanstack/react-router";
import { WelcomeView } from "@/components/auth/WelcomeView";
export const Route = createFileRoute("/welcome")({ component: WelcomeView });
