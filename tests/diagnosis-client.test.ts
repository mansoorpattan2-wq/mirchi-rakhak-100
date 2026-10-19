import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { analyzePhoto } from "../src/lib/diagnosis-client";
import { firebaseAuthAdapter } from "../src/lib/auth/firebase-browser";
import { scanCopy, scanErrorMessage } from "../src/lib/scan-copy";
import { assessment } from "./fixtures";

vi.mock("../src/lib/auth/firebase-browser", () => ({
  firebaseAuthAdapter: { getAccessToken: vi.fn() },
}));
const fetchMock = vi.fn();
const file = new File(["image"], "leaf.jpg", { type: "image/jpeg" });
afterEach(() => vi.unstubAllGlobals());
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(firebaseAuthAdapter.getAccessToken).mockResolvedValue("test-token");
  fetchMock.mockReset();
});

describe("scan request failures", () => {
  it("keeps the authenticated upload and validated response", async () => {
    fetchMock.mockResolvedValue(Response.json(assessment()));
    expect(await analyzePhoto(file, "en", new AbortController().signal)).toEqual(assessment());
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer test-token");
    expect(fetchMock.mock.calls[0][1].body.get("image")).toBe(file);
  });
  it.each([
    ["auth/network-request-failed", "AUTH_UNAVAILABLE"],
    ["auth/user-token-expired", "AUTH_REQUIRED"],
    ["auth/invalid-user-token", "AUTH_REQUIRED"],
  ])("normalizes token refresh failure %s", async (code, expected) => {
    vi.mocked(firebaseAuthAdapter.getAccessToken).mockRejectedValue({ code });
    await expect(analyzePhoto(file, "en", new AbortController().signal)).rejects.toMatchObject({
      code: expected,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("distinguishes a disconnected server from an invalid model response", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(analyzePhoto(file, "en", new AbortController().signal)).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
    fetchMock.mockResolvedValue(new Response("<html>Unavailable</html>", { status: 504 }));
    await expect(analyzePhoto(file, "en", new AbortController().signal)).rejects.toMatchObject({
      code: "SERVER_UNAVAILABLE",
      status: 504,
    });
  });
  it("does not start an upload after cancellation while refreshing a token", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(analyzePhoto(file, "en", controller.signal)).rejects.toHaveProperty(
      "name",
      "AbortError",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(["en", "te", "hi"] as const)("explains upstream errors in %s", (language) => {
    for (const code of [
      "AUTH_UNAVAILABLE",
      "NETWORK_ERROR",
      "PROVIDER_UNAVAILABLE",
      "INVALID_PROVIDER_RESPONSE",
      "SERVER_UNAVAILABLE",
    ])
      expect(scanErrorMessage(code, language)).not.toBe(scanCopy[language].failed);
  });
});
