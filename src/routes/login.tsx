import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/auth/AuthView";
import { authSearch } from "@/lib/auth/navigation";
export const Route = createFileRoute("/login")({
  validateSearch: authSearch,
  component: LoginPage,
});
function LoginPage() {
  const { redirect } = Route.useSearch();
  return <AuthView mode="login" redirect={redirect} />;
}
