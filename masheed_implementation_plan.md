# خطة التنفيذ البرمجي (Implementation Plan)

## 1. ربط قاعدة البيانات (Database Integration)
تم كتابة ملف `02_update_schema.sql` في مجلد `supabase/migrations`.
**الخطوة التنفيذية:**
*   تشغيل ملف التهيئة في Supabase لتحديث المخطط وإنشاء جداول التوكينيزيشن والتوزيع (Tokenization & Distributions).
*   تفعيل (RPC) للدالة `calculate_distribution` ليتم استدعاؤها من الواجهة عند اعتماد مدير الوقف لتوزيع الإيرادات.

## 2. إدارة الجلسات والمصادقة (Authentication & Context)
*   **إنشاء Auth Context:** عمل `AuthProvider` في ملف `src/components/providers/AuthProvider.tsx` لإدارة حالة تسجيل الدخول واستدعاء معلومات المستخدم.
*   **تحديث `layout.tsx` (Dashboard):**
    *   جلب `user` من Supabase واستخراج `full_name` و `waqf_id`.
    *   إضافة زر **تسجيل الخروج (Logout)** بجانب صورة المستخدم.
    *   حماية مسار `/dashboard` بحيث يتم تحويل المستخدم غير المسجل إلى `/login`.

## 3. ربط لوحة التحكم بالبيانات الحقيقية (Dashboard Dynamic Data)
*   **مبدل الأوقاف (Waqf Switcher):** تعديل `Sidebar.tsx` لعمل Fetch من جدول `waqfs` بناءً على تصريح المستخدم وعرض قائمة الأوقاف الفعلية الخاصة به.
*   **الإحصائيات (Stats Cards):** إنشاء دالة في `page.tsx` لجلب:
    *   مجموع قيمة الأصول من جدول `assets`.
    *   مجموع الإيرادات من جدول `transactions` (نوع `income`).
    *   مجموع المصروفات والتوزيعات (نوع `expense` و `distribution`).
*   **سجل العمليات (Activity Log):** ربط القائمة بجدول `audit_logs` لعرض التحديثات الحية.

## 4. شاشات نظام الـ ERP (الأسهم والتوزيعات)
*   **إدارة المستفيدين (`/dashboard/beneficiaries`):**
    *   تعديل الجدول ليعرض خانة **عدد الأسهم (Shares)** والحالة والرصيد المتاح (Wallet Balance).
    *   إضافة زر "توزيع أرباح" (Distribute Yield) يستدعي الدالة `calculate_distribution`.
*   **نظام الأصول (Assets):**
    *   دعم اختيار نوع الوقف (خيري، أهلي، مشترك) عند إضافة أصل جديد.

## 5. تحسين الصفحة الرئيسية (Landing Page UI/UX)
*   استبدال البيانات والنصوص الوهمية (Placeholders) بنصوص تسويقية حقيقية حول إدارة الأوقاف (الحوكمة، التوكينيزيشن، الربط مع الزكاة).
*   إضافة حركات انتقالية (Framer Motion أو CSS Animations) لجعل الصفحة ديناميكية.
*   توضيح خيارات "الوقف المرمز" (Tokenized Waqf) في قسم المميزات (Features) لجذب الانتباه كتقنية حديثة (Fintech).

---
*تم إرفاق ملف `02_update_schema.sql` والذي يمكنك رفعه مباشرة على Supabase (أو نسخه في SQL Editor) لتفعيل التوكينيزيشن والتوزيع الآلي.*
