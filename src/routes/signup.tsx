import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/auth/AuthView";
import { authSearch } from "@/lib/auth/navigation";
export const Route = createFileRoute("/signup")({
  validateSearch: authSearch,
  component: SignupPage,
});
function SignupPage() {
  const { redirect } = Route.useSearch();
  return <AuthView mode="signup" redirect={redirect} />;
}
