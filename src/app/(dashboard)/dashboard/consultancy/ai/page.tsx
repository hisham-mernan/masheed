"use client";

import React, { useState } from "react";

export default function AIConsultancyPage() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "مرحباً بك في المساعد الذكي لمشيد. كيف يمكنني مساعدتك اليوم في إدارة أوقافك أو تحليل شروط الواقفين؟" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "بناءً على اللوائح التنظيمية الخاصة بالهيئة العامة للأوقاف (GAW)، يجب تقديم التقارير المالية للربع الحالي في غضون ٩٠ يوماً من انتهائه. هل تود أن أساعدك في إعداد التقرير المالي التلقائي بناءً على قيود دفتر الأستاذ؟";
      if (input.includes("شرط") || input.includes("صك")) {
        replyText = "تم تحليل صك الوقف الخاص بك مسبقاً. الشروط النشطة تتطلب تخصيص ٣٥٪ من الإيرادات لصيانة البرج. أي عملية بيع أو رهن تتطلب تصريحاً رسمياً وموافقة مجلس النظارة.";
      } else if (input.includes("سوق") || input.includes("استثمار")) {
        replyText = "أصل 'محفظة صكوك بنك الإنماء' مرشح وجاهز بنسبة ١٠٠٪ للإدراج في سوق أوقاف مشيد. هل تريد بدء عملية إعداد طلب الإدراج؟";
      }

      setMessages(prev => [...prev, { sender: "ai", text: replyText }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#fff", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>المساعد الاستشاري الذكي (AI Waqf Assistant)</h1>
        <p style={{ opacity: 0.6, marginTop: "0.25rem" }}>استشارات تنظيمية فورية، تحليل صكوك الأوقاف، ومراجعة جاهزية الطرح الاستثماري بمساعدة الذكاء الاصطناعي</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "2rem" }}>
        {/* Sidebar Info */}
        <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#c4a8e0", margin: 0 }}>💡 اقتراحات الأسئلة</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
            <button onClick={() => setInput("ما هي شروط الواقف في برج الخزامى؟")} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "0.5rem", color: "#fff", cursor: "pointer", textAlign: "right" }}>
              ❓ ما هي شروط الواقف في برج الخزامى؟
            </button>
            <button onClick={() => setInput("هل أصل محفظة الصكوك جاهز لطرحه في سوق الاستثمار؟")} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "0.5rem", color: "#fff", cursor: "pointer", textAlign: "right" }}>
              ❓ هل أصل محفظة الصكوك جاهز لطرحه في سوق الاستثمار؟
            </button>
            <button onClick={() => setInput("ما هو موعد تسليم تقرير الامتثال القادم للهيئة؟")} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "0.5rem", color: "#fff", cursor: "pointer", textAlign: "right" }}>
              ❓ ما هو موعد تسليم تقرير الامتثال القادم للهيئة؟
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ background: "rgba(20, 10, 35, 0.4)", border: "1px solid rgba(133, 97, 173, 0.2)", borderRadius: "16px", padding: "1.5rem", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", height: "450px" }}>
          {/* Message List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem", padding: "0.5rem" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.sender === "ai" ? "flex-start" : "flex-end",
                background: msg.sender === "ai" ? "rgba(133, 97, 173, 0.15)" : "rgba(255,255,255,0.04)",
                border: msg.sender === "ai" ? "1px solid rgba(133, 97, 173, 0.3)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "0.75rem 1rem",
                maxWidth: "75%",
                fontSize: "0.9rem",
                lineHeight: "1.5"
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", background: "rgba(133, 97, 173, 0.08)", borderRadius: "12px", padding: "0.5rem 1rem", fontSize: "0.85rem", opacity: 0.5 }}>
                المساعد الذكي يكتب الآن...
              </div>
            )}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} style={{ display: "flex", gap: "0.75rem" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا للاستفسار عن شروط الوقف والأنظمة..."
              style={{ flex: 1, padding: "0.75rem 1rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "0.9rem" }}
            />
            <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#8561ad", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
              إرسال 🚀
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
