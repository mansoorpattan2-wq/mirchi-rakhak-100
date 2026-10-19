export const APP_PATHS = ["/home", "/scan", "/market", "/chat", "/profile"] as const;
export type AppPath = (typeof APP_PATHS)[number];
export function safeRedirect(value: unknown): AppPath {
  return typeof value === "string" && (APP_PATHS as readonly string[]).includes(value)
    ? (value as AppPath)
    : "/home";
}
export const authSearch = (search: Record<string, unknown>) => ({
  redirect: safeRedirect(search.redirect),
});
export const ONBOARDING_KEY = "mr-onboarding-v1";
export function completeOnboarding() {
  try {
    localStorage.setItem(ONBOARDING_KEY, "complete");
  } catch {
    /* Navigation still works without storage. */
  }
}
