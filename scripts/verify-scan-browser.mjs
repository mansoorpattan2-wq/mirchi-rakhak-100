// Real-browser layout/transport checks with MOCKED auth and diagnosis; no live AI requests.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
import { scanCopy } from "../src/lib/scan-copy.ts";
import { assessment, scenarios } from "../tests/fixtures.ts";
import { installFirebaseFixture, loginFixture } from "./firebase-browser-fixture.mjs";

const baseURL = process.env.TEST_BASE_URL || "http://localhost:8080";
const executablePath =
  process.env.BROWSER_EXECUTABLE ||
  [
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
  ].find(existsSync);
assert(executablePath, "Set BROWSER_EXECUTABLE to a Chromium/Edge executable.");
const outputDir = resolve("test-results/browser");
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const consoleErrors = [];
let requests = 0;
try {
  for (const language of ["en", "te", "hi"]) {
    const c = scanCopy[language];
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const firebase = await installFirebaseFixture(context);
    await context.addInitScript((language) => localStorage.setItem("mr-lang", language), language);
    let response = assessment({ language });
    let responseStatus = 200;
    if (language === "te")
      response = assessment({
        language,
        reasoning_summary:
          "ఆకుపై గోధుమ రంగు మచ్చలు కనిపిస్తున్నాయి. కారణాన్ని ఫోటోతో నిర్ధారించలేము.",
        visible_symptoms: ["ఆకుపై మచ్చలు కనిపిస్తున్నాయి."],
        recommended_actions: [
          "ఆకులను గమనించి, చికిత్సకు ముందు స్థానిక వ్యవసాయ నిపుణుడిని సంప్రదించండి.",
        ],
        uncertainty_notes: [
          "ఇది ఫోటో ఆధారిత అంచనా మాత్రమే. కారణాన్ని నిర్ధారించడానికి నిపుణుడి సహాయం అవసరం.",
        ],
      });
    if (language === "hi")
      response = assessment({
        language,
        reasoning_summary:
          "पत्ती पर भूरे धब्बे दिखाई देते हैं। फोटो से कारण की पुष्टि नहीं हो सकती।",
        visible_symptoms: ["पत्ती पर धब्बे दिखाई देते हैं।"],
        recommended_actions: [
          "पत्तियों पर नज़र रखें और उपचार से पहले स्थानीय कृषि विशेषज्ञ से सलाह लें।",
        ],
        uncertainty_notes: [
          "यह केवल फोटो आधारित आकलन है। कारण की पुष्टि के लिए विशेषज्ञ की सहायता आवश्यक है।",
        ],
      });
    await context.route("**/api/plant-diagnosis/analyze", async (route) => {
      requests++;
      const request = route.request();
      assert.equal(request.method(), "POST");
      assert.equal(request.headers().authorization, `Bearer ${firebase.token}`);
      assert.match(request.headers()["content-type"], /^multipart\/form-data/);
      const body = request.postDataBuffer().toString("latin1");
      assert.match(body, /name="image"/);
      assert.match(body, /name="language"/);
      assert(!body.includes("diseaseId"));
      await route.fulfill({
        status: responseStatus,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => {
      consoleErrors.push(error.message);
      console.error("Browser runtime error:", error.message);
    });
    await loginFixture(page, firebase, baseURL, language, "/scan");
    await page.getByRole("heading", { name: c.title }).waitFor();
    // The English heading also exists in SSR HTML; wait for actual React hydration.
    await page.waitForFunction(() => {
      const input = document.querySelector('input[type="file"]');
      return input && Object.keys(input).some((key) => key.startsWith("__reactProps$"));
    });
    await page
      .locator('input[type="file"]:not([capture])')
      .setInputFiles(resolve("public/samples/leaf_spot.jpg"));
    await page.getByAltText(c.photo).waitFor();
    const before = requests;
    await page.getByRole("button", { name: c.analyze, exact: true }).click();
    await page.getByRole("heading", { name: c.diseased, exact: true }).waitFor();
    assert.equal(requests, before + 1);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${language} overflows at ${width}px`,
      );
      assert(
        await page
          .locator("article")
          .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
        `${language} result does not wrap at ${width}px`,
      );
      await page.screenshot({
        path: resolve(outputDir, `scan-${language}-${width}.png`),
        fullPage: true,
        animations: "disabled",
      });
    }
    if (language === "en") {
      for (const scenario of scenarios.slice(1)) {
        response = scenario.value;
        await page.getByRole("button", { name: c.analyze, exact: true }).click();
        await page.getByRole("heading", { name: c[response.category], exact: true }).waitFor();
      }
    }
    for (const [code, status, message] of [
      ["PROVIDER_UNAVAILABLE", 502, c.serviceUnavailable],
      ["PROVIDER_TIMEOUT", 504, c.timeout],
      ["INVALID_PROVIDER_RESPONSE", 502, c.incomplete],
      ["RATE_LIMIT", 429, c.scanLimit],
      ["PROVIDER_RATE_LIMIT", 429, c.providerLimit],
      ["SCAN_IN_PROGRESS", 409, c.scanInProgress],
      ["SERVICE_BUSY", 429, c.busy],
    ]) {
      responseStatus = status;
      response = { status: "error", error: { code, message: "Safe server error" } };
      const beforeError = requests;
      await page
        .getByRole("button", { name: c.analyze, exact: true })
        .or(page.getByRole("button", { name: c.retry, exact: true }))
        .click();
      await page.getByRole("alert").filter({ hasText: message }).waitFor();
      assert.equal(requests, beforeError + 1);
      assert.equal(await page.locator("article").count(), 0);
    }
    responseStatus = 200;
    response = assessment({ language });
    await page.getByRole("button", { name: c.retry, exact: true }).click();
    await page.getByRole("heading", { name: c.diseased, exact: true }).waitFor();
    console.log(
      `PASS: ${language} real-browser layout at 390/320px and one authenticated multipart request per click (mocked provider).`,
    );
    await context.close();
  }
  assert.deepEqual(consoleErrors, [], "Unexpected browser runtime errors");
  console.log(
    `Screenshots: ${outputDir}. All diagnosis/auth responses were mocked; no live Gemini call was made.`,
  );
} finally {
  await browser.close();
}
