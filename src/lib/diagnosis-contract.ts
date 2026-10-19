import { z } from "zod";

export const languages = ["en", "te", "hi"] as const;
export const categories = [
  "diseased",
  "healthy",
  "wrong_plant",
  "unknown_plant",
  "invalid_image",
  "uncertain",
] as const;
const text = z.string().min(1).max(2000);
const localizedName = z
  .object({ en: text.nullable(), te: text.nullable(), hi: text.nullable() })
  .strict();

// This base schema is also sent to Gemini; refinements below enforce cross-field rules.
export const diagnosisOutputSchema = z
  .object({
    status: z.enum(["success"]),
    category: z
      .enum(categories)
      .describe(
        "Use diseased/healthy only for an identified chilli with image_quality good. Poor/unusable quality requires uncertain or invalid_image; unidentified plants require unknown_plant.",
      ),
    is_chilli_plant: z
      .boolean()
      .nullable()
      .describe(
        "Must be true for diseased/healthy, false for wrong_plant/invalid_image, and null for unknown_plant. Use uncertain if chilli identity cannot support a disease assessment.",
      ),
    plant_name: text
      .nullable()
      .describe(
        "Standard English plant name, required for diseased, healthy and wrong_plant. Null for unknown_plant and invalid_image.",
      ),
    plant_name_local: localizedName,
    disease_name: text.nullable(),
    disease_name_local: localizedName,
    visible_symptoms: z.array(text).max(12),
    reasoning_summary: text,
    confidence_level: z.enum(["low", "medium", "high", "unavailable"]),
    uncertainty_notes: z.array(text).min(1).max(12),
    recommended_actions: z.array(text).min(1).max(12),
    image_quality: z
      .enum(["good", "poor", "unusable"])
      .describe(
        "Must be good for diseased or healthy. If poor/unusable, choose uncertain or invalid_image rather than diagnosing disease or health.",
      ),
    requires_expert_confirmation: z.boolean(),
    language: z.enum(languages),
  })
  .strict();

export const diagnosisSchema = diagnosisOutputSchema.superRefine((value, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message });
  const chilli = value.category === "diseased" || value.category === "healthy";
  if (
    chilli &&
    (value.is_chilli_plant !== true || !value.plant_name || value.image_quality !== "good")
  )
    issue("Chilli assessments require a recognizable plant and usable image.");
  if (
    value.category === "diseased" &&
    (!value.disease_name || !value.visible_symptoms.length || !value.requires_expert_confirmation)
  )
    issue("Suspected disease requires evidence and expert confirmation.");
  if (
    value.category !== "diseased" &&
    (value.disease_name !== null ||
      Object.values(value.disease_name_local).some((name) => name !== null))
  )
    issue("Only a diseased chilli assessment can have a disease name.");
  if (value.category === "wrong_plant" && (value.is_chilli_plant !== false || !value.plant_name))
    issue("Wrong plant requires an identified non-chilli plant.");
  if (
    (value.category === "unknown_plant" || value.category === "invalid_image") &&
    (value.plant_name !== null ||
      Object.values(value.plant_name_local).some((name) => name !== null))
  )
    issue("Unidentified/non-plant images cannot have invented plant names.");
  if (value.category === "invalid_image" && value.is_chilli_plant !== false)
    issue("An invalid image cannot be identified as chilli.");
  if (value.category === "unknown_plant" && value.is_chilli_plant !== null)
    issue("Unknown plant identity must be null.");
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type DiagnosisLanguage = (typeof languages)[number];
// Leave room for multipart fields below Vercel Functions' 4.5 MB request-body limit.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class DiagnosisError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "DiagnosisError";
  }
}
