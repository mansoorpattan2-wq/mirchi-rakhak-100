# Firebase authentication and welcome screens

The current authentication provider is Firebase for project `mir1-f1078`. Supabase settings and dependencies are preserved for the next database phase; they are no longer used for sign-in or diagnosis authorization. No Firestore database, cloud storage, messaging or Analytics tracking was enabled by this work.

## Required console setup

A read-only configuration probe and a sign-in attempt with a non-existent `.invalid` address returned HTTP 400 `CONFIGURATION_NOT_FOUND`. No account was created and no email was sent. Local code cannot enable the project's Authentication service using its public web configuration alone.

In [Firebase Console → Authentication](https://console.firebase.google.com/project/mir1-f1078/authentication):

1. Choose **Get started** if Authentication has not been initialized.
2. Under **Sign-in method**, enable **Email/Password**. Enable **Google** as well to use the Google button; select the requested support email.
3. Under **Settings → Authorized domains**, add `localhost` for local Google sign-in and your production domain before deploying. Add any other development hostname you actually use.
4. Restart the app after changing environment values, then create your own account at `/signup`.

The interface and automated checks are complete, but successful live signup/login cannot be claimed until this console configuration is available. Official references: [web authentication](https://firebase.google.com/docs/auth/web/start), [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [password reset](https://firebase.google.com/docs/auth/web/manage-users), and [ID-token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens).

## Routes and behavior

| Route                                            | Behavior                                                                                                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                              | Restores the Firebase session. Signed-in users go to Home; first-time signed-out users see the three welcome screens; returning signed-out users go to Login. |
| `/welcome`                                       | Replayable three-step introduction with original code-native illustrations, progress, Back/Next, Skip and Get started.                                        |
| `/login`                                         | Email/password, remember-me, password visibility, Google sign-in and reset/signup links.                                                                      |
| `/signup`                                        | Full name, email, password and confirmation, with validation and Google sign-in.                                                                              |
| `/forgot-password`                               | Password-reset request and an account-neutral success message.                                                                                                |
| `/logout`                                        | Explicit confirmation, actual Firebase sign-out and a signed-out screen. Merely loading this route does not perform a mutation.                               |
| `/home`, `/scan`, `/market`, `/chat`, `/profile` | Require an authenticated client session; unauthenticated visits return to Login with a safe internal destination.                                             |

All new screens support English, Telugu and Hindi, honor reduced-motion preferences and work at narrow mobile widths. The introduction is shown once per browser unless replayed from Profile; its local completion marker is separate from authentication and never grants access. Dashboard greeting and profile account information use the signed-in user's name/email. Existing demo farm/weather/market data remain demo data until the later data integration.

## Security and provider boundary

- `src/lib/auth/types.ts` defines the provider-independent `AuthAdapter` interface. `firebase-browser.ts` implements it; the provider/context exposes normalized account data to views. A later Supabase adapter can implement the same interface.
- Firebase's SDK handles persistence, token refresh and cross-tab auth changes. Remember-me chooses browser-local persistence; unchecked remember-me uses session persistence. There are no handmade production sessions or passwords in localStorage.
- Authenticated diagnosis requests fetch a current Firebase ID token from the SDK. `src/server/auth/firebase.server.ts` uses the official Admin SDK verifier and an explicit server-side `FIREBASE_PROJECT_ID`, enforcing signature/issuer/audience/expiry and valid authentication timestamps. Missing, malformed or wrong-project tokens are rejected; Google signing-certificate retrieval is bounded by an eight-second response deadline.
- Token verification uses Google's public signing keys and does not require a service-account private key for this operation. No user-management or database Admin API is called. Signing out removes this device's Firebase session; standard ID tokens already issued remain valid until expiry. Global revocation/user-disable checks would require a separately configured administrative policy/credentials.
- Return destinations are allowlisted to the app's private pages. External URLs, auth loops and arbitrary redirect paths are rejected.
- Forms prevent duplicate submissions. Firebase errors are mapped to safe localized text; raw exceptions, tokens and passwords are not rendered or logged.
- Public `VITE_FIREBASE_*` values belong in the browser. `GEMINI_API_KEY` remains backend-only. The provided Firebase config was added to the existing ignored `.env` without changing the Gemini key or Supabase values.
- Firebase's package included an old gRPC transitive dependency. A narrow `@grpc/grpc-js` override selects the patched 1.14.6+ line; current npm audit reports zero vulnerabilities. No forced downgrade of Firebase was applied.

## Verification

```powershell
npm test
npm run typecheck
npm run build
# With the dev server running and installed Edge/Chromium:
npm run test:auth-browser
npm run test:browser
```

The expanded suite has 113 passing automated tests, including Firebase adapter calls, account forms, all onboarding steps/languages, signup validation, Google popup errors, password reset, backend token verification/error handling/deadlines, and the existing diagnosis tests. Real-browser checks use the real Firebase browser SDK with mocked Identity Toolkit/token endpoints. They cover signup → Home → Profile → logout → protected-route redirect → login failure/retry → session restoration → reset in English, Telugu and Hindi, with screenshots at 320px and 390px. The separate scan browser suite confirms diagnosis categories and actual multipart/image transport after Firebase login, with diagnosis responses intercepted. These mocks are confined to test scripts and are never installed by the production app.

The live local diagnosis endpoint was also checked without credentials, with a malformed token and with a wrong-project token: all returned safe HTTP 401 `AUTH_REQUIRED` responses through the actual Admin SDK path. Live account creation, login, Google OAuth and email delivery remain blocked/unverified while the real project's Authentication configuration is missing. The already verified direct Gemini service remains available after Firebase console setup and real sign-in.

The initial production build compiled but its runtime smoke test exposed a Firebase Admin CommonJS bundling problem. `nitro.config.ts` now explicitly traces `firebase-admin` into the Node artifact instead of rebundling its interdependent entry points. The corrected production server was started and all five account/welcome routes returned HTTP 200; its diagnosis endpoint rejected an invalid token with safe HTTP 401 `AUTH_REQUIRED`. Compilation, TypeScript and runtime checks all pass. Changed files have zero ESLint errors (the conventional combined context/hook module has one Fast Refresh warning). Full-project lint still has 530 pre-existing errors in untouched files. No Gemini secret was found in the built public bundle. The final public Firebase configuration check still returned `CONFIGURATION_NOT_FOUND`.
