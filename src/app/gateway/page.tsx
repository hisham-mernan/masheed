import GatewayHeader from "@/components/landing/GatewayHeader";
import DualGateway from "@/components/landing/DualGateway";
import GatewaySections from "@/components/landing/GatewaySections";
import ScrollReveal from "@/components/landing/ScrollReveal";

export const metadata = {
  title: "منظومة مَشيد | Masheed Ecosystem",
  description: "بوابة منظومة مَشيد: نظام إدارة الأوقاف وسوق الاستثمار الوقفي الرقمي في مكان واحد.",
};

export default function GatewayPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-background)" }}>
      <ScrollReveal />
      <GatewayHeader />
      <DualGateway />
      <GatewaySections />
      <footer style={{
        marginTop: "auto",
        padding: "2.5rem 1.5rem",
        direction: "rtl",
        background: "#16121F",
        borderTop: "1px solid rgba(245, 239, 226, 0.08)",
        color: "rgba(245, 239, 226, 0.55)",
      }}>
        <div style={{
          maxWidth: 1060, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
          fontSize: "0.78rem",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #8561AD, #17573F)",
              color: "white", fontWeight: 800,
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem",
            }}>م</span>
            <strong style={{ color: "#F5EFE2" }}>منظومة مَشيد للأوقاف</strong>
          </span>
          <span>© ٢٠٢٦ مَشيد — جميع الحقوق محفوظة · يخدم رؤية المملكة ٢٠٣٠</span>
          <span>نظامان · منصة واحدة · أثر واحد يبقى</span>
        </div>
      </footer>
    </main>
  );
}
