import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDiagnosisConfig } from "../src/server/plant-diagnosis/config.server";
import { createConfiguredDiagnosisProvider } from "../src/server/plant-diagnosis/configured-provider.server";
import { scanCopy, scanErrorMessage } from "../src/lib/scan-copy";
import { assessment, scenarios } from "./fixtures";

const fetchMock = vi.fn();
const completed = (value = assessment()) => ({
  status: "completed",
  output: [
    { type: "reasoning" },
    { type: "message", content: [{ type: "output_text", text: JSON.stringify(value) }] },
  ],
});
const analyze = (language: "en" | "te" | "hi" = "en", signal = new AbortController().signal) =>
  createConfiguredDiagnosisProvider().analyze({
    bytes: new Uint8Array([255, 216, 255, 10]),
    mimeType: "image/jpeg",
    language,
    signal,
  });

beforeEach(() => {
  vi.stubEnv("PLANT_DIAGNOSIS_PROVIDER", "openai");
  vi.stubEnv("OPENAI_API_KEY", "private-openai-key");
  vi.stubEnv("OPENAI_MODEL", "configured-vision-model");
  vi.stubEnv("GEMINI_API_KEY", "different-google-key");
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockImplementation(async () => Response.json(completed()));
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("configured OpenAI Responses API adapter, mocked HTTP only", () => {
  it("uses only the selected provider's credentials", () => {
    expect(getDiagnosisConfig()).toEqual({
      provider: "openai",
      apiKey: "private-openai-key",
      model: "configured-vision-model",
    });
    vi.stubEnv("OPENAI_API_KEY", "");
    expect(getDiagnosisConfig).toThrow(/OPENAI_API_KEY/);
    vi.stubEnv("OPENAI_API_KEY", "private-openai-key");
    vi.stubEnv("OPENAI_MODEL", "");
    expect(getDiagnosisConfig).toThrow(/OPENAI_MODEL/);
  });
  it("sends actual image bytes and strict native JSON schema without persistent response storage", async () => {
    expect(await analyze()).toEqual(assessment());
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(request.headers.Authorization).toBe("Bearer private-openai-key");
    const body = JSON.parse(request.body);
    expect(body).toMatchObject({
      model: "configured-vision-model",
      store: false,
      text: { format: { type: "json_schema", strict: true } },
    });
    expect(body.text.format.schema.additionalProperties).toBe(false);
    expect(body.text.format.schema.required).toContain("is_chilli_plant");
    expect(body.input[0].content[1]).toMatchObject({
      type: "input_image",
      image_url: "data:image/jpeg;base64,/9j/Cg==",
    });
    expect(request.body).not.toContain("private-openai-key");
    expect(request.body).not.toContain("different-google-key");
  });
  it.each(scenarios)("validates the $name category", async ({ value }) => {
    fetchMock.mockResolvedValue(Response.json(completed(value)));
    expect(await analyze()).toEqual(value);
  });
  it.each(["en", "te", "hi"] as const)("preserves %s output", async (language) => {
    fetchMock.mockResolvedValue(Response.json(completed(assessment({ language }))));
    expect((await analyze(language)).language).toBe(language);
  });
  it.each([
    { status: "incomplete", output: [] },
    { status: "failed", output: [] },
    {
      status: "completed",
      output: [{ type: "message", content: [{ type: "refusal", refusal: "Unavailable" }] }],
    },
    {
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: "not JSON" }] }],
    },
    completed(assessment({ category: "healthy" })),
    completed(assessment({ language: "te" })),
  ])("rejects incomplete, refused or inconsistent output %#", async (response) => {
    fetchMock.mockResolvedValue(Response.json(response));
    await expect(analyze()).rejects.toMatchObject({ code: "INVALID_PROVIDER_RESPONSE" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each([
    [400, "PROVIDER_CONFIGURATION"],
    [401, "PROVIDER_CONFIGURATION"],
    [403, "PROVIDER_CONFIGURATION"],
    [404, "PROVIDER_CONFIGURATION"],
    [429, "PROVIDER_RATE_LIMIT"],
  ])("does not retry HTTP %s or leak raw provider errors", async (status, code) => {
    fetchMock.mockResolvedValue(
      Response.json({ error: { message: "PRIVATE_SECRET" } }, { status: Number(status) }),
    );
    const error = await analyze().catch((e) => e);
    expect(error.code).toBe(code);
    expect(error.message).not.toContain("PRIVATE_SECRET");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("recovers from a transient failure and stops after one retry", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect(await analyze()).toEqual(assessment());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockReset().mockImplementation(async () => new Response(null, { status: 504 }));
    await expect(analyze()).rejects.toMatchObject({ code: "PROVIDER_TIMEOUT" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("honors cancellation without retrying", async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation(async () => {
      controller.abort();
      return new Response(null, { status: 503 });
    });
    await expect(analyze("en", controller.signal)).rejects.toMatchObject({
      code: "PROVIDER_TIMEOUT",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it.each(["en", "te", "hi"] as const)(
    "distinguishes app caps from provider quotas in %s",
    (language) => {
      expect(scanErrorMessage("RATE_LIMIT", language)).toBe(scanCopy[language].scanLimit);
      expect(scanErrorMessage("PROVIDER_RATE_LIMIT", language)).toBe(
        scanCopy[language].providerLimit,
      );
      expect(scanErrorMessage("SCAN_IN_PROGRESS", language)).toBe(
        scanCopy[language].scanInProgress,
      );
      expect(scanErrorMessage("SERVICE_BUSY", language)).toBe(scanCopy[language].busy);
      expect(
        new Set(
          ["RATE_LIMIT", "PROVIDER_RATE_LIMIT", "SCAN_IN_PROGRESS", "SERVICE_BUSY"].map((code) =>
            scanErrorMessage(code, language),
          ),
        ).size,
      ).toBe(4);
    },
  );
});
