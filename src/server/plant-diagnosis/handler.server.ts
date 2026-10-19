import { z } from "zod";
import {
  DiagnosisError,
  diagnosisSchema,
  languages,
  MAX_IMAGE_BYTES,
} from "../../lib/diagnosis-contract";
import { authenticateDiagnosis } from "./auth.server";
import { getDiagnosisConfig } from "./config.server";
import { prepareImage } from "./image.server";
import { acquireDiagnosisSlot } from "./limits.server";
import { DIAGNOSIS_PROVIDER_TIMEOUT_MS } from "../../lib/diagnosis-timing";
import type { PlantDiagnosisProvider } from "./provider.server";
import { createConfiguredDiagnosisProvider } from "./configured-provider.server";

const MAX_BODY_BYTES = MAX_IMAGE_BYTES + 64 * 1024;
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

async function readForm(request: Request): Promise<FormData> {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    throw new DiagnosisError("INVALID_REQUEST", 415, "Send the photo as a multipart upload.");
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_BODY_BYTES)
    throw new DiagnosisError("IMAGE_TOO_LARGE", 413, "Choose a photo smaller than 4 MB.");
  if (!request.body) throw new DiagnosisError("INVALID_REQUEST", 400, "A photo is required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  const timer = setTimeout(() => {
    void reader.cancel();
  }, 15_000);
  const onAbort = () => {
    void reader.cancel();
  };
  request.signal.addEventListener("abort", onAbort, { once: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new DiagnosisError("IMAGE_TOO_LARGE", 413, "Choose a photo smaller than 4 MB.");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return await new Response(body, {
      headers: { "content-type": request.headers.get("content-type")! },
    }).formData();
  } catch (error) {
    if (error instanceof DiagnosisError) throw error;
    throw new DiagnosisError(
      "INVALID_REQUEST",
      400,
      "The upload was incomplete. Please choose the photo again.",
    );
  } finally {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", onAbort);
    reader.releaseLock();
  }
}

type Dependencies = {
  authenticate: typeof authenticateDiagnosis;
  configure: typeof getDiagnosisConfig;
  acquire: typeof acquireDiagnosisSlot;
  provider: PlantDiagnosisProvider;
};

export function createDiagnosisHandler(overrides: Partial<Dependencies> = {}) {
  const deps: Dependencies = {
    authenticate: authenticateDiagnosis,
    configure: getDiagnosisConfig,
    acquire: acquireDiagnosisSlot,
    provider: createConfiguredDiagnosisProvider(),
    ...overrides,
  };
  return async (request: Request): Promise<Response> => {
    let release: (() => void) | undefined;
    const started = Date.now();
    let stage = "configuration";
    try {
      if (request.method !== "POST")
        return Response.json(
          {
            status: "error",
            error: { code: "METHOD_NOT_ALLOWED", message: "Use POST to upload a photo." },
          },
          { status: 405, headers: { ...headers, Allow: "POST" } },
        );
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin)
        throw new DiagnosisError("INVALID_ORIGIN", 403, "Open the app to upload your photo.");
      deps.configure();
      stage = "authentication";
      const user = await deps.authenticate(request);
      stage = "upload";
      release = deps.acquire(user);
      const form = await readForm(request);
      if (
        form.getAll("image").length !== 1 ||
        form.getAll("language").length > 1 ||
        [...form.keys()].some((key) => key !== "image" && key !== "language")
      )
        throw new DiagnosisError(
          "INVALID_REQUEST",
          400,
          "Upload exactly one photo and a supported language.",
        );
      const file = form.get("image");
      const language = z.enum(languages).safeParse(form.get("language") ?? "en");
      if (!(file instanceof File) || !language.success)
        throw new DiagnosisError(
          "INVALID_REQUEST",
          400,
          "Choose a photo and English, Telugu or Hindi.",
        );
      stage = "image";
      const bytes = await prepareImage(file);
      const timeout = AbortSignal.timeout(DIAGNOSIS_PROVIDER_TIMEOUT_MS);
      const signal = AbortSignal.any([request.signal, timeout]);
      // Providers must honor the signal. The concrete SDK also has its own HTTP deadline.
      stage = "provider";
      const result = await deps.provider.analyze({
        bytes,
        mimeType: "image/jpeg",
        language: language.data,
        signal,
      });
      const parsed = diagnosisSchema.safeParse(result);
      if (!parsed.success || parsed.data.language !== language.data)
        throw new DiagnosisError(
          "INVALID_PROVIDER_RESPONSE",
          502,
          "The image service returned an incomplete assessment. Please retry.",
        );
      return Response.json(parsed.data, { headers });
    } catch (error) {
      const safe =
        error instanceof DiagnosisError
          ? error
          : new DiagnosisError(
              "INTERNAL_ERROR",
              500,
              "The photo could not be analyzed. Please retry.",
            );
      // Record only operational metadata: never tokens, user IDs, photos or model output.
      if (safe.status >= 500)
        console.error("[plant-diagnosis]", {
          code: safe.code,
          status: safe.status,
          stage,
          duration_ms: Date.now() - started,
        });
      return Response.json(
        {
          status: "error",
          error: {
            code: safe.code,
            message: safe.message,
            ...(safe.retryAfter ? { retry_after_seconds: safe.retryAfter } : {}),
          },
        },
        {
          status: safe.status,
          headers: {
            ...headers,
            ...(safe.retryAfter ? { "Retry-After": String(safe.retryAfter) } : {}),
          },
        },
      );
    } finally {
      release?.();
    }
  };
}

export const handleDiagnosis = createDiagnosisHandler();
