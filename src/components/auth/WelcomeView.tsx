import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Leaf,
  MessageCircle,
  ScanLine,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { accountCopy } from "@/lib/auth/copy";
import { completeOnboarding } from "@/lib/auth/navigation";
import { useAuth } from "@/lib/auth/context";
import { AccountFooter, AccountShell } from "./AccountShell";

export function WelcomeView() {
  const { lang } = useLang();
  const { user } = useAuth();
  const c = accountCopy[lang];
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const slide = c.slides[step];
  async function finish() {
    completeOnboarding();
    await navigate({
      to: user ? "/home" : "/signup",
      ...(user ? {} : { search: { redirect: "/home" as const } }),
    });
  }
  return (
    <AccountShell className={`welcome-page welcome-step-${step}`}>
      <div className="welcome-toolbar">
        <span className="welcome-progress-label">
          0{step + 1}
          <span> / 03</span>
        </span>
        <button
          className="account-text-button"
          onClick={() => {
            completeOnboarding();
            void navigate({
              to: user ? "/home" : "/login",
              ...(user ? {} : { search: { redirect: "/home" as const } }),
            });
          }}
        >
          {c.skip}
          <ArrowRight size={14} />
        </button>
      </div>
      <div className="welcome-art" key={`art-${step}`} aria-hidden="true">
        <WelcomeIllustration step={step} badge={slide.badge} />
      </div>
      <section className="welcome-copy" aria-live="polite" key={`copy-${step}`}>
        <p className="account-eyebrow">{slide.tag}</p>
        <h1>
          {slide.title}
          <span>{slide.accent}</span>
        </h1>
        <p className="account-description">{slide.description}</p>
        <div className="welcome-detail">
          <span />
          {slide.detail}
        </div>
      </section>
      <div className="welcome-bottom">
        <div
          className="welcome-dots"
          role="group"
          aria-label={
            lang === "te" ? "పరిచయ పేజీలు" : lang === "hi" ? "परिचय पृष्ठ" : "Welcome pages"
          }
        >
          {c.slides.map((item, index) => (
            <button
              key={item.tag}
              aria-label={`${index + 1}. ${item.title} ${item.accent}`}
              aria-current={step === index ? "step" : undefined}
              onClick={() => setStep(index)}
              className={step === index ? "active" : ""}
            />
          ))}
        </div>
        <div className="welcome-actions">
          {step > 0 && (
            <button
              className="account-back"
              aria-label={c.back}
              onClick={() => setStep((value) => value - 1)}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button
            className="account-primary"
            onClick={() => (step < 2 ? setStep((value) => value + 1) : void finish())}
          >
            {step < 2 ? c.next : c.getStarted}
            <ArrowRight size={18} />
          </button>
        </div>
        <p className="account-switch">
          {c.haveAccount}{" "}
          <Link to="/login" search={{ redirect: "/home" }} onClick={completeOnboarding}>
            {c.signIn}
          </Link>
        </p>
      </div>
      <AccountFooter />
    </AccountShell>
  );
}

function WelcomeIllustration({ step, badge }: { step: number; badge: string }) {
  if (step === 1)
    return (
      <div className="welcome-language-art">
        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
        <div className="art-message-icon">
          <MessageCircle size={42} />
        </div>
        <div className="language-card language-card-one">
          <span className="language-avatar">EN</span>
          <div>
            <strong>A little care, every day.</strong>
            <span className="art-text-line" />
            <span className="art-text-line short" />
          </div>
          <Check size={16} />
        </div>
        <div className="language-card language-card-two">
          <span className="language-avatar">తె</span>
          <div>
            <strong>మీ భాషలో మార్గదర్శకం</strong>
            <span className="art-text-line" />
          </div>
        </div>
        <div className="language-card language-card-three">
          <span className="language-avatar">हि</span>
          <div>
            <strong>आपकी भाषा में देखभाल</strong>
            <span className="art-text-line short" />
          </div>
        </div>
        <div className="art-floating-badge language-badge">
          <Leaf size={16} />
          {badge}
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="welcome-grow-art">
        <div className="grow-sun" />
        <svg viewBox="0 0 340 300" className="grow-fields">
          <path d="M0 184Q80 122 170 180Q260 112 340 173V300H0Z" fill="#dce7cd" />
          <path d="M0 219Q90 150 180 216Q270 144 340 207V300H0Z" fill="#b9cea5" />
          <path d="M0 263Q95 191 190 257Q280 186 340 244V300H0Z" fill="#86a578" />
          <path
            d="M10 299Q104 228 190 287M105 300Q192 242 277 300"
            fill="none"
            stroke="#f2f1d9"
            strokeWidth="3"
          />
        </svg>
        <div className="grow-plant">
          <svg viewBox="0 0 150 190">
            <path d="M76 155V63" stroke="#345e3d" strokeWidth="7" strokeLinecap="round" />
            <path d="M76 107C13 110 13 51 22 42C66 40 88 69 76 107Z" fill="#73945c" />
            <path d="M76 79C73 26 111 10 134 14C145 57 123 87 76 79Z" fill="#295740" />
            <path d="M76 130C78 98 111 88 131 98C127 126 103 141 76 130Z" fill="#a4b67b" />
            <path d="M43 146H110L101 184H52Z" fill="#b85c35" />
            <path d="M39 145H114V156H39Z" fill="#d77e4e" />
            <path d="M77 102L40 63M79 75L120 31" stroke="#c3d6a6" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <span className="grow-spark spark-one">✦</span>
        <span className="grow-spark spark-two">✦</span>
        <div className="grow-shield">
          <ShieldCheck size={27} />
        </div>
        <div className="art-floating-badge grow-badge">
          <Sprout size={17} />
          {badge}
        </div>
      </div>
    );
  return (
    <div className="welcome-scan-art">
      <span className="art-orbit orbit-one" />
      <span className="art-orbit orbit-two" />
      <div className="scan-illustration">
        <span className="scan-corner top-left" />
        <span className="scan-corner top-right" />
        <span className="scan-corner bottom-left" />
        <span className="scan-corner bottom-right" />
        <svg viewBox="0 0 240 260">
          <path
            d="M115 224C56 214 38 160 56 107C73 59 114 35 180 25C192 96 195 156 154 199C142 212 128 220 115 224Z"
            fill="#366347"
          />
          <path
            d="M89 221C66 186 66 144 83 111C106 68 143 47 180 25C174 99 153 168 89 221Z"
            fill="#6e925f"
          />
          <path
            d="M83 247C97 192 124 121 180 25M108 177L73 132M127 138L96 96M145 102L125 64M109 177L153 162M128 138L173 119M146 100L182 79"
            stroke="#c7d9a7"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="scan-illustration-line" />
      </div>
      <div className="art-mini-chip">
        <ScanLine size={19} />
        <span>AI</span>
      </div>
      <div className="art-floating-badge scan-badge">
        <span className="art-check">
          <Check size={13} />
        </span>
        {badge}
      </div>
      <span className="scan-art-speck speck-one" />
      <span className="scan-art-speck speck-two" />
    </div>
  );
}
