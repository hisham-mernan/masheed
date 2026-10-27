"use client";

import { useEffect, useRef, useState } from "react";
import { joinMeeting, type JoinResult } from "@/lib/meeting-actions";
import { s } from "./ui";

// Name → server-issued token → ZEGOCLOUD prebuilt video room
export default function MeetingRoom({ code }: { code: string }) {
  const box = useRef<HTMLDivElement>(null);
  const kit = useRef<{ destroy: () => void } | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<Extract<JoinResult, { ok: true }> | null>(null);
  const [left, setLeft] = useState(false);

  // Mount the room once the container exists
  useEffect(() => {
    if (!ticket || !box.current) return;
    let cancelled = false;
    import("@zegocloud/zego-uikit-prebuilt").then(({ ZegoUIKitPrebuilt }) => {
      if (cancelled || !box.current) return;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(ticket.appId, ticket.token, ticket.roomId, ticket.userId, ticket.userName);
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      kit.current = zp;
      zp.joinRoom({
        container: box.current,
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
        showPreJoinView: true,
        showRoomTimer: true,
        showScreenSharingButton: true,
        sharedLinks: [{ name: "رابط الجلسة", url: window.location.href }],
        onLeaveRoom: () => setLeft(true),
      });
    });
    return () => { cancelled = true; kit.current?.destroy(); kit.current = null; };
  }, [ticket]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await joinMeeting(code, name);
    setBusy(false);
    if (!r.ok) { setError(r.message); return; }
    setTicket(r);
  }

  if (!ticket) {
    return (
      <form onSubmit={join} className={`${s.panel} ${s.form}`} style={{ maxWidth: 460 }}>
        <h2>الدخول إلى الجلسة</h2>
        {error && <div className={`${s.alert} ${s.alertErr}`} role="alert">{error}</div>}
        <div className={s.field}>
          <label htmlFor="mt-name">اسمك</label>
          <input id="mt-name" className={s.input} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="name" />
        </div>
        <button className={s.btn} disabled={busy || name.trim().length < 2}>{busy ? "جارٍ الاتصال…" : "ادخل الجلسة"}</button>
        <p className={s.hint}>ستُطلب صلاحية الكاميرا والميكروفون. يفتح الدخول قبل الموعد بربع ساعة.</p>
      </form>
    );
  }
  return (
    <>
      {left && <div className={`${s.alert} ${s.alertInfo}`}>غادرت الجلسة. يمكنك العودة بإعادة تحميل الصفحة ما دامت الجلسة مفتوحة.</div>}
      <div ref={box} style={{ width: "100%", height: "min(78dvh, 760px)", borderRadius: 16, overflow: "hidden", background: "#1A1A2E" }} />
    </>
  );
}
