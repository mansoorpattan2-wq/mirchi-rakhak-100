import { useLang, languageOptions, type Lang } from "@/lib/i18n";
import { Sparkles, Globe, Bell, PhoneCall } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AppHeader() {
  const { lang, setLang, t } = useLang();
  const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-earth-50/90 backdrop-blur-md border-b border-earth-200/60 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="size-9 rounded-xl bg-gradient-to-br from-chili-600 via-chili-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-chili-600/25">
          <span className="text-xl leading-none">🌶️</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base tracking-tight text-earth-900 leading-none">
              MirchiRakshak
            </h1>
            <span className="bg-chili-100 text-chili-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-chili-200 uppercase tracking-wider">
              AI
            </span>
          </div>
          <p className="text-[11px] text-earth-500 font-medium leading-tight mt-0.5">
            {lang === "te" ? "మిర్చి పంట రక్షణ AI" : lang === "hi" ? "मिर्च फसल सुरक्षा AI" : "Chili Crop Protection"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 relative">
        {/* Quick Emergency Kisan Hotline */}
        <a
          href="tel:18001801551"
          className="size-8 rounded-full bg-leaf-50 border border-leaf-200 text-leaf-700 flex items-center justify-center hover:bg-leaf-100 transition-colors"
          title="Kisan Call Center: 1800-180-1551"
          onClick={(e) => {
            toast.info("Kisan Call Center Hotline: 1800-180-1551 (Toll Free)");
          }}
        >
          <PhoneCall className="size-3.5" />
        </a>

        {/* Language selector toggle button */}
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-earth-100 border border-earth-200 hover:bg-earth-200 text-earth-700 text-xs font-semibold transition-all shadow-sm active:scale-95"
          aria-label="Change Language"
        >
          <Globe className="size-3.5 text-chili-600" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Language Popup */}
        {showLangMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowLangMenu(false)}
            />
            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-2xl border border-earth-200 py-1.5 z-50 animate-fade">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Select Language
              </div>
              {languageOptions.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLang(opt.code as Lang);
                    setShowLangMenu(false);
                    toast.success(`Language changed to ${opt.native}`);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-earth-100 transition-colors ${
                    lang === opt.code
                      ? "font-bold text-chili-600 bg-chili-50/60"
                      : "text-earth-700"
                  }`}
                >
                  <span>{opt.native}</span>
                  <span className="text-[10px] text-stone-400 uppercase">{opt.code}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
