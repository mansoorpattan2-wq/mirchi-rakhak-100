import rawDiseasesData from "@/data/chili_diseases.json";

export interface TreatmentMethod {
  name?: string;
  chemical?: string;
  dosage: string;
  frequency?: string;
  waiting_period_days?: number;
  details: string;
}

export interface Disease {
  id: string;
  class_index: number;
  name_en: string;
  name_hi: string;
  name_te: string;
  scientific_name: string;
  category: string;
  vector: string;
  severity: "None" | "Low" | "Medium" | "High" | "Critical";
  symptoms: {
    en: string[];
    hi: string[];
    te: string[];
  };
  environmental_triggers: string;
  organic_treatment: {
    title_en: string;
    title_hi: string;
    title_te: string;
    methods: TreatmentMethod[];
  };
  chemical_treatment: {
    title_en: string;
    title_hi: string;
    title_te: string;
    methods: TreatmentMethod[];
  };
  preventive_measures: {
    en: string[];
    hi: string[];
    te: string[];
  };
  sample_image?: string;
}

// Telugu titles and metadata enrichment for full tri-lingual support
const teluguEnrichment: Record<string, {
  name_te: string;
  symptoms: string[];
  organic_title: string;
  chemical_title: string;
  preventive: string[];
  sample_image: string;
}> = {
  chli_01_leaf_curl: {
    name_te: "మిర్చి ఆకు ముడుత తెగులు (ChLCV)",
    symptoms: [
      "ఆకులు పైకి మరియు కిందకు పడవ లేదా గిన్నె ఆకారంలో ముడుచుకుపోతాయి",
      "లేత ఆకులపై ఈనెలు పసుపుపచ్చగా మారి మందంగా తయారవుతాయి",
      "మొక్క గిడసబారి కణుపుల మధ్య దూరం తగ్గుతుంది",
      "పూత, పిందె రాలిపోయి దిగుబడి విపరీతంగా తగ్గుతుంది"
    ],
    organic_title: "సేంద్రీయ & జీవ నియంత్రణ",
    chemical_title: "రసాయన వెక్టర్ నియంత్రణ (తెల్లదోమ)",
    preventive: [
      "అర్కా మేఘన, పంత్ సి-1 వంటి తెగులు తట్టుకునే రకాలను ఎంచుకోండి",
      "చేను చుట్టూ జొన్న, మొక్కజొన్న వంటి రక్షణ పంటలు వేయండి",
      "తెల్లదోమల కోసం ఎకరాకు 15-20 పసుపు రంగు జిగురు అట్టలు అమర్చండి"
    ],
    sample_image: "/samples/leaf_curl.jpg"
  },
  chli_02_anthracnose: {
    name_te: "మిర్చి కాయ కుళ్ళు & కొమ్మ ఎండు తెగులు",
    symptoms: [
      "పచ్చికాయలు మరియు పండిన కాయలపై నల్లటి గుండ్రని గుంటల వంటి మచ్చలు",
      "మచ్చల మధ్యలో వలయాకారంలో నల్లటి చుక్కలు ఏర్పడతాయి",
      "కొమ్మలు పైనుండి కిందకు ఎండిపోవడం (డై-బ్యాక్)",
      "కాయలు ఎండుగడ్డి రంగులోకి మారి రాలిపోతాయి"
    ],
    organic_title: "జీవ శిలీంద్రనాశిని చికిత్స",
    chemical_title: "రసాయన శిలీంద్రనాశిని పిచికారీ",
    preventive: [
      "ట్రైకోడెర్మా విరిడే (10 గ్రా/కిలో విత్తనానికి) తో విత్తనశుద్ధి చేయండి",
      "ఎక్కువ తేమ నిలవకుండా డ్రిప్ పద్ధతిని పాటించండి",
      "తెగులు సోకిన కాయలను ఏరి నాశనం చేయండి"
    ],
    sample_image: "/samples/anthracnose.jpg"
  },
  chli_03_bacterial_spot: {
    name_te: "బాక్టీరియల్ ఆకు మచ్చ తెగులు",
    symptoms: [
      "ఆకులపై తడిసినట్లుండే చిన్న గోధుమరంగు మచ్చలు",
      "మచ్చల చుట్టూ పసుపు రంగు వలయం (హాలో) ఏర్పడుతుంది",
      "తీవ్రమైన దశలో ఆకులు రాలిపోయి కాయలు ఎండకు మాడిపోతాయి",
      "కాండం మరియు కాయలపై గరుకు పొక్కులు ఏర్పడతాయి"
    ],
    organic_title: "సేంద్రీయ బాక్టీరియా యాజమాన్యం",
    chemical_title: "రసాయన బాక్టీరిసైడ్ పిచికారీ",
    preventive: [
      "ధృవీకరించిన విత్తనాలను వాడండి, పంట మార్పిడి పాటించండి",
      "ఆకులు తడిగా ఉన్నప్పుడు చేనులో పనులు చేయకండి",
      "బోర్డో మిశ్రమం 1% పిచికారీ చేయండి"
    ],
    sample_image: "/samples/mottle_virus.jpg"
  },
  chli_04_cercospora_spot: {
    name_te: "సెర్కోస్పోరా ఆకు మచ్చ (కప్ప కన్ను తెగులు)",
    symptoms: [
      "మధ్యలో బూడిద/తెలుపు రంగు మరియు అంచులలో ముదురు గోధుమరంగు మచ్చలు",
      "మచ్చలు కప్ప కన్ను ఆకారంలో కనిపిస్తాయి",
      "మచ్చల మధ్య భాగం ఎండి రంధ్రాలు పడతాయి (షాట్ హోల్)",
      "ఆకులు పసుపుపచ్చగా మారి రాలిపోతాయి"
    ],
    organic_title: "సేంద్రీయ నివారణ చర్యలు",
    chemical_title: "రసాయన శిలీంద్రనాశిని చికిత్స",
    preventive: [
      "నత్రజని ఎరువులు మోతాదుకు మించి వేయకండి",
      "మొక్కల కింద ఉన్న తెగులు సోకిన ఆకులను తొలగించండి",
      "సాఫ్ (Saaf) లేదా మాంకోజెబ్ 2 గ్రా/లీ పిచికారీ చేయండి"
    ],
    sample_image: "/samples/leaf_spot.jpg"
  },
  chli_05_powdery_mildew: {
    name_te: "బూడిద తెగులు (పౌడరీ మిల్డ్యూ)",
    symptoms: [
      "ఆకుల అడుగుభాగంలో తెల్లటి పౌడర్ లేదా దూది వంటి బూజు ఏర్పడుతుంది",
      "ఆకు పైభాగంలో పసుపు రంగు మచ్చలు కనిపిస్తాయి",
      "ఆకుల అంచులు పైకి ముడుచుకుని ఎండిపోతాయి",
      "ఆకులన్నీ రాలిపోయి కొమ్మలు బోసిగా మారతాయి"
    ],
    organic_title: "సేంద్రీయ బూజు నివారణ",
    chemical_title: "రసాయన బూడిద తెగులు నాశిని",
    preventive: [
      "సూర్యరశ్మి బాగా తగిలేలా మొక్కల మధ్య సరైన దూరం ఉంచండి",
      "నీడపట్టున మిర్చి తోటను సాగు చేయకండి",
      "నీటిలో కరిగే గంధకం (Wettable Sulfur) 3 గ్రా/లీ పిచికారీ చేయండి"
    ],
    sample_image: "/samples/yellowish.jpg"
  },
  chli_06_phytophthora_blight: {
    name_te: "ఫైటోఫ్తోరా ఆకు మాడు & మొదలు కుళ్ళు",
    symptoms: [
      "ఆకులపై నీరు పట్టిన ముదురు ఆకుపచ్చ మచ్చలు వేగంగా మాడిపోతాయి",
      "భూమికి సమీపంలో కాండం మొదలు వద్ద నల్లటి కుళ్ళు వలయం",
      "ఆకులు పసుపు మారకుండానే మొత్తం మొక్క ఉన్నట్టుండి వడలిపోతుంది",
      "కాయలపై తెల్లటి బూజు ఏర్పడుతుంది"
    ],
    organic_title: "జీవ నియంత్రణ & నేల యాజమాన్యం",
    chemical_title: "రసాయన ద్రావణం పోయడం (Drenching)",
    preventive: [
      "ఎత్తు మడులపై (Raised Beds) మిర్చి సాగు చేసి నీరు నిలవకుండా చూడండి",
      "వరి, మొక్కజొన్నతో పంట మార్పిడి చేయండి",
      "రిడోమిల్ గోల్డ్ (Ridomil Gold) 2.5 గ్రా/లీ మొదళ్ల వద్ద పోయండి"
    ],
    sample_image: "/samples/damping_off.jpg"
  },
  chli_07_thrips_mites: {
    name_te: "తామర పురుగులు & నల్లి నష్టం (ముర్దా తెగులు)",
    symptoms: [
      "తామర పురుగులు: ఆకుల అంచులు పైకి ముడుచుకుంటాయి (పడవ ఆకారం)",
      "నల్లి పురుగులు: ఆకుల అంచులు కిందికి ముడుచుకుంటాయి (బోర్లించిన గిన్నె)",
      "ఆకుల అడుగుభాగం రాగి రంగులోకి మారుతుంది",
      "పూత పిందె రాలిపోయి కాయలు వంకర్లు తిరుగుతాయి"
    ],
    organic_title: "సేంద్రీయ కషాయాలు & జిగురు అట్టలు",
    chemical_title: "రసాయన పురుగు మందులు",
    preventive: [
      "ఎకరాకు 10 నీలం అట్టలు (తామర పురుగులకు) + 10 పసుపు అట్టలు ఏర్పాటు చేయండి",
      "కొత్తిమీర, బంతి పూలను అంతర పంటలుగా వేయండి",
      "స్పైనెటోరామ్ 11.7% SC (డెలిగేట్) లేదా ఫిప్రోనిల్ పిచికారీ చేయండి"
    ],
    sample_image: "/samples/whitefly.jpg"
  },
  chli_08_healthy: {
    name_te: "ఆరోగ్యకరమైన మిర్చి మొక్క",
    symptoms: [
      "ఎటువంటి మచ్చలు లేదా పసుపుదనం లేని స్వచ్ఛమైన ఆకుపచ్చని ఆకులు",
      "ముడుతలు లేదా రంధ్రాలు లేకుండా మృదువైన ఆకు ఉపరితలం",
      "మొక్క బలంగా ఎదుగుతూ నిటారుగా ఉంటుంది",
      "సమృద్ధిగా పూత, ఆరోగ్యకరమైన మిర్చి కాయలు కాయడం"
    ],
    organic_title: "సేంద్రీయ పోషక నిర్వహణ",
    chemical_title: "సమతుల్య ఎరువుల షెడ్యూల్ (NPK)",
    preventive: [
      "15 రోజులకు ఒకసారి జీవామృతం లేదా పంచగవ్య పిచికారీ చేయండి",
      "కలుపు లేకుండా తోటను శుభ్రంగా ఉంచండి",
      "ఎకరానికి 10 టన్నుల పశువుల ఎరువు వేయండి"
    ],
    sample_image: "/samples/healthy.jpg"
  }
};

// Process raw dataset into fully enriched typed disease items
export const chiliDiseases: Disease[] = rawDiseasesData.diseases.map((d: any) => {
  const enrich = teluguEnrichment[d.id] || {
    name_te: d.name_en,
    symptoms: d.symptoms.en,
    organic_title: "సేంద్రీయ చికిత్స",
    chemical_title: "రసాయన చికిత్స",
    preventive: d.preventive_measures,
    sample_image: "/samples/healthy.jpg"
  };

  return {
    ...d,
    name_te: enrich.name_te,
    symptoms: {
      en: d.symptoms.en,
      hi: d.symptoms.hi,
      te: enrich.symptoms,
    },
    organic_treatment: {
      title_en: d.organic_treatment.title_en,
      title_hi: d.organic_treatment.title_hi,
      title_te: enrich.organic_title,
      methods: d.organic_treatment.methods,
    },
    chemical_treatment: {
      title_en: d.chemical_treatment.title_en,
      title_hi: d.chemical_treatment.title_hi,
      title_te: enrich.chemical_title,
      methods: d.chemical_treatment.methods,
    },
    preventive_measures: {
      en: d.preventive_measures,
      hi: d.preventive_measures, // fallback to en/hi array
      te: enrich.preventive,
    },
    sample_image: enrich.sample_image,
  };
});

// Quick samples for 1-click test diagnosis
export const sampleTestLeaves = [
  {
    id: "sample-leaf-curl",
    title: "Chili Leaf Curl",
    title_hi: "पत्ता मरोड़",
    title_te: "ఆకు ముడుత",
    image: "/samples/leaf_curl.jpg",
    diseaseId: "chli_01_leaf_curl",
  },
  {
    id: "sample-anthracnose",
    title: "Anthracnose Rot",
    title_hi: "फल सड़न",
    title_te: "కాయ కుళ్ళు",
    image: "/samples/anthracnose.jpg",
    diseaseId: "chli_02_anthracnose",
  },
  {
    id: "sample-damping-off",
    title: "Phytophthora Blight",
    title_hi: "झुलसा रोग",
    title_te: "ఆకు మాడు",
    image: "/samples/damping_off.jpg",
    diseaseId: "chli_06_phytophthora_blight",
  },
  {
    id: "sample-leaf-spot",
    title: "Cercospora Spot",
    title_hi: "मेढक आंख धब्बा",
    title_te: "కప్ప కన్ను మచ్చ",
    image: "/samples/leaf_spot.jpg",
    diseaseId: "chli_04_cercospora_spot",
  },
  {
    id: "sample-whitefly",
    title: "Whitefly / Murda",
    title_hi: "सफेद मक्खी / थ्रिप्स",
    title_te: "తామర పురుగు",
    image: "/samples/whitefly.jpg",
    diseaseId: "chli_07_thrips_mites",
  },
  {
    id: "sample-yellowish",
    title: "Powdery Mildew",
    title_hi: "सफेद फफूंदी",
    title_te: "బూడిద తెగులు",
    image: "/samples/yellowish.jpg",
    diseaseId: "chli_05_powdery_mildew",
  },
  {
    id: "sample-mottle",
    title: "Bacterial Spot",
    title_hi: "जीवाणु धब्बा",
    title_te: "బాక్టీరియల్ మచ్చ",
    image: "/samples/mottle_virus.jpg",
    diseaseId: "chli_03_bacterial_spot",
  },
  {
    id: "sample-healthy",
    title: "Healthy Leaf",
    title_hi: "स्वस्थ पत्ता",
    title_te: "ఆరోగ్యకరమైన ఆకు",
    image: "/samples/healthy.jpg",
    diseaseId: "chli_08_healthy",
  },
];

// APMC Mandi Rates for major chili markets
export const mandiRates = [
  { mandi: "Guntur Yard (AP)", variety: "Teja Super", price: 19600, change: "+250", trend: "up" },
  { mandi: "Khammam (TS)", variety: "Fatki / Deluxe", price: 18900, change: "+180", trend: "up" },
  { mandi: "Warangal (TS)", variety: "Wonder Hot", price: 19250, change: "+100", trend: "up" },
  { mandi: "Byadgi (KA)", variety: "KDL / Oil Rich", price: 28400, change: "+450", trend: "up" },
  { mandi: "Nagpur (MH)", variety: "Dry Red Chilli", price: 17800, change: "-50", trend: "down" },
];

export function getDiseaseById(id: string): Disease | undefined {
  return chiliDiseases.find((d) => d.id === id);
}

export function getLocalizedDiseaseName(disease: Disease, lang: "en" | "hi" | "te"): string {
  if (lang === "hi") return disease.name_hi;
  if (lang === "te") return disease.name_te;
  return disease.name_en;
}
