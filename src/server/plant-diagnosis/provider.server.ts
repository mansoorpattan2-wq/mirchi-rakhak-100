import { GoogleGenAI, ApiError, ThinkingLevel } from "@google/genai";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  diagnosisOutputSchema,
  diagnosisSchema,
  DiagnosisError,
  type Diagnosis,
  type DiagnosisLanguage,
} from "../../lib/diagnosis-contract";
import { getDiagnosisConfig } from "./config.server";
import { PLANT_DIAGNOSIS_PROMPT } from "./prompt";
import { DIAGNOSIS_PROVIDER_TIMEOUT_MS } from "../../lib/diagnosis-timing";

export interface DiagnosisInput {
  bytes: Uint8Array;
  mimeType: "image/jpeg";
  language: DiagnosisLanguage;
  signal: AbortSignal;
}
export interface PlantDiagnosisProvider {
  analyze(input: DiagnosisInput): Promise<Diagnosis>;
}

export function mapProviderError(error: unknown): DiagnosisError {
  if (error instanceof DiagnosisError) return error;
  if (
    (error instanceof Error &&
      ["AbortError", "TimeoutError", "RequestTimeoutError"].includes(error.name)) ||
    (error instanceof ApiError && error.status === 504)
  )
    return new DiagnosisError(
      "PROVIDER_TIMEOUT",
      504,
      "Image analysis took too long. Please retry.",
    );
  const status = error instanceof ApiError ? error.status : undefined;
  if (status === 429)
    return new DiagnosisError(
      "PROVIDER_RATE_LIMIT",
      429,
      "The image service is busy. Please wait before retrying.",
      60,
    );
  if (status === 401 || status === 403 || status === 404)
    return new DiagnosisError(
      "PROVIDER_CONFIGURATION",
      503,
      "The image service credentials or selected model are unavailable. Contact the administrator.",
    );
  const mapped = new DiagnosisError(
    "PROVIDER_UNAVAILABLE",
    502,
    "The image service could not be reached. Please retry shortly.",
  );
  // Keep only allowlisted transport diagnostics; SDK messages may contain request data.
  mapped.cause = {
    provider_status: status,
    transport:
      error instanceof Error
        ? ["fetch failed", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "UND_ERR_CONNECT_TIMEOUT"].find(
            (code) => error.message.includes(code),
          )
        : undefined,
  };
  return mapped;
}

export function validateProviderOutput(
  text: string | undefined,
  language: DiagnosisLanguage,
): Diagnosis {
  try {
    if (!text || text.length > 80_000) throw new Error("Invalid response size");
    const result = diagnosisSchema.parse(JSON.parse(text));
    if (result.language !== language) throw new Error("Unexpected response language");
    return result;
  } catch (cause) {
    const error = new DiagnosisError(
      "INVALID_PROVIDER_RESPONSE",
      502,
      "The image service returned an incomplete assessment. Please retry.",
    );
    // Retain internal validation context without returning it to the browser or logging output.
    error.cause = cause;
    throw error;
  }
}

// Replace this implementation to add an explicitly configured provider; the HTTP/UI contract stays stable.
export class GeminiPlantDiagnosisProvider implements PlantDiagnosisProvider {
  async analyze(input: DiagnosisInput): Promise<Diagnosis> {
    const { apiKey, model } = getDiagnosisConfig();
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: DIAGNOSIS_PROVIDER_TIMEOUT_MS,
        // One retry for transient upstream failures, sharing the request's total deadline.
        // Quotas, credentials, invalid input and invalid assessments require user action.
        retryOptions: {
          attempts: 2,
          initialDelay: 1,
          maxDelay: 2,
          httpStatusCodes: [500, 502, 503, 504],
        },
      },
    });
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: input.mimeType,
                  data: Buffer.from(input.bytes).toString("base64"),
                },
              },
              { text: `Assess this photograph. Requested language: ${input.language}.` },
            ],
          },
        ],
        config: {
          systemInstruction: PLANT_DIAGNOSIS_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: zodToJsonSchema(diagnosisOutputSchema, { $refStrategy: "none" }),
          // Gemini 3's low reasoning level keeps this bounded photo assessment within its deadline.
          // Gemini 2.5 uses a different API and must not receive thinkingLevel.
          ...(model.startsWith("gemini-3")
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
          maxOutputTokens: 4096,
          abortSignal: input.signal,
        },
      });
      if (response.candidates?.[0]?.finishReason !== "STOP") {
        const error = new DiagnosisError(
          "INVALID_PROVIDER_RESPONSE",
          502,
          "The image service could not complete this assessment. Try a different photo.",
        );
        error.cause = { finishReason: response.candidates?.[0]?.finishReason || "NO_CANDIDATE" };
        throw error;
      }
      return validateProviderOutput(response.text, input.language);
    } catch (error) {
      if (input.signal.aborted)
        throw new DiagnosisError(
          "PROVIDER_TIMEOUT",
          504,
          "Image analysis took too long. Please retry.",
        );
      throw mapProviderError(error);
    }
  }
}
