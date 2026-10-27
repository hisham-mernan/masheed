// وقف مَشيد website — copy. Ported from the Masheed Design System (ui_kits/waqf-website).
// The site lists only real opportunities and takes no payments, so the copy that described
// the design's wallet and in-site checkout now describes registering interest instead.

export const MAIN_URL = process.env.NEXT_PUBLIC_MAIN_URL || "https://masheedwaqf.com";
export const SYSTEM_URL = process.env.NEXT_PUBLIC_SYSTEM_URL || "https://system.masheedwaqf.com";

export const WQ_FAQ: [string, string][] = [
  ["من يمكنه الاستثمار في المنصة؟", "الأفراد والجهات بعد إنشاء الحساب والتحقق من الهوية. يظهر الحد الأدنى للاستثمار في صفحة كل فرصة."],
  ["كيف تُختار الفرص قبل عرضها؟", "لا تُطرح الفرصة بمجرد طلب الإدراج؛ بل تمر بمراجعةٍ للبيانات المالية والتقييمات المستقلة والمخاطر والحوكمة، ثم تُعتمد قبل النشر."],
  ["هل العائد مضمون؟", "لا. العائد المعروض تقديري ومبني على دراسة الجدوى، وقد يختلف العائد الفعلي. تُعرض المخاطر بوضوح في صفحة كل فرصة."],
  ["كيف أستثمر في فرصة؟", "سجّل اهتمامك من صفحة الفرصة وحدّد عدد الحصص، وسيتواصل معك فريق وقف مَشيد بمستندات الفرصة وخطوات إتمام الاستثمار. لا يتم أي دفع عبر الموقع."],
  ["هل يمكنني متابعة استثماري بعد الشراء؟", "نعم. تصلك التحديثات والتقارير الدورية ومراحل التنفيذ وتوزيعات الأرباح بحسب شروط كل فرصة."],
];
