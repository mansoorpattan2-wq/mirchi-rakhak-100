// Test-only Firebase REST interception. No real accounts are created and no emails are sent.
import { loadEnv } from "vite";
import { accountCopy } from "../src/lib/auth/copy.ts";

export async function installFirebaseFixture(context) {
  const env = loadEnv("development", process.cwd(), "VITE_");
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId)
    throw new Error("Set the public Firebase project configuration before browser tests.");
  const uid = "browser-test-user";
  const email = "browser-grower@example.invalid";
  const password = "Browser-fixture-only-9!";
  const now = Math.floor(Date.now() / 1000);
  const token = [
    Buffer.from(JSON.stringify({ alg: "RS256", kid: "test-only", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: uid,
        user_id: uid,
        aud: projectId,
        iss: `https://securetoken.google.com/${projectId}`,
        email,
        email_verified: true,
        auth_time: now,
        iat: now,
        exp: now + 3600,
        firebase: { sign_in_provider: "password", identities: { email: [email] } },
      }),
    ).toString("base64url"),
    "mock-signature-never-accepted-by-the-real-backend",
  ].join(".");
  const state = {
    displayName: "Browser Grower",
    loginRequests: 0,
    signupRequests: 0,
    resetRequests: 0,
    loginError: null,
  };
  await context.route("https://identitytoolkit.googleapis.com/**", async (route) => {
    const url = route.request().url();
    const body = route.request().postData() ? route.request().postDataJSON() : {};
    let response;
    if (url.includes("accounts:signInWithPassword")) {
      state.loginRequests++;
      if (state.loginError) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: 400, message: state.loginError } }),
        });
        return;
      }
      response = {
        localId: uid,
        email,
        displayName: state.displayName,
        idToken: token,
        refreshToken: "mock-refresh",
        expiresIn: "3600",
        registered: true,
      };
    } else if (url.includes("accounts:signUp")) {
      state.signupRequests++;
      response = {
        localId: uid,
        email,
        idToken: token,
        refreshToken: "mock-refresh",
        expiresIn: "3600",
      };
    } else if (url.includes("accounts:update")) {
      if (body.displayName) state.displayName = body.displayName;
      response = {
        localId: uid,
        email,
        displayName: state.displayName,
        idToken: token,
        refreshToken: "mock-refresh",
        expiresIn: "3600",
      };
    } else if (url.includes("accounts:lookup")) {
      response = {
        users: [
          {
            localId: uid,
            email,
            displayName: state.displayName,
            emailVerified: true,
            createdAt: String(Date.now()),
            providerUserInfo: [
              { providerId: "password", email, displayName: state.displayName, rawId: email },
            ],
          },
        ],
      };
    } else if (url.includes("accounts:sendOobCode")) {
      state.resetRequests++;
      response = { email };
    } else if (url.includes("getRecaptchaConfig")) {
      response = { recaptchaKey: "", recaptchaEnforcementState: [] };
    } else if (url.includes("/projects")) {
      response = {
        projectId,
        authorizedDomains: ["localhost", "127.0.0.1", env.VITE_FIREBASE_AUTH_DOMAIN],
      };
    } else {
      throw new Error(`Unexpected test auth endpoint: ${new URL(url).pathname}`);
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
  await context.route("https://securetoken.googleapis.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: token,
        id_token: token,
        refresh_token: "mock-refresh",
        expires_in: "3600",
        token_type: "Bearer",
        user_id: uid,
        project_id: projectId,
      }),
    }),
  );
  return { token, email, password, state };
}

export async function waitForHydration(page) {
  await page.waitForFunction(() => {
    const input = document.querySelector("input,select,button");
    return input && Object.keys(input).some((key) => key.startsWith("__reactProps$"));
  });
}

export async function loginFixture(page, fixture, baseURL, language = "en", redirect = "/scan") {
  const c = accountCopy[language];
  await page.goto(`${baseURL}/login?redirect=${encodeURIComponent(redirect)}`);
  await waitForHydration(page);
  await page.getByLabel(c.email, { exact: true }).fill(fixture.email);
  await page.getByLabel(c.password, { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: c.signIn, exact: true }).click();
  await page.waitForURL(`**${redirect}`);
}
