import { createFileRoute } from "@tanstack/react-router";
import { AuthView } from "@/components/auth/AuthView";
import { authSearch } from "@/lib/auth/navigation";
export const Route = createFileRoute("/forgot-password")({
  validateSearch: authSearch,
  component: ResetPage,
});
function ResetPage() {
  const { redirect } = Route.useSearch();
  return <AuthView mode="reset" redirect={redirect} />;
}
