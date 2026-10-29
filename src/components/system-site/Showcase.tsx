"use client";

// Working fragments of the product for the System website. Each root carries data-ui:
// inside it the product's own interface conventions apply (control borders, small radii).
import Link from "next/link";
import { useMemo, useState } from "react";
import Icon, { type IconName } from "./Icon";
import { fmt, type Plan, type Service } from "./data";

/* ---------- hero: approve a distribution, watch the ledger and the audit log change ---------- */

const RIA = 1109000;
const BASE_DIST = 640000;
type Req = { id: string; title: string; meta: string; amount: number; by: string };
const REQS: Req[] = [
  { id: "r1", title: "توزيع ريع على المستفيدين", meta: "٤٨ مستفيداً · أنشأته نورة القحطاني", amount: 120000, by: "نورة القحطاني" },
  { id: "r2", title: "صرف المحافظ (تحويل بنكي)", meta: "صيانة عمارة الريان · أنشأه خالد العتيبي", amount: 48500, by: "خالد العتيبي" },
];
const LOG0: [string, string, string][] = [
  ["نورة القحطاني", "أنشأت طلب توزيع ريع بقيمة 120,000 ر.س", "اليوم 10:42"],
  ["خالد العتيبي", "أنشأ طلب صرف لصيانة عمارة الريان", "اليوم 09:15"],
  ["فيصل المطيري", "أضاف عقد إيجار · برج النخيل التجاري", "أمس"],
];

export function LiveApprovals() {
  const [done, setDone] = useState<Record<string, "ok" | "no">>({});
  const [log, setLog] = useState<{ who: string; what: string; at: string; isNew?: boolean }[]>([]);
  const dist = BASE_DIST + REQS.reduce((s, r) => s + (done[r.id] === "ok" ? r.amount : 0), 0);
  const waiting = REQS.filter((r) => !done[r.id]).length;
  const act = (r: Req, v: "ok" | "no") => {
    setDone((d) => ({ ...d, [r.id]: v }));
    setLog((l) => [{ who: "فيصل المطيري", what: `${v === "ok" ? "اعتمد" : "رفض"} ${r.title} (${fmt(r.amount)} ر.س)`, at: "الآن", isNew: true }, ...l.map((x) => ({ ...x, isNew: false }))]);
  };
  const reset = () => { setDone({}); setLog([]); };
  const kpis: [string, string, string, string, string][] = [
    ["إجمالي قيمة الأصول", "24,500,000", "ر.س", "#8561AD", "+3.2% مقارنة بالربع السابق"],
    ["ريع الأوقاف", fmt(RIA), "ر.س", "#A97E2F", "منذ بداية العام"],
    ["المصارف الموزعة", fmt(dist), "ر.س", "#0F0F14", `${((dist / RIA) * 100).toFixed(1)}% من الريع المحصّل`],
    ["بانتظار الاعتماد", String(waiting), waiting === 1 ? "طلب" : "طلبات", "#C9CCD6", waiting ? "يعتمدها الناظر أو من يفوّضه" : "لا طلبات معلّقة"],
  ];

  return (
    <div className="wb-live" data-ui role="group" aria-label="معاينة تفاعلية من نظام مَشيد: مركز الاعتمادات">
      <div className="wb-live__bar">
        <span><b>وقف الملك عبدالعزيز الخيري</b> · فيصل المطيري، الناظر</span>
        {log.length > 0 && <button type="button" className="wb-reset" onClick={reset}>إعادة المعاينة</button>}
      </div>
      {kpis.map(([l, v, u, c, e], i) => (
        <div key={l} className={"wb-kpi" + (i === 2 && dist !== BASE_DIST ? " is-bumped" : "")} style={{ ["--c" as string]: c }}>
          <span>{l}</span>
          <b><span className="wb-num">{v}</span><small>{u}</small></b>
          <em>{e}</em>
        </div>
      ))}
      <div className="wb-card-ui wb-appr">
        <div className="wb-card-ui__h"><b>بانتظار اعتمادك</b><span>{waiting} من {REQS.length}</span></div>
        {REQS.map((r) => (
          <div key={r.id} className={"wb-req" + (done[r.id] ? " is-done" : "")}>
            <div><b>{r.title}</b><small>{r.meta}</small></div>
            <div className="wb-req__amt"><span className="wb-num">{fmt(r.amount)}</span> <small>ر.س</small></div>
            <div className="wb-req__act" aria-live="polite">
              {done[r.id] ? (
                <span className={"wb-badge " + (done[r.id] === "ok" ? "wb-badge--ok" : "wb-badge--no")}>{done[r.id] === "ok" ? "معتمد" : "مرفوض"}</span>
              ) : (
                <>
                  <button type="button" className="is-pri" onClick={() => act(r, "ok")}>اعتماد</button>
                  <button type="button" onClick={() => act(r, "no")}>رفض</button>
                </>
              )}
            </div>
          </div>
        ))}
        <p className="wb-appr__rule">من ينشئ الطلب لا يعتمده، وكل قرار يُسجَّل في سجل الأحداث.</p>
      </div>
      <div className="wb-card-ui wb-log">
        <div className="wb-card-ui__h"><b>سجل الأحداث</b><span>لا يمكن تعديله</span></div>
        <ol aria-live="polite">
          {[...log, ...LOG0.map(([who, what, at]) => ({ who, what, at, isNew: false }))].slice(0, 4).map((x, i) => (
            <li key={x.what + i} className={x.isNew ? "is-new" : undefined}>
              <b>{x.who}</b><time>{x.at}</time><span>{x.what}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ---------- features: the modules as the product's command menu ---------- */

export function CommandList({ mods }: { mods: [IconName, string, string][] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(mods[0]?.[1] ?? "");
  const list = useMemo(() => mods.filter(([, t, d]) => !q.trim() || t.includes(q.trim()) || d.includes(q.trim())), [mods, q]);
  const current = list.some(([, t]) => t === sel) ? sel : list[0]?.[1];
  const move = (dir: number) => {
    const i = list.findIndex(([, t]) => t === current);
    const n = list[Math.min(list.length - 1, Math.max(0, i + dir))];
    if (n) setSel(n[1]);
  };
  return (
    <div className="wb-cmd" data-ui>
      <label className="wb-cmd__search rv">
        <Icon n="search" s={26} />
        <span className="wb-vh">ابحث في وحدات النظام</span>
        <input type="search" value={q} placeholder="ابحث في وحدات النظام" onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); move(1); } if (e.key === "ArrowUp") { e.preventDefault(); move(-1); } }} />
      </label>
      <ul className="wb-cmd__list">
        {list.map(([, t, d], i) => (
          <li key={t} className="rv" style={{ ["--i" as string]: i }}>
            <button type="button" aria-pressed={t === current} onClick={() => setSel(t)} onMouseEnter={() => setSel(t)} onFocus={() => setSel(t)}>
              <b>{t}</b><span>{d}</span>
            </button>
          </li>
        ))}
      </ul>
      {!list.length && <p className="wb-cmd__empty">لا توجد وحدة بهذا الاسم. جرّب «الأصول» أو «العقود».</p>}
    </div>
  );
}

/* ---------- services: an index of names and the selected service as its quotation sheet ---------- */

const CTA = { request: "اطلب الخدمة", direct: "اشترك في الخدمة", booking: "احجز جلسة" };

export function ServiceIndex({ services }: { services: Service[] }) {
  const [id, setId] = useState(services[0]?.id);
  const s = services.find((x) => x.id === id) ?? services[0];
  if (!s) return null;
  const price = s.priceLabel.replace(/^السعر:\s*/, "");
  return (
    <div className="wb-out">
      <div className="wb-out__idx">
        <ul className="wb-out__names">
          {services.map((x, i) => (
            <li key={x.id} className="rv" style={{ ["--i" as string]: i }}>
              <Link href={"/services/" + x.id} className={x.id === s.id ? "is-on" : undefined} onMouseEnter={() => setId(x.id)} onFocus={() => setId(x.id)}>{x.title}</Link>
            </li>
          ))}
        </ul>
        <div className="wb-out__links rv">
          <Link className="wb-btn wb-btn--pri" href={"/services/" + s.id}>{CTA[s.type]}: {s.title}</Link>
          <Link className="wb-link" href="/services">عرض كل الخدمات<Icon n="arrow" s={18} /></Link>
        </div>
      </div>
      <div className="wb-out__stage rv" style={{ ["--i" as string]: 1 }}>
        <article key={s.id} className="wb-sheet" data-ui aria-live="polite">
          <div className="wb-sheet__top">
            <img src="/brand/masheed-mark.svg" alt="مَشيد" />
            <span>{s.type === "request" ? "طلب عرض سعر" : "خدمة بسعر ثابت"}<br />نظام مَشيد · الخدمات المهنية</span>
          </div>
          <h3>{s.title}</h3>
          <p className="wb-sheet__sub">{s.subtitle}</p>
          <table>
            <thead><tr><th scope="col">ما تشمله الخدمة</th><th scope="col">الحالة</th></tr></thead>
            <tbody>{s.includes.map((x) => <tr key={x}><td>{x}</td><td>مشمول</td></tr>)}</tbody>
          </table>
          <div className="wb-sheet__total"><span>السعر</span><b>{price}</b></div>
          <p className="wb-sheet__foot">{s.type === "request" ? "يصلك العرض في حسابك على المنصة، ولا يلزمك الدفع إلا إذا وافقت عليه." : "السعر شامل ضريبة القيمة المضافة، والدفع إلكتروني من داخل المنصة."}</p>
        </article>
      </div>
    </div>
  );
}

/* ---------- plans: names on one side, the selected plan's figure on the other ---------- */

export function PlanIndex({ plans }: { plans: Plan[] }) {
  const start = plans.find((p) => p.best)?.id ?? plans[Math.floor(plans.length / 2)]?.id;
  const [sel, setSel] = useState(start);
  return (
    <div className="wb-plans">
      {plans.map((p, i) => (
        <PlanPair key={p.id} p={p} i={i} open={p.id === sel} onOpen={() => setSel(p.id)} />
      ))}
    </div>
  );
}

function PlanPair({ p, i, open, onOpen }: { p: Plan; i: number; open: boolean; onOpen: () => void }) {
  return (
    <>
      <button type="button" className="wb-plans__name rv" style={{ ["--i" as string]: i, ["--r" as string]: i + 1 }} aria-expanded={open} aria-controls={"plan-" + p.id} onClick={onOpen} onFocus={onOpen}>
        {p.name}<small>{p.users}{p.best ? " · الأكثر اختياراً" : ""}</small>
      </button>
      <div id={"plan-" + p.id} className="wb-plans__stage" hidden={!open} role="region" aria-label={"الباقة " + p.name}>
        <div className="wb-plans__price"><b className="wb-num">{fmt(p.price)}</b><span>ر.س سنوياً، شاملة الضريبة</span></div>
        <ul>{p.feats.map((f) => <li key={f}>{f}</li>)}</ul>
        <div><Link className="wb-btn wb-btn--pri wb-btn--lg" href={"/register?plan=" + p.id}>ابدأ تجربة مجانية: {p.name}</Link></div>
      </div>
    </>
  );
}

/* ---------- close: the create dialog, carried into sign-up ---------- */

export function StartDialog({ plans }: { plans: Plan[] }) {
  const first = plans.find((p) => p.best)?.id ?? plans[0]?.id;
  return (
    <form className="wb-dialog" data-ui action="/register" method="get">
      <h3>أنشئ حساب جهتك</h3>
      <label>
        اسم الجهة أو الوقف
        <input type="text" name="name" defaultValue="وقف الهداية الخيري" maxLength={120} />
      </label>
      <fieldset>
        <legend>الباقة التي تهمك</legend>
        <div className="wb-seg">
          {plans.map((p) => (
            <label key={p.id}><input type="radio" name="plan" value={p.id} defaultChecked={p.id === first} /><span>{p.name}</span></label>
          ))}
        </div>
      </fieldset>
      <button type="submit">ابدأ التجربة المجانية</button>
      <small>تجربة مجانية لمدة 15 يوماً بمزايا الباقة الأساسية.</small>
    </form>
  );
}
