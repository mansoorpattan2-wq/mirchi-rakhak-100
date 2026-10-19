import { DiagnosisError } from "../../lib/diagnosis-contract";

export function getDiagnosisConfig() {
  const provider = process.env.PLANT_DIAGNOSIS_PROVIDER?.trim() || "gemini";
  if (provider !== "gemini" && provider !== "openai")
    throw new DiagnosisError(
      "CONFIGURATION_ERROR",
      503,
      "The configured image provider is not supported. Contact the app administrator.",
    );
  const keyName = provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY";
  const modelName = provider === "openai" ? "OPENAI_MODEL" : "GEMINI_MODEL";
  const apiKey = process.env[keyName]?.trim();
  const model = process.env[modelName]?.trim();
  if (!apiKey || !model)
    throw new DiagnosisError(
      "CONFIGURATION_ERROR",
      503,
      `Image analysis is not configured. The administrator must set ${keyName} and ${modelName} on the server.`,
    );
  if (!/^[a-zA-Z0-9._-]+$/.test(model))
    throw new DiagnosisError(
      "CONFIGURATION_ERROR",
      503,
      "The server image model configuration is invalid.",
    );
  return { provider, apiKey, model };
}
