import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getWaqfScope, scopeQuery } from "@/lib/waqf-scope";
import styles from "../assets/assets.module.css";

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

type Event = { date: Date; title: string; kind: string; color: string; href: string };

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("is_platform_admin").eq("id", user?.id).single();
  const scope = profile?.is_platform_admin ? await getWaqfScope() : null;

  const [{ data: tasks }, { data: contracts }, { data: meetings }, { data: distributions }] = await Promise.all([
    scopeQuery(supabase.from("maintenance_tasks").select("id, title, due_date, status").eq("status", "open"), scope),
    scopeQuery(supabase.from("contracts").select("id, counterparty, end_date, status").eq("status", "active"), scope),
    scopeQuery(supabase.from("meetings").select("id, title, meeting_date, status").neq("status", "documented"), scope),
    scopeQuery(supabase.from("distributions").select("id, total_amount, distribution_date"), scope),
  ]);

  const events: Event[] = [
    ...(tasks || []).filter(t => t.due_date).map(t => ({ date: new Date(t.due_date), title: `مهمة: ${t.title}`, kind: "صيانة", color: "#F59E0B", href: "/dashboard/tasks" })),
    ...(contracts || []).filter(c => c.end_date).map(c => ({ date: new Date(c.end_date), title: `انتهاء عقد: ${c.counterparty}`, kind: "عقود", color: "#3B82F6", href: "/dashboard/contracts" })),
    ...(meetings || []).map(m => ({ date: new Date(m.meeting_date), title: `اجتماع: ${m.title}`, kind: "حوكمة", color: "#8561AD", href: "/dashboard/meetings" })),
    ...(distributions || []).map(d => ({ date: new Date(d.distribution_date), title: `توزيعة بمبلغ ${Number(d.total_amount).toLocaleString()} ر.س`, kind: "توزيعات", color: "#10B981", href: "/dashboard/finance/distributions" })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const now = new Date(); now.setHours(0, 0, 0, 0);
  const upcoming = events.filter(e => e.date >= now);
  const past = events.filter(e => e.date < now).reverse();

  // تجميع حسب الشهر
  function groupByMonth(list: Event[]) {
    const map = new Map<string, Event[]>();
    list.forEach(e => {
      const key = `${MONTHS_AR[e.date.getMonth()]} ${e.date.getFullYear()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return [...map.entries()];
  }

  const EventRow = ({ e }: { e: Event }) => (
    <Link href={e.href} style={{ display: "flex", alignItems: "center", gap: "0.9rem", padding: "0.7rem 0.9rem", borderRadius: "8px", textDecoration: "none", color: "inherit", background: "#F8FAFC", border: "1px solid #E2E8F0", marginBottom: "0.5rem" }}>
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: e.color, flexShrink: 0 }} />
      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: e.color, width: 60, flexShrink: 0 }}>{e.kind}</span>
      <span style={{ flex: 1, fontSize: "0.88rem" }}>{e.title}</span>
      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>{e.date.toLocaleDateString("ar-SA")}</span>
    </Link>
  );

  return (
    <div className="fade-in">
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <h1>التقويم التشغيلي</h1>
          <p>كل المواعيد الحيوية: مهام الصيانة، انتهاء العقود، الاجتماعات، والتوزيعات.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.25rem", marginTop: "1rem", fontSize: "0.8rem", flexWrap: "wrap" }}>
        {[["صيانة", "#F59E0B"], ["عقود", "#3B82F6"], ["حوكمة", "#8561AD"], ["توزيعات", "#10B981"]].map(([k, c]) => (
          <span key={k} style={{ color: "var(--text-muted)" }}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: c, marginLeft: 5 }} />{k}</span>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#8561AD", marginBottom: "1rem" }}>📅 القادم ({upcoming.length})</h3>
        {groupByMonth(upcoming).map(([month, list]) => (
          <div key={month} style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{month}</div>
            {list.map((e, i) => <EventRow key={i} e={e} />)}
          </div>
        ))}
        {upcoming.length === 0 && <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>لا مواعيد قادمة — كل شيء تحت السيطرة ✓</p>}
      </div>

      {past.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem", marginTop: "1.5rem", opacity: 0.75 }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "1rem" }}>🕘 السابقة ({past.length})</h3>
          {groupByMonth(past).slice(0, 3).map(([month, list]) => (
            <div key={month} style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{month}</div>
              {list.map((e, i) => <EventRow key={i} e={e} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
