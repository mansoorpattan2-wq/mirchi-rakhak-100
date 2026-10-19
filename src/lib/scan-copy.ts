import type { Lang } from "./i18n";

const en = {
  title: "Scan your crop",
  subtitle: "Photo-based chilli plant assessment",
  hint: "Photograph a well-lit leaf and include part of the plant. Preview your photo, then analyze.",
  live: "Open Live Viewfinder",
  device: "Device Camera",
  gallery: "Choose photo",
  capture: "Capture photo",
  close: "Close camera",
  flip: "Switch camera",
  flash: "Toggle flashlight",
  opening: "Opening camera…",
  analyze: "Analyze Leaf",
  analyzing: "Examining your photo…",
  retry: "Retry analysis",
  rescan: "Scan again",
  photo: "Submitted plant photograph",
  preview: "Photo preview",
  samples: "Try a sample photo",
  sampleNote:
    "Sample labels describe the source photos; they are never sent as diagnosis instructions.",
  privacy:
    "Analysis sends your photo to the app's configured AI provider (Google Gemini or OpenAI). We remove photo metadata and do not save uploads on our server. Avoid including people or personal information.",
  plant: "Identified plant",
  symptoms: "Visible symptoms",
  evidence: "What the photo shows",
  actions: "Next steps",
  uncertainty: "Uncertainty",
  confidence: "Model assessment",
  quality: "Photo quality",
  expert: "Confirm with an agricultural expert before treatment.",
  caveat:
    "This is photo-based guidance. Model confidence is qualitative and is not a validated probability or laboratory diagnosis.",
  healthy: "Apparently healthy",
  diseased: "Disease suspected",
  wrong_plant: "Different plant",
  unknown_plant: "Plant not identified",
  invalid_image: "Unsuitable photograph",
  uncertain: "Assessment uncertain",
  high: "High",
  medium: "Medium",
  low: "Low",
  unavailable: "Not available",
  good: "Good",
  poor: "Poor",
  unusable: "Unusable",
  signIn: "Sign in to analyze",
  email: "Email",
  password: "Password",
  signedIn: "Signed in. You can analyze your photo now.",
  signInFailed: "Could not sign in. Check your email and password and try again.",
  authSetup: "Sign-in needs to be configured by the app administrator.",
  saved: "Scan saved on this device.",
  save: "Save result",
  listen: "Listen to assessment",
  speechUnavailable: "Speech is unavailable in this browser.",
  failed: "Analysis could not be completed. Please retry.",
  connection: "Could not reach the scan server. Check your connection and retry.",
  serviceUnavailable: "The image service is temporarily unavailable. Please retry shortly.",
  incomplete:
    "The image service returned an incomplete assessment. Retry or choose a clearer photo.",
  authUnavailable: "Your sign-in could not be verified. Check your connection and retry.",
  configuration:
    "Image analysis is not configured. The administrator must set the selected provider's server API key and model.",
  busy: "The scan server is busy. Please retry shortly.",
  scanLimit: "This app's scan limit has been reached. Wait for the limit to reset before retrying.",
  providerLimit:
    "The AI provider's quota or rate limit was reached. Check API billing and limits, or retry later.",
  scanInProgress: "Your photo is already being analyzed. Please wait for it to finish.",
  timeout: "Analysis took too long. Please retry.",
  invalid: "Choose a valid JPEG, PNG or WebP photo under 4 MB (up to 24 megapixels).",
  cameraError: "Camera unavailable. Check permissions or use Device Camera / Choose photo.",
  changedLanguage:
    "This assessment is shown in its original language. To get a new assessment in your selected language, press Analyze Leaf.",
};

export const scanCopy: Record<Lang, typeof en> = {
  en,
  te: {
    title: "మీ పంటను పరిశీలించండి",
    subtitle: "ఫోటో ఆధారంగా మిర్చి మొక్క పరిశీలన",
    hint: "మంచి వెలుతురులో ఆకు మరియు మొక్కలో కొంత భాగం కనిపించేలా ఫోటో తీయండి. ముందుగా ఫోటో చూసి, తర్వాత విశ్లేషించండి.",
    live: "లైవ్ కెమెరా తెరవండి",
    device: "ఫోన్ కెమెరా",
    gallery: "ఫోటో ఎంచుకోండి",
    capture: "ఫోటో తీయండి",
    close: "కెమెరా మూసివేయండి",
    flip: "కెమెరా మార్చండి",
    flash: "ఫ్లాష్ మార్చండి",
    opening: "కెమెరా తెరుస్తోంది…",
    analyze: "ఆకును విశ్లేషించండి",
    analyzing: "మీ ఫోటోను పరిశీలిస్తోంది…",
    retry: "మళ్లీ ప్రయత్నించండి",
    rescan: "మళ్లీ స్కాన్ చేయండి",
    photo: "పంపిన మొక్క ఫోటో",
    preview: "ఫోటో ముందస్తు వీక్షణ",
    samples: "నమూనా ఫోటో ప్రయత్నించండి",
    sampleNote: "నమూనా పేర్లు ఫోటోల వివరాలు మాత్రమే; వాటిని నిర్ధారణ సూచనలుగా పంపము.",
    privacy:
      "విశ్లేషణ కోసం మీ ఫోటో యాప్‌లో ఎంచుకున్న AI సేవకు (Google Gemini లేదా OpenAI) పంపబడుతుంది. ఫోటో మెటాడేటాను తొలగిస్తాము; మా సర్వరులో ఫోటోలను నిల్వ చేయము. వ్యక్తులు లేదా వ్యక్తిగత సమాచారం ఉండకుండా చూసుకోండి.",
    plant: "గుర్తించిన మొక్క",
    symptoms: "కనిపించే లక్షణాలు",
    evidence: "ఫోటోలో కనిపించే ఆధారాలు",
    actions: "తదుపరి చర్యలు",
    uncertainty: "అనిశ్చితి",
    confidence: "మోడల్ అంచనా",
    quality: "ఫోటో నాణ్యత",
    expert: "చికిత్సకు ముందు వ్యవసాయ నిపుణుడితో నిర్ధారించుకోండి.",
    caveat:
      "ఇది ఫోటో ఆధారిత మార్గదర్శకం. మోడల్ నమ్మకం గుణాత్మక అంచనా మాత్రమే; ధృవీకరించిన సంభావ్యత లేదా ప్రయోగశాల నిర్ధారణ కాదు.",
    healthy: "ఆరోగ్యంగా కనిపిస్తోంది",
    diseased: "తెగులు అనుమానం",
    wrong_plant: "వేరే మొక్క",
    unknown_plant: "మొక్కను గుర్తించలేకపోయాము",
    invalid_image: "అనువుకాని ఫోటో",
    uncertain: "అంచనా అనిశ్చితంగా ఉంది",
    high: "ఎక్కువ",
    medium: "మధ్యస్థం",
    low: "తక్కువ",
    unavailable: "అందుబాటులో లేదు",
    good: "మంచిది",
    poor: "తక్కువ",
    unusable: "ఉపయోగించలేము",
    signIn: "విశ్లేషణకు సైన్ ఇన్ చేయండి",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    signedIn: "సైన్ ఇన్ పూర్తయింది. ఇప్పుడు ఫోటోను విశ్లేషించవచ్చు.",
    signInFailed: "సైన్ ఇన్ కాలేదు. ఇమెయిల్, పాస్‌వర్డ్ సరిచూసి మళ్లీ ప్రయత్నించండి.",
    authSetup: "అడ్మినిస్ట్రేటర్ సైన్ ఇన్ సేవను ఏర్పాటు చేయాలి.",
    saved: "ఈ పరికరంలో ఫలితం భద్రపరచబడింది.",
    save: "ఫలితం భద్రపరచండి",
    listen: "అంచనా వినండి",
    speechUnavailable: "ఈ బ్రౌజరులో వాయిస్ సౌకర్యం అందుబాటులో లేదు.",
    failed: "విశ్లేషణ పూర్తికాలేదు. మళ్లీ ప్రయత్నించండి.",
    connection:
      "స్కాన్ సర్వర్‌ను చేరుకోలేకపోయాము. మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
    serviceUnavailable:
      "ఫోటో విశ్లేషణ సేవ తాత్కాలికంగా అందుబాటులో లేదు. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
    incomplete:
      "ఫోటో విశ్లేషణ సేవ అసంపూర్ణ అంచనాను పంపింది. మళ్లీ ప్రయత్నించండి లేదా మరింత స్పష్టమైన ఫోటో ఎంచుకోండి.",
    authUnavailable:
      "మీ సైన్ ఇన్‌ను ధృవీకరించలేకపోయాము. ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
    configuration:
      "చిత్ర విశ్లేషణ ఏర్పాటు కాలేదు. అడ్మినిస్ట్రేటర్ ఎంచుకున్న సేవకు సర్వర్ API కీ మరియు మోడల్ సెట్ చేయాలి.",
    busy: "స్కాన్ సర్వర్ బిజీగా ఉంది. కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
    scanLimit: "ఈ యాప్ స్కాన్ పరిమితి చేరింది. పరిమితి రీసెట్ అయిన తర్వాత మళ్లీ ప్రయత్నించండి.",
    providerLimit:
      "AI సేవ కోటా లేదా అభ్యర్థన పరిమితి చేరింది. API బిల్లింగ్ మరియు పరిమితులు తనిఖీ చేయండి లేదా తర్వాత మళ్లీ ప్రయత్నించండి.",
    scanInProgress: "మీ ఫోటో ఇప్పటికే విశ్లేషించబడుతోంది. పూర్తయ్యే వరకు వేచి ఉండండి.",
    timeout: "విశ్లేషణకు ఎక్కువ సమయం పట్టింది. మళ్లీ ప్రయత్నించండి.",
    invalid: "4 MB కంటే చిన్న JPEG, PNG లేదా WebP ఫోటో ఎంచుకోండి (24 మెగాపిక్సెల్స్ వరకు).",
    cameraError: "కెమెరా అందుబాటులో లేదు. అనుమతులు సరిచూడండి లేదా ఫోన్ కెమెరా / ఫోటో ఎంపిక వాడండి.",
    changedLanguage:
      "ఈ అంచనా అసలు భాషలో చూపబడుతోంది. ఎంచుకున్న భాషలో కొత్త అంచనా కోసం ఆకును విశ్లేషించండి నొక్కండి.",
  },
  hi: {
    title: "अपनी फसल जाँचें",
    subtitle: "फोटो के आधार पर मिर्च के पौधे की जाँच",
    hint: "अच्छी रोशनी में पत्ती और पौधे का कुछ भाग दिखाते हुए फोटो लें। पहले फोटो देखें, फिर विश्लेषण करें।",
    live: "लाइव कैमरा खोलें",
    device: "फोन कैमरा",
    gallery: "फोटो चुनें",
    capture: "फोटो लें",
    close: "कैमरा बंद करें",
    flip: "कैमरा बदलें",
    flash: "फ्लैश बदलें",
    opening: "कैमरा खुल रहा है…",
    analyze: "पत्ती का विश्लेषण करें",
    analyzing: "आपकी फोटो की जाँच हो रही है…",
    retry: "फिर कोशिश करें",
    rescan: "फिर स्कैन करें",
    photo: "भेजी गई पौधे की फोटो",
    preview: "फोटो पूर्वावलोकन",
    samples: "नमूना फोटो आज़माएँ",
    sampleNote:
      "नमूनों के नाम फोटो का विवरण हैं; उन्हें निदान के निर्देश के रूप में नहीं भेजा जाता।",
    privacy:
      "विश्लेषण के लिए आपकी फोटो ऐप में चुनी गई AI सेवा (Google Gemini या OpenAI) को भेजी जाती है। फोटो का मेटाडेटा हटाया जाता है और फोटो हमारे सर्वर पर सहेजी नहीं जाती। लोगों या निजी जानकारी को शामिल न करें।",
    plant: "पहचाना गया पौधा",
    symptoms: "दिखाई देने वाले लक्षण",
    evidence: "फोटो में दिखने वाले संकेत",
    actions: "अगले कदम",
    uncertainty: "अनिश्चितता",
    confidence: "मॉडल का आकलन",
    quality: "फोटो की गुणवत्ता",
    expert: "उपचार से पहले कृषि विशेषज्ञ से पुष्टि कराएँ।",
    caveat:
      "यह फोटो आधारित मार्गदर्शन है। मॉडल का विश्वास गुणात्मक आकलन है, प्रमाणित संभावना या प्रयोगशाला निदान नहीं।",
    healthy: "स्वस्थ दिखाई देता है",
    diseased: "रोग की आशंका",
    wrong_plant: "अलग पौधा",
    unknown_plant: "पौधे की पहचान नहीं हुई",
    invalid_image: "अनुपयुक्त फोटो",
    uncertain: "आकलन अनिश्चित है",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    unavailable: "उपलब्ध नहीं",
    good: "अच्छी",
    poor: "खराब",
    unusable: "अनुपयोगी",
    signIn: "विश्लेषण के लिए साइन इन करें",
    email: "ईमेल",
    password: "पासवर्ड",
    signedIn: "साइन इन हो गया। अब अपनी फोटो का विश्लेषण कर सकते हैं।",
    signInFailed: "साइन इन नहीं हुआ। ईमेल और पासवर्ड जाँचकर फिर कोशिश करें।",
    authSetup: "ऐप व्यवस्थापक को साइन इन सेवा कॉन्फ़िगर करनी होगी।",
    saved: "परिणाम इस डिवाइस पर सहेजा गया।",
    save: "परिणाम सहेजें",
    listen: "आकलन सुनें",
    speechUnavailable: "इस ब्राउज़र में आवाज़ की सुविधा उपलब्ध नहीं है।",
    failed: "विश्लेषण पूरा नहीं हुआ। फिर कोशिश करें।",
    connection: "स्कैन सर्वर से संपर्क नहीं हुआ। इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।",
    serviceUnavailable: "फोटो विश्लेषण सेवा अभी उपलब्ध नहीं है। थोड़ी देर बाद फिर कोशिश करें।",
    incomplete: "फोटो विश्लेषण सेवा ने अधूरा आकलन भेजा। फिर कोशिश करें या अधिक स्पष्ट फोटो चुनें।",
    authUnavailable: "आपके साइन इन की पुष्टि नहीं हुई। इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।",
    configuration:
      "छवि विश्लेषण कॉन्फ़िगर नहीं है। व्यवस्थापक को चुनी गई सेवा की सर्वर API कुंजी और मॉडल सेट करना होगा।",
    busy: "स्कैन सर्वर व्यस्त है। थोड़ी देर बाद फिर कोशिश करें।",
    scanLimit: "इस ऐप की स्कैन सीमा पूरी हो गई है। सीमा रीसेट होने के बाद फिर कोशिश करें।",
    providerLimit:
      "AI सेवा का कोटा या अनुरोध सीमा पूरी हो गई है। API बिलिंग और सीमाएँ जाँचें या बाद में फिर कोशिश करें।",
    scanInProgress: "आपकी फोटो का विश्लेषण पहले से चल रहा है। पूरा होने तक प्रतीक्षा करें।",
    timeout: "विश्लेषण में अधिक समय लगा। फिर कोशिश करें।",
    invalid: "4 MB से छोटी मान्य JPEG, PNG या WebP फोटो चुनें (24 मेगापिक्सेल तक)।",
    cameraError: "कैमरा उपलब्ध नहीं है। अनुमति जाँचें या फोन कैमरा / फोटो चुनें का उपयोग करें।",
    changedLanguage:
      "यह आकलन मूल भाषा में दिखाया गया है। चुनी गई भाषा में नया आकलन पाने के लिए पत्ती का विश्लेषण करें दबाएँ।",
  },
};

export function scanErrorMessage(code: string, lang: Lang) {
  const c = scanCopy[lang];
  if (code.includes("CONFIGURATION"))
    return code.startsWith("AUTH") ? c.authSetup : c.configuration;
  if (code === "AUTH_REQUIRED") return c.signIn;
  if (code === "AUTH_UNAVAILABLE") return c.authUnavailable;
  if (code === "NETWORK_ERROR") return c.connection;
  if (["PROVIDER_UNAVAILABLE", "SERVER_UNAVAILABLE", "INTERNAL_ERROR"].includes(code))
    return c.serviceUnavailable;
  if (code === "INVALID_PROVIDER_RESPONSE") return c.incomplete;
  if (code === "PROVIDER_TIMEOUT") return c.timeout;
  if (code === "RATE_LIMIT") return c.scanLimit;
  if (code === "PROVIDER_RATE_LIMIT") return c.providerLimit;
  if (code === "SCAN_IN_PROGRESS") return c.scanInProgress;
  if (code === "SERVICE_BUSY") return c.busy;
  if (["INVALID_IMAGE", "UNSUPPORTED_IMAGE", "IMAGE_TOO_LARGE"].includes(code)) return c.invalid;
  return c.failed;
}
