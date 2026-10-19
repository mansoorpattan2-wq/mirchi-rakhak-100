// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthView } from "../src/components/auth/AuthView";
import { WelcomeView } from "../src/components/auth/WelcomeView";
import { LogoutView } from "../src/components/auth/LogoutView";
import { accountCopy } from "../src/lib/auth/copy";
import { safeRedirect, ONBOARDING_KEY } from "../src/lib/auth/navigation";

const mocks = vi.hoisted(() => ({
  lang: "en" as "en" | "te" | "hi",
  navigate: vi.fn(),
  auth: {
    user: null as null | { uid: string; email: string },
    loading: false,
    error: null,
    retry: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    resetPassword: vi.fn(),
    signOut: vi.fn(),
  },
}));
vi.mock("@/lib/i18n", () => ({
  useLang: () => ({ lang: mocks.lang, setLang: vi.fn() }),
  languageOptions: [
    { code: "en", native: "English" },
    { code: "te", native: "తెలుగు" },
    { code: "hi", native: "हिन्दी" },
  ],
}));
vi.mock("@/lib/auth/context", () => ({ useAuth: () => mocks.auth }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
  Navigate: () => <div>Redirecting</div>,
  Link: ({
    to,
    children,
    search: _search,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    search?: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
beforeEach(() => {
  mocks.lang = "en";
  mocks.auth.user = null;
  localStorage.clear();
});
afterEach(cleanup);
const c = accountCopy.en;
async function credentials() {
  await userEvent.type(screen.getByLabelText(c.email), "farmer@example.test");
  await userEvent.type(screen.getByLabelText(c.password, { exact: true }), "Password9!");
}

describe("account forms and three welcome screens", () => {
  it("signs in with the remember option and returns to the requested app page", async () => {
    render(<AuthView mode="login" redirect="/scan" />);
    await credentials();
    await userEvent.click(screen.getByRole("button", { name: c.signIn, exact: true }));
    await waitFor(() =>
      expect(mocks.auth.signIn).toHaveBeenCalledWith("farmer@example.test", "Password9!", true),
    );
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/scan", replace: true });
  });
  it("shows safe invalid-credential errors", async () => {
    mocks.auth.signIn.mockRejectedValueOnce({
      code: "auth/invalid-credential",
      message: "raw internal error",
    });
    render(<AuthView mode="login" />);
    await credentials();
    await userEvent.click(screen.getByRole("button", { name: c.signIn, exact: true }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", c.credentialsError);
    expect(document.body.textContent).not.toContain("raw internal error");
  });
  it("prevents repeated sign-in submissions", async () => {
    let finish!: () => void;
    mocks.auth.signIn.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    render(<AuthView mode="login" />);
    await credentials();
    const form = screen.getByLabelText(c.email).closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(mocks.auth.signIn).toHaveBeenCalledOnce();
    finish();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
  });
  it("rejects mismatched signup passwords before calling Firebase", async () => {
    render(<AuthView mode="signup" />);
    await userEvent.type(screen.getByLabelText(c.fullName), "Farmer");
    await credentials();
    await userEvent.type(screen.getByLabelText(c.confirmPassword), "Different9!");
    await userEvent.click(screen.getByRole("button", { name: c.signUp, exact: true }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", c.mismatch);
    expect(mocks.auth.signUp).not.toHaveBeenCalled();
  });
  it("creates accounts through the adapter", async () => {
    render(<AuthView mode="signup" />);
    await userEvent.type(screen.getByLabelText(c.fullName), "Farmer");
    await credentials();
    await userEvent.type(screen.getByLabelText(c.confirmPassword), "Password9!");
    await userEvent.click(screen.getByRole("button", { name: c.signUp, exact: true }));
    await waitFor(() =>
      expect(mocks.auth.signUp).toHaveBeenCalledWith("Farmer", "farmer@example.test", "Password9!"),
    );
  });
  it("offers Google sign-in and handles blocked popups", async () => {
    mocks.auth.signInWithGoogle.mockRejectedValueOnce({ code: "auth/popup-blocked" });
    render(<AuthView mode="login" />);
    await userEvent.click(screen.getByRole("button", { name: c.google }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", c.popupBlocked);
  });
  it("sends password-reset requests and shows an account-neutral success state", async () => {
    render(<AuthView mode="reset" />);
    await userEvent.type(screen.getByLabelText(c.email), "farmer@example.test");
    await userEvent.click(screen.getByRole("button", { name: c.resetButton }));
    expect(await screen.findByRole("status")).toHaveProperty(
      "textContent",
      expect.stringContaining(c.resetSentSub),
    );
    expect(mocks.auth.resetPassword).toHaveBeenCalledWith("farmer@example.test");
  });
  it.each(["en", "te", "hi"] as const)(
    "shows exactly three navigable welcome steps in %s",
    async (lang) => {
      mocks.lang = lang;
      const copy = accountCopy[lang];
      render(<WelcomeView />);
      expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(copy.slides[0].title);
      await userEvent.click(screen.getByRole("button", { name: copy.next, exact: true }));
      expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(copy.slides[1].title);
      await userEvent.click(screen.getByRole("button", { name: copy.next, exact: true }));
      expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(copy.slides[2].title);
      await userEvent.click(screen.getByRole("button", { name: copy.getStarted }));
      expect(localStorage.getItem(ONBOARDING_KEY)).toBe("complete");
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/signup", search: { redirect: "/home" } });
    },
  );
  it("skips onboarding without setting a fake login session", async () => {
    render(<WelcomeView />);
    await userEvent.click(screen.getByRole("button", { name: c.skip }));
    expect(mocks.navigate).toHaveBeenCalledWith({ to: "/login", search: { redirect: "/home" } });
    expect(mocks.auth.signIn).not.toHaveBeenCalled();
  });
  it("signs out only after an explicit action on the logout page", async () => {
    mocks.auth.user = { uid: "u", email: "farmer@example.test" };
    render(<LogoutView />);
    expect(mocks.auth.signOut).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: c.logoutButton }));
    expect(mocks.auth.signOut).toHaveBeenCalledOnce();
  });
  it.each(["https://evil.example", "//evil.example", "/logout", "/login", "/scan?next=evil", null])(
    "rejects unsafe return path %s",
    (value) => {
      expect(safeRedirect(value)).toBe("/home");
      expect(safeRedirect("/scan")).toBe("/scan");
    },
  );
});
