import { getDiagnosisConfig } from "./config.server";
import { GeminiPlantDiagnosisProvider, type PlantDiagnosisProvider } from "./provider.server";
import { OpenAIPlantDiagnosisProvider } from "./openai.server";

// Resolve configuration per request, after authentication/configuration checks in the handler.
// Never switch providers automatically: that would send a photo to a different service.
export function createConfiguredDiagnosisProvider(): PlantDiagnosisProvider {
  return {
    analyze(input) {
      return (
        getDiagnosisConfig().provider === "openai"
          ? new OpenAIPlantDiagnosisProvider()
          : new GeminiPlantDiagnosisProvider()
      ).analyze(input);
    },
  };
}
