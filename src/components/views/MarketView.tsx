import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { 
  Store, 
  TrendingUp, 
  Calculator, 
  Calendar, 
  MapPin, 
  Phone, 
  BadgePercent,
  CheckCircle2,
  Clock,
  Coins
} from "lucide-react";
import { mandiRates } from "@/lib/chili-data";
import { toast } from "sonner";

export function MarketView() {
  const { t, lang } = useLang();

  // Yield calculator state
  const [acres, setAcres] = useState(3.5);
  const [variety, setVariety] = useState<"teja" | "byadgi" | "sannam">("teja");

  // Multipliers based on variety
  const yieldPerAcre = variety === "teja" ? 28 : variety === "byadgi" ? 22 : 25;
  const pricePerQuintal = variety === "teja" ? 19600 : variety === "byadgi" ? 28400 : 18500;
  const totalYieldQuintals = Math.round(acres * yieldPerAcre);
  const estimatedRevenue = Math.round(totalYieldQuintals * pricePerQuintal);

  return (
    <div className="p-4 space-y-4 pb-28 animate-fade">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-earth-900 flex items-center gap-2">
          <Store className="size-5 text-chili-600" />
          <span>{t("marketplace")} & {t("yieldPrediction")}</span>
        </h2>
        <p className="text-xs text-stone-500">
          {lang === "te"
            ? "లైవ్ మార్కెట్ రేట్లు, దిగుబడి అంచనా మరియు పిచికారీ షెడ్యూల్"
            : lang === "hi"
            ? "लाइव मंडी भाव, उपज अनुमान और छिड़काव कैलेंडर"
            : "Live APMC rates, revenue estimations & spray calendars"}
        </p>
      </div>

      {/* Mandi Live Rates */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-leaf-600" />
            <h3 className="text-sm font-bold text-earth-900">
              {lang === "te" ? "ప్రధాన మిర్చి యార్డుల రేట్లు" : lang === "hi" ? "प्रमुख मिर्च मंडियों के भाव" : "Top Chili APMC Yards"}
            </h3>
          </div>
          <span className="text-[10px] font-semibold bg-leaf-50 text-leaf-700 px-2 py-0.5 rounded-full border border-leaf-200">
            {lang === "te" ? "నేటి ధరలు" : lang === "hi" ? "आज के भाव" : "Today Live"}
          </span>
        </div>

        <div className="space-y-2">
          {mandiRates.map((item) => (
            <div
              key={item.mandi}
              className="flex items-center justify-between p-2.5 rounded-xl bg-earth-50 border border-earth-100"
            >
              <div>
                <div className="text-xs font-bold text-earth-900">{item.mandi}</div>
                <div className="text-[10px] text-stone-500">{item.variety}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-earth-900">
                  ₹{item.price.toLocaleString()}
                  <span className="text-[10px] font-normal text-stone-500">/Q</span>
                </div>
                <span className={`text-[10px] font-bold ${item.trend === "up" ? "text-leaf-600" : "text-destructive"}`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Yield & Revenue Calculator */}
      <div className="bg-gradient-to-br from-earth-900 to-earth-800 text-white rounded-2xl p-4 shadow-lg shadow-black/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calculator className="size-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {t("yieldPrediction")} ({t("smart")})
            </h3>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
            AI Estimator
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Farm Size Slider */}
          <div>
            <div className="flex items-center justify-between text-stone-300 mb-1">
              <span>{lang === "te" ? "తోట విస్తీర్ణం (ఎకరాలు)" : lang === "hi" ? "खेत का क्षेत्रफल (एकड़)" : "Field Size (Acres)"}:</span>
              <span className="font-extrabold text-white text-sm">{acres} Acres</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(parseFloat(e.target.value))}
              className="w-full accent-chili-500 h-1.5 bg-earth-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Variety Selector */}
          <div>
            <div className="text-stone-300 mb-1.5">
              {lang === "te" ? "మిర్చి రకం ఎంచుకోండి:" : lang === "hi" ? "मिर्च की किस्म चुनें:" : "Chili Variety:"}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "teja" as const, label: "Guntur Teja" },
                { id: "byadgi" as const, label: "Byadgi KDL" },
                { id: "sannam" as const, label: "Sannam S4" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariety(v.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                    variety === v.id
                      ? "bg-chili-600 text-white border-chili-500 shadow-sm"
                      : "bg-earth-800 text-stone-300 border-earth-700 hover:bg-earth-700"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown Card */}
          <div className="bg-white/10 rounded-xl p-3 border border-white/10 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-[10px] text-stone-300">{t("expectedYield")}</div>
              <div className="text-base font-extrabold text-amber-300 mt-0.5">
                {totalYieldQuintals} <span className="text-xs font-normal text-stone-300">{t("quintalsAcre")}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-stone-300">
                {lang === "te" ? "అంచనా ఆదాయం" : lang === "hi" ? "अनुमानित आय" : "Estimated Revenue"}
              </div>
              <div className="text-base font-extrabold text-leaf-400 mt-0.5">
                ₹{(estimatedRevenue / 100000).toFixed(2)} Lakhs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spray Reminder Timeline */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-chili-600" />
            <h3 className="text-sm font-bold text-earth-900">{t("sprayReminder")}</h3>
          </div>
          <span className="text-[10px] bg-earth-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
            Season Schedule
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60">
            <Clock className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-earth-900 flex items-center justify-between">
                <span>Day 70: Micro-Nutrient & Neem Booster</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                  In 2 days
                </span>
              </div>
              <div className="text-stone-600 text-[11px] mt-0.5">
                Neem Oil 50,000 PPM (5ml/L) + Formula 4 Micronutrient to prevent thrips & flower drop.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-earth-50 border border-earth-100">
            <CheckCircle2 className="size-4 text-leaf-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-bold text-earth-900 flex items-center justify-between">
                <span>Day 82: Fruit Borer Prevention</span>
                <span className="text-[10px] text-stone-400 font-medium">Scheduled</span>
              </div>
              <div className="text-stone-500 text-[11px] mt-0.5">
                Spinetoram 11.7% SC (0.5ml/L) - Targeted foliar application.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Agri Input Stores Directory */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-earth-200 space-y-3">
        <h3 className="text-sm font-bold text-earth-900 flex items-center gap-1.5">
          <MapPin className="size-4 text-chili-600" />
          <span>{lang === "te" ? "ప్రాంతీయ ధృవీకృత డీలర్లు" : lang === "hi" ? "प्रमाणित कीटनाशक एवं खाद विक्रेता" : "Verified Agri-Input Dealers"}</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-earth-50 border border-earth-100">
            <div>
              <div className="font-bold text-earth-900">Sri Balaji Agro Agencies</div>
              <div className="text-[10px] text-stone-500">APMC Market Gate 2, Guntur • 3.2 km away</div>
            </div>
            <a
              href="tel:9848012345"
              onClick={() => toast.success("Calling Sri Balaji Agro...")}
              className="size-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center hover:bg-leaf-200"
            >
              <Phone className="size-3.5" />
            </a>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-earth-50 border border-earth-100">
            <div>
              <div className="font-bold text-earth-900">Kisan Seva Kendra (IFFCO)</div>
              <div className="text-[10px] text-stone-500">Main Road, Chilakaluripet • 1.1 km away</div>
            </div>
            <a
              href="tel:9848054321"
              onClick={() => toast.success("Calling Kisan Seva Kendra...")}
              className="size-8 rounded-full bg-leaf-100 text-leaf-800 flex items-center justify-center hover:bg-leaf-200"
            >
              <Phone className="size-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
