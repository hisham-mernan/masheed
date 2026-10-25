"use client";

import { useCountUp, useScrollReveal } from "@/lib/hooks";
import {
  Building2,
  Coins,
  HandHeart,
  Landmark,
  ArrowLeft,
  RefreshCw,
  Lock,
  Plus,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

/* ──────────────────────────── HERO ──────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Decorative outlined word with Calligraphy Animation */}
      <svg
        className="pointer-events-none select-none absolute inset-0 w-full h-full z-0"
        aria-hidden
      >
        <motion.text
          x="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display font-black"
          style={{ fontSize: "35vw" }}
          fill="transparent"
          strokeDasharray="4000"
          initial={{ 
            strokeDashoffset: 4000, 
            strokeWidth: 4, 
            stroke: "var(--color-foreground)",
            y: "70%", 
            opacity: 1 
          }}
          animate={{ 
            strokeDashoffset: 0, 
            strokeWidth: 1, 
            stroke: "var(--color-border)",
            y: "105%", 
            opacity: 0.6
          }}
          transition={{
            strokeDashoffset: { duration: 1.8, ease: "easeInOut" },
            strokeWidth: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
            stroke: { duration: 1.2, delay: 1.8, ease: "easeInOut" },
            y: { duration: 1.2, delay: 1.8, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 1.2, delay: 1.8, ease: "easeInOut" }
          }}
        >
          مشيد
        </motion.text>
      </svg>

      <div className="relative z-10 flex-1 flex items-center justify-center max-w-6xl mx-auto w-full px-6 md:px-10 pt-32 pb-40 text-center">
        <div>
          <p className="eyebrow mb-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '2s' }}>
            منصة موثوقة · متوافقة مع أحكام الشريعة
          </p>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl leading-[1.3] md:leading-[1.3] tracking-tight mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
            أثرٌ يبقى،
            <br />
            <span className="text-accent">وقطافٌ لا ينقطع.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-loose mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
            منصة «وقف مشيد» تتيح لك شراء صكوك وقفية في أوقاف متنوعة.
            أصلك محفوظ لا يُباع، وريعه نوجّهه لمن تشاء من مستحقي الخير.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '2.6s' }}>
            <Link href="/explore">
              <button className="group bg-foreground text-background px-10 py-4 rounded-full text-lg font-medium hover:bg-accent transition-colors duration-300 cursor-pointer flex items-center gap-3">
                ابدأ أثرك الآن
                <ArrowLeft
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </button>
            </Link>
            <Link href="#how-it-works">
              <button className="bg-transparent text-foreground border border-foreground/20 px-10 py-4 rounded-full text-lg font-medium hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer">
                كيف تعمل؟
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom hairline + scroll hint */}
      <div className="relative z-10 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between text-xs text-muted-light">
          <span>الرياض، المملكة العربية السعودية</span>
          <span className="hidden md:block">صكوك وقفية رقمية — أصل محفوظ وريع موجّه</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── STATS BAR ─────────────────────────── */
function StatsBar() {
  const stat1 = useCountUp(120, 2000);
  const stat2 = useCountUp(50, 2000);
  const stat3 = useCountUp(10000, 2500);

  return (
    <section className="bg-foreground text-background">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
        <div ref={stat1.ref}>
          <p className="font-display font-bold text-5xl md:text-6xl text-sand mb-3">
            +{stat1.count.toLocaleString("ar-SA")}
          </p>
          <p className="text-background/50 text-sm">وقف عقاري ونقدي ومزارع</p>
        </div>
        <div ref={stat2.ref} className="md:border-x md:border-background/15">
          <p className="font-display font-bold text-5xl md:text-6xl text-sand mb-3">
            {stat2.count.toLocaleString("ar-SA")} مليون
          </p>
          <p className="text-background/50 text-sm">ريال عوائد موجّهة للخير</p>
        </div>
        <div ref={stat3.ref}>
          <p className="font-display font-bold text-5xl md:text-6xl text-sand mb-3">
            +{stat3.count.toLocaleString("ar-SA")}
          </p>
          <p className="text-background/50 text-sm">واقف مساهم على المنصة</p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── HOW IT WORKS ──────────────────────────── */
const STEPS = [
  {
    icon: <Landmark size={22} strokeWidth={1.5} />,
    title: "اختر وقفك",
    description:
      "تصفّح الأوقاف المتاحة وفلترها حسب النوع (عقاري، نقدي، مزارع) ومجال الأثر (تعليم، صحة، أيتام).",
  },
  {
    icon: <Coins size={22} strokeWidth={1.5} />,
    title: "اشترِ صكوكاً",
    description:
      "ساهم بشراء حصص (صكوك وقفية) في الوقف. كل صك يمثّل حصة لا تُباع ولا تُسترد — وقف دائم.",
  },
  {
    icon: <RefreshCw size={22} strokeWidth={1.5} />,
    title: "وجّه العوائد",
    description:
      "الريع (الأرباح) يمكنك توجيهه لأي مصرف خيري تشاء. غيّر وجهة العائد في أي وقت.",
  },
  {
    icon: <Lock size={22} strokeWidth={1.5} />,
    title: "أصلك محفوظ",
    description:
      "مبدأ الوقف: أصل المال محبوس لا يُباع ولا يُورث. أثرك مستمر حتى بعدك.",
  },
];

function HowItWorks() {
  const reveal = useScrollReveal();

  return (
    <section id="how-it-works" className="py-24 md:py-36">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="mb-16 md:mb-20 md:flex md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-6">كيف تعمل المنصة</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">
              أربع خطوات نحو
              <br />
              أثرٍ دائم
            </h2>
          </div>
          <p className="text-muted max-w-sm leading-loose mt-6 md:mt-0">
            مسار بسيط وواضح يمكّنك من المساهمة في الأوقاف وتوجيه عوائدها بكل سهولة.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-border transition-all duration-700 ${
            reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="group relative pt-10 pb-12 px-2 md:px-6 md:border-l border-border last:border-l-0 border-b md:border-b-0"
            >
              <span className="font-display font-light text-6xl text-border group-hover:text-sand transition-colors duration-500 block mb-8">
                {["٠١", "٠٢", "٠٣", "٠٤"][i]}
              </span>
              <div className="text-accent mb-5">{step.icon}</div>
              <h3 className="font-display font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-muted text-sm leading-loose">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── WAQF TYPES SHOWCASE ────────────────────── */
const WAQF_TYPES = [
  {
    icon: <Building2 size={26} strokeWidth={1.5} />,
    title: "أوقاف عقارية",
    description: "مجمعات سكنية وتجارية ومكاتب. عوائد ثابتة ومستقرة من الإيجارات.",
    badge: "للسعوديين",
  },
  {
    icon: <Coins size={26} strokeWidth={1.5} />,
    title: "أوقاف نقدية",
    description: "محافظ مالية استثمارية. عوائد من الأرباح التشغيلية والمرابحات.",
    badge: "للجميع",
  },
  {
    icon: <HandHeart size={26} strokeWidth={1.5} />,
    title: "أوقاف زراعية",
    description: "مزارع نخيل وحبوب. عوائد موسمية من المحاصيل والإنتاج الزراعي.",
    badge: "للسعوديين",
  },
];

function WaqfTypes() {
  const reveal = useScrollReveal();

  return (
    <section className="py-24 md:py-36 bg-secondary">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="mb-16 md:mb-20 md:flex md:items-end md:justify-between">
          <div>
            <p className="eyebrow mb-6">أنواع الأوقاف</p>
            <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">
              تنوّع يناسب الجميع
            </h2>
          </div>
          <p className="text-muted max-w-sm leading-loose mt-6 md:mt-0">
            اختر نوع الوقف الذي يناسبك. الأوقاف العقارية والزراعية متاحة للمواطنين السعوديين فقط.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
            reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {WAQF_TYPES.map((type, i) => (
            <div
              key={i}
              className="group bg-card border border-border rounded-none p-10 hover:bg-foreground hover:text-background transition-colors duration-500 cursor-pointer relative"
            >
              <span className="absolute top-6 left-6 text-[11px] font-medium px-3 py-1 rounded-full border border-border text-muted group-hover:border-background/30 group-hover:text-background/70 transition-colors duration-500">
                {type.badge}
              </span>
              <div className="text-accent group-hover:text-sand transition-colors duration-500 mb-8">
                {type.icon}
              </div>
              <h3 className="font-display font-bold text-2xl mb-4">{type.title}</h3>
              <p className="text-muted text-sm leading-loose group-hover:text-background/60 transition-colors duration-500">
                {type.description}
              </p>
              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-accent group-hover:text-sand transition-colors duration-500">
                استكشف
                <ArrowLeft
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── TESTIMONIALS ───────────────────────── */
const TESTIMONIALS = [
  {
    name: "عبدالله المنصور",
    role: "واقف منذ ٢٠٢٤",
    text: "أسهل منصة وقف تعاملت معها. أقدر أوجّه عائد صكوكي لأي جهة خيرية وأغيرها وقت ما أبي.",
  },
  {
    name: "نورة السالم",
    role: "واقفة منذ ٢٠٢٥",
    text: "حبيت فكرة إن الأصل محفوظ ما ينباع. أحس إن أثري مستمر حتى بعدي. شكراً مشيد.",
  },
  {
    name: "محمد الحربي",
    role: "واقف منذ ٢٠٢٣",
    text: "الداشبورد واضح جداً. أشوف كم صك عندي وكم ريال اتوجّه للخير. شفافية ممتازة.",
  },
];

function Testimonials() {
  const reveal = useScrollReveal();

  return (
    <section className="py-24 md:py-36" id="impact">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16 md:mb-20">
          <p className="eyebrow mb-6">آراء الواقفين</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">
            ماذا يقول واقفونا
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border transition-all duration-700 ${
            reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {TESTIMONIALS.map((t, i) => (
            <figure key={i} className="bg-background p-10 flex flex-col">
              <Quote size={28} strokeWidth={1} className="text-sand mb-8" />
              <blockquote className="font-display text-lg leading-loose mb-10 flex-1">
                «{t.text}»
              </blockquote>
              <figcaption className="border-t border-border pt-6">
                <p className="font-bold text-sm">{t.name}</p>
                <p className="text-muted-light text-xs mt-1">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────── FAQ ────────────────────────────── */
const FAQS = [
  {
    q: "هل أقدر أسحب فلوسي بعد ما أوقفها؟",
    a: "لا. مبدأ الوقف في الشريعة أن الأصل محبوس لا يُباع ولا يُورث. لكن تقدر توجّه العائد (الأرباح) لأي مصرف خيري تختاره.",
  },
  {
    q: "هل المنصة متوافقة مع أحكام الشريعة؟",
    a: "نعم. جميع الأوقاف المعروضة متوافقة مع الضوابط الشرعية للوقف في المملكة العربية السعودية.",
  },
  {
    q: "أنا مقيم (أجنبي)، هل أقدر أساهم؟",
    a: "نعم، لكن فقط في الأوقاف النقدية. الأوقاف العقارية والزراعية والأراضي متاحة للمواطنين السعوديين فقط حسب الأنظمة.",
  },
  {
    q: "كيف أغيّر وجهة عائد صكوكي؟",
    a: "من خلال لوحة التحكم (محفظتي)، اضغط على «إدارة التوجيه» واختر المصرف الجديد (تعليم، صحة، أيتام، مساجد).",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const reveal = useScrollReveal();

  return (
    <section id="faq" className="py-24 md:py-36 bg-secondary">
      <div ref={reveal.ref} className="max-w-4xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <p className="eyebrow mb-6">الأسئلة الشائعة</p>
          <h2 className="font-display font-bold text-4xl md:text-6xl leading-tight">
            عندك سؤال؟
          </h2>
        </div>

        <div
          className={`border-t border-border transition-all duration-700 ${
            reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-border">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-6 py-7 text-right cursor-pointer group"
              >
                <span
                  className={`font-display font-bold text-lg md:text-2xl transition-colors duration-300 ${
                    openIdx === i ? "text-accent" : "group-hover:text-accent"
                  }`}
                >
                  {faq.q}
                </span>
                <Plus
                  size={20}
                  className={`shrink-0 text-muted transition-transform duration-300 ${
                    openIdx === i ? "rotate-45 text-accent" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-400 ${
                  openIdx === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="pb-8 pl-12 text-muted leading-loose">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── CTA BANNER ───────────────────────────── */
function CTABanner() {
  return (
    <section className="bg-foreground text-background">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-36 text-center">
        <p className="eyebrow mb-8 !text-sand before:!bg-sand after:!bg-sand">
          ابدأ اليوم
        </p>
        <h2 className="font-display font-black text-5xl md:text-7xl leading-tight mb-8">
          جاهز تبدأ <span className="text-sand">أثرك؟</span>
        </h2>
        <p className="text-background/60 text-lg mb-12 max-w-xl mx-auto leading-loose">
          انضم لأكثر من ١٠,٠٠٠ واقف على المنصة وابدأ رحلتك في بناء أثر يبقى بعدك.
        </p>
        <Link href="/auth/signup">
          <button className="group bg-sand text-foreground px-12 py-4 rounded-full text-lg font-bold hover:bg-sand-light transition-colors duration-300 cursor-pointer inline-flex items-center gap-3">
            سجّل الآن مجاناً
            <ArrowLeft
              size={18}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
          </button>
        </Link>
      </div>
    </section>
  );
}

/* ───────────────────── EXPORT ALL ───────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <HowItWorks />
      <WaqfTypes />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </>
  );
}
