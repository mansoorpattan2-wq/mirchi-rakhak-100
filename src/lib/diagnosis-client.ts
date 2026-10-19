import { firebaseAuthAdapter } from "./auth/firebase-browser";
import { authErrorCode } from "./auth/types";
import { diagnosisSchema, DiagnosisError, type DiagnosisLanguage } from "./diagnosis-contract";

export async function analyzePhoto(file: File, language: DiagnosisLanguage, signal: AbortSignal) {
  let token: string | null;
  try {
    token = await firebaseAuthAdapter.getAccessToken();
  } catch (error) {
    signal.throwIfAborted();
    const code = authErrorCode(error);
    if (["auth/user-token-expired", "auth/invalid-user-token", "auth/user-disabled"].includes(code))
      throw new DiagnosisError("AUTH_REQUIRED", 401, "Sign in again to analyze.");
    throw new DiagnosisError("AUTH_UNAVAILABLE", 503, "Sign-in verification is unavailable.");
  }
  signal.throwIfAborted();
  if (!token) throw new DiagnosisError("AUTH_REQUIRED", 401, "Sign in to analyze.");
  const form = new FormData();
  form.set("image", file);
  form.set("language", language);
  let response: Response;
  try {
    response = await fetch("/api/plant-diagnosis/analyze", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      signal,
    });
  } catch {
    signal.throwIfAborted();
    throw new DiagnosisError("NETWORK_ERROR", 503, "Could not reach the scan server.");
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    signal.throwIfAborted();
    throw new DiagnosisError(
      response.ok ? "INVALID_PROVIDER_RESPONSE" : "SERVER_UNAVAILABLE",
      response.ok ? 502 : response.status,
      "The server returned an invalid response.",
    );
  }
  if (!response.ok) {
    const code =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "code" in payload.error &&
      typeof payload.error.code === "string"
        ? payload.error.code
        : "REQUEST_FAILED";
    throw new DiagnosisError(code, response.status, "Analysis failed.");
  }
  const parsed = diagnosisSchema.safeParse(payload);
  if (!parsed.success || parsed.data.language !== language)
    throw new DiagnosisError("INVALID_PROVIDER_RESPONSE", 502, "Incomplete assessment.");
  return parsed.data;
}
