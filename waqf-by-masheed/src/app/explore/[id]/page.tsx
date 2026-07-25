"use client";

import React, { useState, use } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Calculator, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  MapPin, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  Award
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OpportunityDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // State for Calculator
  const [investAmount, setInvestAmount] = useState(50000);
  const [holdingPeriod, setHoldingPeriod] = useState(5);
  const [showCertificate, setShowCertificate] = useState(false);

  // Hardcoded project details for Tower A
  const project = {
    name: "برج الخزامى الاستثماري (الرياض)",
    code: "WQ-KHAZAMI-01",
    fundingGoal: 5000000,
    currentFunding: 3600000,
    minInvestment: 5000,
    expectedROI: 8.5, // 8.5%
    milestoneProgress: 65,
    governanceScore: 96,
    complianceScore: 88,
    lastValuationDate: "2026-05-15",
    financialReportingDate: "2026-06-30",
    activeAuditStatus: "مكتمل وسليم",
    impactMetric: "رعاية ١,٢٠٠ يتيم وسداد منح دراسية لـ ٣٠٠ طالب علم سنوياً."
  };

  // Calculator Payout Calculations
  const annualReturn = investAmount * (project.expectedROI / 100);
  const totalReturn = annualReturn * holdingPeriod;
  const irrVal = project.expectedROI;
  const paybackPeriod = (100 / project.expectedROI).toFixed(1);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-12 text-right" style={{ direction: "rtl" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          
          {/* Main Title Section */}
          <div className="mb-8">
            <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-semibold">فرصة استثمارية مرموزة</span>
            <h1 className="text-3xl font-extrabold mt-3">{project.name}</h1>
            <p className="text-muted text-sm mt-1">فرصة فريدة للمشاركة في ريع برج تجاري إداري بحي الخزامى بمدينة الرياض وتحقيق أثر اجتماعي مستدام.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Investment Calculator & Capital Allocation */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Investment Calculator */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Calculator className="text-accent" size={20} /> محاكي الاستثمار الوقفي (Scenario Calculator)
                </h3>
                <p className="text-muted text-xs mb-6">قم بمحاكاة عوائدك المتوقعة وفترة الاسترداد بناءً على مبلغ الاستثمار وفترة الاحتفاظ بصكوك الوقف.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">مبلغ الاستثمار المستهدف (ر.س):</label>
                    <input 
                      type="number" 
                      value={investAmount} 
                      onChange={(e) => setInvestAmount(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-right text-sm"
                      placeholder="مثال: ٥٠٠٠٠"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">مدة الاحتفاظ المقترحة (سنوات):</label>
                    <select 
                      value={holdingPeriod}
                      onChange={(e) => setHoldingPeriod(Number(e.target.value))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-right text-sm"
                    >
                      <option value={3}>٣ سنوات</option>
                      <option value={5}>٥ سنوات</option>
                      <option value={7}>٧ سنوات</option>
                      <option value={10}>١٠ سنوات</option>
                    </select>
                  </div>
                </div>

                {/* Calculator Outputs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-background rounded-xl mb-6">
                  <div className="text-center md:text-right">
                    <span className="text-muted text-xs block">العائد السنوي المتوقع</span>
                    <strong className="text-base text-emerald-600 block mt-1">+{annualReturn.toLocaleString()} ر.س</strong>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-muted text-xs block">إجمالي الأرباح المتراكمة</span>
                    <strong className="text-base text-emerald-600 block mt-1">+{totalReturn.toLocaleString()} ر.س</strong>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-muted text-xs block">معدل العائد الداخلي (IRR)</span>
                    <strong className="text-base text-accent block mt-1">{irrVal}٪</strong>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="text-muted text-xs block">فترة الاسترداد المقدرة</span>
                    <strong className="text-base text-accent block mt-1">{paybackPeriod} سنوات</strong>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowCertificate(true);
                      alert("تمت محاكاة الاستثمار! يمكنك الآن استعراض شهادتك الاستثمارية الوقفية الرقمية.");
                    }}
                    className="flex-1 bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-dark transition-all cursor-pointer text-sm"
                  >
                    محاكاة إصدار الصكوك الرقمية
                  </button>
                </div>
              </div>

              {/* Capital Allocation Breakdown */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="text-accent" size={20} /> هيكل تخصيص رأس المال وتوزيع الأموال (Capital Allocation)
                </h3>
                <p className="text-muted text-xs mb-6">تتسم تدفقات الأموال بالشفافية الكاملة ويتم تقسيم رأس المال المجموع على بنود التطوير والصيانة والتشغيل التالية:</p>
                <div className="space-y-3">
                  {[
                    { label: "تطوير وتحسين البنية الإنشائية (Construction & Development)", percentage: 40, color: "bg-emerald-500" },
                    { label: "شراء وتجهيز الأرض الوقفية (Land Acquisition)", percentage: 35, color: "bg-blue-500" },
                    { label: "صندوق الاحتياط المالي العام (General Reserve)", percentage: 10, color: "bg-purple-500" },
                    { label: "رسوم واستشارات هندسية وقانونية (Professional Services)", percentage: 8, color: "bg-amber-500" },
                    { label: "بنود الطوارئ والتشغيل غير المتوقعة (Contingency)", percentage: 7, color: "bg-red-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{item.label}</span>
                        <span className="text-accent">{item.percentage}٪</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Certificate Preview Modal/Block */}
              {showCertificate && (
                <div className="bg-card rounded-2xl border-2 border-dashed border-accent p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-8 -mt-8" />
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Award className="text-accent" size={22} /> معاينة شهادة الاستثمار الوقفية المرموزة (Digital Waqf Certificate)
                  </h3>
                  <div className="bg-background border border-border p-6 rounded-xl relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className="text-left">
                        <span className="text-muted text-[10px] block">رمز الشهادة الرقمية</span>
                        <code className="text-xs text-accent font-bold">WQ-CERT-{(investAmount * 1.3).toFixed(0)}</code>
                      </div>
                      <div className="text-right">
                        <h4 className="font-extrabold text-base">منصة مشيد الاستثمارية الوقفية</h4>
                        <span className="text-muted text-xs">حجة صك رقمي موثق على قاعدة البيانات المؤمنة</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 text-sm mb-6">
                      <p>نشهد أن المستثمر <strong>{project.impactMetric ? "شريك وقف معتمد" : "مستثمر"}</strong> قد حجز صكوكاً استثمارية بقيمة <strong>{investAmount.toLocaleString()} ر.س</strong> في <strong>{project.name}</strong>.</p>
                      <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                        <div>التاريخ: <strong>{new Date().toLocaleDateString("ar-SA")}</strong></div>
                        <div>معدل النسبة السنوي: <strong>{project.expectedROI}٪ ريع سنوي متوقع</strong></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-border pt-4">
                      <div className="text-[10px] text-muted text-left">
                        🔒 توقيع مشفر معتمد بصك إثبات الهوية الرقمية<br/>
                        منصة مشيد المالية ٢٠٢٦
                      </div>
                      <div className="w-16 h-16 bg-white p-1 border border-border rounded-lg flex items-center justify-center">
                        {/* Mock QR Code */}
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-[8px] text-white text-center font-mono">
                          VALID CERT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Trust Center & Public Transparency Portal */}
            <div className="space-y-8">
              
              {/* Funding Progress (Public Transparency Portal) */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users className="text-accent" size={20} /> بوابة الشفافية وحالة الطرح (Transparency Portal)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span>إجمالي التمويل المجموع</span>
                      <span>{((project.currentFunding / project.fundingGoal) * 100).toFixed(0)}٪</span>
                    </div>
                    <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-2">
                      <span>الهدف: {project.fundingGoal.toLocaleString()} ر.س</span>
                      <span>المحقق: {project.currentFunding.toLocaleString()} ر.س</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">نسبة إنجاز المعالم الإنشائية</span>
                      <strong className="text-accent">{project.milestoneProgress}٪</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">الأثر الاجتماعي المستهدف (Impact)</span>
                      <span className="font-semibold text-right" style={{ maxWidth: "180px", fontSize: "11px", display: "inline-block" }}>{project.impactMetric}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investor Trust Center */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-accent" size={20} /> مركز ثقة المستثمر (Investor Trust Center)
                </h3>
                <p className="text-muted text-xs mb-5">مؤشرات موثوقية الأداء المالي والحوكمي للأصل مسحوبة مباشرة من نظام الـ ERP للوقف:</p>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-muted">معدل الحوكمة والقرارات</span>
                    <strong className="text-emerald-600">{project.governanceScore}٪ (ممتاز)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-muted">معدل الالتزام والامتثال</span>
                    <strong className="text-emerald-600">{project.complianceScore}٪ (ملتزم)</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-muted">تاريخ آخر تقييم للأصول</span>
                    <strong>{project.lastValuationDate}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-muted">آخر تقرير مالي مدقق</span>
                    <strong>{project.financialReportingDate}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-xl border border-border">
                    <span className="text-muted">حالة التدقيق والرقابة</span>
                    <strong className="text-emerald-600">{project.activeAuditStatus}</strong>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-accent/5 rounded-xl border border-accent/20 flex gap-2 items-start text-[11px] text-accent leading-relaxed">
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                  <span>جميع البيانات المالية والحوكمية المعروضة مؤكدة وتخضع لرقابة دورية من مجلس النظارة الداخلي والجهات التنظيمية الرسمية.</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
