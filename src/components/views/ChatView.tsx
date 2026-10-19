import { useState, useRef, useEffect } from "react";
import { useLang } from "@/lib/i18n";
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Bot, 
  User as UserIcon,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export function ChatView() {
  const { t, lang } = useLang();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      sender: "bot",
      text:
        lang === "te"
          ? "నమస్కారం రైతు సోదరా! నేను మీ మిర్చి రక్షక్ AI సహాయకుడిని. ఆకు ముడుత, తామర పురుగులు, ఎరువులు లేదా పిచికారీ సమయం గురించి ఏదైనా అడగండి."
          : lang === "hi"
          ? "नमस्ते किसान भाई! मैं आपका मिर्ची रक्षक AI सहायक हूँ। मिर्च के पत्ता मरोड़, थ्रिप्स, खाद या छिड़काव के बारे में कुछ भी पूछें।"
          : "Namaste! I am your MirchiRakshak AI assistant. Ask me anything about chili leaf curl, thrips, organic sprays, fertilizers, or mandi prices.",
      time: "Just now",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const quickQuestions = [
    {
      q_en: "How to control leaf curl virus?",
      q_hi: "पत्ता मरोड़ रोग कैसे रोकें?",
      q_te: "ఆకు ముడుత తెగులు ఎలా నివారించాలి?",
    },
    {
      q_en: "When should I spray for thrips?",
      q_hi: "थ्रिप्स के लिए कब छिड़काव करें?",
      q_te: "తామర పురుగులకు ఎప్పుడు పిచికారీ చేయాలి?",
    },
    {
      q_en: "How to prepare sour buttermilk spray?",
      q_hi: "खट्टी छाछ का घोल कैसे बनाएं?",
      q_te: "పుల్లటి మజ్జిగ ద్రావణం ఎలా తయారు చేయాలి?",
    },
    {
      q_en: "Which fertilizer is best during flowering?",
      q_hi: "फूल आने के समय कौन सा खाद डालें?",
      q_te: "పూత సమయంలో ఏ ఎరువులు వాడాలి?",
    },
  ];

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("curl") || q.includes("मरोड़") || q.includes("ముడుత")) {
      if (lang === "te") {
        return "ఆకు ముడుత వైరస్ తెల్లదోమల వల్ల వ్యాపిస్తుంది. సేంద్రీయంగా: వేపనూనె (50,000 PPM) 5 మి.లీ/లీ లేదా 500 మి.లీ పుల్లటి మజ్జిగను 10 లీటర్ల నీటిలో కలిపి పిచికారీ చేయండి. చేనులో ఎకరాకు 15 పసుపు జిగురు అట్టలు పెట్టండి. రసాయనంగా: ఇమిడాక్లోప్రిడ్ 17.8% SL (0.5 మి.లీ/లీ) లేదా డయాఫెంథియురాన్ (1.25 గ్రా/లీ) పిచికారీ చేయండి.";
      }
      if (lang === "hi") {
        return "पत्ता मरोड़ (Leaf Curl) सफेद मक्खी से फैलता है। जैविक उपाय: 50,000 PPM नीम तेल 5 मिली/लीटर या 500 मिली खट्टी छाछ 10 लीटर पानी में मिलाकर छिड़कें। 15-20 पीले चिपचिपे ट्रैप लगाएं। रासायनिक उपाय: इमिडाक्लोप्रिड 17.8% SL (0.5 मिली/लीटर पानी) छिड़कें।";
      }
      return "Chili Leaf Curl Virus is transmitted by whiteflies. Organic remedy: Spray Neem Oil (50,000 PPM) at 5ml/liter with 1ml liquid soap, or sour buttermilk (500ml in 10L water). Install 15-20 yellow sticky traps/acre. Chemical control: Imidacloprid 17.8% SL at 0.5ml/liter.";
    }

    if (q.includes("thrip") || q.includes("mite") || q.includes("तामरा") || q.includes("నల్లి") || q.includes("मुर्दा")) {
      if (lang === "te") {
        return "తామర పురుగుల వల్ల ఆకులు పైకి పడవలా ముడుచుకుంటాయి, నల్లి వల్ల కిందకు ముడుచుకుంటాయి. నివారణ: ఎకరాకు 10 నీలం అట్టలు (తామర పురుగులకు) + 10 పసుపు అట్టలు పెట్టండి. రసాయన నియంత్రణకు స్పైనెటోరామ్ 11.7% SC (1 మి.లీ/2 లీటర్ల నీటికి) లేదా ఫిప్రోనిల్ 5% SC (2 మి.లీ/లీ) పిచికారీ చేయండి.";
      }
      if (lang === "hi") {
        return "थ्रिप्स से पत्तियां ऊपर की ओर नाव जैसी और माइट्स से नीचे की ओर मुड़ती हैं। नियंत्रण के लिए नीले और पीले चिपचिपे ट्रैप लगाएं। कीटनाशक: स्पिनेटोरम 11.7% SC (1 मिली प्रति 2 लीटर पानी) या फिप्रोनिल 5% SC (2 मिली/लीटर) शाम के समय छिड़कें।";
      }
      return "Thrips cause leaves to curl upwards like a boat; mites cause downward cup curling. Install blue sticky traps for thrips. Spray Spinetoram 11.7% SC (1ml per 2L water) or Fipronil 5% SC (2ml/L) in late afternoon.";
    }

    if (q.includes("buttermilk") || q.includes("छाछ") || q.includes("మజ్జిగ")) {
      if (lang === "te") {
        return "పుల్లటి మజ్జిగ ద్రావణం: 500 మి.లీ బాగా పులిసిన నాటు ఆవు మజ్జిగను 10 లీటర్ల నీటిలో కలపండి. ఇది వైరస్ వ్యాప్తిని అరికట్టే సహజ రోగనిరోధక బూస్టర్. ప్రతి 10-12 రోజులకు ఒకసారి ఉదయం వేళ పిచికారీ చేయండి.";
      }
      if (lang === "hi") {
        return "खट्टी छाछ का नुस्खा: 500 मिली खट्टी छाछ को 10 लीटर पानी में मिलाकर छान लें। यह मिर्च में वायरल बीमारियों को रोकने और हरियाली बढ़ाने में रामबाण जैविक टॉनिक है। हर 10 दिन में छिड़कें।";
      }
      return "Sour Buttermilk Spray Recipe: Mix 500ml of fermented sour buttermilk in 10 liters of water. It acts as a natural antiviral bio-booster suppressing Begomoviruses and stimulating plant immunity. Spray every 10-12 days.";
    }

    if (q.includes("fertilizer") || q.includes("flower") || q.includes("खाद") || q.includes("ఎరువులు") || q.includes("పూత")) {
      if (lang === "te") {
        return "పూత మరియు పిందె దశలో: 19:19:19 లేదా 13:0:45 (పొటాషియం నైట్రేట్) 5 గ్రా/లీ మరియు బోరాన్ 20% (1 గ్రా/లీ) పిచికారీ చేయండి. ఇది పూత రాలడాన్ని నివారించి నాణ్యమైన కాయలు ఏర్పడేలా చేస్తుంది.";
      }
      if (lang === "hi") {
        return "फूल आने के समय: NPK 19:19:19 (5 ग्राम/लीटर) और बोरॉन 20% (1 ग्राम/लीटर) का पर्णीय छिड़काव करें। इससे फूल झड़ने की समस्या रुकती है और फलों का वजन बढ़ता है।";
      }
      return "During flowering and pod initiation: Spray N:P:K 19:19:19 (5g/L) combined with Boron 20% (1g/L) to prevent flower drop and ensure firm, glossy chili pods.";
    }

    // Default intelligent farming response
    if (lang === "te") {
      return "మీ మిర్చి తోటను క్రమం తప్పకుండా పర్యవేక్షించండి. పంట ఆరోగ్యాన్ని మరింత ఖచ్చితంగా తెలుసుకోవడానికి కెమెరాతో ఆకును స్కాన్ చేయండి. ఎల్లప్పుడూ తక్కువ గాలి ఉన్న ఉదయపు వేళల్లో మాత్రమే పిచికారీ చేయండి.";
    }
    if (lang === "hi") {
      return "अपनी मिर्च फसल की लगातार निगरानी करें। सही पहचान के लिए पत्ती का फोटो स्कैन करें। छिड़काव हमेशा सुबह 6 से 9 बजे के बीच शांत हवा में ही करें।";
    }
    return "Ensure regular inspection of your chili crop canopy. For exact diagnostics, use the AI Scanner tab to photograph affected leaves. Spray only during calm morning hours (6:00 - 9:30 AM).";
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend ?? input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: query,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate smart AI response
    setTimeout(() => {
      const answer = generateAnswer(query);
      const botMsg: Message = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: answer,
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleVoiceToggle = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info("Voice recognition not supported on this device/browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(t("tapToSpeak"));
      };

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "te" ? "te-IN" : lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    toast.info("Speaking answer...");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] pb-24 animate-fade">
      {/* Header */}
      <div className="p-4 bg-white border-b border-earth-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-leaf-100 text-leaf-800 flex items-center justify-center font-bold text-xl shadow-inner">
            🌱
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-earth-900 leading-tight">
              {t("aiAssistant")} (Kisan Mitra)
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-2 rounded-full bg-leaf-500 animate-pulse" />
              <span className="text-[11px] text-stone-500">
                {lang === "te" ? "ఆన్‌లైన్ • తెలుగులో మాట్లాడండి" : lang === "hi" ? "ऑनलाइन • हिंदी में बोलें" : "Online • Speaks EN/HI/TE"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleVoiceToggle}
          className={`size-9 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
            isListening
              ? "bg-chili-600 text-white border-chili-600 animate-pulse"
              : "bg-earth-100 text-earth-700 border-earth-200"
          }`}
          title="Voice Assistant"
        >
          {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-hide">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`size-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                m.sender === "user" ? "bg-chili-600 text-white" : "bg-leaf-600 text-white"
              }`}
            >
              {m.sender === "user" ? <UserIcon className="size-3.5" /> : <Bot className="size-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                m.sender === "user"
                  ? "bg-chili-600 text-white rounded-tr-none"
                  : "bg-white text-earth-900 border border-earth-200 rounded-tl-none leading-relaxed"
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>
              {m.sender === "bot" && (
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-earth-100 text-[10px] text-stone-400">
                  <span>{m.time}</span>
                  <button
                    onClick={() => speakText(m.text)}
                    className="hover:text-chili-600 flex items-center gap-0.5"
                    title="Read aloud"
                  >
                    <Volume2 className="size-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0 bg-earth-50 border-t border-earth-200">
        <Sparkles className="size-3.5 text-amber-500 shrink-0" />
        {quickQuestions.map((qq, idx) => {
          const text = lang === "te" ? qq.q_te : lang === "hi" ? qq.q_hi : qq.q_en;
          return (
            <button
              key={idx}
              onClick={() => handleSend(text)}
              className="text-[11px] font-semibold bg-white border border-earth-200 hover:border-chili-400 text-earth-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 shadow-sm transition-colors active:scale-95"
            >
              {text}
            </button>
          );
        })}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-earth-200 shrink-0 flex items-center gap-2">
        <button
          onClick={handleVoiceToggle}
          className={`size-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
            isListening ? "bg-chili-600 text-white border-chili-600 animate-pulse" : "bg-earth-100 text-earth-700 border-earth-200"
          }`}
          title="Tap to speak"
        >
          <Mic className="size-4" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("askQuestion")}
          className="flex-1 bg-earth-100 text-earth-900 placeholder:text-stone-400 text-xs rounded-xl px-3.5 py-2.5 border border-earth-200 focus:outline-none focus:ring-2 focus:ring-chili-500"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="size-10 rounded-xl bg-chili-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md shadow-chili-600/20 active:scale-95 transition-all"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
