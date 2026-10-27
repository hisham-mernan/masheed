import { redirect } from "next/navigation";
import OnboardingForm from "@/components/platform/OnboardingForm";
import { PageHead } from "@/components/platform/ui";
import { getAccountContext } from "@/lib/account";

export const metadata = { title: "مرحباً بك في مَشيد" };

export default async function OnboardingPage() {
  const ctx = await getAccountContext();
  if (!ctx) redirect("/login");
  const addOnly = ctx.account?.has_waqf === false;
  if (ctx.profile?.waqf_id) redirect("/dashboard");

  return (
    <div className="fade-in" style={{ maxWidth: 760 }}>
      <PageHead
        title={addOnly ? "أضف وقفك" : `مرحباً ${ctx.account?.name || ""}`}
        lead={addOnly ? "أدخل بيانات وقفك لتبدأ إدارته من النظام." : "فترتك التجريبية لمدة 15 يوماً بدأت. قبل أن تبدأ: هل لديك وقف قائم؟"}
      />
      <OnboardingForm addOnly={addOnly} />
    </div>
  );
}
