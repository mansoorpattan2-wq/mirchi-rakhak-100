import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { createDiagnosisHandler } from "../src/server/plant-diagnosis/handler.server";
import { prepareImage } from "../src/server/plant-diagnosis/image.server";
import { diagnosisSchema, DiagnosisError, MAX_IMAGE_BYTES } from "../src/lib/diagnosis-contract";
import { createDiagnosisLimiter } from "../src/server/plant-diagnosis/limits.server";
import { assessment, scenarios } from "./fixtures";

let sample: Buffer;
beforeAll(async () => {
  sample = await readFile(new URL("../public/samples/leaf_spot.jpg", import.meta.url));
});
const configure = () => ({ provider: "gemini" as const, apiKey: "test-key", model: "test-model" });
function request(bytes: BlobPart = sample, language = "en", type = "image/jpeg") {
  const form = new FormData();
  form.set("image", new File([bytes], "photo.jpg", { type }));
  form.set("language", language);
  return new Request("http://localhost/api/plant-diagnosis/analyze", {
    method: "POST",
    body: form,
  });
}
function setup(result = assessment()) {
  const analyze = vi.fn().mockResolvedValue(result);
  const release = vi.fn();
  const handle = createDiagnosisHandler({
    configure,
    authenticate: async () => "user-1",
    acquire: () => release,
    provider: { analyze },
  });
  return { analyze, release, handle };
}

describe("mocked diagnosis contract and transport (no live AI)", () => {
  it.each(scenarios)(
    "returns the provider's $name category without a selected disease",
    async ({ value }) => {
      const { handle, analyze, release } = setup(value);
      const response = await handle(request());
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(value);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const input = analyze.mock.calls[0][0];
      expect(input.mimeType).toBe("image/jpeg");
      expect(input.bytes.length).toBeGreaterThan(100);
      expect(input).not.toHaveProperty("diseaseId");
      expect((await sharp(input.bytes).metadata()).format).toBe("jpeg");
      expect(release).toHaveBeenCalledOnce();
    },
  );
  it.each(["en", "te", "hi"] as const)("requests and validates %s output", async (language) => {
    const { handle, analyze } = setup(assessment({ language }));
    expect((await handle(request(sample, language))).status).toBe(200);
    expect(analyze.mock.calls[0][0].language).toBe(language);
  });
  it("rejects unknown languages before calling AI", async () => {
    const { handle, analyze } = setup();
    expect((await handle(request(sample, "xx"))).status).toBe(400);
    expect(analyze).not.toHaveBeenCalled();
  });
  it.each([
    ["corrupt JPEG", new Uint8Array([255, 216, 255, 0, 0, 0]), 400],
    ["unsupported content with forged image MIME", "This is not an image", 415],
    ["empty image", new Uint8Array(), 400],
    ["oversized image", new Uint8Array(MAX_IMAGE_BYTES + 1), 413],
  ])("rejects %s without calling AI", async (_name, bytes, status) => {
    const { handle, analyze, release } = setup();
    expect((await handle(request(bytes as BlobPart))).status).toBe(status);
    expect(analyze).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledOnce();
  });
  it("does not trust content length", async () => {
    const { handle, analyze } = setup();
    const req = request(new Uint8Array(MAX_IMAGE_BYTES + 100_000));
    req.headers.set("content-length", "1");
    expect((await handle(req)).status).toBe(413);
    expect(analyze).not.toHaveBeenCalled();
  });
  it("rejects multiple files and unexpected diagnosis fields", async () => {
    for (const field of ["image", "diseaseId"]) {
      const form = new FormData();
      form.append("image", new File([sample], "leaf.jpg"));
      form.append(field, "chli_01_leaf_curl");
      const { handle, analyze } = setup();
      expect(
        (
          await handle(
            new Request("http://localhost/api/plant-diagnosis/analyze", {
              method: "POST",
              body: form,
            }),
          )
        ).status,
      ).toBe(400);
      expect(analyze).not.toHaveBeenCalled();
    }
  });
  it("rejects missing authentication before reading images", async () => {
    const { analyze } = setup();
    const handle = createDiagnosisHandler({
      configure,
      authenticate: async () => {
        throw new DiagnosisError("AUTH_REQUIRED", 401, "Sign in");
      },
      provider: { analyze },
    });
    expect((await handle(request())).status).toBe(401);
    expect(analyze).not.toHaveBeenCalled();
  });
  it("returns configuration failure without leaking secrets", async () => {
    const { analyze } = setup();
    const handle = createDiagnosisHandler({
      configure: () => {
        throw new DiagnosisError("CONFIGURATION_ERROR", 503, "Set server credentials");
      },
      provider: { analyze },
    });
    const response = await handle(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("test-key");
    expect(analyze).not.toHaveBeenCalled();
  });
  it.each([
    ["PROVIDER_TIMEOUT", 504],
    ["PROVIDER_RATE_LIMIT", 429],
    ["PROVIDER_UNAVAILABLE", 502],
    ["INVALID_PROVIDER_RESPONSE", 502],
  ])("handles %s without a fabricated diagnosis", async (code, status) => {
    const { handle, analyze, release } = setup();
    analyze.mockRejectedValue(new DiagnosisError(String(code), Number(status), "Retry", 60));
    const response = await handle(request());
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({
      status: "error",
      error: { code, message: "Retry", retry_after_seconds: 60 },
    });
    expect(release).toHaveBeenCalledOnce();
  });
  it("rejects malformed or wrong-language provider output", async () => {
    const { handle, analyze } = setup();
    for (const value of [
      { category: "diseased" },
      assessment({ language: "hi" }),
      assessment({ category: "invalid_image" }),
    ]) {
      analyze.mockResolvedValue(value);
      expect((await handle(request())).status).toBe(502);
    }
  });
  it("sanitizes unexpected failures", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { handle, analyze } = setup();
    analyze.mockRejectedValue(new Error("PRIVATE_SECRET stack trace"));
    const response = await handle(request());
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("PRIVATE_SECRET");
    expect(log).toHaveBeenCalledWith("[plant-diagnosis]", {
      code: "INTERNAL_ERROR",
      status: 500,
      stage: "provider",
      duration_ms: expect.any(Number),
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("PRIVATE_SECRET");
  });
  it("requires POST and same-origin browser requests", async () => {
    const { handle } = setup();
    expect((await handle(new Request("http://localhost/api/plant-diagnosis/analyze"))).status).toBe(
      405,
    );
    const req = request();
    req.headers.set("origin", "https://other.example");
    expect((await handle(req)).status).toBe(403);
  });
  it("does not allow confidence percentages or contradictory results", () => {
    expect(diagnosisSchema.safeParse({ ...assessment(), confidence: 0.98 }).success).toBe(false);
    expect(
      diagnosisSchema.safeParse(assessment({ category: "healthy", image_quality: "poor" })).success,
    ).toBe(false);
    expect(
      diagnosisSchema.safeParse(assessment({ category: "wrong_plant", is_chilli_plant: true }))
        .success,
    ).toBe(false);
  });
});

describe("actual image decoding", () => {
  it.each(["png", "webp", "jpeg"] as const)(
    "accepts %s bytes regardless of filename/MIME",
    async (format) => {
      const encoded = await sharp(sample).toFormat(format).toBuffer();
      const result = await prepareImage(
        new File([encoded], "misleading.txt", { type: "text/plain" }),
      );
      expect((await sharp(result).metadata()).format).toBe("jpeg");
    },
  );
  it("normalizes EXIF orientation, strips metadata and resizes", async () => {
    const source = await sharp({
      create: { width: 2000, height: 1000, channels: 3, background: "green" },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const result = await prepareImage(new File([source], "rotated.jpg"));
    const metadata = await sharp(result).metadata();
    expect(metadata.width).toBe(800);
    expect(metadata.height).toBe(1600);
    expect(metadata.exif).toBeUndefined();
    expect(metadata.orientation).toBeUndefined();
  });
  it("rejects decompression bombs over 24 MP", async () => {
    const bytes = await sharp({
      create: { width: 5000, height: 5000, channels: 3, background: "green" },
    })
      .png()
      .toBuffer();
    await expect(prepareImage(new File([bytes], "large.png"))).rejects.toMatchObject({
      code: "INVALID_IMAGE",
    });
  });
});

describe("request quotas", () => {
  it("prevents concurrent scans per user and caps concurrent decodes", () => {
    const acquire = createDiagnosisLimiter();
    const release = acquire("a");
    expect(() => acquire("a")).toThrowError(/already/);
    acquire("b");
    acquire("c");
    expect(() => acquire("d")).toThrowError(/busy/);
    release();
    expect(() => acquire("d")).not.toThrow();
  });
  it("limits each user to five scans per minute and resets the minute", () => {
    let time = 0;
    const acquire = createDiagnosisLimiter(() => time);
    for (let i = 0; i < 5; i++) acquire("a")();
    expect(() => acquire("a")).toThrowError(/limit/);
    time = 60_001;
    expect(() => acquire("a")).not.toThrow();
  });
  it("enforces daily user and global budgets", () => {
    let time = 0;
    const acquire = createDiagnosisLimiter(() => time);
    for (let i = 0; i < 50; i++) {
      time += 60_001;
      acquire("a")();
    }
    expect(() => acquire("a")).toThrowError(/limit/);
    for (let i = 0; i < 450; i++) acquire(`user-${i}`)();
    expect(() => acquire("fresh")).toThrowError(/limit/);
    time = 86_400_001;
    expect(() => acquire("a")).not.toThrow();
  });
});
