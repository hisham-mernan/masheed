"use client";

import { useState } from "react";
import { askAssistant } from "@/app/actions";

const SUGGESTIONS = ["ما وضع الزكاة الحالي؟", "كم ريع متاح للتوزيع؟", "ما حالة مهام الصيانة؟", "هل أصولي جاهزة لطرح الصكوك؟", "ما حالة الحوكمة والقرارات؟", "كيف أصدر تقرير PDF؟"];

export default function AssistantChat() {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "مرحباً بك في المساعد الذكي لمَشيد 👋 أجيبك من بيانات وقفك الفعلية — اسألني عن الزكاة، الريع، الصيانة، طرح الصكوك، الحوكمة، أو التقارير." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  async function send(text: string) {
    if (!text.trim() || typing) return;
    setMessages(prev => [...prev, { sender: "user", text }]);
    setInput("");
    setTyping(true);
    const res = await askAssistant(text);
    setMessages(prev => [...prev, { sender: "ai", text: res.reply }]);
    setTyping(false);
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.5rem", marginTop: "1.5rem" }}>
      <div className="glass-card" style={{ padding: "1.25rem", alignSelf: "start" }}>
        <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#8561AD", marginBottom: "0.75rem" }}>💡 اقتراحات</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{ textAlign: "right", padding: "0.55rem 0.7rem", borderRadius: "8px", border: "1px solid var(--color-border, #E4E7EF)", background: "var(--bg-main, #F8FAFC)", fontSize: "0.78rem", cursor: "pointer", color: "var(--text-main)" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", minHeight: "420px" }}>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.sender === "user" ? "flex-start" : "flex-end",
              maxWidth: "80%",
              padding: "0.7rem 1rem",
              borderRadius: "12px",
              fontSize: "0.88rem",
              lineHeight: 1.8,
              background: m.sender === "user" ? "#8561AD" : "var(--bg-main, #F1F5F9)",
              color: m.sender === "user" ? "white" : "var(--text-main)",
              borderBottomLeftRadius: m.sender === "user" ? "4px" : "12px",
              borderBottomRightRadius: m.sender === "ai" ? "4px" : "12px",
            }}>
              {m.text}
            </div>
          ))}
          {typing && <div style={{ alignSelf: "flex-end", color: "var(--text-muted)", fontSize: "0.8rem" }}>يكتب...</div>}
        </div>
        <form onSubmit={e => { e.preventDefault(); send(input); }} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            style={{ flex: 1, padding: "0.7rem", borderRadius: "8px", border: "1px solid var(--border-color, #E4E7EF)", background: "var(--bg-main)", color: "var(--text-main)" }}
          />
          <button type="submit" className="btn-primary" disabled={typing}>إرسال</button>
        </form>
      </div>
    </div>
  );
}
