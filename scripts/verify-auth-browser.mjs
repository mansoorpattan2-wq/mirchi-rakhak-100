// Real Edge/Chromium UI checks with intercepted Firebase APIs; never creates remote users.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { accountCopy } from "../src/lib/auth/copy.ts";
import { installFirebaseFixture, waitForHydration } from "./firebase-browser-fixture.mjs";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:8080";
const executablePath =
  process.env.BROWSER_EXECUTABLE ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find(existsSync);
assert(executablePath, "Set BROWSER_EXECUTABLE to Chromium or Edge.");
const output = resolve("test-results/auth-browser");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const errors = [];
async function snapshot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${name}: horizontal overflow at ${width}`,
    );
    await page.screenshot({
      path: resolve(output, `${name}-${width}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}
try {
  for (const language of ["en", "te", "hi"]) {
    const c = accountCopy[language];
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const fixture = await installFirebaseFixture(context);
    await context.addInitScript((language) => localStorage.setItem("mr-lang", language), language);
    const page = await context.newPage();
    page.on("pageerror", (error) => {
      errors.push(error.message);
      console.error("Browser runtime error:", error.message);
    });
    await page.goto(`${baseURL}/`);
    await waitForHydration(page);
    await page.locator(".welcome-step-0").waitFor();
    for (let step = 0; step < 3; step++) {
      await page.locator(`.welcome-step-${step}`).waitFor();
      await snapshot(page, `welcome-${language}-${step + 1}`);
      await page
        .getByRole("button", { name: step < 2 ? c.next : c.getStarted, exact: true })
        .click();
    }
    await page.waitForURL("**/signup**");
    await snapshot(page, `signup-${language}`);
    await page.getByLabel(c.fullName, { exact: true }).fill("Browser Grower");
    await page.getByLabel(c.email, { exact: true }).fill(fixture.email);
    await page.getByLabel(c.password, { exact: true }).fill(fixture.password);
    await page.getByLabel(c.confirmPassword, { exact: true }).fill("Does-not-match-9!");
    await page.getByRole("button", { name: c.signUp, exact: true }).click();
    await page.getByRole("alert").filter({ hasText: c.mismatch }).waitFor();
    assert.equal(fixture.state.signupRequests, 0);
    await page.getByLabel(c.confirmPassword, { exact: true }).fill(fixture.password);
    await page.getByRole("button", { name: c.signUp, exact: true }).click();
    await page.waitForURL("**/home");
    assert.equal(fixture.state.signupRequests, 1);
    await page.goto(`${baseURL}/profile`);
    await page.getByText(fixture.email, { exact: true }).waitFor();
    await page.getByRole("link", { name: c.logoutButton, exact: true }).click();
    await snapshot(page, `logout-confirm-${language}`);
    await page.getByRole("button", { name: c.logoutButton, exact: true }).click();
    await page.getByRole("link", { name: c.signIn, exact: true }).waitFor();
    await snapshot(page, `logout-complete-${language}`);
    await page.goto(`${baseURL}/scan`);
    await page.waitForURL("**/login?redirect=%2Fscan");
    await snapshot(page, `login-${language}`);
    fixture.state.loginError = "INVALID_LOGIN_CREDENTIALS";
    await page.getByLabel(c.email, { exact: true }).fill(fixture.email);
    await page.getByLabel(c.password, { exact: true }).fill(fixture.password);
    await page.getByRole("button", { name: c.signIn, exact: true }).click();
    await page.getByRole("alert").filter({ hasText: c.credentialsError }).waitFor();
    fixture.state.loginError = null;
    await page.getByRole("button", { name: c.signIn, exact: true }).click();
    await page.waitForURL("**/scan");
    assert.equal(fixture.state.loginRequests, 2);
    await page.reload();
    await page.locator('input[type="file"][capture="environment"]').waitFor({ state: "attached" });
    assert.equal(new URL(page.url()).pathname, "/scan");
    await page.goto(`${baseURL}/logout`);
    await page.getByRole("button", { name: c.logoutButton, exact: true }).click();
    await page.goto(`${baseURL}/forgot-password`);
    await waitForHydration(page);
    await page.getByLabel(c.email, { exact: true }).fill(fixture.email);
    await page.getByRole("button", { name: c.resetButton, exact: true }).click();
    await page.getByRole("heading", { name: c.resetSent, exact: true }).waitFor();
    assert.equal(fixture.state.resetRequests, 1);
    await snapshot(page, `reset-complete-${language}`);
    await page.goto(`${baseURL}/`);
    await page.waitForURL("**/login**");
    console.log(
      `PASS: ${language} — three splash screens, signup, login errors, session restoration, protected routes, logout and reset (Firebase APIs mocked).`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(`Mobile screenshots: ${output}. No real Firebase users were created or emails sent.`);
} finally {
  await browser.close();
}
