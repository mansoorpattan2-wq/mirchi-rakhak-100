import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GeminiPlantDiagnosisProvider } from "../src/server/plant-diagnosis/provider.server";
import { assessment } from "./fixtures";

// Exercise the real SDK retry policy against mocked HTTP, with no Google requests.
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.stubEnv("GEMINI_MODEL", "gemini-3.8-flash");
  vi.stubEnv("PLANT_DIAGNOSIS_PROVIDER", "gemini");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const analyze = (signal = new AbortController().signal) =>
  new GeminiPlantDiagnosisProvider().analyze({
    bytes: new Uint8Array([255, 216, 255]),
    mimeType: "image/jpeg",
    language: "en",
    signal,
  });
const success = () =>
  Response.json({
    candidates: [
      {
        finishReason: "STOP",
        content: { role: "model", parts: [{ text: JSON.stringify(assessment()) }] },
      },
    ],
  });
const unavailable = () =>
  Response.json({ error: { code: 503, status: "UNAVAILABLE", message: "Busy" } }, { status: 503 });

describe("bounded transient retry with the real Gemini SDK", () => {
  it("recovers from one HTTP 503 without a second browser upload", async () => {
    fetchMock.mockResolvedValueOnce(unavailable()).mockResolvedValueOnce(success());
    expect(await analyze()).toEqual(assessment());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("stops after two transient failures", async () => {
    fetchMock.mockImplementation(async () => unavailable());
    await expect(analyze()).rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it.each([400, 403, 429])("does not retry HTTP %s", async (status) => {
    fetchMock.mockResolvedValue(
      Response.json({ error: { code: status, message: "Rejected" } }, { status }),
    );
    await expect(analyze()).rejects.toHaveProperty("name", "DiagnosisError");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("honors cancellation before retrying", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async () => {
      controller.abort();
      return unavailable();
    });
    await expect(analyze(controller.signal)).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
