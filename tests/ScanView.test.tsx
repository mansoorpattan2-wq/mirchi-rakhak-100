// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScanView } from "../src/components/views/ScanView";
import { analyzePhoto } from "../src/lib/diagnosis-client";
import { DiagnosisError } from "../src/lib/diagnosis-contract";
import { scanCopy } from "../src/lib/scan-copy";
import { assessment, scenarios } from "./fixtures";

const state = vi.hoisted(() => ({ lang: "en" as "en" | "te" | "hi" }));
vi.mock("@/lib/i18n", () => ({ useLang: () => ({ lang: state.lang }) }));
vi.mock("@/lib/diagnosis-client", () => ({ analyzePhoto: vi.fn(), getBrowserAuth: vi.fn() }));
vi.mock("@/lib/chili-data", () => ({
  sampleTestLeaves: [
    {
      id: "sample",
      image: "/samples/leaf_spot.jpg",
      title: "Source label",
      title_te: "నమూనా",
      title_hi: "नमूना",
    },
  ],
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  state.lang = "en";
  vi.mocked(analyzePhoto).mockResolvedValue(assessment());
  vi.stubGlobal(
    "URL",
    Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function uploadPhoto(label = scanCopy[state.lang].gallery) {
  const file = new File(["mock image transport; not diagnostic ground truth"], "leaf.jpg", {
    type: "image/jpeg",
  });
  await userEvent.upload(screen.getByLabelText(label, { selector: "input" }), file);
  return file;
}

describe("camera/gallery UI with mocked API; no live diagnosis", () => {
  it("previews gallery uploads and waits for an explicit analyze click", async () => {
    render(<ScanView />);
    const file = await uploadPhoto();
    expect(screen.getByAltText(scanCopy.en.photo).getAttribute("src")).toBe("blob:preview");
    expect(analyzePhoto).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    await screen.findByText(scanCopy.en.diseased);
    expect(analyzePhoto).toHaveBeenCalledWith(file, "en", expect.any(AbortSignal));
    expect(document.body.textContent).not.toMatch(/\d+%/);
  });
  it("routes the native camera file input through the same preview flow", async () => {
    render(<ScanView />);
    const input = screen.getByLabelText(scanCopy.en.device);
    expect(input.getAttribute("capture")).toBe("environment");
    const file = await uploadPhoto(scanCopy.en.device);
    expect(analyzePhoto).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    await waitFor(() =>
      expect(analyzePhoto).toHaveBeenCalledWith(file, "en", expect.any(AbortSignal)),
    );
  });
  it("captures a live camera frame and stops the hardware stream", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }], getVideoTracks: () => [] };
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((cb) =>
      cb(new Blob(["camera frame"], { type: "image/jpeg" })),
    );
    const { container } = render(<ScanView />);
    const video = container.querySelector("video")!;
    Object.defineProperties(video, {
      readyState: { configurable: true, value: 4 },
      videoWidth: { configurable: true, value: 1280 },
      videoHeight: { configurable: true, value: 720 },
    });
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.live }));
    await userEvent.click(await screen.findByRole("button", { name: scanCopy.en.capture }));
    expect(stop).toHaveBeenCalledOnce();
    expect(screen.getByAltText(scanCopy.en.photo)).toBeTruthy();
    expect(analyzePhoto).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    await waitFor(() => expect(analyzePhoto).toHaveBeenCalledOnce());
    expect(vi.mocked(analyzePhoto).mock.calls[0][0].name).toBe("camera-photo.jpg");
  });
  it("shows camera permission failures with gallery/native camera alternatives", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new DOMException("denied", "NotAllowedError")),
      },
    });
    render(<ScanView />);
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.live }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", scanCopy.en.cameraError);
    expect(screen.getByRole("button", { name: scanCopy.en.gallery })).toBeTruthy();
  });
  it("blocks duplicate clicks during analysis", async () => {
    let resolve!: (value: ReturnType<typeof assessment>) => void;
    vi.mocked(analyzePhoto).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<ScanView />);
    await uploadPhoto();
    const button = screen.getByRole("button", { name: scanCopy.en.analyze });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(analyzePhoto).toHaveBeenCalledOnce();
    await act(async () => resolve(assessment()));
  });
  it("shows provider errors and permits an explicit retry", async () => {
    vi.mocked(analyzePhoto).mockRejectedValueOnce(
      new DiagnosisError("PROVIDER_TIMEOUT", 504, "timeout"),
    );
    render(<ScanView />);
    await uploadPhoto();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    expect(await screen.findByRole("alert")).toHaveProperty("textContent", scanCopy.en.timeout);
    expect(screen.queryByText(scanCopy.en.diseased)).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.retry }));
    await screen.findByText(scanCopy.en.diseased);
    expect(analyzePhoto).toHaveBeenCalledTimes(2);
  });
  it.each(scenarios)("renders the $name result distinctly", async ({ value }) => {
    vi.mocked(analyzePhoto).mockResolvedValue(value);
    render(<ScanView />);
    await uploadPhoto();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    expect(await screen.findByRole("heading", { name: scanCopy.en[value.category] })).toBeTruthy();
    if (value.category === "wrong_plant") expect(screen.getByText(value.plant_name!)).toBeTruthy();
    if (value.category === "invalid_image")
      expect(screen.queryByText("Leaf spot symptoms")).toBeNull();
  });
  it.each(["en", "te", "hi"] as const)(
    "renders %s text and language attributes without dropping symptoms",
    async (language) => {
      state.lang = language;
      const c = scanCopy[language];
      const evidence =
        language === "te"
          ? "ఆకుపై మచ్చలు కనిపిస్తున్నాయి."
          : language === "hi"
            ? "पत्ती पर धब्बे दिखाई देते हैं।"
            : "Spots are visible on the leaf.";
      vi.mocked(analyzePhoto).mockResolvedValue(
        assessment({ language, reasoning_summary: evidence, visible_symptoms: [evidence] }),
      );
      const { container } = render(<ScanView />);
      await uploadPhoto();
      await userEvent.click(screen.getByRole("button", { name: c.analyze }));
      await screen.findByRole("heading", { name: c.diseased });
      expect(container.querySelector("article")?.getAttribute("lang")).toBe(language);
      expect(screen.getAllByText(evidence)).toHaveLength(2);
      expect(screen.getByText(c.uncertainty)).toBeTruthy();
    },
  );
  it("clears a previous result for rescanning", async () => {
    render(<ScanView />);
    await uploadPhoto();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    await screen.findByText(scanCopy.en.diseased);
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.rescan }));
    expect(screen.queryByAltText(scanCopy.en.photo)).toBeNull();
    expect(screen.queryByText(scanCopy.en.diseased)).toBeNull();
  });
  it("links to account sign-in instead of bypassing authentication", async () => {
    vi.mocked(analyzePhoto).mockRejectedValue(new DiagnosisError("AUTH_REQUIRED", 401, "sign in"));
    render(<ScanView />);
    await uploadPhoto();
    await userEvent.click(screen.getByRole("button", { name: scanCopy.en.analyze }));
    expect(await screen.findByRole("link", { name: scanCopy.en.signIn })).toHaveProperty(
      "href",
      expect.stringContaining("/login"),
    );
    expect(screen.queryByText(scanCopy.en.diseased)).toBeNull();
  });
});
