import { createFileRoute } from "@tanstack/react-router";
import { handleDiagnosis } from "../server/plant-diagnosis/handler.server";

export const Route = createFileRoute("/api/plant-diagnosis/analyze")({
  server: { handlers: { POST: ({ request }) => handleDiagnosis(request) } },
});
