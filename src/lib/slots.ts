// Free consultation slots from weekly availability rules. Riyadh is UTC+3 all year (no DST).
const RIYADH_OFFSET = 3 * 3600_000;

export type Rule = { weekday: number; start_time: string; end_time: string };
export type DaySlots = { date: string; slots: string[] };   // date = YYYY-MM-DD (Riyadh), slots = ISO instants

const minutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export function freeSlots(rules: Rule[], busy: string[], slotMinutes: number, days = 21, leadMs = 3600_000): DaySlots[] {
  const taken = new Set(busy.map((b) => new Date(b).getTime()));
  const now = Date.now();
  const todayLocal = new Date(now + RIYADH_OFFSET);
  const out: DaySlots[] = [];
  for (let d = 0; d < days; d++) {
    const day = new Date(Date.UTC(todayLocal.getUTCFullYear(), todayLocal.getUTCMonth(), todayLocal.getUTCDate() + d));
    const slots: string[] = [];
    for (const r of rules.filter((x) => x.weekday === day.getUTCDay())) {
      for (let m = minutes(r.start_time); m + slotMinutes <= minutes(r.end_time); m += slotMinutes) {
        if (m % slotMinutes) continue;
        const t = day.getTime() + m * 60_000 - RIYADH_OFFSET;
        if (t >= now + leadMs && !taken.has(t)) slots.push(new Date(t).toISOString());
      }
    }
    slots.sort();
    out.push({ date: day.toISOString().slice(0, 10), slots: [...new Set(slots)] });
  }
  return out;
}
