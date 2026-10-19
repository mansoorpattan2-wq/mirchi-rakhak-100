import { useLang } from "@/lib/i18n";
import { HealthRing } from "@/components/HealthRing";
import {
  ScanLine,
  CloudSun,
  Droplets,
  Wind,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sprout,
  Sparkles,
  Info,
} from "lucide-react";
import { mandiRates, chiliDiseases, sampleTestLeaves } from "@/lib/chili-data";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";
import { accountCopy } from "@/lib/auth/copy";

export function HomeView({ onSelectTab }: { onSelectTab?: (tab: string) => void }) {
  const { t, lang } = useLang();
  const { user } = useAuth();

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade">
      {/* Farmer Greeting & Farm Quick Info */}
      <div className="bg-gradient-to-r from-earth-900 to-earth-800 text-white rounded-2xl p-4 shadow-lg shadow-black/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-4 translate-y-4 text-9xl">
          🌶️
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-leaf-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-leaf-300 tracking-wide uppercase">
              {lang === "te"
                ? "లైవ్ ఫీల్డ్ మానిటరింగ్"
                : lang === "hi"
                  ? "लाइव खेत निगरानी"
                  : "Live Field Monitor"}
            </span>
          </div>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-stone-300">
            {lang === "te" ? "గుంటూరు తేజ" : lang === "hi" ? "गुंटूर तेजा" : "Guntur Teja"} (4.5 Ac)
          </span>
        </div>

        <h2 className="text-xl font-bold tracking-tight">
          {t("greeting")},{" "}
          <span className="text-chili-400">{user?.displayName || accountCopy[lang].farmer}</span> 🙏
        </h2>
        <p className="text-xs text-stone-300 mt-0.5">
          {lang === "te"
            ? "చిలకలూరిపేట గ్రామం • 68 రోజుల పంట (పూత & పిందె దశ)"
            : lang === "hi"
              ? "चिलकलूरिपेट गाँव • 68 दिन की फसल (फूल व फल बनने की अवस्था)"
              : "Chilakaluripet Village • 68 days old (Flowering & Pod stage)"}
        </p>

        {/* Thrips / Pest Alert Pill */}
        <div className="mt-3 bg-amber-500/20 border border-amber-400/30 rounded-xl p-2.5 flex items-center gap-2.5">
          <AlertTriangle className="size-4 text-amber-400 shrink-0" />
          <div className="flex-1 text-[11px] leading-tight text-amber-100">
            <span className="font-semibold text-amber-300">
              {lang === "te" ? "హెచ్చరిక: " : lang === "hi" ? "चेतावनी: " : "Advisory: "}
            </span>
            {t("thripsAlert")}
          </div>
          <Link
            to="/scan"
            className="text-[10px] bg-amber-500 text-earth-950 font-bold px-2 py-1 rounded-lg shrink-0 shadow-sm"
          >
            {t("preventNow")}
          </Link>
        </div>
      </div>

      {/* Main Crop Health Index Hero */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 flex items-center justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            {t("healthScore")}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-leaf-100 text-leaf-800">
              <ShieldCheck className="size-3.5 text-leaf-600" />
              {t("good")}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">42 {t("daysToHarvest")}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-earth-100">
            <div>
              <div className="text-[10px] text-stone-400">{t("soilMoisture")}</div>
              <div className="text-xs font-bold text-earth-800">38% ({t("optimal")})</div>
            </div>
            <div>
              <div className="text-[10px] text-stone-400">{t("nitrogen")}</div>
              <div className="text-xs font-bold text-leaf-700">Normal (0.8%)</div>
            </div>
          </div>
        </div>

        <HealthRing value={84} size={88} label="INDEX" />
      </div>

      {/* PROMINENT AI SCANNER CTA */}
      <Link
        to="/scan"
        className="block group relative overflow-hidden rounded-2xl bg-gradient-to-r from-chili-600 via-chili-500 to-amber-600 p-4 text-white shadow-lg shadow-chili-600/30 active:scale-[0.99] transition-all"
      >
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15">
          <ScanLine className="size-32 text-white" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
              <Sparkles className="size-3" />
              {lang === "te"
                ? "తక్షణ AI నిర్ధారణ"
                : lang === "hi"
                  ? "त्वरित AI जांच"
                  : "AI Vision Scanner"}
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">{t("scanCrop")}</h3>
            <p className="text-xs text-chili-100">{t("scanCropSub")}</p>
          </div>
          <div className="size-12 rounded-2xl bg-white text-chili-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
            <ScanLine className="size-6" />
          </div>
        </div>
      </Link>

      {/* Quick Test Samples Preview (One tap from home to diagnosis) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {lang === "te"
              ? "నమూనా ఆకుల పరీక్ష"
              : lang === "hi"
                ? "नमूना पत्ता टेस्ट"
                : "Quick Test Samples"}
          </h4>
          <Link
            to="/scan"
            className="text-xs font-bold text-chili-600 hover:underline flex items-center gap-0.5"
          >
            {t("viewAll")} <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {sampleTestLeaves.slice(0, 4).map((sample) => (
            <Link
              key={sample.id}
              to="/scan"
              className="bg-white rounded-xl p-1.5 border border-earth-200 shadow-sm text-center flex flex-col items-center gap-1 hover:border-chili-400 transition-colors"
            >
              <img
                src={sample.image}
                alt={sample.title}
                className="size-12 object-cover rounded-lg border border-earth-100"
              />
              <span className="text-[10px] font-semibold text-earth-800 line-clamp-1 leading-tight">
                {lang === "te" ? sample.title_te : lang === "hi" ? sample.title_hi : sample.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Smart Weather & Spray Recommendation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="size-5 text-amber-500" />
            <h4 className="text-sm font-bold text-earth-900">
              {t("weather")} & {t("sprayAdvice")}
            </h4>
          </div>
          <span className="text-xs font-bold text-earth-600 bg-earth-100 px-2 py-0.5 rounded-md">
            Guntur 31°C
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center bg-earth-50 rounded-xl p-2.5">
          <div>
            <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
              <Droplets className="size-3 text-sky-500" /> {t("humidity")}
            </div>
            <div className="text-xs font-bold text-earth-800 mt-0.5">64%</div>
          </div>
          <div>
            <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
              <Wind className="size-3 text-leaf-600" /> {t("wind")}
            </div>
            <div className="text-xs font-bold text-earth-800 mt-0.5">11 km/h</div>
          </div>
          <div>
            <div className="text-[10px] text-stone-400">Rain Prob.</div>
            <div className="text-xs font-bold text-earth-800 mt-0.5">10%</div>
          </div>
        </div>

        <div className="bg-leaf-50 border border-leaf-200 rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-leaf-600" />
            <div>
              <div className="text-[11px] font-bold text-leaf-900">{t("sprayWindow")}</div>
              <div className="text-[10px] text-leaf-700">
                06:00 AM – 09:30 AM (Low wind, clear sky)
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-leaf-600 text-white font-bold px-2 py-0.5 rounded-full">
            Safe
          </span>
        </div>
      </div>

      {/* APMC Mandi Rates Live Ticker */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-chili-600" />
            <h4 className="text-sm font-bold text-earth-900">
              {lang === "te"
                ? "నేటి మిర్చి మార్కెట్ ధరలు"
                : lang === "hi"
                  ? "आज के मिर्च मंडी भाव"
                  : "Live Mandi Rates (₹/Quintal)"}
            </h4>
          </div>
          <Link to="/market" className="text-xs font-bold text-chili-600 hover:underline">
            {t("viewAll")}
          </Link>
        </div>

        <div className="space-y-2">
          {mandiRates.slice(0, 3).map((item) => (
            <div
              key={item.mandi}
              className="flex items-center justify-between py-1.5 border-b border-earth-100 last:border-0"
            >
              <div>
                <div className="text-xs font-bold text-earth-800">{item.mandi}</div>
                <div className="text-[10px] text-stone-400">{item.variety}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-extrabold text-earth-900">
                  ₹{item.price.toLocaleString()}
                </div>
                <span className="text-[10px] font-bold text-leaf-600">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Farmer AI Assistant Banner */}
      <Link
        to="/chat"
        className="block bg-earth-900 text-white rounded-2xl p-3.5 shadow-sm hover:bg-earth-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-leaf-600/30 text-leaf-400 flex items-center justify-center font-bold text-lg">
              🤖
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t("aiAssistant")}</div>
              <div className="text-[11px] text-stone-300">{t("askAnything")}</div>
            </div>
          </div>
          <ArrowRight className="size-4 text-stone-400" />
        </div>
      </Link>
    </div>
  );
}
