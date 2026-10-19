import { useState } from "react";
import { useLang, languageOptions, type Lang } from "@/lib/i18n";
import {
  User,
  MapPin,
  Sprout,
  Globe,
  PhoneCall,
  ShieldCheck,
  Save,
  Trash2,
  Database,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";
import { accountCopy } from "@/lib/auth/copy";

export function ProfileView() {
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();
  const accountText = accountCopy[lang];

  const [farmerName, setFarmerName] = useState(user?.displayName || accountText.farmer);
  const [farmName, setFarmName] = useState("Sri Lakshmi Chili Farms");
  const [village, setVillage] = useState("Chilakaluripet");
  const [district, setDistrict] = useState("Guntur, Andhra Pradesh");
  const [variety, setVariety] = useState("Guntur Teja (Hot)");
  const [acres, setAcres] = useState("4.5");

  const handleSave = () => {
    toast.success(
      lang === "te"
        ? "రైతు వివరాలు భద్రపరచబడ్డాయి!"
        : lang === "hi"
          ? "किसान विवरण सुरक्षित हो गया!"
          : "Farm details saved successfully!",
    );
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("mr-scan-history");
      toast.success("Scan history cleared.");
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-earth-900 flex items-center gap-2">
          <User className="size-5 text-chili-600" />
          <span>
            {t("profile")} & {t("settings")}
          </span>
        </h2>
        <p className="text-xs text-stone-500">
          {lang === "te"
            ? "మీ వ్యవసాయ సమాచారం మరియు భాష ప్రాధాన్యతలు"
            : lang === "hi"
              ? "आपकी कृषि जानकारी और भाषा प्राथमिकताएं"
              : "Your farm specifications & app preferences"}
        </p>
      </div>

      {/* Farmer Card */}
      <section className="rounded-2xl border border-earth-200 bg-white p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <div className="size-11 rounded-xl bg-leaf-50 text-leaf-700 grid place-items-center font-bold shrink-0">
            {(user?.displayName || user?.email || accountText.farmer).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold">{accountText.account}</h3>
            <p className="text-[11px] text-stone-500">{accountText.signedInAs}</p>
            <p className="text-xs break-all">{user?.email || user?.displayName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/logout"
            className="rounded-xl bg-earth-900 px-4 py-2 text-xs font-bold text-white"
          >
            {accountText.logoutButton}
          </Link>
          <Link
            to="/welcome"
            className="rounded-xl border border-earth-200 px-3 py-2 text-xs text-stone-600"
          >
            {accountText.welcomeTour}
          </Link>
        </div>
      </section>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 flex items-center gap-3.5">
        <div className="size-14 rounded-2xl bg-gradient-to-br from-chili-600 to-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-chili-600/20 shrink-0">
          🌾
        </div>
        <div>
          <h3 className="font-bold text-base text-earth-900 leading-tight">{farmerName}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{farmName}</p>
          <div className="flex items-center gap-1 text-[11px] text-chili-700 font-semibold mt-1">
            <MapPin className="size-3 text-chili-600" />
            <span>
              {village}, {district}
            </span>
          </div>
        </div>
      </div>

      {/* Language Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-earth-900">
            <Globe className="size-4 text-chili-600" />
            <span>{t("language")} (భాష / भाषा)</span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Auto-synced</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {languageOptions.map((opt) => (
            <button
              key={opt.code}
              onClick={() => {
                setLang(opt.code as Lang);
                toast.success(`Language: ${opt.native}`);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                lang === opt.code
                  ? "bg-chili-600 text-white border-chili-600 shadow-sm shadow-chili-600/20"
                  : "bg-earth-50 text-earth-700 border-earth-200 hover:bg-earth-100"
              }`}
            >
              <div>{opt.native}</div>
              <div className="text-[9px] opacity-70 uppercase mt-0.5">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Farm Profile Configuration Form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-earth-900">
          <Sprout className="size-4 text-leaf-600" />
          <span>
            {lang === "te"
              ? "తోట వివరాల సవరణ"
              : lang === "hi"
                ? "खेत विवरण संपादित करें"
                : "Farm Specifications"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div>
            <label className="text-stone-500 font-medium block mb-1">{t("fullName")}</label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full bg-earth-50 border border-earth-200 rounded-xl px-3 py-2 text-earth-900 font-semibold focus:outline-none focus:ring-2 focus:ring-chili-500"
            />
          </div>

          <div>
            <label className="text-stone-500 font-medium block mb-1">{t("farmName")}</label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full bg-earth-50 border border-earth-200 rounded-xl px-3 py-2 text-earth-900 font-semibold focus:outline-none focus:ring-2 focus:ring-chili-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-stone-500 font-medium block mb-1">{t("village")}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full bg-earth-50 border border-earth-200 rounded-xl px-3 py-2 text-earth-900 font-semibold focus:outline-none focus:ring-2 focus:ring-chili-500"
              />
            </div>
            <div>
              <label className="text-stone-500 font-medium block mb-1">Acreage</label>
              <input
                type="text"
                value={acres}
                onChange={(e) => setAcres(e.target.value)}
                className="w-full bg-earth-50 border border-earth-200 rounded-xl px-3 py-2 text-earth-900 font-semibold focus:outline-none focus:ring-2 focus:ring-chili-500"
              />
            </div>
          </div>

          <div>
            <label className="text-stone-500 font-medium block mb-1">Chili Variety</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full bg-earth-50 border border-earth-200 rounded-xl px-3 py-2 text-earth-900 font-semibold focus:outline-none focus:ring-2 focus:ring-chili-500"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-1.5 bg-chili-600 hover:bg-chili-700 active:scale-95 text-white font-bold py-2.5 rounded-xl shadow-md shadow-chili-600/25 transition-all mt-2"
          >
            <Save className="size-4" />
            <span>{t("save")}</span>
          </button>
        </div>
      </div>

      {/* Dataset & Offline Diagnostic Status */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-earth-900">
          <Database className="size-4 text-leaf-600" />
          <span>AI Diagnostics Engine Status</span>
        </div>
        <div className="p-2.5 rounded-xl bg-leaf-50 border border-leaf-200 text-leaf-800 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>
              {lang === "te"
                ? "ఆన్‌లైన్ చిత్ర విశ్లేషణ"
                : lang === "hi"
                  ? "ऑनलाइन छवि विश्लेषण"
                  : "Online image assessment"}
            </span>
            <span className="text-[10px] bg-leaf-200 px-1.5 py-0.5 rounded">Gemini</span>
          </div>
          <p className="text-[11px] text-leaf-700 leading-tight">
            {lang === "te"
              ? "విశ్లేషణకు ఇంటర్నెట్, సైన్ ఇన్ మరియు సర్వరు అమరిక అవసరం. ఫోటోలు విశ్లేషణ కోసం Google Geminiకి పంపబడతాయి; మా సర్వరులో నిల్వ చేయము."
              : lang === "hi"
                ? "विश्लेषण के लिए इंटरनेट, साइन इन और सर्वर कॉन्फ़िगरेशन आवश्यक है। फोटो Google Gemini को भेजी जाती हैं; हमारे सर्वर पर सहेजी नहीं जातीं।"
                : "Analysis requires internet, sign-in and server configuration. Photos are sent to Google Gemini for assessment and are not stored on our server."}
          </p>
        </div>
      </div>

      {/* Agricultural Research Support Contacts */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-2.5 text-xs">
        <div className="font-bold text-earth-900 flex items-center gap-1.5">
          <Building className="size-4 text-chili-600" />
          <span>
            {lang === "te"
              ? "పరిశోధనా కేంద్రాల సహాయం"
              : lang === "hi"
                ? "अनुसंधान केंद्र हेल्पलाइन"
                : "Research Station Helplines"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-earth-50 border border-earth-100">
            <div>
              <div className="font-bold text-earth-900">National Kisan Call Center</div>
              <div className="text-[10px] text-stone-500">
                Toll Free: 1800-180-1551 (6 AM - 10 PM)
              </div>
            </div>
            <a
              href="tel:18001801551"
              className="size-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center hover:bg-leaf-200"
            >
              <PhoneCall className="size-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-earth-50 border border-earth-100">
            <div>
              <div className="font-bold text-earth-900">
                Regional Agricultural Research (Lam, Guntur)
              </div>
              <div className="text-[10px] text-stone-500">ANGRAU Chili Specialty Division</div>
            </div>
            <a
              href="tel:08632524017"
              className="size-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center hover:bg-leaf-200"
            >
              <PhoneCall className="size-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Clear Scan History */}
      <div className="text-center pt-2">
        <button
          onClick={handleClearHistory}
          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-destructive transition-colors"
        >
          <Trash2 className="size-3.5" />
          <span>Clear Local Scan History</span>
        </button>
      </div>
    </div>
  );
}
