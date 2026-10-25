"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMyProfile, changeMyPassword } from "@/app/actions";

export default function ProfileForms({ currentName }: { currentName: string }) {
  const [name, setName] = useState(currentName);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputStyle: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid var(--border-color)",
    background: "var(--bg-main)",
    color: "var(--text-main)",
    flex: 1,
  };

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("full_name", name);
    const res = await updateMyProfile(fd);
    setLoading(false);
    if (res?.error) setMsg({ ok: false, text: res.error });
    else {
      setMsg({ ok: true, text: "تم تحديث الاسم بنجاح" });
      router.refresh();
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const fd = new FormData();
    fd.set("password", password);
    const res = await changeMyPassword(fd);
    setLoading(false);
    if (res?.error) setMsg({ ok: false, text: res.error });
    else {
      setMsg({ ok: true, text: "تم تغيير كلمة المرور بنجاح" });
      setPassword("");
    }
  }

  return (
    <>
      <form onSubmit={saveName} style={{ display: "flex", gap: "0.75rem", alignItems: "end", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>الاسم الكامل</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>حفظ الاسم</button>
      </form>

      <form onSubmit={savePassword} style={{ display: "flex", gap: "0.75rem", alignItems: "end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
          <label style={{ fontWeight: 600, fontSize: "0.9rem" }}>كلمة مرور جديدة</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="٦ أحرف على الأقل" style={inputStyle} />
        </div>
        <button type="submit" className="btn-outline" disabled={loading || !password}>تغيير كلمة المرور</button>
      </form>

      {msg && (
        <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "6px", background: msg.ok ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${msg.ok ? "#BBF7D0" : "#FECACA"}`, color: msg.ok ? "#15803D" : "#DC2626" }}>
          {msg.text}
        </div>
      )}
    </>
  );
}
