import React from "react";
import Link from "next/link";

interface PageProps {
  params: any;
}

export default async function CatchAllDashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams?.catchall || [];
  const path = pathSegments.join("/");

  // Determine page properties based on path
  let title = "صفحة فرعية بالنظام";
  let subtitle = "هذه الصفحة قيد التحميل والمزامنة مع نظام مشيد المركزي";
  let content = null;

  if (path === "workspace") {
    title = "مساحة العمل التعاونية (Workspace)";
    subtitle = "إدارة مساحة العمل، مراجعة الإشعارات المعلقة، وتنسيق الأنشطة التنظيمية للأوقاف";
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 المهام النشطة المعلقة</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <strong>مراجعة الميزانية السنوية لبرج الخزامى</strong>
              <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>الحالة: قيد المراجعة | المهندس عمر</p>
            </div>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <strong>تحديث رصيد ريع الصكوك الصحية</strong>
              <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>الحالة: معلق موافقة النظارة | سارة العتيبي</p>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📢 أحدث التعليقات والملخصات</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: "1.6" }}>
            تم مراجعة تقرير الامتثال الفني المرفوع لفرصة النخيل الزراعية. ننتظر رفع التقرير الهندسي لتعديل نقاط الجاهزية إلى ١٠٠٪.
          </p>
        </div>
      </div>
    );
  } else if (path === "tasks") {
    title = "قائمة المهام التنفيذية (My Tasks)";
    subtitle = "تتبع وتحديث المهام والواجبات الموزعة على نظار الوقف والمهندسين وأعضاء الإدارة";
    content = (
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>اسم المهمة</th>
              <th style={{ padding: "0.75rem" }}>المسؤول عنها</th>
              <th style={{ padding: "0.75rem" }}>الأولوية</th>
              <th style={{ padding: "0.75rem" }}>تاريخ الاستحقاق</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><strong>تدقيق صك ملكية أرض المدينة</strong></td>
              <td style={{ padding: "0.75rem" }}>المستشار القانوني</td>
              <td style={{ padding: "0.75rem", color: "#ef4444", fontWeight: "bold" }}>عالية (Critical)</td>
              <td style={{ padding: "0.75rem" }}>2026-07-15</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#fef3c7", color: "#d97706", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>قيد العمل</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><strong>رفع تقرير فحص التربة الزراعية</strong></td>
              <td style={{ padding: "0.75rem" }}>المهندس الزراعي</td>
              <td style={{ padding: "0.75rem", color: "#3b82f6", fontWeight: "bold" }}>متوسطة</td>
              <td style={{ padding: "0.75rem" }}>2026-07-20</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#fee2e2", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>معلقة</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else if (path === "calendar") {
    title = "جدول المواعيد التنظيمية (Calendar)";
    subtitle = "عرض وجدولة اجتماعات مجلس النظارة، جلسات التدقيق، وزيارات الصيانة الميدانية للأصول";
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📅 التقويم الأسبوعي للأنشطة</h4>
          <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", border: "1px dashed #C8CCDB", borderRadius: "8px", color: "#64748B" }}>
             عرض خريطة مواعيد أوقاف هذا الشهر التفاعلية
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📆 الاجتماعات القادمة هذا الأسبوع</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px" }}>
              <strong>اجتماع مجلس النظارة الطارئ</strong>
              <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الأربعاء القادم - ١٠:٠٠ ص</p>
            </div>
            <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px" }}>
              <strong>مراجعة ترخيص وقف النخيل</strong>
              <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الخميس القادم - ٠١:٣٠ م</p>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (path === "meetings") {
    title = "إدارة اجتماعات لجان الحوكمة (Meetings Center)";
    subtitle = "توثيق محاضر الاجتماعات، التصويت على القرارات الاستراتيجية، وإصدار مسودات الاجتماع التلقائية بمساعدة الـ AI";
    content = (
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل اجتماعات مجلس النظارة</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>اسم الاجتماع</th>
              <th style={{ padding: "0.75rem" }}>اللجنة / المجلس</th>
              <th style={{ padding: "0.75rem" }}>تاريخ الانعقاد</th>
              <th style={{ padding: "0.75rem" }}>معدل التصويت</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><strong>الجمعية العمومية السنوية للشركاء</strong></td>
              <td style={{ padding: "0.75rem" }}>مجلس النظارة الموحد</td>
              <td style={{ padding: "0.75rem" }}>2025-06-01</td>
              <td style={{ padding: "0.75rem", color: "#10b981", fontWeight: "bold" }}>مكتملة (١٠٠٪)</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#d1fae5", color: "#065f46", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>تم التوثيق</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><strong>جلسة اعتماد ميزانية الصيانة الربعية</strong></td>
              <td style={{ padding: "0.75rem" }}>لجنة الأصول والاستثمار</td>
              <td style={{ padding: "0.75rem" }}>2025-06-25</td>
              <td style={{ padding: "0.75rem", color: "#fbbf24", fontWeight: "bold" }}>نشط (٧٥٪)</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#fef3c7", color: "#d97706", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>قيد التصويت</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else if (path === "workflows") {
    title = "محرك تدفقات العمل والاعتمادات (Workflow Engine)";
    subtitle = "تصميم وإدارة تدفقات الموافقات والمهام لكل أصل ووقف، وتحديد معايير الصلاحيات المعتمدة";
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>⚙️ تدفق عمل الموافقة على الميزانية النشط</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>المرحلة الأولى: إعداد مقترح الميزانية</span>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>مكتملة ✓</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B" }}>بواسطة: محاسب الوقف الرئيسي</p>
            </div>
            <div style={{ borderLeft: "2px dashed #8561AD", paddingLeft: "1rem", marginLeft: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>المرحلة الثانية: المراجعة المالية والجدوى</span>
                <span style={{ color: "#fbbf24", fontWeight: "bold" }}>قيد العمل...</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B" }}>المسؤول: مدير الأصول والاستثمار</p>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", opacity: 0.5 }}>
                <span>المرحلة الثالثة: الاعتماد والتوثيق القانوني</span>
                <span>معلق</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748B", opacity: 0.5 }}>الجهة: مجلس النظارة</p>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>💡 قوالب تدفق العمل الافتراضية (SOP Templates)</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748B", marginBottom: "1rem" }}>يمكنك تفعيل أحد القوالب الجاهزة للتشغيل المباشر:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button style={{ padding: "0.75rem", background: "#F0E7FF", color: "#58308F", border: "none", borderRadius: "8px", textAlign: "right", fontSize: "0.85rem", fontWeight: "bold", cursor: "pointer" }}>
              📁 قالب إدراج أصل عقاري جديد
            </button>
            <button style={{ padding: "0.75rem", background: "#F8FAFC", color: "#1A1A2E", border: "1px solid #E2E8F0", borderRadius: "8px", textAlign: "right", fontSize: "0.85rem", cursor: "pointer" }}>
              📁 قالب مراجعة طلب الصرف للمستفيدين
            </button>
          </div>
        </div>
      </div>
    );
  } else if (path.startsWith("finance/")) {
    title = "دفتر الحسابات والقيود المالية المخصصة (Financial Ledgers)";
    subtitle = "تفصيل المعاملات المحاسبية، الإيرادات والمصروفات المسجلة تحت تصنيف البنود المالية للوقف";
    content = (
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 سجل القيود المحاسبية التفصيلي لقسم ({path.split("/")[1]})</h4>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", color: "#64748B" }}>
              <th style={{ padding: "0.75rem" }}>رقم المعاملة</th>
              <th style={{ padding: "0.75rem" }}>البيان / الوصف</th>
              <th style={{ padding: "0.75rem" }}>المبلغ</th>
              <th style={{ padding: "0.75rem" }}>الأصل المرتبط</th>
              <th style={{ padding: "0.75rem" }}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD" }}>TX-726</code></td>
              <td style={{ padding: "0.75rem" }}><strong>توزيع عوائد ريع الربع السنوي الثاني</strong></td>
              <td style={{ padding: "0.75rem", color: "#10b981", fontWeight: "bold" }}>+٢٥,٠٠٠ ر.س</td>
              <td style={{ padding: "0.75rem" }}>برج الخزامى</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#d1fae5", color: "#065f46", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>مرحلة بنجاح</span></td>
            </tr>
            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
              <td style={{ padding: "0.75rem" }}><code style={{ color: "#8561AD" }}>TX-727</code></td>
              <td style={{ padding: "0.75rem" }}><strong>سداد فواتير شركة الصيانة الدورية</strong></td>
              <td style={{ padding: "0.75rem", color: "#ef4444", fontWeight: "bold" }}>-١٢,٤٠٠ ر.س</td>
              <td style={{ padding: "0.75rem" }}>مزرعة النخيل</td>
              <td style={{ padding: "0.75rem" }}><span style={{ background: "#d1fae5", color: "#065f46", padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>مرحلة بنجاح</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else if (path.startsWith("consultancy/")) {
    title = "مركز الاستشارات الشرعية والقانونية (Waqf Consultancy)";
    subtitle = "التواصل مع خبراء ومستشارين لتوجيه شروط الواقفين وحل الإشكالات التنظيمية والقانونية";
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📋 الخبراء والمستشارون المعتمدون بنظام مشيد</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
              <div>
                <strong>الشيخ د. عبدالرحمن المطلق</strong>
                <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>التخصص: صياغة وتوثيق صكوك الأوقاف الشرعية</p>
              </div>
              <button style={{ padding: "0.5rem 1rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>استشارة فورية 📞</button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
              <div>
                <strong>المستشار القانوني أحمد السديري</strong>
                <p style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "0.2rem" }}>التخصص: حوكمة مجالس النظارة وحماية الأصول</p>
              </div>
              <button style={{ padding: "0.5rem 1rem", background: "#8561AD", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>استشارة فورية 📞</button>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📊 طلبات الاستشارة النشطة</h4>
          <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "0.85rem" }}>
            <strong>طلب تفسير بند الصرف التعليمي لوقف الخزامى</strong>
            <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الحالة: قيد الدراسة مع المستشار أحمد</p>
          </div>
        </div>
      </div>
    );
  } else if (path.startsWith("marketplace/")) {
    title = "بوابة إدراج أوقاف التنموية بالمنصة (Marketplace Integration)";
    subtitle = "تتبع وتهيئة أصول الوقف لطرحها كصكوك وقفية رقمية للمساهمين في سوق أوقاف مشيد";
    content = (
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>💡 مؤشرات جاهزية أصولك للطرح الاستثماري</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>برج الخزامى الاستثماري (جاهزية قانونية ومالية)</span>
                <span style={{ color: "#10b981", fontWeight: "bold" }}>٩٨٪ - جاهز للطرح</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#F1F5F9", borderRadius: "3px" }}>
                <div style={{ width: "98%", height: "100%", background: "#10b981", borderRadius: "3px" }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                <span>مزرعة النخيل بالقصيم (نقص القوائم المالية)</span>
                <span style={{ color: "#fbbf24", fontWeight: "bold" }}>٨٢٪ - تحت التجهيز</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#F1F5F9", borderRadius: "3px" }}>
                <div style={{ width: "82%", height: "100%", background: "#fbbf24", borderRadius: "3px" }} />
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>📁 طلبات الطرح الفعالة بسوق الاستثمار</h4>
          <div style={{ padding: "0.75rem", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "0.85rem" }}>
            <strong>طلب رقم #REQ-091 - برج الخزامى</strong>
            <p style={{ color: "#64748B", marginTop: "0.25rem" }}>الحالة: قيد مراجعة مستندات الطرح بواسطة الإشراف العام</p>
          </div>
        </div>
      </div>
    );
  } else {
    // General fallback for reports, analytics, settings
    title = path.toUpperCase() === "REPORTS" ? "محرك التقارير التنظيمية والمالية (Reports Center)" : 
            path.toUpperCase() === "ANALYTICS" ? "لوحة التحليلات والإحصائيات الكلية (Analytics Dashboard)" : "إعدادات منصة مشيد (Settings & Config)";
    subtitle = "عرض لوحات المعلومات وتعديل إعدادات النظام التشغيلية للأوقاف بما يتوافق مع هيكل الحوكمة";
    content = (
      <div style={{ background: "#ffffff", border: "1px solid #E4E7EF", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "#8561AD" }}>🛠️ واجهة التهيئة ومتابعة الأداء</h4>
        <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", border: "1px dashed #C8CCDB", borderRadius: "8px", color: "#64748B" }}>
          جاري جلب وعرض أدوات لوحة التحكم النشطة لقسم ({path})
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: "2rem", color: "#1A1A2E", direction: "rtl", fontFamily: "Cairo, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>{title}</h1>
        <p style={{ color: "#64748B", marginTop: "0.25rem" }}>{subtitle}</p>
      </div>
      {content}
    </div>
  );
}
