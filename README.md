# MirchiRakshak AI

React 19, TanStack Start/Router, Vite and Tailwind. Image diagnosis uses server-side Google Gemini or OpenAI, selected explicitly by environment configuration. No custom model or training dataset is required. The camera, native Android camera input, gallery and sample picker all use the same preview → explicit **Analyze Leaf** → authenticated backend → real image bytes → validated assessment flow.

Authentication now uses Firebase, with login, account creation, Google sign-in, password reset and an explicit sign-out page. First-time visitors see three skippable welcome screens. The interface supports English, Telugu and Hindi. See [Firebase setup and verification](docs/firebase-auth.md). Supabase database integration is reserved for the next phase.

For GitHub/Vercel deployment, see [Vercel deployment setup](docs/vercel-deployment.md).

## Local setup

Use Node 22.12+ or Node 24 LTS. Run commands here (the inner `Mirchi Ai App` directory):

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

If `.env` already exists, **keep it** and add the missing names from `.env.example`. Firebase web settings have been added locally; existing Gemini and Supabase settings are preserved. Configure locally in that file:

| Variable                                                                                            | Purpose                                                                                               |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                                                                                    | Secret Google AI Studio API key. Backend only.                                                        |
| `GEMINI_MODEL`                                                                                      | Explicit supported vision model with structured output, available to that key.                        |
| `PLANT_DIAGNOSIS_PROVIDER`                                                                          | `gemini` (default) or `openai`. Only the selected provider is called.                                  |
| `OPENAI_API_KEY`                                                                                    | Secret OpenAI Platform API key, required when selecting OpenAI. Backend only.                         |
| `OPENAI_MODEL`                                                                                      | Model accessible to that key, supporting Responses API image inputs and strict structured output.     |
| `FIREBASE_PROJECT_ID`                                                                               | Backend token-verification project ID. Must match the browser project.                                |
| `VITE_FIREBASE_API_KEY`                                                                             | Public Firebase web API key; distinct from the secret Gemini key.                                     |
| `VITE_FIREBASE_AUTH_DOMAIN`                                                                         | Firebase Authentication domain.                                                                       |
| `VITE_FIREBASE_PROJECT_ID`                                                                          | Browser Firebase project ID.                                                                          |
| `VITE_FIREBASE_APP_ID`                                                                              | Firebase web application ID.                                                                          |
| `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_MEASUREMENT_ID` | Remaining supplied public app configuration; no storage, messaging or analytics feature is activated. |

Never put an AI provider secret in a `VITE_*` variable. `.env`, `.env.*` and `.dev.vars` are ignored; `.env.example` is safe to commit. If a secret file was previously committed, adding an ignore rule does not remove it from history: rotate exposed secrets and remove the tracked file without rewriting published Lovable history.

To switch to OpenAI, set `PLANT_DIAGNOSIS_PROVIDER=openai`, `OPENAI_API_KEY` and `OPENAI_MODEL` in the inner app's `.env`, then restart the dev server (or set these server environment variables and restart production). Create your key in [OpenAI Platform](https://platform.openai.com/api-keys); configure API billing separately from your ChatGPT subscription. Keep the key in the local file rather than sharing it in chat. The adapter uses the [Responses API with base64 image input](https://developers.openai.com/api/docs/guides/images-vision) and [strict JSON schema output](https://developers.openai.com/api/docs/guides/structured-outputs). Responses are requested with `store: false`, then validated by the same local Zod and semantic rules. No OpenAI key or model is included in this repository; mocked tests do not verify account/model access or live diagnosis quality. There is no automatic provider fallback.

The official [model catalog](https://ai.google.dev/gemini-api/docs/models) currently documents `gemini-3.8-flash` as a stable example. Model access depends on the Google project; verify the model using AI Studio or the [Models API](https://ai.google.dev/api/models) with your own key. There is no silent model substitution. See [image inputs](https://ai.google.dev/gemini-api/docs/image-understanding) and [generateContent structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output). The implementation uses the official `@google/genai` SDK, inline image bytes and native JSON-schema output, validated again with Zod.

Restart Vite after changing backend environment values. Open the local URL printed by Vite (normally `http://localhost:8080/`). New visitors get a three-step introduction, then can create an account or sign in. Enable Firebase Authentication and its Email/Password and Google providers in the Firebase console first; the supplied project's live API currently returns `CONFIGURATION_NOT_FOUND`. Protected app pages require a restored Firebase session. The diagnosis endpoint verifies Firebase ID tokens with the official Admin SDK, checking their signatures, expiry and configured project. No sign-in bypass or test account is supplied in production.

## API contract

`POST /api/plant-diagnosis/analyze` requires `Authorization: Bearer <Firebase ID token>` and multipart fields:

- `image`: exactly one actual JPEG, PNG or WebP, at most 4 MiB and 24 megapixels. Animated files are rejected.
- `language`: `en`, `te`, or `hi` (default `en`). Extra fields, including disease selections, are rejected.

Success is HTTP 200 and a `Diagnosis` object defined in `src/lib/diagnosis-contract.ts`. The six categories are `diseased`, `healthy`, `wrong_plant`, `unknown_plant`, `invalid_image`, and `uncertain`. Results include plant/disease names where applicable, localized names, observable symptoms, evidence, actions, qualitative confidence, uncertainty, image quality and expert-confirmation guidance. Disease fields are null outside `diseased`. Only a recognizable chilli in a sufficiently clear image can be healthy/diseased. Unknown plants and non-plant photos cannot receive invented plant names.

Error bodies have this stable shape, with no diagnosis, stack trace or provider details:

```json
{
  "status": "error",
  "error": { "code": "CONFIGURATION_ERROR", "message": "Safe user-facing explanation" }
}
```

HTTP statuses: 400 invalid/corrupt request or image; 401 sign-in required; 403 cross-origin upload; 409 user's scan already running; 413 oversized request; 415 unsupported content; 429 app/provider quota; 502 provider/network/response failure; 503 missing configuration, inaccessible model or auth service; 504 provider timeout. Quota responses can include `retry_after_seconds` and `Retry-After`.

Provider behavior is isolated behind `PlantDiagnosisProvider` in `src/server/plant-diagnosis/provider.server.ts`, with selection in `configured-provider.server.ts` and OpenAI's adapter in `openai.server.ts`. A provider must be explicitly configured and return the same validated contract. There are no mock production predictions, random confidence scores or automatic disease selections. A transient upstream server failure can be retried once within the same deadline. The dedicated diagnostic prompt is versioned in `prompt.ts` and treats image text as untrusted content.

## Privacy, cost and limits

The server fully decodes the image, corrects EXIF orientation, resizes it to fit 1600 × 1600 without enlarging, strips metadata (including GPS), and sends a JPEG to the selected AI provider. Images are held in memory only during processing; uploads and diagnoses are not logged or automatically stored. Saving a result is opt-in and stores the assessment, without the photo, in this browser's existing scan-history key; profile settings can clear it. Review the selected provider's data terms, including [Gemini API terms](https://ai.google.dev/gemini-api/terms) or [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data), before using personal photographs. `store: false` does not imply zero retention by the provider.

One Analyze click makes one authenticated browser upload and at most two upstream model attempts if a transient server failure is retried. Language is sent in the same request; translation does not incur a second call. Switching languages after receiving a result preserves that assessment's original language; press Analyze to request a new assessment in the newly selected language. The UI explicitly explains this. Confidence is an unvalidated qualitative model assessment, never a scientific probability. No recovery time, severity percentage or pesticide dosage is fabricated.

The service has an 4 MiB file / approximately 4 MiB + 64 KiB total-body cap, a 15-second upload deadline, an 8-second authentication deadline, and a 90-second provider deadline. The browser has a 120-second outer deadline. It permits five attempts/user/minute, 50/user/day, 500 total/day, one in-flight scan/user and three concurrent scans/process. Attempts with invalid images still count. Requests have no-store cache headers. Configure Google project quotas and billing budgets separately; model/image token usage can incur charges. Check [current pricing](https://ai.google.dev/gemini-api/docs/pricing) rather than assuming a free tier is available.

The in-memory quotas reset on restart and apply **per process**. For horizontally scaled hosting, add a shared gateway or distributed limiter enforcing the same quotas before exposing this paid endpoint. Browser camera access requires HTTPS or localhost. A phone opening a computer's plain-HTTP LAN address cannot normally use live `getUserMedia`; native camera/gallery selection remains available. HEIC is unsupported: choose/export JPEG, PNG or WebP. Capture controls are tested with simulated browser media devices; physical Android camera permissions and device-specific torch support still need device testing.

## Node deployment

Build and run:

```powershell
npm run build
npm start
```

Deploy the `.output` artifact to a Node runtime with native `sharp` support. Build/install for the deployment OS; do not copy Windows native dependencies to Linux. Configure the backend variables in the host's secret/environment settings. Set public `VITE_FIREBASE_*` values **at build time** and `FIREBASE_PROJECT_ID` on the server; private Gemini settings are read by the server at runtime. Authorize your production domain in Firebase Authentication. Use HTTPS and allow enough memory for up to three concurrent image decodes. Use the host's `PORT`/`HOST` settings as appropriate.

**Hosting change:** the original Lovable wrapper defaulted to Cloudflare Workers. Full decoding uses native `sharp`, so `vite.config.ts` now selects Nitro's `node-server` preset. This backend cannot be deployed to Workers unchanged. Lovable builds may force the Cloudflare preset even if a different preset is specified; host this version on Node. To retain a Workers deployment, first replace the decoder with an audited Workers-compatible decoder/service and verify its pixel/resource limits. No deployment or production secret configuration has been performed here.

From the outer workspace directory, `npm run dev`, `npm run build`, `npm test`, `npm run typecheck`, and `npm run lint` forward to this app. `npm run start:production` starts its production output; the workspace's pre-existing `npm start` still starts development.

## Verification

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Vitest tests are deterministic **mocked-provider** tests. They cover all six result categories (including tomato, brinjal, person/object and animal), three response languages, malformed AI output, credentials, authentication, timeouts, quota/network errors, real JPEG/PNG/WebP decoding, corrupted/mislabelled/oversized files, EXIF orientation and metadata removal, gallery/native/live camera transport, preview gating, retry and duplicate prevention. Locally bundled sample leaf photos are used to test decoding and transport; their labels are not asserted as scientific ground truth. Synthetic images test codec behavior only. No copyrighted datasets are downloaded.

With the dev server running, `npm run test:browser` and `npm run test:auth-browser` run real-browser checks using installed Edge/Chrome and Node 24. On other systems, set `BROWSER_EXECUTABLE` to a Chromium executable; optionally set `TEST_BASE_URL`. These scripts exercise the real Firebase browser SDK against intercepted test-only API responses, never real accounts. The auth suite covers all three welcome screens, signup, validation, login failures, persistent sessions, protected routes, logout and password reset in all three languages. The scan suite also intercepts diagnosis responses and verifies all result categories and one authenticated multipart request per click. Layouts are checked at 320px and 390px. Screenshots are written to ignored `test-results` directories. No real users are created or emails sent by these tests.

For a live integration check, configure Gemini and enable Firebase Authentication, create your own account through the signup page, open Scan, choose a clear real leaf photo and Analyze. Confirm the browser makes a single authenticated multipart POST, the response has the correct category/schema/language, and API errors remain retryable. Then try another crop, a non-plant photo, a dark photo, and each language. Do not treat mocked tests as proof of live model accuracy. The local Gemini key has already been accepted by Google, and direct live Gemini image requests have passed schema validation in English. This verifies provider transport and response handling, not agricultural accuracy or the full Firebase-authenticated user journey.

To explicitly send one local photograph through the real backend service, run `npm run test:live -- public/samples/leaf_spot.jpg en` (optional languages: `en`, `te`, `hi`). This consumes provider quota and may incur charges. It does not disable authentication on the HTTP endpoint. The script never prints the API key, raw provider errors or submitted image. Gemini 3 models use the documented low reasoning level to keep latency within the service deadline; Gemini 2.5 does not receive that incompatible setting. See [Google's reasoning controls](https://ai.google.dev/gemini-api/docs/generate-content/thinking). The SDK retries a transient HTTP 500/502/503/504 once within the shared 90-second provider deadline; quota, credential and assessment-validation failures are not retried. Backend failure logs contain only error code, status, stage and elapsed time.

The original project had existing lint errors, mostly formatting. Touched files are checked separately from unrelated legacy files. The expanded 158-test suite covers both adapters, including OpenAI image/schema transport, categories, languages, refusal handling, quota errors, transient retries and cancellation. The scan suite covers error messages and retry recovery in all three languages. See `docs/diagnosis-audit.md` for the original diagnosis audit and `docs/firebase-auth.md` for the current authentication work.

The UI distinguishes the app's `RATE_LIMIT`, provider's `PROVIDER_RATE_LIMIT`, active scan's `SCAN_IN_PROGRESS` and server capacity's `SERVICE_BUSY`. Changing providers does not bypass the app's own five scans/minute, 50 scans/day/user or global budgets. Configure provider billing and quotas separately; an API key does not guarantee unlimited calls.

Scan error investigation (2026-10-19): live Gemini photo requests returned HTTP 503/504, including a minimal image request without the assessment schema. Model metadata, a tiny text-generation request and Firebase signing-certificate downloads succeeded. The longer timeout, bounded transient retry and localized error messages improve recovery, but do not guarantee availability while upstream image requests fail. The local configured model remains unchanged; alternate models were tested only through temporary process settings. Browser tests use mocked diagnosis responses and do not demonstrate live service recovery.
