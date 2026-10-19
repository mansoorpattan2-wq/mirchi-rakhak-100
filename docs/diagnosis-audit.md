# Diagnosis implementation audit

This records the original diagnosis phase. Authentication has since moved from the initial Supabase scaffold to Firebase; see [the current authentication implementation and verification](firebase-auth.md). Historical Supabase references below describe that earlier phase.

## Before editing

- The outer directory is an npm script wrapper; the app is the inner `Mirchi Ai App` directory. This checkout contains no usable `.git` repository.
- Frontend: React 19, TanStack Router/Start, Vite, Tailwind, Lucide and Sonner; mobile layout uses `PhoneShell`.
- Backend: TanStack Start SSR with a custom error-wrapper `src/server.ts`. No image API routes, FastAPI app, trained inference function or vision-provider call existed.
- Authentication/database: Supabase package and public environment settings exist. The auth-attacher middleware was a pass-through placeholder; there was no browser Supabase client or real sign-in flow. Profile fields and scan history were local/demo data. No diagnosis database retention was required.
- Camera/gallery: `ScanView.tsx` already provided getUserMedia, canvas capture, `capture="environment"` file input, gallery input, preview and samples.
- Exact broken path: `handleFileChange` called `runScan(reader.result, "chli_01_leaf_curl")`. `runScan` used a timer, looked up that disease (or the first disease for live capture), generated a random 93–98 confidence score, and assigned recovery days from the static severity label. Samples selected their own disease ID. No image pixels reached a backend or inference model.
- The screen claimed cellular/biomarker analysis without doing it. Static treatments and recovery estimates were displayed as a photo diagnosis. Profile claimed offline diagnosis from eight cached classes. There were no wrong-plant, non-plant, unknown or ambiguous-image categories.
- Existing localization covers English, Telugu and Hindi but static treatment details had English-only gaps. Telugu font existed; Hindi font and robust dynamic result language handling were missing.
- `.env` existed but was not ignored. It contained Supabase configuration names; no Gemini key/model was present. Secret values were not printed during inspection.
- Deployment: Lovable Vite wrapper, Nitro with a default Cloudflare module target and generated Wrangler artifacts. Native image decoding requires the documented Node hosting change.
- Verification baseline: no tests/test runner; 649 lint errors (641 formatting-fixable). Type checking found the auth placeholder registered a request middleware as function middleware; this mismatch has been fixed.

## Plan implemented

1. Define a strict shared response schema with category consistency checks and a versioned diagnostic system prompt.
2. Add an authenticated TanStack multipart route; enforce bounded uploads, concurrency/quotas, full image decoding, orientation normalization and metadata removal.
3. Implement a replaceable Gemini adapter with an explicit configured model, native structured output, timeouts, no automatic retries and safe error mapping.
4. Reuse ScanView's camera/native/gallery entry points, replacing the simulated inference path with preview and explicit analysis. Retain capture, flip, torch, samples, voice and opt-in saved assessments.
5. Render truthful, accessible category states and complete selected-language output; remove fabricated diagnosis, treatment and offline claims.
6. Add deterministic API/provider/auth/codec/UI tests and document setup, privacy, costs, Node deployment and remaining live/device verification.

## Important limitations

- Local Gemini credentials and access to gemini-3.8-flash are now configured and verified. Deployments still need their own backend secret settings, and users must sign in through Supabase. No agricultural accuracy claim is made.
- A photograph cannot confirm a pathogen. The provider prompt and result screen disclose uncertainty and request expert confirmation where appropriate.
- Node deployment is required for the chosen native decoder; the existing Workers deployment cannot run this backend unchanged.
- Quotas are per process; a shared limiter is required for distributed deployment.
- Physical Android camera/torch and permissions still need device testing; mobile-width Edge rendering has been checked separately from the simulated DOM tests.
- Unrelated demo dashboard/chat/profile behaviors were preserved; adding diagnosis does not turn those features into connected services.

## Verification results (19 October 2026)

- 75 automated tests pass across API/schema/codec/quota, Gemini adapter, Supabase authentication and camera/gallery/result UI suites. Provider and authentication responses are mocked; actual local sample bytes are decoded by sharp. Regression checks cover Gemini-compatible status enums and model-specific reasoning configuration.
- TypeScript checking and the Node production build pass. The first sandboxed build failed on Windows dependency-tracing `readlink` permissions; the approved build outside that sandbox succeeded.
- All changed TypeScript/TSX files pass ESLint. Full-project lint still has 550 pre-existing errors in unrelated files, reduced from the 649-error baseline by formatting touched files and replacing ScanView. No unrelated mass-format was applied.
- npm audit initially reported 17 advisories (including critical TanStack/Seroval dependencies). Compatible updates removed the high/critical advisories. The unused TensorFlow package was then removed; no application code imported it. npm now reports zero vulnerabilities.
- The built server starts and serves `/scan` with HTTP 200. Its diagnosis endpoint returns the expected safe HTTP 503 `CONFIGURATION_ERROR` when Gemini key/model are absent, rather than a fabricated assessment. No server-only Gemini identifiers were found in built public JavaScript.
- Headless Edge browser tests pass at 320px and 390px in English, Telugu and Hindi, including authenticated multipart uploads and all result categories with intercepted provider responses. There were no browser runtime errors or horizontal overflow. Telugu/Hindi screenshots were visually inspected; fonts and result text wrap correctly. These checks use mocked sessions/diagnoses and never call the real provider.
- After local key configuration, Google accepted the credentials and listed the configured gemini-3.8-flash model. Real image requests through the actual backend adapter then passed strict schema validation in English. Live testing exposed a fixed-value schema compatibility issue and insufficient cross-field guidance; these were fixed using a string enum, field descriptions and explicit category consistency instructions. The final low-reasoning check returned a valid cautious uncertain result in approximately 23 seconds. Another successful response returned a suspected leaf-spot assessment. Neither result is validated diagnostic ground truth.
- Physical-device camera behavior, live Telugu/Hindi responses and the complete browser-to-Supabase-to-Gemini authenticated journey remain unverified. No authentication bypass was introduced; direct-service checks use the explicit local test:live utility.
