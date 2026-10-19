# Vercel deployment

Repository/project name: `mirchi-rakhak-100`. The repository root is the inner app directory, so Vercel's Root Directory is `.`.

The Vercel build uses the Nitro `vercel` preset, Node.js 24, `npm ci`, and `npm run build`. Local builds still use the standalone Node preset. `nitro.config.ts` sets the function duration to 120 seconds and traces Firebase Admin without rebundling its entry points. Uploads are limited to 4 MiB, leaving multipart overhead below Vercel's 4.5 MB function request limit. Keep the npm lockfile authoritative; `vercel.json` selects npm explicitly.

Configure these environment variables in Vercel before building:

- `PLANT_DIAGNOSIS_PROVIDER=openai`
- `NODE_OPTIONS=--experimental-require-module`
- `OPENAI_API_KEY`: the backend secret from your local `.env`
- `OPENAI_MODEL=gpt-6-luna`
- `FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
- Optional public Firebase settings: `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_MEASUREMENT_ID`

Private API keys stay unprefixed and are stored as sensitive Vercel environment variables. Public Firebase web settings must be present at build time. `.env` and `.vercel` are excluded from Git; local `.env` files are excluded from deployment uploads. Vercel builds from source on Linux so `sharp` installs the correct native binaries. Do not upload the Windows prebuilt output.

Vercel disables synchronous CommonJS loading of ES modules by default. Firebase Admin 14's `jwks-rsa` dependency loads the ESM-only `jose` package this way, so the `NODE_OPTIONS` setting above is required in both Production and Preview. Without it the build succeeds but pages fail at runtime with `ERR_REQUIRE_ESM`. This uses [Vercel's documented Node.js option](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration#experimental-nodejs-require-of-es-module), retaining the current Firebase and JOSE versions.

The unused local training-image directory under `src/data/Chilli Plant Diseases Dataset(Augmented)` is kept on disk and excluded from Git/deployment. The eight app sample photographs remain included.

After deployment, add the stable `mirchi-rakhak-100.vercel.app` hostname (and any custom domain) under **Firebase Console → Authentication → Settings → Authorized domains** to enable Google sign-in there. Preview deployment hostnames need their own authorization if you test Google sign-in on previews. Email/password and Google providers must be enabled in Firebase.

Verify the deployed welcome/login pages, protected redirects, static sample photos, and rejection of unauthenticated diagnosis requests. A real authenticated scan requires your own Firebase session; mocked browser tests cannot establish live authentication or agricultural accuracy.

The app's memory-based quotas apply per function instance and reset on cold starts. For shared limits across scaled instances, add a distributed gateway/limiter. Provider billing and usage caps remain separate from these app limits.

References: [TanStack Start on Vercel](https://vercel.com/kb/guide/deploy-a-tanstack-start-app-to-vercel), [Nitro Vercel preset](https://nitro.build/deploy/providers/vercel), [function request limits](https://vercel.com/docs/functions/limitations).
