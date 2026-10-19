import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { DiagnosisError, diagnosisOutputSchema } from "../../lib/diagnosis-contract";
import { getDiagnosisConfig } from "./config.server";
import {
  validateProviderOutput,
  type DiagnosisInput,
  type PlantDiagnosisProvider,
} from "./provider.server";
import { PLANT_DIAGNOSIS_PROMPT } from "./prompt";

const responseSchema = z.object({
  status: z.literal("completed"),
  output: z.array(
    z.object({
      type: z.string(),
      content: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),
    }),
  ),
});

function httpError(status: number): DiagnosisError {
  if (status === 429)
    return new DiagnosisError(
      "PROVIDER_RATE_LIMIT",
      429,
      "The AI provider quota or rate limit was reached. Check API billing and limits, or retry later.",
      60,
    );
  if ([400, 401, 403, 404].includes(status))
    return new DiagnosisError(
      "PROVIDER_CONFIGURATION",
      503,
      "The image service key, selected model or request configuration is unavailable. Contact the administrator.",
    );
  if ([408, 504].includes(status))
    return new DiagnosisError(
      "PROVIDER_TIMEOUT",
      504,
      "Image analysis took too long. Please retry.",
    );
  return new DiagnosisError(
    "PROVIDER_UNAVAILABLE",
    502,
    "The image service is temporarily unavailable. Please retry shortly.",
  );
}

export class OpenAIPlantDiagnosisProvider implements PlantDiagnosisProvider {
  async analyze(input: DiagnosisInput) {
    const { apiKey, model } = getDiagnosisConfig();
    const body = JSON.stringify({
      model,
      instructions: PLANT_DIAGNOSIS_PROMPT,
      store: false,
      max_output_tokens: 4096,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Assess this photograph. Requested language: ${input.language}.`,
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${Buffer.from(input.bytes).toString("base64")}`,
              detail: "high",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "plant_assessment",
          strict: true,
          schema: zodToJsonSchema(diagnosisOutputSchema, {
            $refStrategy: "none",
            target: "openAi",
          }),
        },
      },
    });
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        input.signal.throwIfAborted();
        const response = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body,
          signal: input.signal,
          redirect: "error",
        });
        if (!response.ok) {
          // Discard provider error bodies; they can contain submitted data or credentials.
          await response.body?.cancel();
          if (attempt === 0 && [500, 502, 503, 504].includes(response.status)) {
            await delay(1000, undefined, { signal: input.signal });
            continue;
          }
          throw httpError(response.status);
        }
        const result = responseSchema.safeParse(await response.json());
        if (!result.success)
          throw new DiagnosisError(
            "INVALID_PROVIDER_RESPONSE",
            502,
            "The image service returned an incomplete assessment. Please retry.",
          );
        const content = result.data.output
          .filter((item) => item.type === "message")
          .flatMap((item) => item.content ?? []);
        if (content.some((item) => item.type === "refusal"))
          throw new DiagnosisError(
            "INVALID_PROVIDER_RESPONSE",
            502,
            "The image service could not assess this photo. Try a different photograph.",
          );
        return validateProviderOutput(
          content
            .filter((item) => item.type === "output_text")
            .map((item) => item.text ?? "")
            .join(""),
          input.language,
        );
      }
      throw httpError(503);
    } catch (error) {
      if (
        input.signal.aborted ||
        (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name))
      )
        throw httpError(504);
      if (error instanceof DiagnosisError) throw error;
      if (error instanceof SyntaxError)
        throw new DiagnosisError(
          "INVALID_PROVIDER_RESPONSE",
          502,
          "The image service returned invalid JSON.",
        );
      throw httpError(502);
    }
  }
}
