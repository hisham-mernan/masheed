"use client";

import { useCountUp, useScrollReveal } from "@/lib/hooks";
import { Building2, Coins, HandHeart, Landmark, ArrowLeft, Shield, RefreshCw, Lock, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ──────────────────────────── HERO ──────────────────────────── */
function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-sand/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-8 animate-fade-in-up opacity-0">
          <Shield size={14} className="text-accent" />
          <span className="text-xs font-medium text-muted">منصة موثوقة · متوافقة مع أحكام الشريعة</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8 animate-fade-in-up opacity-0 delay-100">
          أثر يبقى،
          <br />
          <span className="text-gradient">وقطاف لا ينقطع.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up opacity-0 delay-200">
          منصة &quot;وقف مشيد&quot; تتيح لك شراء صكوك وقفية في أوقاف متنوعة.
          <br className="hidden md:block" />
          أصلك محفوظ لا يُباع، وريعه نوجّهه لمن تشاء من مستحقي الخير.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 delay-300">
          <Link href="/explore">
            <button className="bg-accent text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg shadow-accent/20 hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-2">
              ابدأ أثرك الآن
              <ArrowLeft size={18} />
            </button>
          </Link>
          <Link href="#how-it-works">
            <button className="bg-transparent text-foreground border-2 border-border px-10 py-4 rounded-full text-lg font-semibold hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer">
              كيف تعمل؟
            </button>
          </Link>
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
    <section className="bg-foreground text-background py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 text-center">
        <div ref={stat1.ref}>
          <p className="text-4xl md:text-5xl font-bold text-sand-light mb-2">+{stat1.count}</p>
          <p className="text-gray-400 text-sm">وقف عقاري ونقدي ومزارع</p>
        </div>
        <div ref={stat2.ref} className="border-y md:border-y-0 md:border-x border-gray-700 py-8 md:py-0">
          <p className="text-4xl md:text-5xl font-bold text-sand-light mb-2">{stat2.count} مليون</p>
          <p className="text-gray-400 text-sm">ريال عوائد موجّهة للخير</p>
        </div>
        <div ref={stat3.ref}>
          <p className="text-4xl md:text-5xl font-bold text-sand-light mb-2">+{stat3.count.toLocaleString("ar-SA")}</p>
          <p className="text-gray-400 text-sm">واقف مساهم على المنصة</p>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── HOW IT WORKS ──────────────────────────── */
const STEPS = [
  {
    icon: <Landmark size={28} />,
    title: "اختر وقفك",
    description: "تصفّح الأوقاف المتاحة وفلترها حسب النوع (عقاري، نقدي، مزارع) ومجال الأثر (تعليم، صحة، أيتام).",
  },
  {
    icon: <Coins size={28} />,
    title: "اشترِ صكوكاً",
    description: "ساهم بشراء حصص (صكوك وقفية) في الوقف. كل صك يمثّل حصة لا تُباع ولا تُسترد — وقف دائم.",
  },
  {
    icon: <RefreshCw size={28} />,
    title: "وجّه العوائد",
    description: "الريع (الأرباح) يمكنك توجيهها لأي مصرف خيري تشاء. غيّر وجهة العائد في أي وقت.",
  },
  {
    icon: <Lock size={28} />,
    title: "أصلك محفوظ",
    description: "مبدأ الوقف: أصل المال محبوس لا يُباع ولا يُورث. أثرك مستمر حتى بعدك.",
  },
];

function HowItWorks() {
  const reveal = useScrollReveal();

  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide mb-3 block">كيف تعمل المنصة</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">أربع خطوات نحو أثر دائم</h2>
          <p className="text-muted max-w-xl mx-auto">مسار بسيط وواضح يمكّنك من المساهمة في الأوقاف وتوجيه عوائدها بكل سهولة.</p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-8 border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                {step.icon}
              </div>
              <div className="text-accent font-bold text-xs mb-2">0{i + 1}</div>
              <h3 className="text-lg font-bold mb-3">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.description}</p>
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
    icon: <Building2 size={32} />,
    title: "أوقاف عقارية",
    description: "مجمعات سكنية وتجارية ومكاتب. عوائد ثابتة ومستقرة من الإيجارات.",
    badge: "للسعوديين",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <Coins size={32} />,
    title: "أوقاف نقدية",
    description: "محافظ مالية استثمارية. عوائد من الأرباح التشغيلية والمرابحات.",
    badge: "للجميع",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: <HandHeart size={32} />,
    title: "أوقاف زراعية",
    description: "مزارع نخيل وحبوب. عوائد موسمية من المحاصيل والإنتاج الزراعي.",
    badge: "للسعوديين",
    color: "bg-amber-50 text-amber-700",
  },
];

function WaqfTypes() {
  const reveal = useScrollReveal();

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide mb-3 block">أنواع الأوقاف</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">تنوّع يناسب الجميع</h2>
          <p className="text-muted max-w-xl mx-auto">اختر نوع الوقف الذي يناسبك. ملاحظة: الأوقاف العقارية والزراعية متاحة للمواطنين السعوديين فقط.</p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {WAQF_TYPES.map((type, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-8 border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${type.color}`}>
                  {type.badge}
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {type.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{type.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{type.description}</p>
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
    avatar: "ع",
  },
  {
    name: "نورة السالم",
    role: "واقفة منذ ٢٠٢٥",
    text: "حبيت فكرة إن الأصل محفوظ ما ينباع. أحس إن أثري مستمر حتى بعدي. شكراً مشيد.",
    avatar: "ن",
  },
  {
    name: "محمد الحربي",
    role: "واقف منذ ٢٠٢٣",
    text: "الداشبورد واضح جداً. أشوف كم صك عندي وكم ريال اتوجّه للخير. شفافية ممتازة.",
    avatar: "م",
  },
];

function Testimonials() {
  const reveal = useScrollReveal();

  return (
    <section className="py-20 md:py-28" id="impact">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide mb-3 block">آراء الواقفين</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">ماذا يقول واقفونا</h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold text-lg">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-muted text-xs">{t.role}</p>
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed">&quot;{t.text}&quot;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── FEATURED OPPORTUNITIES ─────────────────── */
const MOCK_OPPORTUNITIES = [
  {
    id: "1",
    title: "وقف إحسان السكني",
    description: "مجمع سكني يعود ريعه للأيتام والأرامل في الرياض. يضم ١٢ وحدة سكنية مؤجرة بعقود طويلة الأجل.",
    type: "عقاري",
    availableTokens: 450,
    tokenPrice: 500,
    yieldRate: 8.5,
  },
  {
    id: "2",
    title: "الصندوق الوقفي الصحي",
    description: "محفظة مالية نقدية تخصص أرباحها لعلاج المرضى المحتاجين في المستشفيات الحكومية.",
    type: "نقدي",
    availableTokens: 3200,
    tokenPrice: 100,
    yieldRate: 6.2,
  },
  {
    id: "3",
    title: "وقف النخيل",
    description: "مزرعة نخيل عضوية في القصيم يعود ريعها لدعم الحلقات القرآنية وبناء المساجد.",
    type: "زراعي",
    availableTokens: 15,
    tokenPrice: 2000,
    yieldRate: 7.8,
  }
];

function FeaturedOpportunities() {
  const reveal = useScrollReveal();

  return (
    <section id="opportunities" className="py-20 md:py-28 bg-background">
      <div ref={reveal.ref} className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide mb-3 block">الفرص الوقفية المتاحة</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">أوقاف متميزة تبحث عن واقفين</h2>
          <p className="text-muted max-w-xl mx-auto">تصفح الفرص الوقفية الأكثر جاهزية للمساهمة وابدأ رحلتك في الاستثمار المستدام.</p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-700 ${reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {MOCK_OPPORTUNITIES.map((opp) => (
            <div
              key={opp.id}
              className="bg-card rounded-2xl p-8 border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
                    {opp.type}
                  </span>
                  <span className="text-emerald-600 text-xs font-bold">
                    عائد {opp.yieldRate}%
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{opp.title}</h3>
                <p className="text-muted text-sm leading-relaxed mb-6">{opp.description}</p>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <div className="flex justify-between text-xs mb-4 text-muted">
                  <span>سعر الصك: <strong>{opp.tokenPrice} ر.س</strong></span>
                  <span>الصكوك المتاحة: <strong>{opp.availableTokens}</strong></span>
                </div>
                <Link href={`/explore/${opp.id}`}>
                  <button className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent-dark transition-all duration-200 cursor-pointer text-center">
                    تفاصيل الوقف والمساهمة
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────── FAQ ────────────────────────────── */
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
    a: "من خلال لوحة التحكم (محفظتي)، اضغط على 'إدارة التوجيه' واختر المصرف الجديد (تعليم، صحة، أيتام، مساجد).",
  },
];

function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const reveal = useScrollReveal();

  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary">
      <div ref={reveal.ref} className="max-w-3xl mx-auto px-6 md:px-10">
        <div className="text-center mb-16">
          <span className="text-accent text-sm font-semibold tracking-wide mb-3 block">الأسئلة الشائعة</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">عندك سؤال؟</h2>
        </div>

        <div className={`space-y-4 transition-all duration-700 ${reveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-right cursor-pointer hover:bg-secondary/50 transition-colors"
              >
                <span className="font-semibold text-sm md:text-base">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-muted shrink-0 mr-4 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIdx === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-6 text-muted text-sm leading-relaxed">{faq.a}</p>
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
    <section className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 md:px-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          جاهز تبدأ أثرك؟
        </h2>
        <p className="text-muted text-lg mb-10 max-w-xl mx-auto">
          انضم لأكثر من ١٠,٠٠٠ واقف على المنصة وابدأ رحلتك في بناء أثر يبقى بعدك.
        </p>
        <Link href="/auth/signup">
          <button className="bg-accent text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg shadow-accent/20 hover:bg-accent-dark transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
            سجّل الآن مجاناً
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
      <FeaturedOpportunities />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </>
  );
}
