// Shared list options for the platform forms and the System website request form

export const ORG_TYPES = ["جهة وقفية قائمة", "واقف راغب في التأسيس", "جمعية", "جهة مانحة", "أخرى"];
export const HOLDING_TYPES = ["عقاري", "زراعي", "محافظ استثمارية", "نقدي ومنقول", "وقف جديد لم يُؤسَّس بعد", "أخرى"];
export const ASSET_RANGES = ["1 إلى 5", "6 إلى 20", "21 إلى 50", "أكثر من 50", "لا أعرف بعد"];
export const CONSULT_TYPES: Record<string, string> = { financial: "مالية", sharia: "شرعية", legal: "قانونية" };

export const LISTING_CATEGORIES: Record<string, string> = {
  real_estate: "عقارية", agricultural: "زراعية", education: "تعليمية", health: "صحية", investment: "استثمارية", other: "أخرى",
};

type Tone = "pNew" | "pWait" | "pOk" | "pOff" | "pBad";
export const REQUEST_STATUS: Record<string, [string, Tone]> = {
  new: ["جديد", "pNew"], contacted: ["تم التواصل", "pNew"], quoted: ["بانتظار الدفع", "pWait"], paid: ["مدفوع", "pOk"],
  in_progress: ["قيد التنفيذ", "pOk"], done: ["مكتمل", "pOff"], cancelled: ["ملغى", "pBad"],
};
export const BOOKING_STATUS: Record<string, [string, Tone]> = {
  pending_payment: ["بانتظار الدفع", "pWait"], confirmed: ["مؤكد", "pOk"], cancelled: ["ملغى", "pBad"], done: ["منتهية", "pOff"],
};
export const LISTING_STATUS: Record<string, [string, Tone]> = {
  pending: ["قيد المراجعة", "pWait"], approved: ["معتمد ومنشور", "pOk"], trading: ["متاح للاستثمار", "pOk"], rejected: ["مرفوض", "pBad"],
};
export const PAYMENT_STATUS: Record<string, [string, Tone]> = {
  initiated: ["لم يكتمل", "pOff"], paid: ["مدفوع", "pOk"], failed: ["فشل", "pBad"],
};
