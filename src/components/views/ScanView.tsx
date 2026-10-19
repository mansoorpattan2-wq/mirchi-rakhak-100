import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Camera,
  Upload,
  RotateCcw,
  AlertOctagon,
  Volume2,
  Bookmark,
  Leaf,
  SwitchCamera,
  Zap,
  X,
  Aperture,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/lib/i18n";
import { sampleTestLeaves } from "@/lib/chili-data";
import { analyzePhoto } from "@/lib/diagnosis-client";
import { DIAGNOSIS_REQUEST_TIMEOUT_MS } from "@/lib/diagnosis-timing";
import {
  DiagnosisError,
  MAX_IMAGE_BYTES,
  SUPPORTED_IMAGE_TYPES,
  type Diagnosis,
} from "@/lib/diagnosis-contract";
import { scanCopy, scanErrorMessage } from "@/lib/scan-copy";

const primary =
  "w-full flex items-center justify-center gap-2 bg-chili-600 hover:bg-chili-700 text-white font-bold text-sm py-3 px-4 rounded-xl disabled:opacity-50";
const secondary =
  "flex items-center justify-center gap-2 bg-earth-100 text-earth-900 border border-earth-200 font-semibold text-xs py-3 px-3 rounded-xl disabled:opacity-50";

export function ScanView() {
  const { lang } = useLang();
  const c = scanCopy[lang];
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const directCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraGeneration = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const selectionGeneration = useRef(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  useEffect(
    () => () => {
      cameraGeneration.current++;
      selectionGeneration.current++;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      requestRef.current?.abort();
      window.speechSynthesis?.cancel();
    },
    [],
  );

  function stopLiveCamera() {
    cameraGeneration.current++;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setIsCameraLoading(false);
  }

  async function startLiveCamera(facing: "environment" | "user" = cameraFacing) {
    stopLiveCamera();
    const generation = cameraGeneration.current;
    setCameraError(false);
    setIsCameraLoading(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera unavailable");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1600 }, height: { ideal: 1200 } },
        audio: false,
      });
      if (generation !== cameraGeneration.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraFacing(facing);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      if (generation === cameraGeneration.current) {
        stopLiveCamera();
        setCameraError(true);
      }
    } finally {
      if (generation === cameraGeneration.current) setIsCameraLoading(false);
    }
  }

  function selectPhoto(file: File) {
    if (
      !file.size ||
      file.size > MAX_IMAGE_BYTES ||
      (file.type && !SUPPORTED_IMAGE_TYPES.includes(file.type))
    ) {
      setErrorCode(file.size > MAX_IMAGE_BYTES ? "IMAGE_TOO_LARGE" : "INVALID_IMAGE");
      return;
    }
    selectionGeneration.current++;
    requestRef.current?.abort();
    requestRef.current = null;
    setIsScanning(false);
    stopLiveCamera();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPhoto(file);
    setDiagnosis(null);
    setErrorCode(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // Selecting the same file again must work.
    if (file) selectPhoto(file);
  }

  function captureLivePhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setCameraError(true);
      return;
    }
    context.drawImage(video, 0, 0);
    const generation = selectionGeneration.current;
    canvas.toBlob(
      (blob) => {
        if (blob && generation === selectionGeneration.current)
          selectPhoto(new File([blob], "camera-photo.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  async function toggleFlash() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      const settings = track.getSettings() as MediaTrackSettings & { torch?: boolean };
      if (!capabilities.torch) {
        toast.info(c.cameraError);
        return;
      }
      await track.applyConstraints({
        advanced: [{ torch: !settings.torch } as MediaTrackConstraintSet],
      });
    } catch {
      toast.info(c.cameraError);
    }
  }

  async function selectSample(image: string) {
    const generation = ++selectionGeneration.current;
    try {
      const response = await fetch(image);
      if (!response.ok) throw new Error("Sample unavailable");
      const blob = await response.blob();
      if (generation === selectionGeneration.current)
        selectPhoto(new File([blob], "sample-photo.jpg", { type: blob.type }));
    } catch {
      if (generation === selectionGeneration.current) setErrorCode("INVALID_IMAGE");
    }
  }

  async function runScan() {
    if (!photo || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setIsScanning(true);
    setErrorCode(null);
    setDiagnosis(null);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const timer = setTimeout(() => controller.abort("timeout"), DIAGNOSIS_REQUEST_TIMEOUT_MS);
    try {
      const result = await analyzePhoto(photo, lang, controller.signal);
      if (!controller.signal.aborted && requestRef.current === controller) {
        setDiagnosis(result);
        setAuthRequired(false);
      }
    } catch (error) {
      if (requestRef.current !== controller) return;
      if (controller.signal.aborted && controller.signal.reason !== "timeout") return;
      const code = controller.signal.aborted
        ? "PROVIDER_TIMEOUT"
        : error instanceof DiagnosisError
          ? error.code
          : "REQUEST_FAILED";
      setErrorCode(code);
      if (code === "AUTH_REQUIRED") setAuthRequired(true);
    } finally {
      clearTimeout(timer);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsScanning(false);
      }
    }
  }

  function resetScan() {
    selectionGeneration.current++;
    requestRef.current?.abort();
    requestRef.current = null;
    stopLiveCamera();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPhoto(null);
    setDiagnosis(null);
    setErrorCode(null);
    setIsScanning(false);
    setCameraError(false);
  }

  function handleSpeak() {
    if (!diagnosis || !("speechSynthesis" in window)) {
      toast.info(c.speechUnavailable);
      return;
    }
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      [
        scanCopy[diagnosis.language][diagnosis.category],
        diagnosis.reasoning_summary,
        ...diagnosis.recommended_actions,
        ...diagnosis.uncertainty_notes,
      ].join(". "),
    );
    utterance.lang = `${diagnosis.language}-IN`;
    utterance.onend = utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  function saveResult() {
    if (!diagnosis) return;
    try {
      const existing: unknown = JSON.parse(localStorage.getItem("mr-scan-history") || "[]");
      const records = Array.isArray(existing) ? existing : [];
      // Explicit opt-in saves assessment only; no images or bearer tokens in history.
      localStorage.setItem(
        "mr-scan-history",
        JSON.stringify(
          [
            { id: crypto.randomUUID(), timestamp: new Date().toISOString(), diagnosis },
            ...records,
          ].slice(0, 16),
        ),
      );
      toast.success(c.saved);
    } catch {
      toast.error(c.failed);
    }
  }

  const resultCopy = diagnosis ? scanCopy[diagnosis.language] : c;
  const statusStyle =
    diagnosis?.category === "healthy"
      ? "bg-leaf-50 border-leaf-600 text-leaf-900"
      : diagnosis?.category === "diseased"
        ? "bg-orange-50 border-chili-600 text-chili-900"
        : diagnosis?.category === "invalid_image"
          ? "bg-red-50 border-red-700 text-red-900"
          : diagnosis?.category === "wrong_plant"
            ? "bg-sky-50 border-sky-800 text-sky-900"
            : "bg-amber-50 border-amber-700 text-amber-900";

  return (
    <div lang={lang} className="p-4 space-y-4 pb-28 animate-fade leading-relaxed break-words">
      <input
        ref={directCameraInputRef}
        aria-label={c.device}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        aria-label={c.gallery}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-earth-900">{c.title}</h2>
          <p className="text-xs text-stone-600">{c.subtitle}</p>
        </div>
        {(photo || isCameraActive || isCameraLoading) && (
          <button className={secondary} onClick={resetScan}>
            <RotateCcw className="size-4" />
            {c.rescan}
          </button>
        )}
      </div>
      {cameraError && (
        <p role="alert" className="rounded-xl p-3 bg-red-50 text-red-900 text-sm">
          {c.cameraError}
        </p>
      )}
      {/* Remains mounted so getUserMedia can bind immediately. */}
      <div
        hidden={!isCameraActive}
        className={
          isCameraActive
            ? "relative rounded-3xl overflow-hidden bg-black border-2 border-chili-600"
            : "hidden"
        }
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[380px] object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-3">
          <button className={secondary} aria-label={c.flash} onClick={toggleFlash}>
            <Zap className="size-5" />
          </button>
          <button className={secondary} aria-label={c.close} onClick={stopLiveCamera}>
            <X className="size-5" />
          </button>
        </div>
        <div className="absolute bottom-4 inset-x-4 flex justify-around items-center gap-3">
          <button
            className={secondary}
            aria-label={c.flip}
            onClick={() =>
              void startLiveCamera(cameraFacing === "environment" ? "user" : "environment")
            }
          >
            <SwitchCamera className="size-5" />
          </button>
          <button
            className="rounded-full border-4 border-white bg-chili-600 text-white p-5"
            aria-label={c.capture}
            onClick={captureLivePhoto}
          >
            <Camera className="size-7" />
          </button>
          <button
            className={secondary}
            aria-label={c.gallery}
            onClick={() => {
              stopLiveCamera();
              galleryInputRef.current?.click();
            }}
          >
            <Upload className="size-5" />
          </button>
        </div>
      </div>
      {!photo && !isCameraActive && (
        <div className="rounded-3xl border-2 border-dashed border-earth-300 bg-white p-6 text-center space-y-4">
          <Camera className="size-12 text-chili-600 mx-auto" />
          <p className="text-sm text-stone-600">{c.hint}</p>
          <button
            className={primary}
            onClick={() => void startLiveCamera()}
            disabled={isCameraLoading}
          >
            <Aperture className="size-4" />
            {isCameraLoading ? c.opening : c.live}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className={secondary} onClick={() => directCameraInputRef.current?.click()}>
              <Smartphone className="size-4 shrink-0" />
              {c.device}
            </button>
            <button className={secondary} onClick={() => galleryInputRef.current?.click()}>
              <Upload className="size-4 shrink-0" />
              {c.gallery}
            </button>
          </div>
        </div>
      )}
      {photo && (
        <div className="space-y-3">
          {preview && (
            <img
              src={preview}
              alt={c.photo}
              className="w-full max-h-80 object-contain rounded-2xl bg-earth-100"
              onError={() => setErrorCode("INVALID_IMAGE")}
            />
          )}
          <p className="text-xs text-stone-600">{c.preview}</p>
          <button className={primary} disabled={isScanning} onClick={() => void runScan()}>
            <Leaf className="size-4" />
            {isScanning ? c.analyzing : errorCode ? c.retry : c.analyze}
          </button>
          <button
            className={`${secondary} w-full`}
            disabled={isScanning}
            onClick={() => galleryInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {c.gallery}
          </button>
          {isScanning && (
            <p role="status" aria-live="polite" className="text-sm text-chili-700 animate-pulse">
              {c.analyzing}
            </p>
          )}
        </div>
      )}
      {errorCode && (
        <div
          role="alert"
          className="rounded-2xl border border-red-700 bg-red-50 text-red-900 p-4 text-sm flex gap-2"
        >
          <AlertOctagon className="size-5 shrink-0" />
          {scanErrorMessage(errorCode, lang)}
        </div>
      )}
      {authRequired && (
        <a href="/login?redirect=%2Fscan" className={primary}>
          {c.signIn}
        </a>
      )}
      {diagnosis && (
        <article
          lang={diagnosis.language}
          aria-live="polite"
          className="rounded-2xl border border-earth-200 bg-white p-4 space-y-4"
        >
          {diagnosis.language !== lang && (
            <p className="bg-amber-50 rounded-lg p-2 text-xs">{c.changedLanguage}</p>
          )}
          <h3 className={`rounded-xl p-3 border font-bold ${statusStyle}`}>
            {resultCopy[diagnosis.category]}
          </h3>
          {diagnosis.plant_name && (
            <div>
              <p className="text-xs text-stone-600">{resultCopy.plant}</p>
              <p className="font-extrabold text-xl">
                {diagnosis.plant_name_local[diagnosis.language] || diagnosis.plant_name}
              </p>
              {diagnosis.language !== "en" && (
                <p className="text-xs text-stone-600">{diagnosis.plant_name}</p>
              )}
            </div>
          )}
          {diagnosis.disease_name && (
            <div>
              <h4 className="text-lg font-bold">
                {diagnosis.disease_name_local[diagnosis.language] || diagnosis.disease_name}
              </h4>
              {diagnosis.language !== "en" && (
                <p className="text-sm text-stone-600">{diagnosis.disease_name}</p>
              )}
            </div>
          )}
          <div>
            <h4 className="font-bold text-sm">{resultCopy.evidence}</h4>
            <p className="text-sm">{diagnosis.reasoning_summary}</p>
          </div>
          {diagnosis.visible_symptoms.length > 0 && (
            <ResultList title={resultCopy.symptoms} items={diagnosis.visible_symptoms} />
          )}
          <ResultList title={resultCopy.actions} items={diagnosis.recommended_actions} />
          <ResultList title={resultCopy.uncertainty} items={diagnosis.uncertainty_notes} />
          <p className="text-xs">
            {resultCopy.confidence}: {resultCopy[diagnosis.confidence_level]} · {resultCopy.quality}
            : {resultCopy[diagnosis.image_quality]}
          </p>
          {diagnosis.requires_expert_confirmation && (
            <p className="text-sm font-bold text-chili-700">{resultCopy.expert}</p>
          )}
          <p className="text-xs text-stone-600">{resultCopy.caveat}</p>
          <div className="grid grid-cols-2 gap-2">
            <button className={secondary} onClick={handleSpeak} aria-pressed={speaking}>
              <Volume2 className="size-4 shrink-0" />
              {resultCopy.listen}
            </button>
            <button className={secondary} onClick={saveResult}>
              <Bookmark className="size-4 shrink-0" />
              {resultCopy.save}
            </button>
          </div>
        </article>
      )}
      <p className="text-xs text-stone-600">{c.privacy}</p>
      {!photo && !isCameraActive && (
        <details className="rounded-2xl border border-earth-200 p-3 bg-white">
          <summary className="font-bold text-sm cursor-pointer">{c.samples}</summary>
          <p className="text-xs text-stone-600 my-2">{c.sampleNote}</p>
          <div className="grid grid-cols-2 gap-2">
            {sampleTestLeaves.map((sample) => (
              <button
                key={sample.id}
                onClick={() => void selectSample(sample.image)}
                className="border border-earth-200 rounded-xl p-2 text-left text-xs"
              >
                <img
                  src={sample.image}
                  alt=""
                  loading="lazy"
                  className="w-full h-20 object-cover rounded-lg mb-1"
                />
                {lang === "te" ? sample.title_te : lang === "hi" ? sample.title_hi : sample.title}
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h4 className="font-bold text-sm mb-1">{title}</h4>
      <ul className="list-disc pl-5 space-y-1 text-sm">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
