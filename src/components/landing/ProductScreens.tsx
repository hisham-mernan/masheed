// Static, non-interactive previews of the two products, rendered at 1440×900 and
// scaled down by the parent (see .mw-screen in masheed-site.css).
// Content mirrors the Masheed Design System's ui_kits/masheed-system demo screens.

const MONTHS = ["مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"];
const RIA = [142000, 168000, 151000, 196000, 214000, 238000];
const DIST = [90000, 104000, 98000, 118000, 126000, 140000];

const ASSETS = [
  { id: "a3f9c2e1", name: "عمارة الريان السكنية", cat: "عقاري", loc: "جدة — حي الروضة", v: 4200000, ria: 312000, s: "مؤجر" },
  { id: "7bc14d90", name: "برج النخيل التجاري", cat: "عقاري", loc: "الرياض — طريق الملك فهد", v: 12800000, ria: 596000, s: "نشط" },
  { id: "e51a0b33", name: "مزرعة الخرج", cat: "زراعي", loc: "الخرج", v: 1150000, ria: 41000, s: "صيانة" },
  { id: "c02f8e17", name: "محفظة صكوك مرابحة", cat: "مالي", loc: "حساب استثماري 4402", v: 5300000, ria: 160000, s: "نشط" },
  { id: "9d6e2a48", name: "محلات سوق البلد", cat: "عقاري", loc: "جدة — البلد", v: 1050000, ria: 0, s: "شاغر" },
];
const TONE: Record<string, string> = { "مؤجر": "success", "نشط": "info", "صيانة": "warning", "شاغر": "danger" };
const fmt = (n: number) => n.toLocaleString("en-US");

const NAV = ["نظرة عامة", "الأوقاف", "الأصول", "المستفيدون", "المالية", "العقود", "الاعتمادات", "الحوكمة", "التقارير"];

function IncomeChart() {
  const W = 640, H = 200, T = 10, B = 10, max = 260000;
  const y = (v: number) => T + (1 - v / max) * (H - T - B);
  const x = (i: number) => 8 + (i * (W - 16)) / (RIA.length - 1);
  const line = (s: number[]) => s.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ");
  const area = line(RIA) + " L" + x(5) + "," + (H - B) + " L" + x(0) + "," + (H - B) + " Z";
  return (
    <>
      <div className="mw-scr-legend">
        <span style={{ ["--c" as string]: "#A97E2F" }}>الريع المحصّل</span>
        <span style={{ ["--c" as string]: "#8561AD" }}>المصارف الموزعة</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 200, display: "block" }}>
        <defs>
          <linearGradient id="mwRia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A97E2F" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#A97E2F" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 65000, 130000, 195000, 260000].map((t) => (
          <line key={t} x1="0" x2={W} y1={y(t)} y2={y(t)} stroke={t === 0 ? "#E6E7EC" : "#F2F3F5"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill="url(#mwRia)" />
        <path d={line(DIST)} fill="none" stroke="#8561AD" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <path d={line(RIA)} fill="none" stroke="#A97E2F" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, color: "var(--color-ink-4)", direction: "ltr" }}>
        {MONTHS.map((m) => <span key={m}>{m}</span>)}
      </div>
    </>
  );
}

function Overview() {
  return (
    <>
      <div className="mw-scr-head">
        <div>
          <h5>صباح الخير، فيصل</h5>
          <p>ملخص أداء وقف الملك عبدالعزيز الخيري · الأحد ٢٥ أكتوبر ٢٠٢٦</p>
        </div>
        <span className="mw-scr-btn">تصدير التقرير</span>
      </div>
      <div className="mw-scr-row" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        {[
          ["إجمالي قيمة الأصول", "24,500,000", "ر.س", "#8561AD", "+3.2%", "مقارنة بالربع السابق"],
          ["ريع الأوقاف", "1,109,000", "ر.س", "#A97E2F", "+8.4%", "منذ بداية العام"],
          ["المصارف الموزعة", "640,000", "ر.س", "#0F0F14", "", "57.7% من الريع المحصّل"],
          ["الأصول المسجلة", "12", "أصلاً", "#C9CCD6", "", "٣ أصول تحت الصيانة"],
        ].map(([label, value, suffix, c, delta, caption]) => (
          <div key={label} className="mw-scr-card mw-scr-stat" style={{ ["--c" as string]: c }}>
            <span>{label}</span>
            <b className="mw-num">{value}<small>{suffix}</small></b>
            <em>{delta && <b className="mw-num">{delta} </b>}{caption}</em>
          </div>
        ))}
      </div>
      <div className="mw-scr-row" style={{ gridTemplateColumns: "minmax(0,1.7fr) minmax(0,1fr)" }}>
        <div className="mw-scr-card">
          <h6>الريع والمصارف</h6>
          <small>القيم الشهرية الفعلية من دفتر الأستاذ</small>
          <IncomeChart />
        </div>
        <div className="mw-scr-card mw-scr-card--flush">
          <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid var(--color-row-line)" }}><h6>بانتظار اعتمادك</h6></div>
          <div className="mw-scr-list">
            {[
              ["توزيع ريع على المستفيدين", "٤٨ مستفيداً · أنشأته نورة القحطاني", "120,000"],
              ["صرف المحافظ (تحويل بنكي)", "صيانة عمارة الريان · أنشأه خالد العتيبي", "48,500"],
            ].map(([t, s, a]) => (
              <div key={t}>
                <div><b>{t}</b><small>{s}</small></div>
                <div style={{ whiteSpace: "nowrap" }}><b className="mw-num" style={{ display: "inline" }}>{a}</b> <small>ر.س</small></div>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, padding: "12px 20px", fontSize: 12.5, color: "var(--color-ink-4)" }}>من ينشئ الطلب لا يعتمدُه — كل قرار يُسجَّل في سجل الأحداث.</p>
          <div style={{ padding: "0 20px 16px" }}><span className="mw-scr-btn mw-scr-btn--p" style={{ width: "100%", justifyContent: "center" }}>فتح مركز الاعتمادات</span></div>
        </div>
      </div>
      <div className="mw-scr-row" style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div className="mw-scr-card">
          <h6>مهام الصيانة</h6>
          {[["تسرب مياه — عمارة الريان", "اليوم", "danger"], ["صيانة المصاعد — برج النخيل", "٢٨ أكتوبر", "info"], ["فحص دوري — مزرعة الخرج", "٢ نوفمبر", "success"]].map(([t, d, tone]) => (
            <div key={t} className="mw-scr-check"><span>{t}</span><span className={`mw-scr-badge mw-scr-badge--${tone}`}>{d}</span></div>
          ))}
        </div>
        <div className="mw-scr-card">
          <h6>آخر العمليات</h6>
          {[["فيصل المطيري", "إضافة · المالية", "اليوم"], ["نورة القحطاني", "تعديل · الأصول", "أمس"], ["خالد العتيبي", "حذف · المستندات", "٢٢ أكتوبر"]].map(([a, v, t]) => (
            <div key={a} className="mw-scr-check"><span><b style={{ display: "inline" }}>{a}</b> — {v}</span><small>{t}</small></div>
          ))}
        </div>
        <div className="mw-scr-card">
          <h6>الرقابة والامتثال</h6>
          {[["سجل المراجعة", "مفعّل", true], ["صلاحيات المستخدمين", "حسب الدور", true], ["عزل بيانات الأوقاف", "مفعّل", true], ["الربط مع ZATCA", "بانتظار التفعيل", false]].map(([l, s, ok]) => (
            <div key={l as string} className={`mw-scr-check${ok ? "" : " is-off"}`}><span>{l}</span><span>{s}</span></div>
          ))}
        </div>
      </div>
    </>
  );
}

function AssetsRegistry() {
  const total = ASSETS.reduce((s, a) => s + a.v, 0);
  return (
    <>
      <div className="mw-scr-head">
        <div>
          <h5>سجل الأصول</h5>
          <p>جميع العقارات والأصول الوقفية المسجلة، بقيمها التقديرية وريعها السنوي.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <span className="mw-scr-btn">تصدير</span>
          <span className="mw-scr-btn mw-scr-btn--p">إضافة أصل</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="mw-scr-top__search" style={{ width: 420, background: "#fff" }}>بحث بالمعرّف أو الاسم أو الموقع</span>
        <span className="mw-scr-btn">الكل</span>
        <span style={{ marginInlineStart: "auto", fontSize: 13, color: "var(--color-ink-3)" }}>
          <b className="mw-num" style={{ color: "var(--color-ink)" }}>{ASSETS.length}</b> أصول · <b className="mw-num" style={{ color: "var(--color-ink)" }}>{fmt(total)}</b> ر.س
        </span>
      </div>
      <div className="mw-scr-card mw-scr-card--flush" style={{ overflow: "hidden" }}>
        <table className="mw-scr-table">
          <thead>
            <tr><th>الأصل</th><th>المعرّف</th><th>التصنيف</th><th>الحالة</th><th>الريع السنوي (ر.س)</th><th>التقييم (ر.س)</th></tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.id}>
                <td><b>{a.name}</b><small style={{ color: "var(--color-ink-4)" }}>{a.loc}</small></td>
                <td><span className="mw-scr-code">{a.id}</span></td>
                <td>{a.cat}</td>
                <td><span className={`mw-scr-badge mw-scr-badge--${TONE[a.s]}`}>{a.s}</span></td>
                <td className="mw-num" style={{ color: "var(--color-gold-ink)", fontWeight: 700 }}>{a.ria ? fmt(a.ria) : "—"}</td>
                <td className="mw-num" style={{ color: "var(--color-ink)", fontWeight: 700 }}>{fmt(a.v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function SystemScreen({ view, style }: { view: "dashboard" | "assets"; style?: React.CSSProperties }) {
  return (
    <div className="mw-screen mw-scr-sys" style={style} aria-hidden="true">
      <aside className="mw-scr-side">
        <div className="mw-scr-side__brand"><img src="/brand/masheed-mark.svg" alt="" />نظام مَشيد</div>
        <div className="mw-scr-side__waqf"><small>الوقف الحالي</small>وقف الملك عبدالعزيز الخيري</div>
        {NAV.map((n, i) => {
          const on = view === "dashboard" ? i === 0 : i === 2;
          return <div key={n} className={`mw-scr-side__item${on ? " is-on" : ""}`}><i />{n}</div>;
        })}
      </aside>
      <div className="mw-scr-main">
        <div className="mw-scr-top">
          <span className="mw-scr-top__search">ابحث في الأصول والعقود والمستفيدين…</span>
          <span className="mw-scr-top__me"><i>ف</i>فيصل المطيري</span>
        </div>
        <div className="mw-scr-body">{view === "dashboard" ? <Overview /> : <AssetsRegistry />}</div>
      </div>
    </div>
  );
}

const OPPS = [
  { tag: "عقاري · الرياض", name: "مجمع سكني وقفي — حي النرجس", ret: "8.2%", min: "5,000", term: "٧ سنوات", p: "72%", g: "linear-gradient(135deg,#3F4D35,#596B4B 60%,#8A9C7A)" },
  { tag: "تجاري · جدة", name: "مركز تجاري — طريق المدينة", ret: "9.1%", min: "10,000", term: "٥ سنوات", p: "45%", g: "linear-gradient(135deg,#2B3326,#46553B 55%,#B7C4A6)" },
  { tag: "زراعي · القصيم", name: "مزارع نخيل وقفية مستدامة", ret: "7.4%", min: "2,500", term: "١٠ سنوات", p: "88%", g: "linear-gradient(135deg,#46553B,#7A9167 60%,#C9A876)" },
];

export function WaqfScreen({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="mw-screen mw-scr-waqf" style={style} aria-hidden="true">
      <div className="mw-scr-waqf__top">
        <b><img src="/brand/masheed-mark-waqf.svg" alt="" />وقف مَشيد</b>
        <span>الفرص</span><span>محفظتي</span><span>التقارير</span>
        <em>إدراج فرصة</em>
      </div>
      <div className="mw-scr-waqf__body">
        <div className="mw-scr-waqf__head">
          <h5>فرصٌ وقفيةٌ مؤهّلة</h5>
          <p>كل فرصة مرّت بمراجعة البيانات المالية والتقييمات المستقلة والمخاطر والحوكمة.</p>
        </div>
        <div className="mw-scr-waqf__filters"><span className="is-on">الكل</span><span>عقاري</span><span>تجاري</span><span>زراعي</span><span>مالي</span></div>
        <div className="mw-scr-waqf__grid">
          {OPPS.map((o) => (
            <div key={o.name} className="mw-scr-opp">
              <div className="mw-scr-opp__img" style={{ ["--g" as string]: o.g }} />
              <div className="mw-scr-opp__in">
                <small>{o.tag}</small>
                <b>{o.name}</b>
                <div className="mw-scr-opp__kpis">
                  <span>العائد المتوقع<b className="mw-num is-gold">{o.ret}</b></span>
                  <span>الحد الأدنى (ر.س)<b className="mw-num">{o.min}</b></span>
                  <span>المدة<b>{o.term}</b></span>
                </div>
                <div className="mw-scr-opp__bar" style={{ ["--p" as string]: o.p }}><i /></div>
                <span>اكتمال التمويل <b className="mw-num">{o.p}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
