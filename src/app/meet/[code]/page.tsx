import type { Metadata } from "next";
import MeetingRoom from "@/components/platform/MeetingRoom";
import { getMeeting } from "@/lib/meeting-actions";
import { dateAr } from "@/lib/account";
import s from "@/components/platform/platform.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "جلسة استشارية | مَشيد", robots: { index: false, follow: false } };

// Shareable meeting link: no account needed, guests type their name and join
export default async function MeetPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const m = await getMeeting(code);

  return (
    <div dir="rtl" lang="ar" style={{ minHeight: "100dvh", background: "var(--color-background)", padding: "1.5rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <header style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/brand/masheed-mark.svg" alt="" width={36} height={36} />
          <div>
            <b style={{ display: "block" }}>جلسة استشارية — مَشيد</b>
            {m && <span className={s.muted}>{m.expert} · {dateAr(m.startsAt, { dateStyle: "full" })} · {dateAr(m.startsAt, { timeStyle: "short" })}–{dateAr(m.endsAt, { timeStyle: "short" })} (الرياض)</span>}
          </div>
        </header>
        {m ? <MeetingRoom code={code} /> : <div className={`${s.alert} ${s.alertErr}`}>رابط الجلسة غير صالح أو أُلغيت الجلسة.</div>}
      </div>
    </div>
  );
}
