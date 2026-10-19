import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuth } from "firebase-admin/auth";
import { initializeApp } from "firebase-admin/app";
import { authenticateDiagnosis } from "../src/server/plant-diagnosis/auth.server";

vi.mock("firebase-admin/app", () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(() => ({ name: "test" })),
}));
vi.mock("firebase-admin/auth", () => ({ getAuth: vi.fn() }));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
const configure = () => vi.stubEnv("FIREBASE_PROJECT_ID", "test-firebase-project");
const request = (token?: string) =>
  new Request("http://localhost/", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
function verifier(
  value: unknown = { uid: "verified-user", auth_time: Math.floor(Date.now() / 1000) },
) {
  const verifyIdToken = vi.fn().mockResolvedValue(value);
  vi.mocked(getAuth).mockReturnValue({ verifyIdToken } as unknown as ReturnType<typeof getAuth>);
  return verifyIdToken;
}

describe("diagnosis authentication uses the official Firebase token verifier", () => {
  it("rejects missing project configuration", async () => {
    vi.stubEnv("FIREBASE_PROJECT_ID", "");
    await expect(authenticateDiagnosis(request())).rejects.toMatchObject({
      code: "AUTH_CONFIGURATION",
      status: 503,
    });
  });
  it.each([undefined, "", " ", "x".repeat(9000)])(
    "rejects missing or oversized bearer tokens",
    async (token) => {
      configure();
      await expect(authenticateDiagnosis(request(token))).rejects.toMatchObject({ status: 401 });
      expect(getAuth).not.toHaveBeenCalled();
    },
  );
  it("pins verification to the configured project and uses the SDK signature verifier", async () => {
    configure();
    const verifyIdToken = verifier();
    expect(await authenticateDiagnosis(request("test-id-token"))).toBe("verified-user");
    expect(initializeApp).toHaveBeenCalledWith(
      { projectId: "test-firebase-project" },
      "mirchirakshak-auth-test-firebase-project",
    );
    expect(verifyIdToken).toHaveBeenCalledWith("test-id-token");
  });
  it.each([
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/invalid-id-token",
    "auth/id-token-revoked",
    "auth/user-disabled",
  ])("rejects %s without disclosing verifier internals", async (code) => {
    configure();
    verifier().mockRejectedValue({ code, message: "private token and stack details" });
    await expect(authenticateDiagnosis(request("invalid"))).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      status: 401,
    });
  });
  it.each([
    { uid: "", auth_time: 10 },
    { uid: "u" },
    { uid: "u", auth_time: Math.floor(Date.now() / 1000) + 999 },
  ])("rejects missing subject/auth time or future authentication", async (claims) => {
    configure();
    verifier(claims);
    await expect(authenticateDiagnosis(request("invalid"))).rejects.toMatchObject({ status: 401 });
  });
  it("returns a retryable service error if public signing keys are unavailable", async () => {
    configure();
    verifier().mockRejectedValue({
      code: "auth/internal-error",
      message: "certificate fetch failed",
    });
    await expect(authenticateDiagnosis(request("token"))).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
      status: 503,
    });
  });
  it("bounds verification latency", async () => {
    vi.useFakeTimers();
    configure();
    verifier().mockReturnValue(new Promise(() => {}));
    const result = expect(authenticateDiagnosis(request("token"))).rejects.toMatchObject({
      code: "AUTH_UNAVAILABLE",
      status: 503,
    });
    await vi.advanceTimersByTimeAsync(8001);
    await result;
  });
});
