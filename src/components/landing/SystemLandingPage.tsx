import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Partners from "@/components/landing/Partners";
import HowItWorks from "@/components/landing/HowItWorks";
import Solutions from "@/components/landing/Solutions";
import Compliance from "@/components/landing/Compliance";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default function SystemLandingPage() {
  return (
    <main dir="rtl">
      <Header />
      <Hero />
      <Partners />
      <HowItWorks />
      <Solutions />
      <Compliance />
      <div id="features">
        <Features />
      </div>
      <Stats />

      {/* Footer */}
      <footer style={{
        padding: '5rem 0 2.5rem',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        borderTop: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '3rem',
            marginBottom: '3.5rem',
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 36, height: 36,
                  background: 'var(--color-primary)',
                  borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: '800', color: 'white',
                  fontFamily: 'var(--font-heading)',
                }}>م</div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
                  مَشيد | MASHEED
                </span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: '1.8' }}>
                المنصة المتكاملة لإدارة واستدامة الأوقاف في المملكة العربية السعودية.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                marginTop: '1rem', padding: '0.3rem 0.8rem',
                background: 'var(--color-primary-light)', border: '1px solid rgba(133,97,173,0.1)',
                borderRadius: '20px', fontSize: '0.72rem', color: 'var(--color-primary-dark)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                صنع في المملكة العربية السعودية
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                روابط سريعة
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', lineHeight: '2.4' }}>
                {['عن المنصة', 'حلول الأوقاف', 'المميزات', 'الأمن والخصوصية'].map(l => (
                  <li key={l} className="footer-link">{l}</li>
                ))}
              </ul>
            </div>

            {/* Solutions */}
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                الحلول
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', lineHeight: '2.4' }}>
                {['إدارة الأصول', 'المحاسبة الوقفية', 'التقارير الرقابية', 'إدارة المستفيدين'].map(l => (
                  <li key={l} style={{ color: 'var(--color-text-muted)' }}>{l}</li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-text)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                تواصل معنا
              </h4>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: '2.2' }}>
                الرياض، المملكة العربية السعودية<br />
                info@masheed.sa<br />
                920 0XX XXX
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '2rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--color-text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <p>© ٢٠٢٦ مَشيد. جميع الحقوق محفوظة.</p>
            <p>يخدم رؤية المملكة العربية السعودية ٢٠٣٠</p>
          </div>
        </div>
      </footer>
      <ScrollReveal />
    </main>
  );
}
