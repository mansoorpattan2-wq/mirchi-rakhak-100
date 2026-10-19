import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { DiagnosisError } from "../../lib/diagnosis-contract";

export async function verifyFirebaseRequest(request: Request): Promise<string> {
  let deadline: ReturnType<typeof setTimeout> | undefined;
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId || !/^[a-z0-9-]+$/.test(projectId))
    throw new DiagnosisError(
      "AUTH_CONFIGURATION",
      503,
      "Sign-in is not configured on the server. Contact the administrator.",
    );
  const authorization = request.headers.get("authorization");
  if (
    !authorization?.startsWith("Bearer ") ||
    authorization.length > 8192 ||
    !authorization.slice(7).trim()
  )
    throw new DiagnosisError("AUTH_REQUIRED", 401, "Sign in to analyze your leaf photo.");
  try {
    // ID-token verification uses Google's cached public signing certificates, not a service-account secret.
    // The explicit project ID pins issuer/audience; no claims are trusted until SDK signature verification.
    const app =
      getApps().find((item) => item.name === `mirchirakshak-auth-${projectId}`) ??
      initializeApp({ projectId }, `mirchirakshak-auth-${projectId}`);
    const claims = await Promise.race([
      getAuth(app).verifyIdToken(authorization.slice(7)),
      new Promise<never>((_resolve, reject) => {
        deadline = setTimeout(
          () =>
            reject(
              new DiagnosisError(
                "AUTH_UNAVAILABLE",
                503,
                "Sign-in verification took too long. Please retry.",
              ),
            ),
          8000,
        );
      }),
    ]);
    if (
      !claims.uid ||
      !Number.isInteger(claims.auth_time) ||
      claims.auth_time < 0 ||
      claims.auth_time > Math.floor(Date.now() / 1000)
    )
      throw new DiagnosisError(
        "AUTH_REQUIRED",
        401,
        "Your session is invalid. Please sign in again.",
      );
    return claims.uid;
  } catch (error) {
    if (error instanceof DiagnosisError) throw error;
    const code =
      typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (
      typeof code === "string" &&
      [
        "auth/argument-error",
        "auth/invalid-id-token",
        "auth/id-token-expired",
        "auth/id-token-revoked",
        "auth/user-disabled",
      ].includes(code)
    )
      throw new DiagnosisError(
        "AUTH_REQUIRED",
        401,
        "Your session has expired or is invalid. Please sign in again.",
      );
    throw new DiagnosisError(
      "AUTH_UNAVAILABLE",
      503,
      "Sign-in could not be verified. Please retry.",
    );
  } finally {
    if (deadline) clearTimeout(deadline);
  }
}
