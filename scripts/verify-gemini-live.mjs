// Explicit live integration check: sends one local photograph to the selected AI provider.
// Invokes the real backend service directly; it does not bypass authentication on the HTTP route.
import { createServer, loadEnv } from "vite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DIAGNOSIS_PROVIDER_TIMEOUT_MS } from "../src/lib/diagnosis-timing.ts";

const env = loadEnv("development", process.cwd(), "");
for (const name of [
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "PLANT_DIAGNOSIS_PROVIDER",
]) {
  if (process.env[name] === undefined && env[name]) process.env[name] = env[name];
}
const language = process.argv[3] || "en";
if (!["en", "te", "hi"].includes(language)) {
  console.error("Choose en, te or hi as the response language.");
  process.exit(1);
}
const server = await createServer({
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
});
try {
  console.log(JSON.stringify({ live_provider: true, stage: "loading_backend" }));
  const { createConfiguredDiagnosisProvider } = await server.ssrLoadModule(
    "/src/server/plant-diagnosis/configured-provider.server.ts",
  );
  const { getDiagnosisConfig } = await server.ssrLoadModule(
    "/src/server/plant-diagnosis/config.server.ts",
  );
  const { prepareImage } = await server.ssrLoadModule(
    "/src/server/plant-diagnosis/image.server.ts",
  );
  const image = await readFile(resolve(process.argv[2] || "public/samples/leaf_spot.jpg"));
  const bytes = await prepareImage(new File([image], "live-check-photo"));
  const started = Date.now();
  console.log(
    JSON.stringify({
      live_provider: true,
      stage: "analyzing",
      timeout_ms: DIAGNOSIS_PROVIDER_TIMEOUT_MS,
    }),
  );
  const result = await createConfiguredDiagnosisProvider().analyze({
    bytes,
    mimeType: "image/jpeg",
    language,
    signal: AbortSignal.timeout(DIAGNOSIS_PROVIDER_TIMEOUT_MS),
  });
  console.log(
    JSON.stringify({
      live_provider: true,
      schema_validated: true,
      provider: getDiagnosisConfig().provider,
      model: getDiagnosisConfig().model,
      category: result.category,
      plant_name: result.plant_name,
      disease_name: result.disease_name,
      language: result.language,
      duration_ms: Date.now() - started,
      note: "Successful API transport and schema validation do not establish diagnostic accuracy.",
    }),
  );
} catch (error) {
  // Never print raw SDK exceptions, request headers, response bodies or credentials.
  console.error(
    JSON.stringify({
      live_provider: true,
      success: false,
      code:
        typeof error?.code === "string" && /^[A-Z_]+$/.test(error.code)
          ? error.code
          : "LIVE_CHECK_FAILED",
      status: typeof error?.status === "number" ? error.status : undefined,
      provider_status: error?.cause?.provider_status,
      transport: error?.cause?.transport,
      validation_issues: Array.isArray(error?.cause?.issues)
        ? error.cause.issues.map((issue) => ({
            path: issue.path,
            code: issue.code,
            message: issue.message,
          }))
        : undefined,
      finish_reason: error?.cause?.finishReason,
    }),
  );
  process.exitCode = 1;
} finally {
  await server.close();
}
