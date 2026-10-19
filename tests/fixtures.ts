import type { Diagnosis } from "../src/lib/diagnosis-contract";

// Contract fixtures for mocked tests, not validated ground truth for sample photographs.
export function assessment(overrides: Partial<Diagnosis> = {}): Diagnosis {
  return {
    status: "success",
    category: "diseased",
    is_chilli_plant: true,
    plant_name: "Chilli pepper",
    plant_name_local: { en: "Chilli pepper", te: "మిరప", hi: "मिर्च" },
    disease_name: "Leaf spot symptoms",
    disease_name_local: {
      en: "Leaf spot symptoms",
      te: "ఆకు మచ్చల లక్షణాలు",
      hi: "पत्ती पर धब्बे के लक्षण",
    },
    visible_symptoms: ["Brown spots on the leaf"],
    reasoning_summary: "Visible spots suggest a leaf-spot condition; the cause is unconfirmed.",
    confidence_level: "medium",
    uncertainty_notes: [
      "A photo cannot confirm the cause. Nutrient or environmental stress may overlap.",
    ],
    recommended_actions: [
      "Monitor affected leaves and consult a local agricultural expert before treatment.",
    ],
    image_quality: "good",
    requires_expert_confirmation: true,
    language: "en",
    ...overrides,
  };
}

const noDisease = { disease_name: null, disease_name_local: { en: null, te: null, hi: null } };
const noPlant = { plant_name: null, plant_name_local: { en: null, te: null, hi: null } };
export const scenarios: { name: string; value: Diagnosis }[] = [
  { name: "symptomatic chilli", value: assessment() },
  {
    name: "apparently healthy chilli",
    value: assessment({
      ...noDisease,
      category: "healthy",
      visible_symptoms: [],
      requires_expert_confirmation: false,
      reasoning_summary:
        "No obvious disease symptoms are visible. Early or invisible disease cannot be ruled out.",
    }),
  },
  {
    name: "tomato",
    value: assessment({
      ...noDisease,
      category: "wrong_plant",
      is_chilli_plant: false,
      plant_name: "Tomato",
      plant_name_local: { en: "Tomato", te: "టమాటా", hi: "टमाटर" },
    }),
  },
  {
    name: "brinjal",
    value: assessment({
      ...noDisease,
      category: "wrong_plant",
      is_chilli_plant: false,
      plant_name: "Brinjal",
      plant_name_local: { en: "Brinjal", te: "వంకాయ", hi: "बैंगन" },
    }),
  },
  {
    name: "person or object",
    value: assessment({
      ...noDisease,
      ...noPlant,
      category: "invalid_image",
      is_chilli_plant: false,
      visible_symptoms: [],
      reasoning_summary: "This photograph shows a person, not a usable plant image.",
    }),
  },
  {
    name: "animal",
    value: assessment({
      ...noDisease,
      ...noPlant,
      category: "invalid_image",
      is_chilli_plant: false,
      visible_symptoms: [],
      reasoning_summary: "This photograph shows an animal, not a usable plant image.",
    }),
  },
  {
    name: "blurry/dark leaf",
    value: assessment({
      ...noDisease,
      ...noPlant,
      category: "uncertain",
      is_chilli_plant: null,
      visible_symptoms: [],
      image_quality: "poor",
      confidence_level: "unavailable",
      reasoning_summary:
        "The image is dark and blurry. Please photograph a leaf in focus with good light.",
    }),
  },
  {
    name: "unknown plant",
    value: assessment({
      ...noDisease,
      ...noPlant,
      category: "unknown_plant",
      is_chilli_plant: null,
      visible_symptoms: [],
      reasoning_summary: "A plant is visible but its species is not clear.",
    }),
  },
];
